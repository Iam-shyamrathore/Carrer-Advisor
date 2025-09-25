import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { ProfileAnalyzerAgent } from '../agents/ProfileAnalyzerAgent';

const profileAnalyzer = new ProfileAnalyzerAgent();

// Schema for the anonymous analysis route
const AnalyzeBodySchema = z.object({
  profileText: z.string().min(20),
});

// Schema for the route that saves the analysis
const AnalyzeAndSaveBodySchema = z.object({
  profileText: z.string().min(20),
  userId: z.string().cuid(),
});


async function profileRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {

  // Route 1: Anonymous analysis (doesn't save to DB)
  fastify.post('/analyze', async (request, reply) => {
    try {
      const { profileText } = AnalyzeBodySchema.parse(request.body);
      const result = await profileAnalyzer.execute({ input: { profileText } });
      return reply.status(200).send(result);
    } catch (error) {
       if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: "Validation error", errors: error.issues });
      }
      fastify.log.error(error, 'Error executing anonymous analysis');
      return reply.status(500).send({ error: 'An unexpected error occurred.' });
    }
  });

  // Route 2: Analyze and save to a user's profile
  fastify.post('/analyze-and-save', async (request, reply) => {
    try {
      const { profileText, userId } = AnalyzeAndSaveBodySchema.parse(request.body);

      // Check if user exists
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return reply.status(404).send({ message: 'User not found.' });
      }

      // Execute analysis
      const analysisResult = await profileAnalyzer.execute({ input: { profileText } });
      
      // Save to database
      const savedAnalysis = await prisma.profileAnalysis.create({
        data: {
          profileText: profileText,
          result: analysisResult, // Prisma handles JSON serialization
          userId: userId,
        },
      });

      return reply.status(201).send(savedAnalysis);

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: "Validation error", errors: error.issues });
      }
      fastify.log.error(error, 'Error during analyze-and-save');
      return reply.status(500).send({ error: 'An unexpected error occurred.' });
    }
  });

}

export default profileRoutes;