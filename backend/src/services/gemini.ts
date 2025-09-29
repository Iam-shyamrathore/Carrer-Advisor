import { config } from 'dotenv';
import { GoogleGenerativeAI, GenerationConfig } from '@google/generative-ai';
import NodeCache from 'node-cache'; // --- NEW: Import node-cache

config();

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private generationConfig: GenerationConfig;
  private cache: NodeCache; // --- NEW: Add a cache property

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables. Please check your .env file.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    
    this.generationConfig = {
      responseMimeType: "application/json",
    };

    // --- NEW: Initialize the cache.
    // stdTTL (Standard Time-To-Live) is the default lifetime in seconds for each cache entry.
    // 3600 seconds = 1 hour.
    this.cache = new NodeCache({ stdTTL: 3600 });
  }

  public async generateContent(prompt: string): Promise<string> {
    // --- NEW: Check for a cached response first.
    const cachedResponse = this.cache.get<string>(prompt);
    if (cachedResponse) {
      console.log('--- CACHE HIT ---');
      return cachedResponse;
    }

    console.log('--- CACHE MISS ---');
    try {
      const model = this.genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash", 
        generationConfig: this.generationConfig 
      });

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // --- NEW: Store the new response in the cache before returning.
      this.cache.set(prompt, text);

      console.log('--- LIVE GEMINI API CALL SUCCESSFUL ---');
      return text;
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw new Error("Failed to generate content from Gemini API.");
    }
  }
  public async generateChatResponse(
    prompt: string,
    history: { role: 'user' | 'model'; parts: { text: string }[] }[]
  ): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating chat response from Gemini API:', error);
      throw new Error('Failed to get chat response from Gemini API.');
    }
  }
  
}

export const geminiService = new GeminiService();