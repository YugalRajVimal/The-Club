import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { Errors } from "../utils/errors";
import { AdminAccount } from "../models/AdminAccount";
import { Role } from "../models/Role";

// GET /api/admin/subadmins   [requireSuperAdmin]
export const listSubAdmins = asyncHandler(async (_req: Request, res: Response) => {
  const subAdmins = await AdminAccount.find({ type: "sub_admin" })
    .populate("roleId")
    .sort({ createdAt: -1 });
  return sendSuccess(res, subAdmins);
});

// POST /api/admin/subadmins   [requireSuperAdmin]
export const createSubAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, roleId } = req.body;

  const role = await Role.findById(roleId);
  if (!role) throw Errors.notFound("Role not found");

  // Checked against ALL AdminAccounts (admin AND sub_admin) — admin/sub-admin
  // emails must be globally unique against each other. Deliberately NOT
  // checked against the User collection — a sub-admin's email is explicitly
  // allowed to duplicate a User's, per the contract.
  const existing = await AdminAccount.findOne({ email: email.toLowerCase().trim() });
  if (existing) throw Errors.conflict("An admin account with this email already exists");

  const passwordHash = await bcrypt.hash(password, 10);

  const subAdmin = await AdminAccount.create({
    name,
    email: email.toLowerCase().trim(),
    passwordHash,
    type: "sub_admin",
    roleId: role._id,
  });

  return sendSuccess(res, subAdmin, 201);
});

// PATCH /api/admin/subadmins/:id   [requireSuperAdmin]
export const updateSubAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { name, roleId, password } = req.body;

  const subAdmin = await AdminAccount.findOne({ _id: req.params.id, type: "sub_admin" });
  if (!subAdmin) throw Errors.notFound("Sub-admin not found");

  if (roleId) {
    const role = await Role.findById(roleId);
    if (!role) throw Errors.notFound("Role not found");
    subAdmin.roleId = role._id as any;
  }
  if (name) subAdmin.name = name;
  if (password) subAdmin.passwordHash = await bcrypt.hash(password, 10);

  await subAdmin.save();
  return sendSuccess(res, subAdmin);
});

// DELETE /api/admin/subadmins/:id   [requireSuperAdmin]
export const deleteSubAdmin = asyncHandler(async (req: Request, res: Response) => {
  const subAdmin = await AdminAccount.findOneAndDelete({ _id: req.params.id, type: "sub_admin" });
  if (!subAdmin) throw Errors.notFound("Sub-admin not found");
  return sendSuccess(res, { message: "Sub-admin deleted" });
});
