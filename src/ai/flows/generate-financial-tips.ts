'use server';
/**
 * @fileOverview An AI agent that generates personal finance recommendations.
 *
 * - generateFinancialTips - A function that provides financial tips based on receipts.
 * - GenerateFinancialTipsInput - The input type for the generateFinancialTips function.
 * - GenerateFinancialTipsOutput - The return type for the generateFinancialTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFinancialTipsInputSchema = z.object({
  receipts: z.array(z.any()).describe('A list of receipt objects to analyze.'),
});
export type GenerateFinancialTipsInput = z.infer<typeof GenerateFinancialTipsInputSchema>;

const FinancialTipSchema = z.object({
    type: z.enum(['alternative', 'reorder', 'savings_tip']).describe("The type of recommendation."),
    title: z.string().describe("A short, catchy title for the tip."),
    description: z.string().describe("A concise description of the recommendation (1-2 sentences)."),
});
export type FinancialTip = z.infer<typeof FinancialTipSchema>;


const GenerateFinancialTipsOutputSchema = z.object({
  recommendations: z.array(FinancialTipSchema).describe("A list of personalized financial tips."),
});
export type GenerateFinancialTipsOutput = z.infer<typeof GenerateFinancialTipsOutputSchema>;

export async function generateFinancialTips(input: GenerateFinancialTipsInput): Promise<GenerateFinancialTipsOutput> {
  return generateFinancialTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFinancialTipsPrompt',
  input: {schema: GenerateFinancialTipsInputSchema},
  output: {schema: GenerateFinancialTipsOutputSchema},
  prompt: `You are a helpful personal finance assistant. Your goal is to provide actionable recommendations based on the user's spending habits.
  Analyze the provided receipt data and generate 2-3 concise financial tips.
  
  Generate tips covering these areas:
  1.  **Cheaper Alternatives**: If you see brand-name items, suggest a more affordable brand or generic alternative.
  2.  **Reorder Suggestions**: Identify items that seem to be purchased regularly (e.g., coffee, milk, medicine) and suggest setting up a reminder to reorder.
  3.  **Monthly Savings Tips**: Based on the spending categories, provide a general, relevant savings tip. For example, if there's a lot of dining spend, suggest cooking at home more often.

  Keep the tips concise and actionable.

  Receipt Data:
  {{{json receipts}}}
  `,
});

const generateFinancialTipsFlow = ai.defineFlow(
  {
    name: 'generateFinancialTipsFlow',
    inputSchema: GenerateFinancialTipsInputSchema,
    outputSchema: GenerateFinancialTipsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
