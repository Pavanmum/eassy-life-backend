import { Router } from "express";
import { createService, getAllServices } from "../controllers/serviceController.js";

const router = Router();

router.post("/", createService);
router.get("/",getAllServices);

export default router;