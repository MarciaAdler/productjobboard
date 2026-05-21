import { Router, Request, Response } from 'express';
import { getCache, setCache, invalidateCache } from '../cache/jobCache';
import { runAll } from '../scrapers/index';

export const jobsRouter = Router();

jobsRouter.get('/', async (req: Request, res: Response) => {
  try {
    if (req.query.refresh === 'true') {
      invalidateCache();
    }

    const cached = getCache();
    if (cached) {
      return res.json(cached);
    }

    const jobs = await runAll();
    setCache(jobs);
    return res.json(jobs);
  } catch (err) {
    console.error('[/api/jobs] error:', err);
    return res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

jobsRouter.get('/:id', (req: Request, res: Response) => {
  const cached = getCache();
  if (!cached) {
    return res.status(503).json({ error: 'Cache not ready, try again' });
  }
  const job = cached.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  return res.json(job);
});
