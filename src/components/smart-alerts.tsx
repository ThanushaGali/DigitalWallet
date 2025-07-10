'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, Bot, Lightbulb, Bell, CalendarCheck2 } from "lucide-react";
import type { Receipt } from "@/types";
import * as React from 'react';

interface SmartAlertsProps {
    receipts: Receipt[];
}

const HIGH_SPEND_THRESHOLD = 2000;
const FREQUENT_VENDOR_THRESHOLD = 3; // Increased threshold
const RETURN_WINDOW_DAYS = 30;

type AlertType = {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
};

export function SmartAlerts({ receipts }: SmartAlertsProps) {
    const alerts = React.useMemo(() => {
        const generatedAlerts: AlertType[] = [];
        const today = new Date();

        // 1. Fraudulent Receipt Alert
        const fraudulentReceipts = receipts.filter(r => r.isFraudulent);
        if (fraudulentReceipts.length > 0) {
            generatedAlerts.push({
                id: 'fraud-alert',
                title: "Potential Fraud Detected",
                description: `We found ${fraudulentReceipts.length} receipt(s) that might be fraudulent. Please review them carefully.`,
                icon: <AlertTriangle className="h-6 w-6" />,
                color: 'text-destructive',
            });
        }
        
        // 2. Return Window Reminder for High-Value Items
        const highValueItems = receipts.filter(r => r.totalAmount > HIGH_SPEND_THRESHOLD && !r.isFraudulent);
        highValueItems.forEach(receipt => {
            const receiptDate = new Date(receipt.date);
            const diffTime = today.getTime() - receiptDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const remainingDays = RETURN_WINDOW_DAYS - diffDays;

            if (remainingDays > 0 && remainingDays <= 7) {
                 generatedAlerts.push({
                    id: `return-${receipt.id}`,
                    title: `Return Window Closing!`,
                    description: `Only ${remainingDays} days left to return your ₹${receipt.totalAmount.toFixed(2)} purchase from ${receipt.vendor}.`,
                    icon: <CalendarCheck2 className="h-6 w-6" />,
                    color: 'text-amber-500',
                });
            }
        });


        // 3. Frequent Vendor Alert
        const vendorCounts = receipts.reduce((acc, r) => {
            acc[r.vendor] = (acc[r.vendor] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const frequentVendors = Object.entries(vendorCounts).filter(([, count]) => count >= FREQUENT_VENDOR_THRESHOLD);
        if (frequentVendors.length > 0) {
             const mostFrequent = frequentVendors.sort((a,b) => b[1] - a[1])[0];
            generatedAlerts.push({
                id: 'frequent-vendor-alert',
                title: "Subscription or Habit?",
                description: `You've shopped at ${mostFrequent[0]} ${mostFrequent[1]} times recently. Is this a recurring expense you can track?`,
                icon: <Bot className="h-6 w-6" />,
                color: 'text-primary',
            });
        }
        
        return generatedAlerts;
    }, [receipts]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Bell />
            Smart Reminders
        </CardTitle>
        <CardDescription>
            AI-powered alerts for return windows, potential fraud, and spending habits.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length > 0 ? (
             <div className="grid gap-4 md:grid-cols-2">
                {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-4 p-4 border rounded-lg bg-muted/30">
                        <div className={alert.color}>{alert.icon}</div>
                        <div className="flex-1">
                            <h4 className="font-semibold">{alert.title}</h4>
                            <p className="text-sm text-muted-foreground">
                                {alert.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center h-[300px]">
                <Lightbulb className="h-12 w-12 mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold tracking-tight">All Clear!</h3>
                <p className="text-muted-foreground mt-2">
                    No urgent reminders right now. We'll let you know if anything needs your attention.
                </p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
