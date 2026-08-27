import { Router } from "express";
import { requirePermission } from "../middleware/requirePermission";
import { validateBody, validateQuery } from "../middleware/validate";
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  verifyUserDocument,
  approveMembership,
  getUserPayments,
} from "../controllers/adminUserController";
import {
  adminListUsersQuerySchema,
  adminCreateUserSchema,
  adminUpdateUserSchema,
  verifyDocumentSchema,
  approveMembershipSchema,
} from "../utils/schemas";

const router = Router();

router.get("/", ...requirePermission("users.view"), validateQuery(adminListUsersQuerySchema), listUsers);
router.get("/:id", ...requirePermission("users.view"), getUserById);
router.post("/", ...requirePermission("users.add"), validateBody(adminCreateUserSchema), createUser);
router.patch(
  "/:id",
  ...requirePermission("users.update"),
  validateBody(adminUpdateUserSchema),
  updateUser
);
router.delete("/:id", ...requirePermission("users.delete"), deleteUser);
router.patch(
  "/:id/documents/:docId/verify",
  ...requirePermission("users.verifyDocuments"),
  validateBody(verifyDocumentSchema),
  verifyUserDocument
);
router.patch(
  "/:id/membership/approve",
  ...requirePermission("users.approveMembership"),
  validateBody(approveMembershipSchema),
  approveMembership
);
router.get("/:id/payments", ...requirePermission("users.view"), getUserPayments);

export default router;
