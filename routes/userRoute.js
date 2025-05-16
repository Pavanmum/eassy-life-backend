import { Router } from "express";
import { createUser, getUser, loginUser, logout } from '../controllers/userController.js';
import { authenticate } from "../middleware/isVerify.js";
const router = Router();

router.post('/register', createUser);
router.post('/login', loginUser);
router.get('/', authenticate, getUser);
router.post('/logout', authenticate, logout);

export default router;