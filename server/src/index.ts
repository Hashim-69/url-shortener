import app from './app';
import { config } from './config';
import { initializeDb } from './db';

initializeDb()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port} (${config.isProduction ? 'production' : 'development'})`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
