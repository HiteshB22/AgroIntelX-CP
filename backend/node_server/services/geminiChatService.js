import { GoogleGenerativeAI } from "@google/generative-ai";

const USE_GEMINI = true; // Set to false to disable Gemini

// Initialize only if enabled
let genAI = null;
if (USE_GEMINI) {
  genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
}

export const generateChatResponse = async ({
  userMessage,
  soilReports,
  chatHistory,
}) => {

  // ======================================================
  // MOCK MODE (Gemini Disabled)
  // ======================================================
  if (!USE_GEMINI) {
    console.log("Gemini disabled. Returning mock response.");

    // You can make this smarter if you want
    return `
    [Mock AI Response]

You asked: "${userMessage}"

Based on your uploaded soil report:
- pH: ${soilReports[0]?.extracted_input_data?.ph || "N/A"}
- Nitrogen: ${soilReports[0]?.extracted_input_data?.nitrogen || "N/A"}
- Phosphorus: ${soilReports[0]?.extracted_input_data?.phosphorus || "N/A"}
- Potassium: ${soilReports[0]?.extracted_input_data?.potassium || "N/A"}

Suggested Action:
Apply balanced NPK fertilizer
Choose crops suitable for your soil conditions

(This is a test response. AI is currently disabled.)
`;
  }

  // ======================================================
  // REAL GEMINI MODE
  // ======================================================
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Build soil context
  const soilContext = soilReports.length
    ? soilReports
      .map(
        (r, i) => `
Report ${i + 1}:
District: ${r.extracted_input_data?.district || "N/A"}
pH: ${r.extracted_input_data?.ph || "N/A"}
Nitrogen: ${r.extracted_input_data?.nitrogen || "N/A"}
Phosphorus: ${r.extracted_input_data?.phosphorus || "N/A"}
Potassium: ${r.extracted_input_data?.potassium || "N/A"}
Recommended Crop: ${r.analysis?.recommended_crop || "N/A"}
Recommended Fertilizers: ${r.analysis?.recommended_fertilizers || "N/A"}
Soil Health: ${r.analysis?.soil_health_grade || "N/A"}
`
      )
      .join("\n")
    : "No soil reports available.";

  // Build chat memory
  const memory = chatHistory
    .map(
      (msg) =>
        `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.message}`
    )
    .join("\n");

  const prompt = `
You are AgroIntelX AI Assistant, an agriculture expert for Indian farmers.

User Soil Reports:
${soilContext}

Conversation History:
${memory}

User Question:
${userMessage}

Respond with clear, actionable agricultural advice.
Avoid generic answers. Use the user's soil data. give response with proper format.

GUARDRAILS:
- If the user asks questions unrelated to agriculture, soil health, or farming, politely decline to answer.
- Base your recommendations purely on the provided User Soil Reports and Conversation History. Do not hallucinate facts or data.
- If you do not have enough information to answer accurately, inform the user rather than guessing.
`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
};
