import { Router } from "express";
import { getBannerAnime } from "../controllers/getbanner.controller.js";

const router = Router();

router.get("/", getBannerAnime);

export default router;