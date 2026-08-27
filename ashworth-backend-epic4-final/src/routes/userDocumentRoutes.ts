import { Router } from "express";
import { userAuth } from "../middleware/userAuth";
import { uploadMemory } from "../middleware/uploadMemory";
import { validateBody } from "../middleware/validate";
import {
  getRequiredList,
  uploadDocument,
  saveKycNumbers,
  listDocuments,
  submitDocuments,
} from "../controllers/documentController";
import { uploadDocumentSchema, kycNumbersSchema } from "../utils/schemas";

const router = Router();

router.get("/required-list", getRequiredList);
// multer runs first so multipart text fields land in req.body before validation.
router.post(
  "/upload",
  userAuth,
  uploadMemory.single("file"),
  validateBody(uploadDocumentSchema),
  uploadDocument
);
router.post("/kyc-numbers", userAuth, validateBody(kycNumbersSchema), saveKycNumbers);
router.get("/", userAuth, listDocuments);
router.post("/submit", userAuth, submitDocuments);

export default router;
