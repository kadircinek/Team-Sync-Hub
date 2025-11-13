import dotenv from 'dotenv';

dotenv.config();

console.log('🚀 Team-Sync-Hub initialized with Google Gemini AI');
console.log('-------------------------------------------');

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey || apiKey === 'your_api_key_here') {
  console.log('\n⚠️  Demo Mode (No API Key)');
  console.log('-------------------------------------------');
  console.log('API Key not configured. Running in demo mode.\n');

  // Mock demo responses
  const demoChat = async () => {
    console.log('📝 Demo Prompt: Introduce yourself as a team collaboration assistant\n');
    
    // Simulate Gemini response
    const mockResponse = `Hello! I'm Team-Sync-Hub's AI Assistant, powered by Google Gemini.

I'm designed to help teams:
✓ Synchronize work and stay aligned on goals
✓ Summarize discussions and extract key insights  
✓ Analyze team dynamics and collaboration patterns
✓ Generate summaries of meetings and documents
✓ Provide intelligent suggestions for team processes

My capabilities include:
- Real-time team data analysis
- Meeting summarization and key point extraction
- Collaboration metrics and team health assessment
- Smart recommendations for process improvement

To use my full capabilities, please add your Google API Key to the .env file:
1. Get your key from: https://aistudio.google.com/app/apikey
2. Add it to .env: GOOGLE_API_KEY=your_key_here
3. Restart the application

For development, I can run in this demo mode to showcase features!`;

    console.log('✨ Demo Response:');
    console.log('-------------------------------------------');
    console.log(mockResponse);
    console.log('-------------------------------------------\n');
  };

  await demoChat();
} else {
  // Real Gemini mode
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const { config } = await import('./config');

  const client = new GoogleGenerativeAI(apiKey);

  try {
    const model = client.getGenerativeModel({ model: config.googleApi.model });

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
