'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Skeleton } from '@/components/ui/skeleton';

interface QRCodeGeneratorProps {
  data: object;
  className?: string;
}

export function QRCodeGenerator({ data, className }: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        // Only generate if data is present
        if(Object.keys(data).length > 0) {
            const jsonString = JSON.stringify(data);
            const url = await QRCode.toDataURL(jsonString, {
                errorCorrectionLevel: 'H',
                type: 'image/png',
                quality: 0.9,
                margin: 1,
                color: {
                  dark:"#000000FF",
                  light:"#FFFFFFFF"
                }
            });
            setQrCodeUrl(url);
        }
      } catch (err) {
        console.error('Failed to generate QR code', err);
        setQrCodeUrl(null); // Reset on error
      }
    };
    generateQRCode();
  }, [data]);

  if (!qrCodeUrl) {
    return <Skeleton className={className || "w-48 h-48"} />;
  }

  return <img src={qrCodeUrl} alt="Receipt QR Code" className={className || "w-48 h-48"} />;
}
