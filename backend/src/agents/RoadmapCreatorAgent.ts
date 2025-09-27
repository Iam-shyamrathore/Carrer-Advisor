import { z } from 'zod';
import { IAgent, AgentExecuteParams } from './types';
import { geminiService } from '../services/gemini';

// Define the structured output we expect from the LLM
const RoadmapPhaseSchema = z.object({
  title: z.string().describe("e.g., 'Months 0-3: Foundational Skills'"),
  milestones: z.array(z.string()).describe("A list of 3-5 actionable goals for this phase."),
});

const RoadmapOutputSchema = z.object({
  roadmap: z.array(RoadmapPhaseSchema),
});

type RoadmapOutput = z.infer<typeof RoadmapOutputSchema>;

// Define the input, which is the result of the ProfileAnalyzerAgent
interface RoadmapInput {
  analysis: string;
  suggestions: string[];
}

export class RoadmapCreatorAgent implements IAgent<RoadmapInput, RoadmapOutput> {
  async execute({ input }: AgentExecuteParams<RoadmapInput>): Promise<RoadmapOutput> {
    const prompt = this.createPrompt(input);
    const rawResponse = await geminiService.generateContent(prompt);

    try {
      const parsedJson = JSON.parse(rawResponse);
      return RoadmapOutputSchema.parse(parsedJson);
    } catch (error) {
      console.error("Failed to validate RoadmapCreatorAgent output:", error);
      throw new Error("The response from the AI was not in the expected format.");
    }
  }

  private createPrompt(input: RoadmapInput): string {
    return `
      Based on the following professional profile analysis, create a personalized 3-phase career roadmap (Months 0-3, 3-6, and 6-12) for a student or new graduate.
      
      The analysis identified the following strengths and weaknesses:
      Analysis: "${input.analysis}"
      Suggestions for improvement: "${input.suggestions.join(', ')}"

      Your task is to generate a roadmap with clear, actionable milestones for each phase. Focus on free or low-cost resources (like specific documentation to read, types of personal projects to build, key open-source libraries to explore, or concepts to master).

      Respond ONLY with a valid JSON object in the following format:
      {
        "roadmap": [
          {
            "title": "Months 0-3: Phase Title",
            "milestones": ["Milestone 1...", "Milestone 2...", "Milestone 3..."]
          },
          {
            "title": "Months 3-6: Phase Title",
            "milestones": ["Milestone 1...", "Milestone 2...", "Milestone 3..."]
          },
          {
            "title": "Months 6-12: Phase Title",
            "milestones": ["Milestone 1...", "Milestone 2...", "Milestone 3..."]
          }
        ]
      }
    `;
  }
}