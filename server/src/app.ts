import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import authRoutes from './routes/auth';
import linkRoutes from './routes/links';
import redirectRoutes from './routes/redirect';
import analyticsRoutes from './routes/analytics';
import { rateLimit } from './middleware/rateLimit';

const app = express();

app.set('trust proxy', 1);

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(rateLimit(100, 60000));

app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/links', analyticsRoutes);
app.use('/', redirectRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (config.isProduction && !process.env.VERCEL) {
  const clientDist = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else if (process.env.VERCEL) {
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/') || req.path === '/api/health' || /^\/[a-zA-Z0-9_-]{4,16}$/.test(req.path)) {
      next();
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  });
} else {
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
}

export default app;
