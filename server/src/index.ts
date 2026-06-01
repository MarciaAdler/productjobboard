import express from 'express';
import cors from 'cors';
import { jobsRouter } from './routes/jobs';
import { getCache, setCache, getCacheInfo } from './cache/jobCache';
import { runAll } from './scrapers/index';

const app = express();
const PORT = process.env.PORT || 3002;

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  ...(process.env.CLIENT_ORIGIN ? [process.env.CLIENT_ORIGIN] : []),
];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api/jobs', jobsRouter);

app.get('/api/health', (_req, res) => {
  const info = getCacheInfo();
  res.json({
    status: 'ok',
    cachedAt: info.cachedAt,
    jobCount: info.jobCount,
    cacheValid: info.valid,
  });
});

async function warmCache() {
  if (getCache()) return;
  console.log('[server] Warming cache...');
  try {
    const jobs = await runAll();
    setCache(jobs);
    console.log(`[server] Cache warm: ${jobs.length} jobs`);
  } catch (err) {
    console.error('[server] Cache warm failed:', err);
  }
}

app.listen(PORT, () => {
  console.log(`[server] Running on http://localhost:${PORT}`);
  warmCache();
  // Refresh every 30 minutes
  setInterval(warmCache, 30 * 60 * 1000);
});
