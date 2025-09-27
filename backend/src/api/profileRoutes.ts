import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';
import { z } from 'zod';
import { ProfileAnalyzerAgent } from '../agents/ProfileAnalyzerAgent';
import { RoadmapCreatorAgent } from '../agents/RoadmapCreatorAgent';

const profileAnalyzer = new ProfileAnalyzerAgent();
const roadmapCreator = new RoadmapCreatorAgent();

// Schemas for request body validation
const AnalyzeBodySchema = z.object({
  profileText: z.string().min(20),
});

const AnalyzeAndSaveBodySchema = z.object({
  profileText: z.string().min(20),
  userId: z.string().cuid(),
});

async function profileRoutes(fastify: FastifyInstance) {
  // POST /api/v1/profile/analyze (anonymous)
  fastify.post('/analyze', async (request, reply) => {
    // ... existing logic ...
  });

  // POST /api/v1/profile/analyze-and-save
  fastify.post('/analyze-and-save', async (request, reply) => {
    // ... existing logic ...
  });

  // --- NEW ROUTE, CORRECTED PATH ---
  // POST /api/v1/profile/:analysisId/roadmap
  fastify.post('/:analysisId/roadmap', async (request, reply) => {
    try {
      const { analysisId } = request.params as { analysisId: string };

      const existingRoadmap = await prisma.roadmap.findUnique({
        where: { profileAnalysisId: analysisId },
      });
      if (existingRoadmap) {
        return reply.status(200).send(existingRoadmap);
      }

      const analysis = await prisma.profileAnalysis.findUnique({
        where: { id: analysisId },
      });
      if (!analysis) {
        return reply.status(404).send({ error: 'Analysis not found' });
      }

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
}

export default profileRoutes;