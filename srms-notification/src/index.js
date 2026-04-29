require('dotenv').config();
const express = require('express');
const cors = require('cors');

const notificationRoutes = require('./routes/notifications');
const emailRoutes = require('./routes/email');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/notifications', notificationRoutes);
app.use('/email', emailRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'srms-notification' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`[srms-notification] running on http://localhost:${PORT}`);
});
