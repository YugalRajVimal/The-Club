import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { Errors } from "../utils/errors";
import { Club } from "../models/Club";
import { uploadFile } from "../services/storageService";

// GET /api/admin/clubs   [requirePermission("clubs.view")]
export const listClubsAdmin = asyncHandler(async (_req: Request, res: Response) => {
  const clubs = await Club.find().sort({ createdAt: 1 });
  return sendSuccess(res, clubs);
});

// POST /api/admin/clubs   [requirePermission("clubs.add")]
// heroImageUrl may arrive either as a plain string (client already hosts the
// image somewhere) OR as an uploaded file under the "heroImage" field — if a
// file is present it's routed through storageService (never handled
// directly here) and its returned fileUrl wins over any heroImageUrl string
// in the body.
export const createClub = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body;
  const file = req.file;

  const existing = await Club.findOne({ slug: body.slug.toLowerCase().trim() });
  if (existing) throw Errors.conflict("A club with this slug already exists");

  let heroImageUrl = body.heroImageUrl || "";
  if (file) {
    const uploaded = await uploadFile(file.buffer, file.originalname, "clubs/hero-images");
    heroImageUrl = uploaded.fileUrl;
  }

  const club = await Club.create({
    ...body,
    slug: body.slug.toLowerCase().trim(),
    heroImageUrl,
  });

  return sendSuccess(res, club, 201);
});

// PATCH /api/admin/clubs/:id   [requirePermission("clubs.update")]
// This is the endpoint Admin uses to change a club's fixed membership fee —
// membershipFee.amount flows through here like any other editable field,
// with no special-casing, since it's just another field on the Club doc.
export const updateClub = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body;
  const file = req.file;

  const update: Record<string, unknown> = { ...body };

  if (body.slug) {
    update.slug = body.slug.toLowerCase().trim();
    const existing = await Club.findOne({ slug: update.slug, _id: { $ne: req.params.id } });
    if (existing) throw Errors.conflict("Another club already uses this slug");
  }

  if (file) {
    const uploaded = await uploadFile(file.buffer, file.originalname, "clubs/hero-images");
    update.heroImageUrl = uploaded.fileUrl;
  }

  // membershipFee/whatWeOffer may arrive as partial objects (per the zod
  // schema's .partial()) — merge them onto the existing sub-document rather
  // than overwriting the whole nested object with a partial one.
  const club = await Club.findById(req.params.id);
  if (!club) throw Errors.notFound("Club not found");

  if (update.membershipFee) {
    update.membershipFee = { ...club.membershipFee, ...(update.membershipFee as object) };
  }
  if (update.whatWeOffer) {
    update.whatWeOffer = { ...club.whatWeOffer, ...(update.whatWeOffer as object) };
  }

  Object.assign(club, update);
  await club.save();

  return sendSuccess(res, club);
});

// DELETE /api/admin/clubs/:id   [requirePermission("clubs.delete")]
export const deleteClub = asyncHandler(async (req: Request, res: Response) => {
  const club = await Club.findByIdAndDelete(req.params.id);
  if (!club) throw Errors.notFound("Club not found");
  return sendSuccess(res, { message: "Club deleted" });
});
