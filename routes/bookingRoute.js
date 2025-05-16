import { Router } from "express";
import { createBooking, deleteBooking, myBooking } from "../controllers/bookingController.js";
import { authenticate } from "../middleware/isVerify.js";

const router = Router();

router.post("/",authenticate,createBooking);
router.get("/", authenticate, myBooking);
router.delete("/", authenticate, deleteBooking)

export default router;