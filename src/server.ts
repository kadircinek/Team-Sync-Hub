import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import geminiService from './services/gemini.service';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static('public'));

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Team-Sync-Hub API is running' });
});

app.post('/api/chat', async (req, res): Promise<void> => {
  try {
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const response = await geminiService.chat(message);
    res.json({ response });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

app.post('/api/summarize', async (req, res): Promise<void> => {
  try {
    const { text } = req.body;

    if (!text) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    const summary = await geminiService.generateSummary(text);
    res.json({ summary });
  } catch (error) {
    console.error('Error in /api/summarize:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

app.post('/api/analyze', async (req, res): Promise<void> => {
  try {
    const { data } = req.body;

    if (!data) {
      res.status(400).json({ error: 'Data is required' });
      return;
    }

    const analysis = await geminiService.analyzeTeamData(data);
    res.json({ analysis });
  } catch (error) {
    console.error('Error in /api/analyze:', error);
    res.status(500).json({ error: 'Failed to analyze data' });
  }
});

// Serve index.html for all other routes (SPA fallback)
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Team-Sync-Hub Server Running`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
  console.log(`-------------------------------------------\n`);
});
