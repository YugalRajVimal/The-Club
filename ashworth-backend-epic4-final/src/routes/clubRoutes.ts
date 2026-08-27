import { Router } from "express";
import { listClubs, getClubBySlug } from "../controllers/clubController";

const router = Router();

router.get("/", listClubs);
router.get("/:slug", getClubBySlug);

export default router;
