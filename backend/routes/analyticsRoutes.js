import { Router } from 'express';
import { getChartData, getDatasetStats } from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/:id/chart', authenticate, getChartData);
router.get('/:id/stats', authenticate, getDatasetStats);

export default router;