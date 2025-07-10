'use server';

import { extractReceiptData } from '@/ai/flows/extract-receipt-data';
import { categorizeSpending } from '@/ai/flows/categorize-spending';
import { detectFraudulentReceipt } from '@/ai/flows/detect-fraudulent-receipt';
import { parseTextReceipt } from '@/ai/flows/parse-text-receipt';
import { queryReceipts } from '@/ai/flows/query-receipts-flow';
import { generateFinancialTips, FinancialTip } from '@/ai/flows/generate-financial-tips';
import type { Receipt } from '@/types';

export async function processReceipt(photoDataUri: string): Promise<Omit<Receipt, 'id' | 'image'>> {
  try {
    const extractedData = await extractReceiptData({ photoDataUri });
    const receiptString = JSON.stringify(extractedData);
    
    // Run categorization and fraud detection in parallel
    const [categoryData, fraudData] = await Promise.all([
      categorizeSpending({ receiptData: receiptString }),
      detectFraudulentReceipt({ receiptData: receiptString }),
    ]);

    return {
      ...extractedData,
      category: categoryData.category,
      confidence: categoryData.confidence,
      isFraudulent: fraudData.isFraudulent,
      fraudulentDetails: fraudData.fraudulentDetails,
    };
  } catch (error) {
    console.error("Error processing receipt:", error);
    throw new Error("Failed to process receipt. The AI model might be unable to read the data.");
  }
}

export async function processTextReceipt(textContent: string): Promise<Omit<Receipt, 'id' | 'image'>> {
    try {
        const extractedData = await parseTextReceipt({ textContent });
        const receiptString = JSON.stringify(extractedData);

        const [categoryData, fraudData] = await Promise.all([
            categorizeSpending({ receiptData: receiptString }),
            detectFraudulentReceipt({ receiptData: receiptString }),
        ]);

        return {
            ...extractedData,
            category: categoryData.category,
            confidence: categoryData.confidence,
            isFraudulent: fraudData.isFraudulent,
            fraudulentDetails: fraudData.fraudulentDetails,
        };
    } catch (error) {
        console.error("Error processing text receipt:", error);
        throw new Error("Failed to parse text. The AI model might be unable to read the data.");
    }
}


export async function processQuery(query: string, receipts: Receipt[]): Promise<string> {
    if (!query) {
        return "Please enter a question.";
    }
    if (!receipts || receipts.length === 0) {
        return "There are no receipts to analyze. Please upload a receipt first.";
    }

    try {
        const answer = await queryReceipts(query, receipts);
        return answer;
    } catch (error) {
        console.error("Error processing query:", error);
        throw new Error("I'm having trouble answering that question right now. Please try again later.");
    }
}

export async function getFinancialTips(receipts: Receipt[]): Promise<FinancialTip[]> {
    if (!receipts || receipts.length === 0) {
        return [];
    }
    try {
        const tips = await generateFinancialTips({ receipts });
        return tips.recommendations;
    } catch (error) {
        console.error("Error getting financial tips:", error);
        // In case of an error, return an empty array to avoid breaking the UI
        return [];
    }
}
