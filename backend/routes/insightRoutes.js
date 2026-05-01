import { Router } from 'express';
import { generateInsights, listInsights, getInsight, deleteInsight } from '../controllers/insightController.js';
import { authenticate } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/:id/generate', authenticate, aiLimiter, generateInsights);
router.get('/', authenticate, listInsights);
router.get('/:id', authenticate, getInsight);
router.delete('/:id', authenticate, deleteInsight);

export default router;