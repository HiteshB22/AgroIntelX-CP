import dotenv from "dotenv";
dotenv.config();

import { getLanguageFromLocation } from "./services/weatherService.js";
import { generateChatResponse } from "./services/geminiChatService.js";

const test = async () => {
  console.log("=== Testing Language Mapping ===");
  console.log("Ahmednagar ->", getLanguageFromLocation("Ahmednagar"));
  console.log("Satara ->", getLanguageFromLocation("Satara"));
  console.log("nayagarh ->", getLanguageFromLocation("nayagarh"));
  console.log("himatnagar ->", getLanguageFromLocation("himatnagar"));
  console.log("random state ->", getLanguageFromLocation("", "Gujarat"));
  console.log("default ->", getLanguageFromLocation(""));

  console.log("\n=== Testing Chat Response ===");
  try {
    const reply = await generateChatResponse({
      userMessage: "What crops are recommended for my alkaline soil?",
      soilReports: [
        {
          extracted_input_data: {
            district: "Satara",
            state: "Maharashtra",
            ph: 8.2,
            nitrogen: 150,
            phosphorus: 20,
            potassium: 300,
          },
          analysis: {
            recommended_crop: "Sorghum",
          }
        }
      ],
      chatHistory: [],
      weatherData: null,
      targetLanguage: "Marathi"
    });
    console.log("Marathi reply preview:\n", reply.substring(0, 500));
  } catch (error) {
    console.error("Chat test failed:", error);
  }
};

test();
