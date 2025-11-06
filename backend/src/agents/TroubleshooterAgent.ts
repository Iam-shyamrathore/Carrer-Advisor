import { IAgent, AgentExecuteParams } from './types';
import { geminiService } from '../services/gemini';

interface TroubleshooterInput {
  milestone: string;
  history: { role: 'user' | 'model'; content: string }[];
  question: string;
}

interface TroubleshooterOutput {
  response: string;
}

export class TroubleshooterAgent
  implements IAgent<TroubleshooterInput, TroubleshooterOutput>
{
  async execute({ input }: AgentExecuteParams<TroubleshooterInput>): Promise<TroubleshooterOutput> {
    const formattedHistory = input.history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    const fullPrompt = this.createPrompt(input.milestone, input.question);

    const response = await geminiService.generateChatResponse(fullPrompt, formattedHistory);
    return { response };
  }

  private createPrompt(milestone: string, question: string): string {
    return `
      CONTEXT:
      You are a friendly and encouraging career coach for a new software developer. 
      The user is feeling stuck on a specific milestone from their career roadmap.
      The milestone is: "${milestone}"

      INSTRUCTIONS:
      Your goal is NOT to give the user the answer directly. Instead, you should:
      1. Acknowledge their question and validate their feelings.
      2. Ask a clarifying question to better understand their specific problem.
      3. Suggest a very small, concrete first step they could take.
      4. Keep your response concise (2-4 sentences) and supportive.
      5. End your response with a question to encourage them to reply.

      CONVERSATION:
      User's latest question: "${question}"
    `;
  }
}