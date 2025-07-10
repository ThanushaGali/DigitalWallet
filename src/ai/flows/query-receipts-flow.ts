'use server';
/**
 * @fileOverview An AI agent that can answer questions about receipt data.
 *
 * - queryReceiptsFlow - A function that handles answering questions about receipts.
 * - QueryReceiptsInput - The input type for the queryReceiptsFlow function.
 * - QueryReceiptsOutput - The return type for the queryReceiptsFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Receipt } from '@/types';


const QueryReceiptsInputSchema = z.object({
  query: z.string().describe('The user query about their receipts.'),
  receipts: z.array(z.any()).describe('A list of receipt objects to query against.'),
});

export type QueryReceiptsInput = z.infer<typeof QueryReceiptsInputSchema>;

const QueryReceiptsOutputSchema = z.object({
  answer: z.string().describe('The answer to the user query.'),
});
export type QueryReceiptsOutput = z.infer<typeof QueryReceiptsOutputSchema>;


export async function queryReceipts(query: string, receipts: Receipt[]): Promise<string> {
  const { answer } = await queryReceiptsFlow({ query, receipts });
  return answer;
}

const prompt = ai.definePrompt({
  name: 'queryReceiptsPrompt',
  input: {schema: QueryReceiptsInputSchema},
  output: {schema: QueryReceiptsOutputSchema},
  prompt: `You are a helpful AI assistant for a receipt management app.
  Your goal is to answer user questions based on the receipt data they provide.
  Be concise and friendly in your responses.
  If you don't know the answer or the data is insufficient, say so.
  Do not make up information.
  Base your answers *only* on the provided JSON data.
  Today's date is ${new Date().toLocaleDateString()}.

  User Question: {{{query}}}

  Receipt Data:
  {{{json receipts}}}
  `,
});

const queryReceiptsFlow = ai.defineFlow(
  {
    name: 'queryReceiptsFlow',
    inputSchema: QueryReceiptsInputSchema,
    outputSchema: QueryReceiptsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
