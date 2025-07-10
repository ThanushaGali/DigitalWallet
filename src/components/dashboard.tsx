'use client';

import * as React from 'react';
import { BarChart, Bell, Bot, PlusCircle, Wallet } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DigitalWallet } from '@/components/digital-wallet';
import { SpendingAnalytics } from '@/components/spending-analytics';
import { SmartAlerts } from '@/components/smart-alerts';
import { ReceiptUpload } from '@/components/receipt-upload';
import type { Receipt } from '@/types';
import { useToast } from '@/hooks/use-toast';

const mockReceipts: Receipt[] = [
  {
    id: '1',
    image: 'https://placehold.co/400x600.png',
    vendor: 'Fresh Mart',
    date: '2024-07-20',
    totalAmount: 6200,
    itemizedList: [
      { item: 'Organic Avocados', price: 490 },
      { item: 'Almond Milk', price: 290 },
      { item: 'Whole Wheat Bread', price: 350 },
    ],
    category: 'Groceries',
    confidence: 0.95,
    isFraudulent: false,
    fraudulentDetails: 'No fraudulent activity detected.',
  },
  {
    id: '2',
    image: 'https://placehold.co/400x600.png',
    vendor: 'The Daily Grind Cafe',
    date: '2024-07-19',
    totalAmount: 1050,
    itemizedList: [
      { item: 'Large Latte', price: 450 },
      { item: 'Croissant', price: 300 },
    ],
    category: 'Dining',
    confidence: 0.98,
    isFraudulent: false,
    fraudulentDetails: 'No fraudulent activity detected.',
  },
  {
    id: '3',
    image: 'https://placehold.co/400x600.png',
    vendor: 'City Gas',
    date: '2024-07-18',
    totalAmount: 3750,
    itemizedList: [{ item: 'Unleaded Fuel', price: 3750 }],
    category: 'Travel',
    confidence: 0.89,
    isFraudulent: false,
    fraudulentDetails: 'No fraudulent activity detected.',
  },
  {
    id: '4',
    image: 'https://placehold.co/400x600.png',
    vendor: 'Duplicate Store',
    date: '2024-07-15',
    totalAmount: 12500,
    itemizedList: [{ item: 'Luxury Item', price: 12500 }],
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
          <TabsList className="grid w-full grid-cols-3 md:w-[400px] bg-primary/10">
            <TabsTrigger value="wallet"><Wallet className="mr-2 h-4 w-4" /> Digital Wallet</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart className="mr-2 h-4 w-4" /> Analytics</TabsTrigger>
            <TabsTrigger value="alerts"><Bell className="mr-2 h-4 w-4" /> Smart Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="mt-6">
            <DigitalWallet receipts={receipts} />
          </TabsContent>
          <TabsContent value="analytics" className="mt-6">
            <SpendingAnalytics receipts={receipts} />
          </TabsContent>
          <TabsContent value="alerts" className="mt-6">
            <SmartAlerts />
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
