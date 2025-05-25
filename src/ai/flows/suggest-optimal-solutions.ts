// Implemented suggestOptimalSolutions flow for suggesting solutions based on the ticket description.

'use server';

/**
 * @fileOverview An AI agent that suggests optimal solutions for hardware problems described in a ticket.
 *
 * - suggestOptimalSolutions - A function that handles the suggestion of optimal solutions.
 * - SuggestOptimalSolutionsInput - The input type for the suggestOptimalSolutions function.
 * - SuggestOptimalSolutionsOutput - The return type for the suggestOptimalSolutions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalSolutionsInputSchema = z.object({
  ticketDescription: z
    .string()
    .describe('The description of the hardware problem reported in the ticket.'),
});
export type SuggestOptimalSolutionsInput = z.infer<typeof SuggestOptimalSolutionsInputSchema>;

const SuggestOptimalSolutionsOutputSchema = z.object({
  suggestedSolutions: z
    .array(z.string())
    .describe('An array of suggested solutions for the hardware problem.'),
  reasoning: z
    .string()
    .describe('The AI reasoning behind the suggested solutions.'),
});
export type SuggestOptimalSolutionsOutput = z.infer<typeof SuggestOptimalSolutionsOutputSchema>;

export async function suggestOptimalSolutions(
  input: SuggestOptimalSolutionsInput
): Promise<SuggestOptimalSolutionsOutput> {
  return suggestOptimalSolutionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalSolutionsPrompt',
  input: {schema: SuggestOptimalSolutionsInputSchema},
  output: {schema: SuggestOptimalSolutionsOutputSchema},
  prompt: `You are an expert handyman specializing in diagnosing and solving hardware problems.

You will receive a ticket description from a client describing their hardware issue. Based on this description, you will suggest a few possible solutions, and describe your reasoning behind these solutions.

Ticket Description: {{{ticketDescription}}}

Suggest at least three possible solutions.
`,
});

const suggestOptimalSolutionsFlow = ai.defineFlow(
  {
    name: 'suggestOptimalSolutionsFlow',
    inputSchema: SuggestOptimalSolutionsInputSchema,
    outputSchema: SuggestOptimalSolutionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
