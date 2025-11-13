import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error('Error: GOOGLE_API_KEY environment variable is not set.');
  console.error('Please create a .env file with GOOGLE_API_KEY=your_key');
  process.exit(1);
}

const client = new GoogleGenerativeAI(apiKey);

async function main() {
  console.log('🚀 Team-Sync-Hub initialized with Google Gemini AI');
  console.log('-------------------------------------------');

  try {
    const model = client.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are a team synchronization assistant. Help teams stay aligned and productive. 
    Introduce yourself and explain your capabilities for team collaboration.`;

    console.log('\n📝 Sending prompt to Gemini...\n');

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✨ Gemini Response:');
    console.log('-------------------------------------------');
    console.log(text);
    console.log('-------------------------------------------\n');

  } catch (error) {
    console.error('Error communicating with Gemini:', error);
    process.exit(1);
  }
}

main();
