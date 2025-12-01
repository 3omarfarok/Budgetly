import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    // For some reason listModels is not directly exposed in the main class in some versions,
    // but let's try to infer or just test a simple generation with a fallback.
    // Actually, the SDK has a model listing feature but it might be on the model manager.
    // Let's try a different approach: just try 'gemini-1.0-pro' or 'gemini-1.5-flash-001'

    console.log("Testing models...");

    const modelsToTest = [
      "gemini-1.5-flash",
      "gemini-1.5-flash-001",
      "gemini-1.5-pro",
      "gemini-1.5-pro-001",
      "gemini-pro",
      "gemini-1.0-pro",
    ];

    for (const modelName of modelsToTest) {
      try {
        console.log(`Testing ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        const response = await result.response;
        console.log(`✅ Success with ${modelName}`);
        return; // Found one!
      } catch (error) {
        console.log(`❌ Failed ${modelName}: ${error.message.split("\n")[0]}`);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

listModels();
