import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

if (!process.env.GEMINI_API_KEY) {
  console.error(
    'FATAL: The GEMINI_API_KEY environment variable is not set. The AI service will not be available.'
  );
}

export const ai = genkit({
  plugins: [
    googleAI({
      models: {
        'gemini-2.5-flash': {
          model: 'gemini-2.5-flash',
        },
      },
    }),
  ],
});
