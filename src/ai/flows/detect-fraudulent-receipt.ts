// src/ai/flows/detect-fraudulent-receipt.ts
'use server';

/**
 * @fileOverview Detects potentially fraudulent receipts by analyzing receipt data.
 *
 * - detectFraudulentReceipt - A function that detects fraudulent receipts.
 * - DetectFraudulentReceiptInput - The input type for the detectFraudulentReceipt function.
 * - DetectFraudulentReceiptOutput - The return type for the detectFraudulentReceipt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectFraudulentReceiptInputSchema = z.object({
  receiptData: z.string().describe('The receipt data to analyze.'),
});
export type DetectFraudulentReceiptInput = z.infer<
  typeof DetectFraudulentReceiptInputSchema
>;

const DetectFraudulentReceiptOutputSchema = z.object({
  isFraudulent: z.boolean().describe('Whether the receipt is fraudulent or not.'),
  fraudulentDetails: z.string().describe('Details of why the receipt is fraudulent.'),
});

export type DetectFraudulentReceiptOutput = z.infer<
  typeof DetectFraudulentReceiptOutputSchema
>;

export async function detectFraudulentReceipt(
  input: DetectFraudulentReceiptInput
): Promise<DetectFraudulentReceiptOutput> {
  return detectFraudulentReceiptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectFraudulentReceiptPrompt',
  input: {schema: DetectFraudulentReceiptInputSchema},
  output: {schema: DetectFraudulentReceiptOutputSchema},
  prompt: `You are an expert in fraud detection.

You will be provided with receipt data, and you must determine if the receipt is fraudulent or not.

Receipt Data: {{{receiptData}}}

Based on the receipt data, determine if the receipt is fraudulent. If it is, provide details of why it is fraudulent.

Output in JSON format:
{
  "isFraudulent": true/false,
  "fraudulentDetails": "Details of why the receipt is fraudulent."
}
`,
});

const detectFraudulentReceiptFlow = ai.defineFlow(
  {
    name: 'detectFraudulentReceiptFlow',
    inputSchema: DetectFraudulentReceiptInputSchema,
    outputSchema: DetectFraudulentReceiptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
