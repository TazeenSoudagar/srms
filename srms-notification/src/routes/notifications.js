const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireBearerToken } = require('../middleware/auth');

// All routes require a valid Sanctum Bearer token
router.use(requireBearerToken);

// GET /notifications — paginated, newest first
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page || '1');
  const perPage = 20;
  const offset = (page - 1) * perPage;

  try {
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) as total FROM notifications WHERE notifiable_id = ? AND notifiable_type = ?',
      [req.userId, 'App\\Models\\User']
    );

    const [rows] = await db.query(
      `SELECT id, type, data, read_at, created_at
       FROM notifications
       WHERE notifiable_id = ? AND notifiable_type = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [req.userId, 'App\\Models\\User', perPage, offset]
    );

    const items = rows.map((n) => {
      const parts = n.type.split('\\');
      const data = typeof n.data === 'string' ? JSON.parse(n.data) : n.data;
      return {
        id: n.id,
        type: parts[parts.length - 1],
        title: data.title ?? null,
        message: data.message ?? data.body ?? null,
        data,
        read_at: n.read_at ? new Date(n.read_at).toISOString() : null,
        created_at: new Date(n.created_at).toISOString(),
      };
    });

    res.json({
      data: items,
      meta: {
        current_page: page,
        last_page: Math.ceil(total / perPage),
        per_page: perPage,
        total,
      },
    });
  } catch (err) {
    console.error('[notifications] index error:', err.message);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// GET /notifications/unread-count
router.get('/unread-count', async (req, res) => {
  try {
    const [[{ count }]] = await db.query(
      `SELECT COUNT(*) as count FROM notifications
       WHERE notifiable_id = ? AND notifiable_type = ? AND read_at IS NULL`,
      [req.userId, 'App\\Models\\User']
    );
    res.json({ count });
  } catch (err) {
    console.error('[notifications] unread-count error:', err.message);
    res.status(500).json({ error: 'Failed to count notifications' });
  }
});

// POST /notifications/read-all
router.post('/read-all', async (req, res) => {
  try {
    await db.query(
      `UPDATE notifications SET read_at = NOW()
       WHERE notifiable_id = ? AND notifiable_type = ? AND read_at IS NULL`,
      [req.userId, 'App\\Models\\User']
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('[notifications] read-all error:', err.message);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

// DELETE /notifications — clear all
router.delete('/', async (req, res) => {
  try {
    await db.query(
      'DELETE FROM notifications WHERE notifiable_id = ? AND notifiable_type = ?',
      [req.userId, 'App\\Models\\User']
    );
    res.json({ message: 'All notifications cleared' });
  } catch (err) {
    console.error('[notifications] clear error:', err.message);
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
});

// POST /notifications/:id/read
router.post('/:id/read', async (req, res) => {
  try {
    const [result] = await db.query(
      `UPDATE notifications SET read_at = NOW()
       WHERE id = ? AND notifiable_id = ? AND notifiable_type = ?`,
      [req.params.id, req.userId, 'App\\Models\\User']
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('[notifications] mark-read error:', err.message);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

module.exports = router;
