import Fastify from 'fastify';
import dotenv from 'dotenv';
import profileRoutes from './api/profileRoutes';

dotenv.config();

const server = Fastify({
  logger: true,
});

// Health check route
server.get('/health', async (request, reply) => {
  return { status: 'ok' };
});

// Register our new profile analysis routes
server.register(profileRoutes, { prefix: '/api/profile' });

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
    await server.listen({ port, host: '0.0.0.0' });
    server.log.info(`Server listening on port ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();