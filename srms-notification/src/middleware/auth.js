/**
 * Validates the shared service token for internal Laravel → microservice calls.
 * For notification read routes, validates a Sanctum Bearer token via DB lookup.
 */
const db = require('../db');

function requireServiceToken(req, res, next) {
  const token = req.headers['x-service-token'];
  if (!token || token !== process.env.SERVICE_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

async function requireBearerToken(req, res, next) {
  const header = req.headers['authorization'] || '';
  const raw = header.replace('Bearer ', '').trim();
  if (!raw) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Sanctum stores SHA-256 hash of the token in personal_access_tokens
    const crypto = require('node:crypto');
    // Sanctum token format is "id|plaintext" — only hash the part after the pipe
    const plaintext = raw.includes('|') ? raw.split('|')[1] : raw;
    const hashed = crypto.createHash('sha256').update(plaintext).digest('hex');

    const [rows] = await db.query(
      `SELECT pat.tokenable_id, u.id as user_id
       FROM personal_access_tokens pat
       JOIN users u ON u.id = pat.tokenable_id
       WHERE pat.token = ? AND pat.tokenable_type = ?
       LIMIT 1`,
      [hashed, String.raw`App\Models\User`]
    );

    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.userId = rows[0].user_id;
    next();
  } catch (err) {
    console.error('[auth] DB error:', err.message);
    res.status(500).json({ error: 'Auth check failed' });
  }
}

module.exports = { requireServiceToken, requireBearerToken };
