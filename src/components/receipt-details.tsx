'use client';

import type { Receipt } from '@/types';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { QRCodeGenerator } from '@/components/qr-code-generator';
import Image from 'next/image';
import { AlertTriangle, Bot, Calendar, FileJson, QrCode, ShoppingCart, Tag } from 'lucide-react';
import { format } from 'date-fns';

interface ReceiptDetailsProps {
  receipt: Receipt;
}

export function ReceiptDetails({ receipt }: ReceiptDetailsProps) {
  const {
    vendor,
    date,
    totalAmount,
    itemizedList,
    category,
    isFraudulent,
    fraudulentDetails,
    image,
  } = receipt;
  
  const qrData = {
      vendor,
      date,
      totalAmount,
      items: itemizedList.map(i => `${i.item}: $${i.price.toFixed(2)}`).join(', '),
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl">{vendor}</DialogTitle>
        <DialogDescription className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {format(new Date(date), 'EEEE, MMMM do, yyyy')}
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <div className="md:col-span-2 space-y-6">
          {isFraudulent && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Fraud Alert!</AlertTitle>
              <AlertDescription>{fraudulentDetails}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-baseline justify-between rounded-lg bg-muted/50 p-4">
              <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-4xl font-bold text-primary">${totalAmount.toFixed(2)}</p>
              </div>
              <Badge className="text-base" variant="secondary">{category}</Badge>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary" /> Itemized List</h3>
            <ScrollArea className="h-48 rounded-md border p-4">
              <div className="space-y-3">
                {itemizedList.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>{item.item}</span>
                    <span className="font-mono">${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2"><Bot className="h-5 w-5 text-primary" /> AI Analysis</h3>
            <div className="text-sm p-4 bg-muted/50 rounded-md">
                <p>This receipt has been categorized as <span className="font-semibold text-primary">{category}</span> with high confidence. {isFraudulent ? fraudulentDetails : 'No signs of fraudulent activity were detected.'}</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-1 space-y-6">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border">
            <Image src={image} data-ai-hint="receipt photo" alt={`Receipt from ${vendor}`} layout="fill" objectFit="contain" />
          </div>
          <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2"><QrCode className="h-5 w-5 text-primary" /> Digital Pass</h3>
              <div className="flex flex-col items-center p-4 border rounded-lg bg-muted/50">
                <QRCodeGenerator data={qrData} />
                <p className="text-xs text-muted-foreground mt-3 text-center">Scan for quick returns or to share receipt data.</p>
              </div>
          </div>
        </div>
      </div>
    </>
  );
}
