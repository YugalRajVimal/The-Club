import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { Errors } from "../utils/errors";
import { Role, DEFAULT_PERMISSIONS, IPermissionMap } from "../models/Role";

// Deep-merges a (possibly partial) permissions payload onto
// DEFAULT_PERMISSIONS so every section/action key is always present and
// boolean — callers (requirePermission.ts) can safely do
// `permissions[section][action]` without a chain of optional-chaining.
function normalizePermissions(input: Partial<IPermissionMap> | undefined): IPermissionMap {
  const base = DEFAULT_PERMISSIONS;
  if (!input) return base;
  return {
    users: { ...base.users, ...(input.users ?? {}) },
    clubs: { ...base.clubs, ...(input.clubs ?? {}) },
    payments: { ...base.payments, ...(input.payments ?? {}) },
    settings: { ...base.settings, ...(input.settings ?? {}) },
  };
}

// GET /api/admin/roles   [requireSuperAdmin]
export const listRoles = asyncHandler(async (_req: Request, res: Response) => {
  const roles = await Role.find().sort({ createdAt: -1 });
  return sendSuccess(res, roles);
});

// POST /api/admin/roles   [requireSuperAdmin]
export const createRole = asyncHandler(async (req: Request, res: Response) => {
  const { name, permissions } = req.body;

  const existing = await Role.findOne({ name });
  if (existing) throw Errors.conflict("A role with this name already exists");

  const role = await Role.create({ name, permissions: normalizePermissions(permissions) });
  return sendSuccess(res, role, 201);
});

// PATCH /api/admin/roles/:id   [requireSuperAdmin]
export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const { name, permissions } = req.body;

  const role = await Role.findById(req.params.id);
  if (!role) throw Errors.notFound("Role not found");

  if (name && name !== role.name) {
    const existing = await Role.findOne({ name, _id: { $ne: role._id } });
    if (existing) throw Errors.conflict("A role with this name already exists");
    role.name = name;
  }

  if (permissions) {
    role.permissions = normalizePermissions({
      ...(role.permissions as IPermissionMap),
      ...permissions,
    });
  }

  await role.save();
  return sendSuccess(res, role);
});

// DELETE /api/admin/roles/:id   [requireSuperAdmin]
export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
  const role = await Role.findByIdAndDelete(req.params.id);
  if (!role) throw Errors.notFound("Role not found");
  return sendSuccess(res, { message: "Role deleted" });
});
