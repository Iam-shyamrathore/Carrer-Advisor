import Fastify from 'fastify';
import dotenv from 'dotenv';
import profileRoutes from './api/profileRoutes';
import userRoutes from './api/userRoutes';
import authRoutes from './api/authRoutes';
import roadmapRoutes from './api/roadmapRoutes';
import troubleshootingRoutes from './api/troubleshootingRoutes';
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


server.register(troubleshootingRoutes, { prefix: '/api/v1/troubleshooting' });
server.register(profileRoutes,{ prefix: '/api/v1/profile' });
server.register(userRoutes, { prefix: '/api/v1/users' });
server.register(authRoutes, { prefix: '/api/v1/auth' });
server.register(roadmapRoutes, { prefix: '/api/v1/roadmaps' });

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