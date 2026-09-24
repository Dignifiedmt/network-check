import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiRouter } from './server/src/routes/api.ts';
import { db } from './server/src/db/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Security & Parsing Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Permit Vite dev and loaded assets
  crossOriginEmbedderPolicy: false,
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/health', (req, res) => {
  const dbStatus = db.getDatabaseStatus();
  res.json({
    status: 'ok',
    service: 'networkcheck',
    version: '1.0.0-hackathon-prod',
    demoMode: process.env.DEMO_MODE !== 'false',
    database: {
      type: dbStatus.type,
      connected: dbStatus.connected,
      records: {
        states: dbStatus.stateCount,
        lgas: dbStatus.lgaCount,
        baselines: dbStatus.baselineCount,
        reports: dbStatus.reportCount,
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// Mount /api routes
app.use('/api', apiRouter);

// USSD & SMS convenience direct routes (for direct Africa's Talking callback URL configuration)
app.use('/ussd', (req, res, next) => {
  req.url = '/ussd/webhook';
  apiRouter(req, res, next);
});
app.use('/sms', (req, res, next) => {
  req.url = '/sms/webhook';
  apiRouter(req, res, next);
});
app.use('/delivery-reports', (req, res, next) => {
  req.url = '/sms/delivery-reports';
  apiRouter(req, res, next);
});

async function startServer() {
  if (!isProduction) {
    // Development mode: attach Vite dev server middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('⚡ [Vite] Attached Vite dev middleware.');
  } else {
    // Production mode: serve static build assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log(`📦 [Production] Serving static files from ${distPath}`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [NetworkCheck] Server running on http://0.0.0.0:${PORT}`);
    console.log(`📡 USSD Webhook ready at: http://localhost:${PORT}/api/ussd/webhook`);
    console.log(`📱 SMS Webhook ready at: http://localhost:${PORT}/api/sms/webhook`);
    console.log(`🏥 Health check at: http://localhost:${PORT}/health`);
  });
}

startServer().catch(err => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
