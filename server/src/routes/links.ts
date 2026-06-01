import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createLink, getLinksByUser, getLinkById, updateLink, deleteLink } from '../services/link';
import QRCode from 'qrcode';

const router = Router();

router.use(authenticate);

router.post('/', (req: AuthRequest, res: Response) => {
  try {
    const { originalUrl, customSlug, title, expiresAt } = req.body;
    if (!originalUrl) {
      res.status(400).json({ error: 'Original URL is required' });
      return;
    }

    const link = createLink({
      userId: req.userId!,
      originalUrl,
      customSlug,
      title,
      expiresAt,
    });

    res.status(201).json(link);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', (req: AuthRequest, res: Response) => {
  const links = getLinksByUser(req.userId!);
  res.json({ links });
});

router.get('/:id', (req: AuthRequest, res: Response) => {
  const link = getLinkById(parseInt(req.params.id as string), req.userId!);
  if (!link) {
    res.status(404).json({ error: 'Link not found' });
    return;
  }
  res.json(link);
});

router.put('/:id', (req: AuthRequest, res: Response) => {
  const { originalUrl, title, expiresAt, isActive } = req.body;
  const link = updateLink(parseInt(req.params.id as string), req.userId!, {
    originalUrl,
    title,
    expiresAt: expiresAt === undefined ? undefined : expiresAt,
    isActive,
  });

  if (!link) {
    res.status(404).json({ error: 'Link not found' });
    return;
  }
  res.json(link);
});

router.delete('/:id', (req: AuthRequest, res: Response) => {
  const deleted = deleteLink(parseInt(req.params.id as string), req.userId!);
  if (!deleted) {
    res.status(404).json({ error: 'Link not found' });
    return;
  }
  res.json({ message: 'Link deleted' });
});

router.post('/:id/qr', (req: AuthRequest, res: Response) => {
  const link = getLinkById(parseInt(req.params.id as string), req.userId!);
  if (!link) {
    res.status(404).json({ error: 'Link not found' });
    return;
  }

  const shortUrl = `${req.protocol}://${req.get('host')}/${link.short_code}`;
  QRCode.toDataURL(shortUrl, { width: 300 }, (err, url) => {
    if (err) {
      res.status(500).json({ error: 'Failed to generate QR code' });
      return;
    }
    res.json({ qrCode: url, shortUrl });
  });
});

export default router;
