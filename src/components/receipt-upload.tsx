'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bot, ImageIcon, Loader2, UploadCloud, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { processReceipt } from '@/app/actions';
import type { Receipt } from '@/types';
import Image from 'next/image';
import { getCategoryImage } from '@/lib/utils';

const UploadSchema = z.object({
  receipt: z
    .custom<FileList>()
    .refine(files => files?.length > 0, 'A receipt image is required.')
    .refine(files => files?.[0]?.type.startsWith('image/'), 'Only image files are accepted.'),
});

type UploadFormValues = z.infer<typeof UploadSchema>;

interface ReceiptUploadProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onReceiptAdd: (receipt: Receipt) => void;
}

export function ReceiptUpload({ isOpen, setIsOpen, onReceiptAdd }: ReceiptUploadProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [preview, setPreview] = React.useState<string | null>(null);
  const { toast } = useToast();
  const { control, handleSubmit, reset, watch } = useForm<UploadFormValues>({
    resolver: zodResolver(UploadSchema),
  });

  const fileList = watch('receipt');

  React.useEffect(() => {
    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, [fileList]);

  const onSubmit = async (data: UploadFormValues) => {
    setIsProcessing(true);
    const file = data.receipt[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      const photoDataUri = e.target?.result as string;
      try {
        const result = await processReceipt(photoDataUri);
        onReceiptAdd({
          ...result,
          id: new Date().toISOString(),
          image: photoDataUri, // We still pass the original image
        });
        handleClose();
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: error.message || 'There was a problem processing your receipt.',
        });
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsDataURL(file);
  };
  
  const handleClose = () => {
    reset();
    setPreview(null);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px]" onInteractOutside={(e) => {
        if (isProcessing) {
          e.preventDefault();
        }
      }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
             <UploadCloud className="h-6 w-6 text-primary" /> Upload New Receipt
          </DialogTitle>
          <DialogDescription>
            Select an image of your receipt. Our AI will automatically extract and analyze the details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 py-4">
          <div className="space-y-2">
            <Controller
              name="receipt"
              control={control}
              render={({ field: { onChange, ...fieldProps }, fieldState }) => (
                <>
                  <label
                    htmlFor="receipt-upload"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/70 transition-colors"
                  >
                    {preview ? (
                       <div className="relative w-full h-full">
                         <Image src={preview} alt="Receipt preview" layout="fill" objectFit="contain" className="rounded-lg"/>
                         <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={(e) => { e.preventDefault(); reset(); setPreview(null); }}>
                           <X className="h-4 w-4" />
                         </Button>
                       </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="w-10 h-10 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP</p>
                      </div>
                    )}
                  </label>
                  <Input
                    id="receipt-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => onChange(e.target.files)}
                    {...fieldProps}
                    disabled={isProcessing}
                  />
                  {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                </>
              )}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button type="submit" disabled={isProcessing || !preview}>
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
