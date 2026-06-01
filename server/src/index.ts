import express from 'express';
import cors from 'cors';
import { config } from './config';
import authRoutes from './routes/auth';
import linkRoutes from './routes/links';
import redirectRoutes from './routes/redirect';
import analyticsRoutes from './routes/analytics';
import { rateLimit } from './middleware/rateLimit';

const app = express();

app.use(cors());
app.use(express.json());
app.use(rateLimit(100, 60000));

app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/links', analyticsRoutes);
app.use('/', redirectRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});

export default app;
