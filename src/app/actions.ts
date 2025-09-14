
'use server';

import { aiFAQAssistant } from '@/ai/flows/ai-faq-assistant';

export async function askFaqAssistant(query: string) {
  try {
    const result = await aiFAQAssistant({ query });
    return result.answer;
  } catch (error) {
    console.error('Error in AI FAQ Assistant:', error);
    return 'Sorry, I am having trouble connecting to my knowledge base. Please try again later.';
  }
}
