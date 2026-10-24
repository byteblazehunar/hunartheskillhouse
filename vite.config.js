import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import apiRouter from './server/apiRouter.js';
import { connectDB } from './server/config/db.js';
import { bootstrapSystem } from './server/bootstrap.js';

// Vercel project variables are mounted outside the repository in local preview.
dotenv.config({ path: '/vercel/share/.env.project' });
dotenv.config({ path: '.env.development.local' });

function hunarBackendPlugin() {
  return {
    name: 'hunar-backend-plugin',
    async configureServer(server) {
      // Connect database and run initial seed bootstrap
      await connectDB();
      await bootstrapSystem();

      // Mount API Router on /api with json parser
      const apiApp = express();
      if (process.env.VERCEL === '1') apiApp.set('trust proxy', 1);
      apiApp.use(helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", 'https://www.googletagmanager.com'],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'https://hunar.courses', 'https://www.hunar.courses'],
            frameAncestors: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"]
          }
        },
        crossOriginEmbedderPolicy: false,
        hsts: process.env.NODE_ENV === 'production'
          ? { maxAge: 31536000, includeSubDomains: true, preload: true }
          : false
      }));
      apiApp.use(express.json({ limit: '32kb' }));
      apiApp.use(express.urlencoded({ extended: true, limit: '32kb' }));
      apiApp.use('/api', apiRouter);
      apiApp.use('/api', (_req, res) => {
        res.status(404).json({ success: false, message: 'API endpoint not found.' });
      });
      server.middlewares.use(apiApp);
    }
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  Object.assign(process.env, env);

  return {
    plugins: [react(), hunarBackendPlugin()],
  };
});
