
import { GoogleGenAI } from "@google/genai";
import type { Message, User } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const summarizeConversation = async (messages: Message[], users: User[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key is not configured. Please set the API_KEY environment variable.";
  }
  
  const userMap = new Map(users.map(u => [u.id, u.name]));

  const formattedMessages = messages.map(msg => {
    const userName = userMap.get(msg.userId) || 'Unknown User';
    return `${userName}: ${msg.text}`;
  }).join('\n');

  const prompt = `Please provide a concise summary of the following conversation. Highlight key decisions and action items:\n\n---\n\n${formattedMessages}`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error summarizing conversation:", error);
    if (error instanceof Error) {
        return `Failed to generate summary. Reason: ${error.message}`;
    }
    return "An unknown error occurred while generating the summary.";
  }
};
