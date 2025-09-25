import { config } from 'dotenv';
config();

class GeminiService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('GEMINI_API_KEY is not set in environment variables.');
      // In a real app, you might throw an error here.
      // throw new Error('GEMINI_API_KEY is not set.');
    }
  }

  // This is a placeholder for now. It will eventually call the real Gemini API.
  public async generateContent(prompt: string): Promise<string> {
    console.log('--- MOCK GEMINI API CALL ---');
    console.log(`Prompt: ${prompt}`);
    console.log('----------------------------');
    
    // For now, return a mock JSON string to simulate a real response.
    const mockResponse = {
      analysis: "This is a mock analysis from the Gemini Service.",
      suggestions: ["Add more projects.", "Quantify achievements."]
    };

    return JSON.stringify(mockResponse, null, 2);
  }
}

// Export a singleton instance so the rest of our app shares the same service
export const geminiService = new GeminiService();