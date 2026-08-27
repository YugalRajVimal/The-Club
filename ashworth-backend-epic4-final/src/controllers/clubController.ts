import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { Errors } from "../utils/errors";
import { Club } from "../models/Club";

// GET /api/clubs
export const listClubs = asyncHandler(async (_req: Request, res: Response) => {
  const clubs = await Club.find().sort({ createdAt: 1 });
  return sendSuccess(res, clubs);
});

// GET /api/clubs/:slug
export const getClubBySlug = asyncHandler(async (req: Request, res: Response) => {
  const club = await Club.findOne({ slug: req.params.slug.toLowerCase() });
  if (!club) throw Errors.notFound("Club not found");
  return sendSuccess(res, club);
});
