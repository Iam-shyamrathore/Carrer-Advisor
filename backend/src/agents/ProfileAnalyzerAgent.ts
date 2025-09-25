import { IAgent, AgentExecuteParams } from './types';
import { geminiService } from '../services/gemini';

// Define the structure of the input for this specific agent
export interface ProfileAnalysisInput {
  profileText: string;
}

// Define the structure of the output we expect from this agent
export interface ProfileAnalysisOutput {
  analysis: string;
  suggestions: string[];
}

export class ProfileAnalyzerAgent implements IAgent<ProfileAnalysisInput, ProfileAnalysisOutput> {
  
  async execute({ input }: AgentExecuteParams<ProfileAnalysisInput>): Promise<ProfileAnalysisOutput> {
    console.log('ProfileAnalyzerAgent: Executing with input...', input);

    const prompt = this.createPrompt(input.profileText);
    
    // Call our Gemini service (currently mocked)
    const rawResponse = await geminiService.generateContent(prompt);
    
    // In a real scenario, we'd need robust error handling and validation here.
    // For now, we'll trust the mock response is correctly formatted JSON.
    const parsedResponse: ProfileAnalysisOutput = JSON.parse(rawResponse);

    console.log('ProfileAnalyzerAgent: Parsed response from service:', parsedResponse);
    return parsedResponse;
  }

  private createPrompt(profileText: string): string {
    // This prompt is designed to instruct the LLM to return a specific JSON structure.
    // We'll use this exact prompt later when we call the real Gemini API.
    return `
      Analyze the following professional profile text from a resume, LinkedIn, or GitHub.
      Extract key skills, identify strengths, and suggest 2-3 actionable improvements.
      
      Respond ONLY with a valid JSON object in the following format:
      {
        "analysis": "A brief summary of the profile's strengths and weaknesses.",
        "suggestions": ["A concise, actionable suggestion.", "Another actionable suggestion."]
      }

      Profile Text:
      """
      ${profileText}
      """
    `;
  }
}