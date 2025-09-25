# Career Advisor & Roadmap MVP

This project is a multi-agent system designed to help students and freshers get personalized career advice.

## Tech Stack

- **Frontend**: Next.js (TypeScript) + Tailwind CSS
- **Backend**: Node.js (TypeScript) + Fastify
- **Database**: PostgreSQL (via Neon/PlanetScale)
- **ORM**: Prisma

## Local Development

### Backend Setup
```bash
cd backend
npm install
cp ../.env.example .env
# Add your secrets to the .env file
npm run dev