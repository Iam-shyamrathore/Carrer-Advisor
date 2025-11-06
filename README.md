# Agentic AI Career Advisor

This project is a full-stack, AI-powered platform designed to provide students and freshers with personalized career analysis, detailed, actionable roadmaps, and interactive coaching. It leverages a multi-agent system powered by the Google Gemini API to deliver a comprehensive and supportive user experience.

![Career Advisor Dashboard](https://i.imgur.com/your-screenshot-url.png)
_(Recommendation: Replace the URL above with a screenshot of your beautiful new UI!)_

---

## ✨ Core Features

- **Multi-Source Profile Analysis:** Users can get instant, in-depth feedback by:
  - **Uploading a PDF Resume:** Parsed securely using a serverless function.
  - **Providing a GitHub URL:** The app fetches public repositories and user data via the official GitHub API.
- **Personalized Career Roadmaps:** A dedicated AI agent generates a 3-phase (0-3, 6-12 month) actionable roadmap based on the user's analysis.
- **Grounded Resource Recommendations:** To prevent AI hallucinations, this agent uses a Google Search-augmented RAG pattern to find real, relevant, and free learning resources for each roadmap milestone.
- **Interactive AI Coach:** A chat-based "troubleshooter" agent (with a unique persona) helps users overcome blockers on-demand for any roadmap step.
- **Modern, Minimalist UI:** A polished, responsive interface built with **shadcn/ui** and Tailwind CSS, inspired by minimalist designs like Monkeytype.
- **Robust Backend:** Built on a scalable monorepo architecture with a job queue (`BullMQ` + `Upstash`) to handle slow AI tasks in the background, ensuring a fast, non-blocking user experience.
- **Secure Authentication:** Full user login flow handled by **NextAuth.js** with a GitHub OAuth provider.

---

## 🛠 Tech Stack

| Category           | Technology                                                 |
| :----------------- | :--------------------------------------------------------- |
| **Frontend**       | Next.js, React, TypeScript, Tailwind CSS, **shadcn/ui**    |
| **Backend**        | Fastify, Node.js, TypeScript                               |
| **Database**       | PostgreSQL (via **Neon**)                                  |
| **ORM**            | Prisma                                                     |
| **AI Agents**      | Google Gemini API                                          |
| **Grounding**      | Google Search API                                          |
| **Job Queue**      | **BullMQ** & **Upstash** (Redis)                           |
| **Authentication** | NextAuth.js (GitHub Provider)                              |
| **File Parsing**   | `pdf.js` (Client-Side), `formidable` (Serverless Function) |

---

## 🚀 Getting Started

This project is a monorepo using **NPM Workspaces**. All installation and run commands must be executed from the **root directory**.

### 1. Environment Variables

This project requires **three** separate environment files. You must create them and add your secret keys.

**File: `/.env`** (In the root `career-advisor/` folder)

```env
# For Prisma CLI & Google Search
DATABASE_URL="postgres://..."
SEARCH_ENGINE_ID="..."
SEARCH_API_KEY="..."
```
