import { Router } from 'express';

import { createComplaint, getAllComplaints, getComplaints, updateComplaintStatus } from '../controllers/complaintController.js';
import { protect, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// User routes
router.post('/', protect, createComplaint);
router.get('/', protect, getComplaints);

// Admin routes
router.get('/admin/all', protect, requireAdmin, getAllComplaints);
router.put('/:id/status', protect, requireAdmin, updateComplaintStatus);

export default router;
