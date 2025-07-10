'use server';

import { extractReceiptData } from '@/ai/flows/extract-receipt-data';
import { categorizeSpending } from '@/ai/flows/categorize-spending';
import { detectFraudulentReceipt } from '@/ai/flows/detect-fraudulent-receipt';
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
