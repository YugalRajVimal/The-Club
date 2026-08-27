import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { getSettings, Settings } from "../models/Settings";

// GET /api/admin/settings   [requirePermission("settings.view")]
export const getUploadProviderSetting = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await getSettings();
  return sendSuccess(res, { uploadProvider: settings.uploadProvider });
});

// PATCH /api/admin/settings/upload-provider   [requirePermission("settings.update")]
// storageService.ts's uploadFile() calls getSettings() fresh on every
// invocation (never caches uploadProvider at process startup), so this
// write takes effect on the very next upload — no restart needed. See
// storageService.ts for the read side of that guarantee.
export const updateUploadProvider = asyncHandler(async (req: Request, res: Response) => {
  const { uploadProvider } = req.body;

  await getSettings(); // ensures the singleton row exists before we update it
  await Settings.updateOne({ singleton: "singleton" }, { $set: { uploadProvider } });

  return sendSuccess(res, { uploadProvider });
});
