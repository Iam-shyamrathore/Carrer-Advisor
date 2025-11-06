import { z } from 'zod';
import { IAgent, AgentExecuteParams } from './types';
import { geminiService } from '../services/gemini';

// 1. Define the Zod schema for the agent's output.
// This schema enforces the structure, types, and even content rules.
const ProfileAnalysisOutputSchema = z.object({
  analysis: z.string().min(10, { message: "Analysis must be a meaningful summary." }),
  suggestions: z.array(z.string().min(5, { message: "Suggestions must be actionable." }))
    .min(1, { message: "At least one suggestion is required." })
    .max(5, { message: "No more than 5 suggestions should be provided." }),
});

// 2. Infer the TypeScript type directly from the Zod schema.
// This is a best practice to avoid maintaining a separate type definition.
type ProfileAnalysisOutput = z.infer<typeof ProfileAnalysisOutputSchema>;

// Define the structure of the input for this specific agent
export interface ProfileAnalysisInput {
  profileText: string;
}

export class ProfileAnalyzerAgent implements IAgent<ProfileAnalysisInput, ProfileAnalysisOutput> {
  
  async execute({ input }: AgentExecuteParams<ProfileAnalysisInput>): Promise<ProfileAnalysisOutput> {
    console.log('ProfileAnalyzerAgent: Executing with input...');

    const prompt = this.createPrompt(input.profileText);
    const rawResponse = await geminiService.generateContent(prompt);
    
    // 3. Parse and validate the response using the Zod schema.
    try {
      const parsedJson = JSON.parse(rawResponse);
      const validatedResponse = ProfileAnalysisOutputSchema.parse(parsedJson);
      
      console.log('ProfileAnalyzerAgent: Successfully validated response:', validatedResponse);
      return validatedResponse;
    } catch (error) {
      console.error("Validation Error:", error);
      // If validation fails, we throw an error to be caught by the API layer.
      throw new Error("Failed to get a valid analysis from the AI service. The response was malformed.");
    }
  }

  private createPrompt(profileText: string): string {
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