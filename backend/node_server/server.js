import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();
connectDB();

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
// import predictionRoutes from "./routes/predictionRoute.js";
import soilRoutes from "./routes/soilRoute.js";
import chatRoutes from "./routes/chatRoute.js";
import weatherRoutes from "./routes/weatherRoute.js";

const app = express();
const allowedOrigins = (process.env.FRONTEND_URL || "https://frontend-rho-five-28.vercel.app,http://localhost:3000,http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
}));

app.use("/api/auth", authRoutes);
// app.use("/api/predict", predictionRoutes);
app.use("/api/soil", soilRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/weather", weatherRoutes);
app.get("/", (req, res) => {
  res.send("AgroIntelX API running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Node.js Server running on port ${PORT}`));
