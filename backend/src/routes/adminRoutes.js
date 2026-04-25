import { Router } from 'express';

import {
  createCandidate,
  deleteCandidate,
  getActivityLogs,
  getElectionStatus,
  getUsers,
  startElection,
  stopElection,
  updateCandidate,
} from '../controllers/adminController.js';
import { protect, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect, requireAdmin);

router.post('/candidate', createCandidate);
router.put('/candidate/:id', updateCandidate);
router.delete('/candidate/:id', deleteCandidate);

router.get('/users', getUsers);
router.get('/logs', getActivityLogs);

router.get('/election', getElectionStatus);
router.post('/election/start', startElection);
router.post('/election/stop', stopElection);

export default router;
