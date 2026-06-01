import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getLinkById } from '../services/link';
import { getClickStats } from '../services/analytics';

const router = Router();

router.use(authenticate);

router.get('/:linkId', (req: AuthRequest, res: Response) => {
  const link = getLinkById(parseInt(req.params.linkId as string), req.userId!);
  if (!link) {
    res.status(404).json({ error: 'Link not found' });
    return;
  }

  const stats = getClickStats(link.id);
  res.json(stats);
});

export default router;
