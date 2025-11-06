import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';
import { z } from 'zod';

const upsertUserBodySchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  image: z.string().url().optional(),
  provider: z.string(),
  providerAccountId: z.string(),
});

async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/upsert-user', async (request, reply) => {
    try {
      const { email, name, image, provider, providerAccountId } =
        upsertUserBodySchema.parse(request.body);

      // Find or create the user based on email
      const user = await prisma.user.upsert({
        where: { email },
        update: { name, image },
        create: { email, name, image },
      });

      // Link the OAuth account to the user
      await prisma.account.upsert({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
        update: {},
        create: {
          userId: user.id,
          type: 'oauth',
          provider,
          providerAccountId,
        },
      });

      return reply.status(200).send(user);
    } catch (error) {
      fastify.log.error(error, 'Error during user upsert');
      return reply.status(500).send({ error: 'Failed to sign in user.' });
    }
  });
}

export default authRoutes;