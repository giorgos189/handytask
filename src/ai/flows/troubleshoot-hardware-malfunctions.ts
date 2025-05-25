// 'use server';

/**
 * @fileOverview An AI agent that suggests possible root causes of hardware malfunctions based on the client's description.
 *
 * - troubleshootHardwareMalfunction - A function that handles the troubleshooting process.
 * - TroubleshootHardwareMalfunctionInput - The input type for the troubleshootHardwareMalfunction function.
 * - TroubleshootHardwareMalfunctionOutput - The return type for the troubleshootHardwareMalfunction function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TroubleshootHardwareMalfunctionInputSchema = z.object({
  problemDescription: z
    .string()
    .describe('The description of the hardware malfunction provided by the client.'),
});
export type TroubleshootHardwareMalfunctionInput = z.infer<
  typeof TroubleshootHardwareMalfunctionInputSchema
>;

const TroubleshootHardwareMalfunctionOutputSchema = z.object({
  possibleRootCauses: z
    .array(z.string())
    .describe('An array of possible root causes for the hardware malfunction.'),
  suggestedSolutions: z
    .array(z.string())
    .describe('An array of suggested solutions for the hardware malfunction.'),
});
export type TroubleshootHardwareMalfunctionOutput = z.infer<
  typeof TroubleshootHardwareMalfunctionOutputSchema
>;

export async function troubleshootHardwareMalfunction(
  input: TroubleshootHardwareMalfunctionInput
): Promise<TroubleshootHardwareMalfunctionOutput> {
  return troubleshootHardwareMalfunctionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'troubleshootHardwareMalfunctionPrompt',
  input: {schema: TroubleshootHardwareMalfunctionInputSchema},
  output: {schema: TroubleshootHardwareMalfunctionOutputSchema},
  prompt: `You are an AI assistant specialized in troubleshooting hardware malfunctions. A client has submitted a ticket with the following problem description:

  Description: {{{problemDescription}}}

  Based on the description, suggest possible root causes and solutions for the hardware malfunction. Return the root causes and solutions as arrays of strings.
  `,
});

const troubleshootHardwareMalfunctionFlow = ai.defineFlow(
  {
    name: 'troubleshootHardwareMalfunctionFlow',
    inputSchema: TroubleshootHardwareMalfunctionInputSchema,
    outputSchema: TroubleshootHardwareMalfunctionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
