import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getWeatherForecast } from "../controllers/weatherController.js";

const router = express.Router();

router.get("/forecast", protect, getWeatherForecast);

export default router;
