
# AI Coding Agent Instructions for Team-Sync-Hub

## Project Overview
Team-Sync-Hub is a TypeScript/Node.js application powered by Google Gemini AI for team synchronization and collaboration. It provides AI-driven team analytics, summarization, and collaborative intelligence.

**Tech Stack**: Node.js 20+, TypeScript, Google Generative AI SDK, ESLint, Prettier

## Quick Start for Agents
- **Repository**: `kadircinek/Team-Sync-Hub`
- **Current Status**: MVP with Gemini integration foundation
- **Entry Point**: `src/index.ts` (demonstrates basic Gemini chat)
- **Setup**: See `SETUP.md` for complete installation guide

## Architecture & Components
- **`src/config.ts`**: Centralized configuration (environment variables, model settings)
- **`src/services/gemini.service.ts`**: Singleton service for all Gemini API interactions
  - Methods: `chat()`, `analyzeTeamData()`, `generateSummary()`
  - Handles API error handling and response parsing
- **`src/index.ts`**: Application entry point, demonstrates service usage

**Critical Pattern**: All Gemini calls go through `GeminiService` - don't instantiate client elsewhere.

## Development Workflows
- **Dev**: `npm run dev` (tsx with hot reload via tsx)
- **Build**: `npm run build` (TypeScript → `dist/`)
- **Lint**: `npm run lint` (ESLint configured for strict TypeScript)
- **Format**: `npm run format` (Prettier auto-formatting)

**Debugging**: Environment variable `LOG_LEVEL` controls verbosity. Check `.env` for API key issues.

## Code Conventions
- **Language**: TypeScript with `noImplicitAny=true` and strict mode
- **File Structure**: Services in `src/services/`, config isolated in `config.ts`
- **Error Handling**: All service methods use try-catch; errors logged to console then re-thrown
- **API Keys**: Never commit `.env` - use `.env.example` as template
- **Naming**: camelCase for functions/variables, PascalCase for classes/services

## Integration Points (Google Gemini)
- **SDK**: `@google/generative-ai` (npm)
- **Authentication**: GOOGLE_API_KEY environment variable (get from [AI Studio](https://aistudio.google.com/app/apikey))
- **Model**: Currently `gemini-pro` (update in `config.ts` if needed)
- **Usage Pattern**: 
  ```typescript
  import geminiService from '@/services/gemini.service';
  const response = await geminiService.chat(userPrompt);
  ```

---

## Usage Notes
- This file will evolve as the codebase grows
- Update sections when new major components or patterns are introduced
- Reference specific files/directories as examples when documenting patterns
- Keep guidance focused on this project's unique approaches rather than generic best practices
