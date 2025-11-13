# Setup Guide - Team-Sync-Hub

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Google API Key from [AI Studio](https://aistudio.google.com/app/apikey)

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and add your Google API Key:
```bash
cp .env.example .env
```

Edit `.env`:
```
GOOGLE_API_KEY=your_actual_api_key_here
NODE_ENV=development
LOG_LEVEL=debug
```

### 3. Run the Application

**Development mode** (with hot reload):
```bash
npm run dev
```

**Build for production**:
```bash
npm run build
npm start
```

## Project Structure
```
src/
├── index.ts           # Application entry point
├── config.ts          # Configuration management
└── services/
    └── gemini.service.ts  # Gemini AI integration service
```

## Features
- ✅ Google Gemini AI integration
- ✅ TypeScript for type safety
- ✅ Environment variable configuration
- ✅ Service-based architecture
- ✅ ESLint & Prettier for code quality

## Getting Help
- [Google AI Studio Documentation](https://aistudio.google.com)
- [Gemini API Reference](https://ai.google.dev)
- Check `.github/copilot-instructions.md` for AI agent guidance
