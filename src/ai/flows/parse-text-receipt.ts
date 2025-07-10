// src/ai/flows/parse-text-receipt.ts
'use server';

/**
 * @fileOverview Extracts data from a text-based receipt (SMS/email) using AI.
 *
 * - parseTextReceipt - A function that extracts receipt data from text.
 * - ParseTextReceiptInput - The input type for the parseTextReceipt function.
 * - ParseTextReceiptOutput - The return type for the parseTextReceipt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseTextReceiptInputSchema = z.object({
  textContent: z
    .string()
    .describe(
      "The text content of a receipt, for example from an SMS or email."
    ),
});
export type ParseTextReceiptInput = z.infer<typeof ParseTextReceiptInputSchema>;

// Re-using the same output schema as the image extraction flow
const ParseTextReceiptOutputSchema = z.object({
  date: z.string().describe('The date on the receipt (YYYY-MM-DD). If no year is present, assume the current year.'),
  vendor: z.string().describe('The name of the vendor.'),
  totalAmount: z.number().describe('The total amount on the receipt.'),
  itemizedList: z
    .array(
      z.object({
        item: z.string().describe('The name of the item.'),
        price: z.number().describe('The price of the item.'),
      })
    )
    .describe('The itemized list of items on the receipt. If not available, provide a single item with the total amount.'),
});
export type ParseTextReceiptOutput = z.infer<typeof ParseTextReceiptOutputSchema>;

export async function parseTextReceipt(
  input: ParseTextReceiptInput
): Promise<ParseTextReceiptOutput> {
  return parseTextReceiptFlow(input);
}

const parseTextReceiptPrompt = ai.definePrompt({
  name: 'parseTextReceiptPrompt',
  input: {schema: ParseTextReceiptInputSchema},
  output: {schema: ParseTextReceiptOutputSchema},
  prompt: `You are an AI assistant that extracts structured data from text-based receipts (like SMS messages or emails).

  You will be provided with raw text. You must extract the following information:

  - Date: The date on the receipt (YYYY-MM-DD). If no year is specified, assume the current year.
  - Vendor: The name of the vendor (e.g., Zomato, Amazon, Swiggy).
  - Total Amount: The total amount of the transaction.
  - Itemized List: A list of items. If the text only contains a total, create a single item in the list named 'Total Purchase' with the total amount.

  Here is the text content:

  {{{textContent}}}

  Please extract the data and return it in the specified JSON format.
  For example, for "Your order with Zomato for Rs. 450 is confirmed on 15 July.", the output should have vendor: "Zomato", totalAmount: 450, date: "YYYY-07-15", and an itemizedList.
  `,
});

const parseTextReceiptFlow = ai.defineFlow(
  {
    name: 'parseTextReceiptFlow',
    inputSchema: ParseTextReceiptInputSchema,
    outputSchema: ParseTextReceiptOutputSchema,
  },
  async input => {
    const {output} = await parseTextReceiptPrompt(input);
    return output!;
  }
);
