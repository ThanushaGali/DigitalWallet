// src/ai/flows/extract-receipt-data.ts
'use server';

/**
 * @fileOverview Extracts data from a receipt image using AI.
 *
 * - extractReceiptData - A function that extracts receipt data.
 * - ExtractReceiptDataInput - The input type for the extractReceiptData function.
 * - ExtractReceiptDataOutput - The return type for the extractReceiptData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractReceiptDataInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractReceiptDataInput = z.infer<typeof ExtractReceiptDataInputSchema>;

const ExtractReceiptDataOutputSchema = z.object({
  date: z.string().describe('The date on the receipt (YYYY-MM-DD).'),
  vendor: z.string().describe('The name of the vendor.'),
  totalAmount: z.number().describe('The total amount on the receipt.'),
  itemizedList: z
    .array(
      z.object({
        item: z.string().describe('The name of the item.'),
        price: z.number().describe('The price of the item.'),
      })
    )
    .describe('The itemized list of items on the receipt.'),
});
export type ExtractReceiptDataOutput = z.infer<typeof ExtractReceiptDataOutputSchema>;

export async function extractReceiptData(
  input: ExtractReceiptDataInput
): Promise<ExtractReceiptDataOutput> {
  return extractReceiptDataFlow(input);
}

const extractReceiptDataPrompt = ai.definePrompt({
  name: 'extractReceiptDataPrompt',
  input: {schema: ExtractReceiptDataInputSchema},
  output: {schema: ExtractReceiptDataOutputSchema},
  prompt: `You are an AI assistant that extracts data from a receipt image.

  You will be provided with an image of a receipt. You will extract the following information from the receipt:

  - Date: The date on the receipt (YYYY-MM-DD).
  - Vendor: The name of the vendor.
  - Total Amount: The total amount on the receipt.
  - Itemized List: A list of items on the receipt, including the name and price of each item.

  Here is the receipt image:

  {{media url=photoDataUri}}

  Please extract the data from the receipt and return it in JSON format.`,
});

const extractReceiptDataFlow = ai.defineFlow(
  {
    name: 'extractReceiptDataFlow',
    inputSchema: ExtractReceiptDataInputSchema,
    outputSchema: ExtractReceiptDataOutputSchema,
  },
  async input => {
    const {output} = await extractReceiptDataPrompt(input);
    return output!;
  }
);
