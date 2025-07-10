'use client';

import * as React from 'react';
import { BarChart, Bell, MessageSquare, PlusCircle, Wallet } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DigitalWallet } from '@/components/digital-wallet';
import { SpendingAnalytics } from '@/components/spending-analytics';
import { SmartAlerts } from '@/components/smart-alerts';
import { ReceiptUpload } from '@/components/receipt-upload';
import type { Receipt } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { getCategoryImage } from '@/lib/utils';
import { AskAI } from '@/components/ask-ai';

const mockReceipts: Receipt[] = [
  {
    id: '1',
    image: getCategoryImage('Groceries'),
    vendor: 'Fresh Mart',
    date: '2024-07-20',
    totalAmount: 620,
    itemizedList: [
      { item: 'Organic Avocados', price: 49 },
      { item: 'Almond Milk', price: 29 },
      { item: 'Whole Wheat Bread', price: 35 },
    ],
    category: 'Groceries',
    confidence: 0.95,
    isFraudulent: false,
    fraudulentDetails: 'No fraudulent activity detected.',
  },
  {
    id: '2',
    image: getCategoryImage('Dining'),
    vendor: 'The Daily Grind Cafe',
    date: '2024-07-19',
    totalAmount: 105,
    itemizedList: [
      { item: 'Large Latte', price: 45 },
      { item: 'Croissant', price: 30 },
    ],
    category: 'Dining',
    confidence: 0.98,
    isFraudulent: false,
    fraudulentDetails: 'No fraudulent activity detected.',
  },
  {
    id: '3',
    image: getCategoryImage('Travel'),
    vendor: 'City Gas',
    date: '2024-07-18',
    totalAmount: 375,
    itemizedList: [{ item: 'Unleaded Fuel', price: 375 }],
    category: 'Travel',
    confidence: 0.89,
    isFraudulent: false,
    fraudulentDetails: 'No fraudulent activity detected.',
  },
    {
    id: '5',
    image: getCategoryImage('Dining'),
    vendor: 'The Daily Grind Cafe',
    date: '2024-07-21',
    totalAmount: 125,
    itemizedList: [
      { item: 'Espresso', price: 35 },
      { item: 'Muffin', price: 40 },
    ],
    category: 'Dining',
    confidence: 0.99,
    isFraudulent: false,
    fraudulentDetails: 'No fraudulent activity detected.',
  },
  {
    id: '4',
    image: getCategoryImage('Shopping'),
    vendor: 'Duplicate Store',
    date: '2024-07-15',
    totalAmount: 2500,
    itemizedList: [{ item: 'Luxury Item', price: 2500 }],
    category: 'Shopping',
    confidence: 0.92,
    isFraudulent: true,
    fraudulentDetails: 'This receipt appears to be a duplicate of a transaction from July 14th. High-value single item is suspicious.',
  },
];

export function Dashboard() {
  const [receipts, setReceipts] = React.useState<Receipt[]>(mockReceipts);
  const [isUploadOpen, setUploadOpen] = React.useState(false);
  const { toast } = useToast();

  const handleAddReceipt = (newReceipt: Receipt) => {
    setReceipts(prevReceipts => [newReceipt, ...prevReceipts]);
    toast({
      title: "Success!",
      description: `Receipt from ${newReceipt.vendor} has been added.`,
    });
  };
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Wallet className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            ReceiptWise <span className="text-primary">Wallet</span>
          </h1>
        </div>
        <div className="ml-auto">
          <Button onClick={() => setUploadOpen(true)}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Receipt
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8">
        <Tabs defaultValue="wallet" className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex">
            <TabsTrigger value="wallet"><Wallet className="mr-2 h-4 w-4" /> Digital Wallet</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart className="mr-2 h-4 w-4" /> Analytics</TabsTrigger>
            <TabsTrigger value="alerts"><Bell className="mr-2 h-4 w-4" /> Smart Alerts</TabsTrigger>
            <TabsTrigger value="ask-ai"><MessageSquare className="mr-2 h-4 w-4" /> Ask AI</TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="mt-6">
            <DigitalWallet receipts={receipts} />
          </TabsContent>
          <TabsContent value="analytics" className="mt-6">
            <SpendingAnalytics receipts={receipts} />
          </TabsContent>
          <TabsContent value="alerts" className="mt-6">
            <SmartAlerts receipts={receipts} />
          </TabsContent>
          <TabsContent value="ask-ai" className="mt-6">
            <AskAI receipts={receipts} />
          </TabsContent>
        </Tabs>
      </main>

      <ReceiptUpload 
        isOpen={isUploadOpen}
        setIsOpen={setUploadOpen}
        onReceiptAdd={handleAddReceipt}
      />
    </div>
  );
}
