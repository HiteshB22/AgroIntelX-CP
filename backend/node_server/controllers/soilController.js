import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import SoilReport from "../models/SoilReport.js";
import { uploadPdfToCloudinary } from "../services/cloudinaryService.js";

export const analyzeSoil = async (req, res) => {
  try {
    const fastapiBaseUrl = process.env.FASTAPI_URL || "http://localhost:8000";
    // ---------------- USER & INPUT ----------------
    const userId = req.user._id;
    const { source, nutrients } = req.body;
    console.log({ userId, source, nutrients });
    // Initialize variables
    let pdfUrl = null;
    let parsedNutrients = null;
    let aiResult = null;
    let extractedData = null;

    // ============================================================
    // VALIDATION
    // ============================================================

    // Validate source type
    if (!source || !["pdf", "manual"].includes(source)) {
      return res.status(400).json({
        message: "Invalid or missing source (pdf/manual)",
      });
    }

    // Validate PDF upload
    if (source === "pdf" && !req.file) {
      return res.status(400).json({
        message: "PDF file is required",
      });
    }

    // Validate manual input
    if (source === "manual") {
      if (!nutrients) {
        return res.status(400).json({
          message: "Nutrients data required",
        });
      }

      try {
        parsedNutrients = JSON.parse(nutrients);
      } catch {
        return res.status(400).json({
          message: "Invalid nutrients JSON format",
        });
      }
    }

    // ============================================================
    // CASE 1: PDF INPUT → FASTAPI (Gemini + Extraction)
    // ============================================================
    if (source === "pdf" && req.file) {

      // Create multipart form data
      const form = new FormData();
      form.append("file", fs.createReadStream(req.file.path));

      // Send PDF to FastAPI for processing
      const fastapiResponse = await axios.post(
        `${fastapiBaseUrl}/api/analyze-soil-report`,
        form,
        {
          headers: form.getHeaders(),
          timeout: 120000, // 2 min timeout
        }
      );

      // Extract AI + parsed soil values
      aiResult = fastapiResponse.data.ai_analysis_data;
      extractedData = fastapiResponse.data.extracted_data;

      // Upload PDF to Cloudinary for storage
      const uploadResult = await uploadPdfToCloudinary(req.file.path);
      pdfUrl = uploadResult.secure_url;
    }

    // ============================================================
    // CASE 2: MANUAL INPUT → FASTAPI /predict (ML Model)
    // ============================================================
    if (source === "manual") {

      const fastapiResponse = await axios.post(
        `${fastapiBaseUrl}/predict`,
        parsedNutrients,
        {
          headers: { "Content-Type": "application/json" },
          timeout: 60000,
        }
      );

      const data = fastapiResponse.data;
      console.log("Received ML analysis result:-------\n", data);

      // Normalize response (important for frontend consistency)
      aiResult = {
        soil_health_analysis: data.soil_health_analysis,
        soil_health_score: data.soil_health_score,
        soil_health_grade: data.soil_health_grade,
        recommended_crop: data.recommended_crop,
        recommended_fertilizer: data.recommended_fertilizer,
        top_crops: data.top_crops || [],
        top_fertilizers: data.top_fertilizers || [],
      };
      console.log("Normalized AI Result:-------\n");
      console.log(JSON.stringify(aiResult.top_crops, null, 2));
      // Manual input itself is treated as extracted data
      extractedData = parsedNutrients;
    }

    // ============================================================
    // NORMALIZE EXTRACTED INPUT DATA
    // ============================================================
    const extractedInputData = extractedData
      ? {
          district:
            extractedData.District_Name || extractedData.district || null,

          state:
            extractedData.State || extractedData.state || null,

          ph:
            extractedData.pH || extractedData.ph || null,

          nitrogen:
            extractedData.Nitrogen || extractedData.nitrogen || null,

          phosphorus:
            extractedData.Phosphorus || extractedData.phosphorus || null,

          potassium:
            extractedData.Potassium || extractedData.potassium || null,

          organicCarbon:
            extractedData.Organic_Carbon ||
            extractedData.organicCarbon ||
            null,

          sulphur:
            extractedData.Sulphur || extractedData.sulphur || null,

          zinc:
            extractedData.Zinc || extractedData.zinc || null,

          iron:
            extractedData.Iron || extractedData.iron || null,

          // FIXED naming (lowercase for consistency)
          rainfall:
            extractedData.Rainfall || extractedData.rainfall || null,
        }
      : null;

    // ============================================================
    // SAVE REPORT TO DATABASE
    // ============================================================
    const soilReport = await SoilReport.create({
      userId,
      source,
      pdfUrl,

      // Store normalized input data
      extracted_input_data: extractedInputData,

      // Store AI analysis (final structured output)
      analysis: aiResult
        ? {
            soil_health_analysis: aiResult.soil_health_analysis,
            soil_health_score: aiResult.soil_health_score,
            soil_health_grade: aiResult.soil_health_grade,
            recommended_crop: aiResult.recommended_crop,

            
            recommended_fertilizer: aiResult.recommended_fertilizer,

            top_crops: aiResult.top_crops || [],
            top_fertilizers: aiResult.top_fertilizers || [],
          }
        : null,
    });

    console.log("soilReport---------\n",soilReport);

    // ============================================================
    // RESPONSE
    // ============================================================
    res.status(201).json({
      message: "Soil analysis completed successfully",
      data: soilReport,
    });

  } catch (err) {
    console.error("Soil analysis error:", err.response?.data || err.message);

    res.status(500).json({
      message: "Soil analysis failed",
    });
  }
};

// ============================================================
// FETCH USER REPORTS
// ============================================================
export const getMySoilReports = async (req, res) => {
  try {
    const reports = await SoilReport.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(reports);

  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch reports",
    });
  }
};