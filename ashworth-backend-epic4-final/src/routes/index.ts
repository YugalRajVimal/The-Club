import { Router } from "express";
import authUserRoutes from "./authUserRoutes";
import authAdminRoutes from "./authAdminRoutes";
import clubRoutes from "./clubRoutes";
import membershipRoutes from "./membershipRoutes";
import userDocumentRoutes from "./userDocumentRoutes";
import userProfileRoutes from "./userProfileRoutes";
import adminUserRoutes from "./adminUserRoutes";
import adminClubRoutes from "./adminClubRoutes";
import adminPaymentRoutes from "./adminPaymentRoutes";
import adminRoleRoutes from "./adminRoleRoutes";
import adminSubAdminRoutes from "./adminSubAdminRoutes";
import adminSettingsRoutes from "./adminSettingsRoutes";
import registrationRouter from "./registrationRoutes";

const router = Router();

router.use("/auth/user", authUserRoutes);
router.use("/auth/admin", authAdminRoutes);
router.use("/clubs", clubRoutes);
router.use("/membership", membershipRoutes);
router.use("/registration", registrationRouter);

router.use("/user/documents", userDocumentRoutes);
router.use("/user/profile", userProfileRoutes);
router.use("/admin/users", adminUserRoutes);
router.use("/admin/clubs", adminClubRoutes);
router.use("/admin/payments", adminPaymentRoutes);
router.use("/admin/roles", adminRoleRoutes);
router.use("/admin/subadmins", adminSubAdminRoutes);
router.use("/admin/settings", adminSettingsRoutes);

export default router;
