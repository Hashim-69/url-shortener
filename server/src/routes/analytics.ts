import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getLinkById } from '../services/link';
import { getClickStats } from '../services/analytics';

const router = Router();

router.use(authenticate);

router.get('/:linkId', async (req: AuthRequest, res: Response) => {
  try {
    const link = await getLinkById(parseInt(req.params.linkId as string), req.userId!);
    if (!link) {
      res.status(404).json({ error: 'Link not found' });
      return;
    }

    const stats = await getClickStats(link.id);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
