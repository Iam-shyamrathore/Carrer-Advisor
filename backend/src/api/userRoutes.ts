import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma';
// Import the specific error type from its runtime location
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const SignupBodySchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

async function userRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {

  fastify.post('/signup', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validatedBody = SignupBodySchema.parse(request.body);
      
      const newUser = await prisma.user.create({
        data: {
          email: validatedBody.email,
        },
      });

      return reply.status(201).send(newUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: "Validation error", errors: error.issues });
      }
      // Use the directly imported error type here
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        return reply.status(409).send({ message: "A user with this email already exists." });
      }
      fastify.log.error(error, "Error during user signup");
      return reply.status(500).send({ message: "An internal server error occurred." });
    }
  });
  fastify.get('/:userId/analyses', async (request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) => {
    try {
      const { userId } = request.params;

      // In a real app, you'd verify that the logged-in user is authorized to see this data.
      const analyses = await prisma.profileAnalysis.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }, // Show newest first
        include: {
          roadmap: {
            include: {
              resources: true,
            },
          }
        }
      });

      return reply.status(200).send(analyses);
    } catch (error) {
      fastify.log.error(error, "Error fetching user analyses");
      return reply.status(500).send({ message: "An internal server error occurred." });
    }
  });
}

export default userRoutes;