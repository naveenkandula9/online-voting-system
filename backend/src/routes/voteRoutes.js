import { Router } from 'express';

import { castVote } from '../controllers/voteController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', protect, castVote);

export default router;
