import { Router } from 'express';
import {
  archiveTask,
  createTask,
  getHeatmap,
  getTasks,
  updateTask,
  upsertDailyEntry
} from '../controllers/taskController.js';

const router = Router();

router.get('/', getTasks);
router.post('/', createTask);
router.patch('/:taskId', updateTask);
router.delete('/:taskId', archiveTask);
router.get('/heatmap/all', getHeatmap);
router.put('/:taskId/entry', upsertDailyEntry);

export default router;
