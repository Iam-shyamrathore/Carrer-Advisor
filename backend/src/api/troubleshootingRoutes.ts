import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';
import { z } from 'zod';
import { TroubleshooterAgent } from '../agents/TroubleshooterAgent';

const agent = new TroubleshooterAgent();

const createSessionBodySchema = z.object({
  userId: z.string().cuid(),
  milestoneText: z.string().min(10),
});

const createMessageBodySchema = z.object({
  content: z.string().min(1),
});

async function troubleshootingRoutes(fastify: FastifyInstance) {
  // POST /api/v1/troubleshooting/sessions
  fastify.post('/sessions', async (request, reply) => {
    const { userId, milestoneText } = createSessionBodySchema.parse(request.body);
    const session = await prisma.troubleshootingSession.create({
      data: { userId, milestoneText },
    });
    return reply.status(201).send(session);
  });

  // POST /api/v1/troubleshooting/sessions/:sessionId/messages
  fastify.post('/sessions/:sessionId/messages', async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const { content: userMessage } = createMessageBodySchema.parse(request.body);

    // 1. Save user's message
    await prisma.chatMessage.create({
      data: { role: 'user', content: userMessage, sessionId },
    });

    // 2. Get context and history
    const session = await prisma.troubleshootingSession.findUnique({
      where: { id: sessionId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!session) return reply.status(404).send({ error: 'Session not found' });

    // 3. Execute agent
    const agentResult = await agent.execute({
      input: {
        milestone: session.milestoneText,
        history: session.messages.map(m => ({ role: m.role as 'user' | 'model', content: m.content })),
        question: userMessage,
      },
    });

    // 4. Save AI's message
    const aiMessage = await prisma.chatMessage.create({
      data: { role: 'model', content: agentResult.response, sessionId },
    });

    // 5. Return AI's message
    return reply.status(201).send(aiMessage);
  });
}

export default troubleshootingRoutes;