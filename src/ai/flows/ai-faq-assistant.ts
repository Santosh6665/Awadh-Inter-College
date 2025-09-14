'use server';

/**
 * @fileOverview This file defines a Genkit flow for an AI-powered FAQ assistant.
 *
 * The assistant answers frequently asked questions about college life.
 * - aiFAQAssistant - The main function to call the flow.
 * - AiFAQAssistantInput - The input type for the aiFAQAssistant function.
 * - AiFAQAssistantOutput - The output type for the aiFAQAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiFAQAssistantInputSchema = z.object({
  query: z.string().describe('The user query about college life.'),
});
export type AiFAQAssistantInput = z.infer<typeof AiFAQAssistantInputSchema>;

const AiFAQAssistantOutputSchema = z.object({
  answer: z.string().describe('The answer to the user query.'),
});
export type AiFAQAssistantOutput = z.infer<typeof AiFAQAssistantOutputSchema>;

export async function aiFAQAssistant(input: AiFAQAssistantInput): Promise<AiFAQAssistantOutput> {
  return aiFAQAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiFAQAssistantPrompt',
  input: {schema: AiFAQAssistantInputSchema},
  output: {schema: AiFAQAssistantOutputSchema},
  prompt: `You are a helpful AI assistant that answers frequently asked questions about college life at Awadh Narayan Pratap Lal Intermediate College.
  Use the provided context to answer the question.
  If you don't know the answer, say you do not know.

  Question: {{{query}}}`,
});

const aiFAQAssistantFlow = ai.defineFlow(
  {
    name: 'aiFAQAssistantFlow',
    inputSchema: AiFAQAssistantInputSchema,
    outputSchema: AiFAQAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
