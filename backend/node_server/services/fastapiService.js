import axios from "axios";
import FormData from "form-data";//Mainly used when your backend sends files/data to another API


export const analyzeSoilWithFastAPI = async ({ pdfUrl, location }) => {
  try {
    const fastapiBaseUrl = process.env.FASTAPI_URL || "http://localhost:8000";
    let data = {
      pdf_url: pdfUrl,
      location: {
        state: location.state,
        district: location.district,
      },
    }
    console.log("Sending request to FastAPI with PDF URL:", data);
    const response = await axios.post(
      `${fastapiBaseUrl}/api/analyze-soil-report`,
      {
        pdf_url: pdfUrl,
        location: {
          state: location.state,
          district: location.district,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 120000, // Gemini can be slow
      }
    );

    return response.data;
  } catch (error) {
  if (error.response?.status === 429) {
    throw new Error("Gemini API quota exceeded. Try again later.");
  }

  console.error(
    "❌ FastAPI PDF analysis error:",
    error.response?.data || error.message
  );

  throw new Error("FastAPI PDF analysis failed");
}
};
//-----------------------------------------------------------------------------------------------------
// import axios from "axios";
// import FormData from "form-data";
// import fs from "fs";

// const FASTAPI_BASE_URL = process.env.FASTAPI_URL || "http://localhost:8000";

// export const analyzeSoilWithFastAPI = async ({ filePath, location }) => {
//   try {
//     const form = new FormData();
//     form.append("file", fs.createReadStream(filePath));
//     form.append("state", location.state);
//     form.append("district", location.district);

//     console.log("Sending PDF file directly to FastAPI...");

//     const response = await axios.post(
//       `${FASTAPI_BASE_URL}/api/analyze-soil-report`,
//       form,
//       {
//         headers: form.getHeaders(),
//         timeout: 120000,
//       }
//     );

//     return response.data;
//   } catch (error) {
//     if (error.response?.status === 429) {
//       throw new Error("Gemini API quota exceeded. Try again later.");
//     }

//     console.error(
//       "❌ FastAPI PDF analysis error:",
//       error.response?.data || error.message
//     );

//     throw new Error("FastAPI PDF analysis failed");
//   }
// };



//-----------------------------------------------------------------------------------------------------


// export const analyzeSoilWithFastAPI = async ({ pdfBuffer, manualInput }) => {
//   const formData = new FormData();

//   if (pdfBuffer) {
//     formData.append("file", pdfBuffer, {
//       filename: "soil.pdf",
//       contentType: "application/pdf",
//     });
//   }

//   if (manualInput) {
//     formData.append("manual_input", JSON.stringify(manualInput));
//   }

//   const response = await axios.post(
//     `${process.env.FASTAPI_URL}/predict`,
//     formData,
//     { headers: formData.getHeaders() }
//   );

//   return response.data;
// };



