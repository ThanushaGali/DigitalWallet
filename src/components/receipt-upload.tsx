'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bot, ImageIcon, Loader2, UploadCloud, X, Camera, Video, TriangleAlert } from 'lucide-react';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { cn } from '@/lib/utils';

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
  onReceiptAdd: (receipt: Omit<Receipt, 'id' | 'image' | 'wallet'>) => void;
}

export function ReceiptUpload({ isOpen, setIsOpen, onReceiptAdd }: ReceiptUploadProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState('upload');
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
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
  
  React.useEffect(() => {
    let stream: MediaStream;
    const getCameraPermission = async () => {
      if(activeTab !== 'scan' || !isOpen) return;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };
    getCameraPermission();
    
    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [activeTab, isOpen, toast]);


  const processDataUri = async (photoDataUri: string) => {
    setIsProcessing(true);
    try {
      const result = await processReceipt(photoDataUri);
      onReceiptAdd(result);
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
  
  const onFileSubmit = (data: UploadFormValues) => {
    const file = data.receipt[0];
    const reader = new FileReader();
    reader.onload = (e) => processDataUri(e.target?.result as string);
    reader.readAsDataURL(file);
  };
  
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame onto the canvas
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    
    // Get the image as a data URI
    const dataUri = canvas.toDataURL('image/jpeg');
    setPreview(dataUri);
  };

  const handleClose = () => {
    reset();
    setPreview(null);
    setIsOpen(false);
    setActiveTab('upload');
    if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px]" onInteractOutside={(e) => {
        if (isProcessing) { e.preventDefault(); }
      }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
             <UploadCloud className="h-6 w-6 text-primary" /> Upload New Receipt
          </DialogTitle>
          <DialogDescription>
            Upload a file or scan with your camera. Our AI will analyze the details.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload"><ImageIcon className="mr-2 h-4 w-4"/>Upload File</TabsTrigger>
                <TabsTrigger value="scan"><Camera className="mr-2 h-4 w-4"/>Scan with Camera</TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
                <form onSubmit={handleSubmit(onFileSubmit)} className="grid gap-6 py-4">
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
                            id="receipt-upload" type="file" className="hidden" accept="image/*"
                            onChange={(e) => onChange(e.target.files)}
                            {...fieldProps} disabled={isProcessing}
                          />
                          {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                        </>
                      )}
                    />
                  </div>
                   <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleClose} disabled={isProcessing}>Cancel</Button>
                    <Button type="submit" disabled={isProcessing || !preview}>
                      {isProcessing ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>) : (<><Bot className="mr-2 h-4 w-4" /> Process with AI</>)}
                    </Button>
                  </DialogFooter>
                </form>
            </TabsContent>
            <TabsContent value="scan">
                <div className="grid gap-6 py-4">
                    <div className="w-full h-48 border-2 border-dashed rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden">
                       {preview && activeTab === 'scan' ? (
                          <div className="relative w-full h-full">
                            <Image src={preview} alt="Receipt preview" layout="fill" objectFit="contain" className="rounded-lg"/>
                          </div>
                       ) : (
                          hasCameraPermission === false ? (
                              <Alert variant="destructive" className="m-4">
                                  <TriangleAlert className="h-4 w-4" />
                                  <AlertTitle>Camera Access Denied</AlertTitle>
                                  <AlertDescription>
                                    Enable camera permissions in your browser settings.
                                  </AlertDescription>
                              </Alert>
                          ) : (
                             <>
                                <video ref={videoRef} className={cn("w-full h-full object-cover", preview && "hidden")} autoPlay muted playsInline />
                                <canvas ref={canvasRef} className="hidden" />
                                {!videoRef.current?.srcObject && <Video className="w-10 h-10 text-muted-foreground"/>}
                             </>
                          )
                       )}
                    </div>
                    {preview && activeTab === 'scan' ? (
                       <div className="flex justify-center gap-2">
                           <Button variant="outline" onClick={() => setPreview(null)}>Retake</Button>
                       </div>
                    ) : (
                        <Button type="button" onClick={handleCapture} disabled={isProcessing || !hasCameraPermission}>
                            <Camera className="mr-2 h-4 w-4" /> Capture Photo
                        </Button>
                    )}
                </div>
                 <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleClose} disabled={isProcessing}>Cancel</Button>
                    <Button type="button" onClick={() => processDataUri(preview!)} disabled={isProcessing || !preview}>
                      {isProcessing ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>) : (<><Bot className="mr-2 h-4 w-4" /> Process with AI</>)}
                    </Button>
                  </DialogFooter>
            </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
