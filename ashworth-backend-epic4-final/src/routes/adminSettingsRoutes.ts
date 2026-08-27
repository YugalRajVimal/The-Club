import { Router } from "express";
import { requirePermission } from "../middleware/requirePermission";
import { validateBody } from "../middleware/validate";
import { getUploadProviderSetting, updateUploadProvider } from "../controllers/settingsController";
import { updateUploadProviderSchema } from "../utils/schemas";

const router = Router();

router.get("/", ...requirePermission("settings.view"), getUploadProviderSetting);
router.patch(
  "/upload-provider",
  ...requirePermission("settings.update"),
  validateBody(updateUploadProviderSchema),
  updateUploadProvider
);

export default router;
