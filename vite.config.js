import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import express from 'express';
import apiRouter from './server/apiRouter.js';
import { connectDB } from './server/config/db.js';
import { bootstrapSystem } from './server/bootstrap.js';

function hunarBackendPlugin() {
  return {
    name: 'hunar-backend-plugin',
    async configureServer(server) {
      // Connect database and run initial seed bootstrap
      await connectDB();
      await bootstrapSystem();

      // Mount API Router on /api with json parser
      const apiApp = express();
      apiApp.use(express.json());
      apiApp.use(express.urlencoded({ extended: true }));
      apiApp.use('/api', apiRouter);
      apiApp.use('/api', (_req, res) => {
        res.status(404).json({ success: false, message: 'API endpoint not found.' });
      });
      server.middlewares.use(apiApp);
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), hunarBackendPlugin()],
});
