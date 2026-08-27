import { Router } from "express";
import { requirePermission } from "../middleware/requirePermission";
import { uploadMemory } from "../middleware/uploadMemory";
import { parseJsonFields } from "../middleware/parseJsonFields";
import { validateBody } from "../middleware/validate";
import { listClubsAdmin, createClub, updateClub, deleteClub } from "../controllers/adminClubController";
import { adminCreateClubSchema, adminUpdateClubSchema } from "../utils/schemas";

const router = Router();

const NESTED_FIELDS = ["membershipFee", "whatWeOffer"];

router.get("/", ...requirePermission("clubs.view"), listClubsAdmin);

// Accepts multipart/form-data (field name "heroImage" for the file) OR a
// plain JSON body with heroImageUrl as a string — uploadMemory.single()
// only kicks in when the request actually is multipart; a JSON request
// simply has no file and req.file stays undefined.
router.post(
  "/",
  ...requirePermission("clubs.add"),
  uploadMemory.single("heroImage"),
  parseJsonFields(NESTED_FIELDS),
  validateBody(adminCreateClubSchema),
  createClub
);

router.patch(
  "/:id",
  ...requirePermission("clubs.update"),
  uploadMemory.single("heroImage"),
  parseJsonFields(NESTED_FIELDS),
  validateBody(adminUpdateClubSchema),
  updateClub
);

router.delete("/:id", ...requirePermission("clubs.delete"), deleteClub);

export default router;
