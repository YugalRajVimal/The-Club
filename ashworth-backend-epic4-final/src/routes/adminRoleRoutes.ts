import { Router } from "express";
import { requireSuperAdmin } from "../middleware/requireSuperAdmin";
import { validateBody } from "../middleware/validate";
import { listRoles, createRole, updateRole, deleteRole } from "../controllers/roleController";
import { createRoleSchema, updateRoleSchema } from "../utils/schemas";

// Section 10 of the contract: Roles & Sub-Admins management is restricted
// entirely to type === "admin" (super admin), regardless of any permission
// flag — requireSuperAdmin, not requirePermission, gates every route here.
// See middleware/requireSuperAdmin.ts for why this is a hard, separate
// check rather than a "settings.update"-style permission a sub-admin could
// ever be granted.

const router = Router();

router.get("/", ...requireSuperAdmin, listRoles);
router.post("/", ...requireSuperAdmin, validateBody(createRoleSchema), createRole);
router.patch("/:id", ...requireSuperAdmin, validateBody(updateRoleSchema), updateRole);
router.delete("/:id", ...requireSuperAdmin, deleteRole);

export default router;
