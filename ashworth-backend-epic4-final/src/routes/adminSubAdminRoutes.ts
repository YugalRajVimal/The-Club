import { Router } from "express";
import { requireSuperAdmin } from "../middleware/requireSuperAdmin";
import { validateBody } from "../middleware/validate";
import {
  listSubAdmins,
  createSubAdmin,
  updateSubAdmin,
  deleteSubAdmin,
} from "../controllers/subAdminController";
import { createSubAdminSchema, updateSubAdminSchema } from "../utils/schemas";

const router = Router();

router.get("/", ...requireSuperAdmin, listSubAdmins);
router.post("/", ...requireSuperAdmin, validateBody(createSubAdminSchema), createSubAdmin);
router.patch("/:id", ...requireSuperAdmin, validateBody(updateSubAdminSchema), updateSubAdmin);
router.delete("/:id", ...requireSuperAdmin, deleteSubAdmin);

export default router;
