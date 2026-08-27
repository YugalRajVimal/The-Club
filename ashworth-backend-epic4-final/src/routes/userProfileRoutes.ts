import { Router } from "express";
import { userAuth } from "../middleware/userAuth";
import { validateBody } from "../middleware/validate";
import { getProfile, updateProfile } from "../controllers/profileController";
import { updateProfileSchema } from "../utils/schemas";

const router = Router();

router.get("/", userAuth, getProfile);
router.patch("/", userAuth, validateBody(updateProfileSchema), updateProfile);

export default router;
