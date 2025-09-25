import { config } from 'dotenv';
import { GoogleGenerativeAI, GenerationConfig } from '@google/generative-ai';

config();

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private generationConfig: GenerationConfig;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables. Please check your .env file.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    
    // Configure the model to return JSON
    this.generationConfig = {
      responseMimeType: "application/json",
    };
  }

  public async generateContent(prompt: string): Promise<string> {
    try {
      // For text-only input, use the gemini-pro model
      const model = this.genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash", 
        generationConfig: this.generationConfig 
      });

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      console.log('--- LIVE GEMINI API CALL SUCCESSFUL ---');
      return text;
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw new Error("Failed to generate content from Gemini API.");
    }
  }
}

// Export a singleton instance so the rest of our app shares the same service
export const geminiService = new GeminiService();