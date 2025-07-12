'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ReceiptDetails } from '@/components/receipt-details';
import type { Receipt } from '@/types';
import { AlertCircle, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { QRCodeGenerator } from './qr-code-generator';

interface DigitalWalletProps {
  receipts: Omit<Receipt, 'image'>[];
}

const categoryColors: { [key: string]: string } = {
  Groceries: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700',
  Dining: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700',
  Travel: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700',
  Health: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700',
  Entertainment: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700',
  Shopping: 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/50 dark:text-pink-300 dark:border-pink-700',
  Utilities: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700',
  Rent: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-700',
  Other: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/50 dark:text-gray-300 dark:border-gray-700',
};


export function DigitalWallet({ receipts }: DigitalWalletProps) {
  const [selectedReceipt, setSelectedReceipt] = React.useState<Omit<Receipt, 'image'> | null>(null);

  if (receipts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center h-[400px]">
        <h3 className="text-2xl font-bold tracking-tight">You have no receipts</h3>
        <p className="text-muted-foreground mt-2">
          Click "Add Receipt" to upload your first one and see the magic happen.
        </p>
      </div>
    );
  }
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {receipts.map((receipt, index) => {
              const qrData = {
                id: receipt.id,
                vendor: receipt.vendor,
                date: receipt.date,
                totalAmount: receipt.totalAmount,
                category: receipt.category,
              };
            return (
              <motion.div
                key={receipt.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => setSelectedReceipt(receipt)}
              >
                <Card className={cn(
                  "cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-transform duration-300 overflow-hidden flex flex-col h-full",
                  receipt.isFraudulent && 'border-destructive/50 hover:border-destructive'
                )}>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{receipt.vendor}</CardTitle>
                        <CardDescription className="flex items-center gap-1.5 pt-1">
                            <Calendar className="h-3.5 w-3.5" /> 
                            {format(new Date(receipt.date), 'PPP')}
                        </CardDescription>
                      </div>
                      {receipt.isFraudulent && <AlertCircle className="h-5 w-5 text-destructive" />}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow p-4 flex items-center justify-center bg-muted/20">
                    <div className="p-3 bg-white rounded-lg shadow-md">
                        <QRCodeGenerator data={qrData} className="w-28 h-28"/>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center bg-muted/30 p-4">
                    <Badge variant="outline" className={cn("font-medium text-sm", categoryColors[receipt.category] || categoryColors['Other'])}>
                      {receipt.category}
                    </Badge>
                    <div className="text-xl font-bold text-foreground">
                      ₹{receipt.totalAmount.toFixed(2)}
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <Dialog
        open={!!selectedReceipt}
        onOpenChange={(open) => !open && setSelectedReceipt(null)}
      >
        <DialogContent className="sm:max-w-md md:max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedReceipt && <ReceiptDetails receipt={selectedReceipt} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
