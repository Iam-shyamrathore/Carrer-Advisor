import { FastifyInstance, FastifyRequest } from 'fastify';
import prisma from '../lib/prisma';
import { z } from 'zod';
import { ProfileAnalyzerAgent } from '../agents/ProfileAnalyzerAgent';
import { RoadmapCreatorAgent } from '../agents/RoadmapCreatorAgent';
import axios from 'axios';

const profileAnalyzer = new ProfileAnalyzerAgent();
const roadmapCreator = new RoadmapCreatorAgent();

// Helper to fetch data from GitHub API
async function getGitHubData(username: string): Promise<string> {
  try {
    const token = process.env.GITHUB_API_TOKEN;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const userResponse = await axios.get(`https://api.github.com/users/${username}`, { headers });
    const reposResponse = await axios.get(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=5`, { headers });

    let githubText = `GitHub Profile for ${username}:\n`;
    if (userResponse.data.bio) {
      githubText += `Bio: ${userResponse.data.bio}\n`;
    }
    githubText += `Top 5 Recently Pushed Repositories:\n`;
    for (const repo of reposResponse.data) {
      githubText += `- ${repo.name}: ${repo.description || 'No description'}. Main language: ${repo.language}\n`;
    }
    return githubText;
  } catch (error) {
    console.error(`Failed to fetch data for GitHub user ${username}`, error);
    return `Could not fetch data for GitHub user ${username}.`;
  }
}

// Zod schema for the JSON body from the frontend
const AnalyzeAndSaveBodySchema = z.object({
  userId: z.string().cuid(),
  resumeText: z.string().optional(),
  githubUrl: z.string().url().optional(),
});

async function profileRoutes(fastify: FastifyInstance) {

  // POST /api/v1/profile/analyze-and-save
  fastify.post('/analyze-and-save', async (request, reply) => {
    try {
      const { userId, resumeText, githubUrl } = AnalyzeAndSaveBodySchema.parse(request.body);

      let combinedProfileText = '';
      if (resumeText) {
        combinedProfileText += "--- RESUME CONTENT ---\n" + resumeText + "\n\n";
      }
      if (githubUrl) {
        const match = githubUrl.match(/github\.com\/([^\/]+)/);
        if (match && match[1]) {
          const username = match[1];
          const githubData = await getGitHubData(username);
          combinedProfileText += "--- GITHUB PROFILE DATA ---\n" + githubData;
        }
      }

      if (!combinedProfileText.trim()) {
        return reply.status(400).send({ error: 'No resume text or valid GitHub URL provided.' });
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return reply.status(404).send({ message: 'User not found.' });
      }

      const analysisResult = await profileAnalyzer.execute({ input: { profileText: combinedProfileText } });
      
      const savedAnalysis = await prisma.profileAnalysis.create({
        data: {
          profileText: combinedProfileText,
          result: JSON.stringify(analysisResult),
          userId: userId,
        },
      });
      return reply.status(201).send(savedAnalysis);
    } catch (error) {
      fastify.log.error(error, 'Error during analyze-and-save');
      return reply.status(500).send({ error: 'An unexpected error occurred.' });
    }
  });
  
  // POST /api/v1/profile/:analysisId/roadmap
  fastify.post('/:analysisId/roadmap', async (request, reply) => {
    try {
      const { analysisId } = request.params as { analysisId: string };
      const existingRoadmap = await prisma.roadmap.findUnique({ where: { profileAnalysisId: analysisId } });
      if (existingRoadmap) return reply.status(200).send(existingRoadmap);
      
      const analysis = await prisma.profileAnalysis.findUnique({ where: { id: analysisId } });
      if (!analysis) return reply.status(404).send({ error: 'Analysis not found' });
      
      const analysisResultObject = JSON.parse(analysis.result);
      const roadmapResult = await roadmapCreator.execute({ input: analysisResultObject });

      const newRoadmap = await prisma.roadmap.create({
        data: {
          profileAnalysisId: analysisId,
          phases: JSON.stringify(roadmapResult),
        },
      });
      return reply.status(201).send(newRoadmap);
    } catch (error) {
      fastify.log.error(error, 'Error creating roadmap');
      return reply.status(500).send({ error: 'Failed to create roadmap' });
    }
  });

  // GET /api/v1/profile/:analysisId
  fastify.get('/:analysisId', async (request, reply) => {
    try {
      const { analysisId } = request.params as { analysisId: string };
      const analysis = await prisma.profileAnalysis.findUnique({
        where: { id: analysisId },
        include: { roadmap: { include: { resources: true } } },
      });

      if (!analysis) return reply.status(404).send({ error: 'Analysis not found' });
      return reply.status(200).send(analysis);
    } catch (error) {
      fastify.log.error(error, "Error fetching single analysis");
      return reply.status(500).send({ message: "An internal server error occurred." });
    }
  });
}

export default profileRoutes;