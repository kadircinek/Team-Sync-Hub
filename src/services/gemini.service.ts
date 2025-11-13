import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';

export class GeminiService {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor() {
    this.client = new GoogleGenerativeAI(config.googleApi.apiKey);
    this.model = config.googleApi.model;
  }

  async chat(userMessage: string): Promise<string> {
    try {
      const model = this.client.getGenerativeModel({ model: this.model });
      const result = await model.generateContent(userMessage);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error in GeminiService.chat:', error);
      throw error;
    }
  }

  async analyzeTeamData(teamData: Record<string, unknown>): Promise<string> {
    const prompt = `Analyze the following team data and provide insights:\n${JSON.stringify(teamData, null, 2)}`;
    return this.chat(prompt);
  }

  async generateSummary(text: string): Promise<string> {
    const prompt = `Please summarize the following text:\n${text}`;
    return this.chat(prompt);
  }
}

export default new GeminiService();
