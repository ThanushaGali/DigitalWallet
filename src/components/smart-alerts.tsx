'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Bot, Coins, Lightbulb } from "lucide-react";
import type { Receipt } from "@/types";
import * as React from 'react';

interface SmartAlertsProps {
    receipts: Receipt[];
}

const HIGH_SPEND_THRESHOLD = 2000;
const FREQUENT_VENDOR_THRESHOLD = 2;

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

        // 2. High Spending Alert
        const highSpendReceipts = receipts.filter(r => r.totalAmount > HIGH_SPEND_THRESHOLD);
        if (highSpendReceipts.length > 0) {
            const largestPurchase = highSpendReceipts.sort((a,b) => b.totalAmount - a.totalAmount)[0];
            generatedAlerts.push({
                id: 'high-spend-alert',
                title: "Large Purchase Detected",
                description: `You made a significant purchase of ₹${largestPurchase.totalAmount.toFixed(2)} at ${largestPurchase.vendor}.`,
                icon: <Coins className="h-6 w-6" />,
                color: 'text-amber-500',
            });
        }

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
                title: "You're a Regular!",
                description: `You've shopped at ${mostFrequent[0]} ${mostFrequent[1]} times recently. Keep an eye out for loyalty rewards!`,
                icon: <Bot className="h-6 w-6" />,
                color: 'text-primary',
            });
        }
        
        // Add a default suggestion if no other alerts
        if (generatedAlerts.length === 0) {
             generatedAlerts.push({
                id: 'default-suggestion',
                title: "AI Insight",
                description: `Try asking our AI a question like, "What was my biggest expense this month?" to get smart insights.`,
                icon: <Lightbulb className="h-6 w-6" />,
                color: 'text-blue-500',
            });
        }

        return generatedAlerts;
    }, [receipts]);

  return (
    <div className="max-w-4xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {alerts.map((alert) => (
                <Card key={alert.id} className="flex flex-col">
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                        <div className={alert.color}>{alert.icon}</div>
                        <CardTitle className="text-lg">{alert.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-sm text-muted-foreground">
                            {alert.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
             {/* Placeholder for future alerts */}
            <Card className="flex flex-col border-dashed">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                     <div className="text-muted-foreground"><Lightbulb className="h-6 w-6" /></div>
                     <CardTitle className="text-lg text-muted-foreground">Future Insights</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">
                        More AI-powered alerts and suggestions will appear here as you add more receipts.
                    </p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
