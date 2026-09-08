import { Router } from "express";
import { auditImage } from "../controllers/auditImage.js";
import { authenticate } from "../middleware/auth.js";

const auditRouter = Router();

auditRouter.post("/audit-image", authenticate, auditImage);

export { auditRouter };
