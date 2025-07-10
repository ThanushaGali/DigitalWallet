'use client';

import * as React from 'react';
import { Bell, FileInput, PlusCircle, Wallet } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DigitalWallet } from '@/components/digital-wallet';
import { SmartAlerts } from '@/components/smart-alerts';
import { ReceiptUpload } from '@/components/receipt-upload';
import type { Receipt } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ImportReceipt } from '@/components/import-receipt';

const mockReceipts: Receipt[] = [
  {
    id: '1',
    image: '/images/groceries.jpg',
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
    image: '/images/dining.jpg',
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
    image: '/images/travel.jpg',
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
    image: '/images/dining.jpg',
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
    image: '/images/shopping.jpg',
    vendor: 'Duplicate Store',
    date: '2024-07-15',
    totalAmount: 2500,
    itemizedList: [{ item: 'Luxury Item', price: 2500 }],
    category: 'Shopping',
    confidence: 0.92,
    isFraudulent: true,
    fraudulentDetails: 'This receipt appears to be a duplicate of a transaction from July 14th. High-value single item is suspicious.',
  },
  {
    id: '6',
    image: '/images/utilities.jpg',
    vendor: 'PowerLight Co.',
    date: '2024-07-15',
    totalAmount: 1500,
    itemizedList: [{ item: 'Electricity Bill', price: 1500 }],
    category: 'Utilities',
    confidence: 0.99,
    isFraudulent: false,
    fraudulentDetails: 'No fraudulent activity detected.',
  },
];

export function Dashboard() {
  const [receipts, setReceipts] = React.useState<Receipt[]>(mockReceipts);
  const [isUploadOpen, setUploadOpen] = React.useState(false);
  const [isImportOpen, setImportOpen] = React.useState(false);
  const { toast } = useToast();

  const handleAddReceipt = (newReceiptData: Omit<Receipt, 'id' | 'image' | 'wallet'>) => {
    const newReceipt: Receipt = {
      ...newReceiptData,
      id: new Date().toISOString(),
      // The image will be set by the getCategoryImage utility
      image: 'images/other.jpg',
    };
    
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
            ReceiptWise
          </h1>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
           <Button variant="outline" onClick={() => setImportOpen(true)}>
            <FileInput className="mr-2 h-5 w-5" />
            Import Text
          </Button>
          <Button onClick={() => setUploadOpen(true)}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Receipt
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8">
        <Tabs defaultValue="wallet" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
            <TabsTrigger value="wallet"><Wallet className="mr-2 h-4 w-4" /> Digital Wallet</TabsTrigger>
            <TabsTrigger value="alerts"><Bell className="mr-2 h-4 w-4" /> Smart Reminders</TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="mt-6">
            <DigitalWallet receipts={receipts} />
          </TabsContent>
          <TabsContent value="alerts" className="mt-6">
            <SmartAlerts receipts={receipts} />
          </TabsContent>
        </Tabs>
      </main>

      <ReceiptUpload 
        isOpen={isUploadOpen}
        setIsOpen={setUploadOpen}
        onReceiptAdd={handleAddReceipt}
      />
      
      <ImportReceipt
        isOpen={isImportOpen}
        setIsOpen={setImportOpen}
        onReceiptAdd={handleAddReceipt}
      />
    </div>
  );
}
