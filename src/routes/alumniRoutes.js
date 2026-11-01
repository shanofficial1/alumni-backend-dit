import { Router } from 'express';
import { getMyProfile, listAlumni, updateMyProfile } from '../controllers/alumniController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
const router = Router();
router.get('/me', authenticate, getMyProfile);
router.patch('/me', authenticate, updateMyProfile);
router.get('/', authenticate, requireAdmin, listAlumni);
export default router;
