import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import {
  createLink,
  getLinksByUser,
  getLinkById,
  updateLink,
  deleteLink,
} from '../services/link';
import QRCode from 'qrcode';

const router = Router();

router.use(authenticate);

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { originalUrl, customSlug, title, expiresAt } = req.body;
    if (!originalUrl) {
      res.status(400).json({ error: 'Original URL is required' });
      return;
    }

    const link = await createLink({
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

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const links = await getLinksByUser(req.userId!);
    res.json({ links });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch links' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const link = await getLinkById(parseInt(req.params.id as string), req.userId!);
    if (!link) {
      res.status(404).json({ error: 'Link not found' });
      return;
    }
    res.json(link);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch link' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { originalUrl, title, expiresAt, isActive } = req.body;
    const link = await updateLink(parseInt(req.params.id as string), req.userId!, {
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to update link' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await deleteLink(parseInt(req.params.id as string), req.userId!);
    if (!deleted) {
      res.status(404).json({ error: 'Link not found' });
      return;
    }
    res.json({ message: 'Link deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete link' });
  }
});

router.post('/:id/qr', async (req: AuthRequest, res: Response) => {
  try {
    const link = await getLinkById(parseInt(req.params.id as string), req.userId!);
    if (!link) {
      res.status(404).json({ error: 'Link not found' });
      return;
    }

    const shortUrl = `${req.protocol}://${req.get('host')}/${link.short_code}`;
    const qrCode = await QRCode.toDataURL(shortUrl, { width: 300 });
    res.json({ qrCode, shortUrl });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

export default router;
