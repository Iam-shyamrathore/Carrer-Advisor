import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { ProfileAnalyzerAgent, ProfileAnalysisInput } from '../agents/ProfileAnalyzerAgent';

// Define the expected structure of the request body
interface AnalyzeRequestBody {
  profileText: string;
}

async function profileRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  
  // Instantiate our agent. In a larger app, we might manage this differently (e.g., dependency injection).
  const profileAnalyzer = new ProfileAnalyzerAgent();

  fastify.post(
    '/analyze', 
    async (request: FastifyRequest<{ Body: AnalyzeRequestBody }>, reply: FastifyReply) => {
      
      const { profileText } = request.body;

      if (!profileText || typeof profileText !== 'string' || profileText.trim().length === 0) {
        return reply.status(400).send({ error: 'profileText is required and must be a non-empty string.' });
      }

      try {
        const result = await profileAnalyzer.execute({ input: { profileText } });
        return reply.status(200).send(result);
      } catch (error) {
        fastify.log.error(error, 'Error executing ProfileAnalyzerAgent');
        return reply.status(500).send({ error: 'An unexpected error occurred during analysis.' });
      }
    }
  );
}

export default profileRoutes;