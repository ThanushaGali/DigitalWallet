import { config } from 'dotenv';
config();

import '@/ai/flows/extract-receipt-data.ts';
import '@/ai/flows/categorize-spending.ts';
import '@/ai/flows/detect-fraudulent-receipt.ts';
import '@/ai/flows/parse-text-receipt.ts';
import '@/ai/flows/query-receipts-flow.ts';
import '@/ai/flows/generate-financial-tips.ts';
