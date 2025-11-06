import { PrismaClient } from '@prisma/client';

// Instantiate PrismaClient
const prisma = new PrismaClient({
  // Optionally, log database queries to the console during development
  log: ['query', 'info', 'warn', 'error'],
});

export default prisma;