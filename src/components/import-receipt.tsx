// src/components/import-receipt.tsx
'use client';

import * as React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bot, FileInput, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { processTextReceipt } from '@/app/actions';
import type { Receipt } from '@/types';
import { useToast } from '@/hooks/use-toast';

const ImportSchema = z.object({
  textContent: z.string().min(10, 'Please paste the content of your SMS or email.'),
});

type ImportFormValues = z.infer<typeof ImportSchema>;

interface ImportReceiptProps {
  onReceiptAdd: (receipt: Omit<Receipt, 'id' | 'image'>) => void;
}

export function ImportReceipt({ onReceiptAdd }: ImportReceiptProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ImportFormValues>({
    resolver: zodResolver(ImportSchema),
  });

  const onSubmit: SubmitHandler<ImportFormValues> = async (data) => {
    setIsProcessing(true);
    try {
      const result = await processTextReceipt(data.textContent);
      onReceiptAdd(result);
      toast({
          title: "Import Successful!",
          description: `Receipt from ${result.vendor} has been processed and added.`,
      });
      reset();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'There was a problem parsing the receipt text.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <FileInput />
            Import from Text
        </CardTitle>
        <CardDescription>
            Paste the content of an SMS or email receipt below. Our AI will parse it and add it to your wallet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Textarea
            {...register('textContent')}
            placeholder="e.g., Thanks for your order from The Daily Grind Cafe! Total: ₹105.00 on July 19..."
            className="min-h-[200px]"
            disabled={isProcessing}
          />
          {errors.textContent && <p className="text-sm text-destructive">{errors.textContent.message}</p>}
          <div className="flex justify-end">
            <Button type="submit" disabled={isProcessing}>
                {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                 <Bot className="mr-2 h-4 w-4" />
                 Process with AI
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
