import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

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
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return reply.status(409).send({ message: "A user with this email already exists." });
      }
      fastify.log.error(error, "Error during user signup");
      return reply.status(500).send({ message: "An internal server error occurred." });
    }
  });
}

export default userRoutes;