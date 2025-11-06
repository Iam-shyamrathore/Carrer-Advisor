import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';
import { z } from 'zod';
import { ResourceRecommenderAgent } from '../agents/ResourceRecommenderAgent';

const resourceRecommender = new ResourceRecommenderAgent();

const resourceBodySchema = z.object({
  milestoneText: z.string().min(10),
});

async function roadmapRoutes(fastify: FastifyInstance) {
  // POST /api/v1/roadmaps/:roadmapId/resources
  fastify.post('/:roadmapId/resources', async (request, reply) => {
    try {
      const { roadmapId } = request.params as { roadmapId: string };
      const { milestoneText } = resourceBodySchema.parse(request.body);

      // Check if resources for this milestone already exist to prevent duplicate calls
      const existingResources = await prisma.resource.findMany({
        where: { roadmapId, milestoneText },
      });
      if (existingResources.length > 0) {
        return reply.status(200).send(existingResources);
      }

      // Execute the agent to get new resources
      const agentResult = await resourceRecommender.execute({
        input: { milestone: milestoneText },
      });

      // Save the new resources to the database
      const resourcesToCreate = agentResult.resources.map(res => ({
        ...res,
        milestoneText,
        roadmapId,
      }));
      
      await prisma.resource.createMany({
        data: resourcesToCreate,
      });
      
      // Return the newly created resources
      const newResources = await prisma.resource.findMany({
        where: { roadmapId, milestoneText },
      });

      return reply.status(201).send(newResources);
    } catch (error) {
      fastify.log.error(error, 'Error creating resources');
      return reply.status(500).send({ error: 'Failed to create resources' });
    }
  });
}

export default roadmapRoutes;