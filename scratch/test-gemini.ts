import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(__dirname, "../backend/.env") });

import { AIProviderService } from "../backend/src/services/ai/ai-provider.service";

async function testGemini() {
  console.log("Testing Gemini API with key loaded from backend/.env...");
  const res = await AIProviderService.generateJobDescription({
    title: "Senior AI Engineer",
    department: "Engineering",
    keySkills: ["TypeScript", "Python", "Gemini"],
  });
  console.log("Gemini API Output:", JSON.stringify(res, null, 2));
}

testGemini().catch(console.error);
