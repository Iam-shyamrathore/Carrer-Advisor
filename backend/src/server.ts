import Fastify from 'fastify';
import dotenv from 'dotenv';
import profileRoutes from './api/profileRoutes';
import userRoutes from './api/userRoutes';

dotenv.config();

const server = Fastify({
  logger: true,
});

// server.register(cors, {
//   origin: 'http://localhost:3000',
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// });

server.get('/health', async (request, reply) => {
  return { status: 'ok' };
});

server.register(profileRoutes, { prefix: '/api/profile' });
server.register(userRoutes, { prefix: '/api/users' });

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