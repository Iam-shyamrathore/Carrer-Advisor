import { z } from 'zod';
import { IAgent, AgentExecuteParams } from './types';
import { geminiService } from '../services/gemini';
import axios from 'axios';

// --- ZOD SCHEMAS ---
const ResourceSchema = z.object({
  title: z.string().describe("The concise title of the resource."),
  url: z.string().url().describe("The direct URL to the resource."),
  type: z.enum(["Article", "Video", "Interactive Tutorial", "Documentation", "Course"])
    .describe("The type of the resource."),
  description: z.string().describe("A one-sentence explanation of why this resource is useful for the milestone."),
});

const ResourceOutputSchema = z.object({
  resources: z.array(ResourceSchema).length(3, "You must provide exactly 3 resources."),
});

type ResourceOutput = z.infer<typeof ResourceOutputSchema>;

interface ResourceInput {
  milestone: string;
}

// --- Type for Google Search API results ---
interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

export class ResourceRecommenderAgent implements IAgent<ResourceInput, ResourceOutput> {
  async execute({ input }: AgentExecuteParams<ResourceInput>): Promise<ResourceOutput> {
    const searchResults = await this.performSearch(input.milestone);
    if (searchResults.length === 0) {
      throw new Error("Could not find any web results for this milestone.");
    }
    
    const prompt = this.createPrompt(input, searchResults);
    const rawResponse = await geminiService.generateContent(prompt);

    try {
      const parsedJson = JSON.parse(rawResponse);
      return ResourceOutputSchema.parse(parsedJson);
    } catch (error) {
      console.error("Failed to validate ResourceRecommenderAgent output:", error, { rawResponse });
      throw new Error("The response from the AI was not in the expected format.");
    }
  }

  private async performSearch(query: string): Promise<SearchResult[]> {
    const apiKey = process.env.SEARCH_API_KEY;
    const searchEngineId = process.env.SEARCH_ENGINE_ID;
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}`;

    try {
      const response = await axios.get(url);
      if (!response.data.items) {
        return [];
      }
      return response.data.items.slice(0, 5).map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
      }));
    } catch (error) {
      console.error("Error fetching Google Search results:", error);
      return [];
    }
  }

  private createPrompt(input: ResourceInput, searchResults: SearchResult[]): string {
    const searchResultsText = searchResults.map(
        (item, index) => `Result ${index + 1}:\nTitle: ${item.title}\nURL: ${item.link}\nSnippet: ${item.snippet}`
      ).join('\n\n');

    return `
      You are an expert career advisor for software developers. Your task is to act as a curator.
      Based *only* on the provided search results below, select the 3 best, most relevant, and free-to-access resources for the following career milestone.

      Milestone: "${input.milestone}"

      Here are the web search results to choose from:
      ---
      ${searchResultsText}
      ---
      
      Select the top 3 resources from the list above. For each, provide its title, its exact URL from the results, its type, and a one-sentence description.
      
      IMPORTANT: The "type" field MUST be one of these exact strings: "Article", "Video", "Interactive Tutorial", "Documentation", or "Course". Do not use any other values.

      Respond ONLY with a valid JSON object in the specified format. Do not invent or hallucinate any URLs; use only the URLs provided in the search results.
      The JSON object must look like this:
      {
        "resources": [
          { "title": "...", "url": "...", "type": "Article", "description": "..." },
          { "title": "...", "url": "...", "type": "Video", "description": "..." },
          { "title": "...", "url": "...", "type": "Documentation", "description": "..." }
        ]
      }
    `;
  }
}