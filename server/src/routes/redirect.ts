import { Router, Request, Response } from 'express';
import { getLinkByShortCode } from '../services/link';
import { recordClick } from '../services/analytics';

const router = Router();

router.get('/:shortCode', (req: Request, res: Response) => {
  const link = getLinkByShortCode(req.params.shortCode as string);

  if (!link) {
    res.status(404).send('Link not found');
    return;
  }

  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    res.status(410).send('Link has expired');
    return;
  }

  recordClick(
    link.id,
    req.ip,
    req.headers.referer as string | undefined,
    req.headers['user-agent'] as string | undefined
  );

  res.redirect(301, link.original_url);
});

export default router;
