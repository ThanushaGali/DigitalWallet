
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, Lightbulb, Bell, CalendarCheck2, TrendingUp, Repeat, Info, Gift, RotateCw, Wallet, Target } from "lucide-react";
import type { Receipt } from "@/types";
import * as React from 'react';
import { getFinancialTips } from "@/app/actions";
import type { FinancialTip } from "@/ai/flows/generate-financial-tips";
import { Skeleton } from "./ui/skeleton";

interface SmartAlertsProps {
    receipts: Receipt[];
}

const HIGH_SPEND_THRESHOLD = 2000;
const FREQUENT_VENDOR_THRESHOLD = 3;
const RETURN_WINDOW_DAYS = 30;
const SPIKE_MULTIPLIER = 5; // A purchase is a "spike" if it's 5x the average
const BUDGET_LIMIT_DINING = 5000;


type AlertType = {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
};

const financialTipIcons: { [key: string]: React.ReactNode } = {
    alternative: <Gift className="h-6 w-6" />,
    reorder: <RotateCw className="h-6 w-6" />,
    savings_tip: <Info className="h-6 w-6" />,
};

export function SmartAlerts({ receipts }: SmartAlertsProps) {
    const [financialTips, setFinancialTips] = React.useState<FinancialTip[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchTips = async () => {
            if (receipts.length > 0) {
                setIsLoading(true);
                const tips = await getFinancialTips(receipts);
                setFinancialTips(tips);
                setIsLoading(false);
            } else {
                setFinancialTips([]);
                setIsLoading(false);
            }
        };
        fetchTips();
    }, [receipts]);
    
    const staticAlerts = React.useMemo(() => {
        if (!receipts || receipts.length === 0) {
            return [];
        }

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
        
        // 2. Return Window Reminder
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

        // 3. Subscription Renewal Reminder
        const vendorCounts = receipts.reduce((acc, r) => {
            if (!r.isFraudulent) {
              acc[r.vendor] = (acc[r.vendor] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const frequentVendors = Object.entries(vendorCounts).filter(([, count]) => count >= FREQUENT_VENDOR_THRESHOLD);
        if (frequentVendors.length > 0) {
             const mostFrequent = frequentVendors.sort((a,b) => b[1] - a[1])[0];
            generatedAlerts.push({
                id: 'subscription-renewal-alert',
                title: "Subscription Renewal?",
                description: `You've shopped at ${mostFrequent[0]} ${mostFrequent[1]} times recently. Check if a subscription is due for renewal.`,
                icon: <Repeat className="h-6 w-6" />,
                color: 'text-primary',
            });
        }
        
        // 4. Budget Spikes / Overages
        const totalSpent = receipts.reduce((sum, r) => sum + r.totalAmount, 0);
        const averageSpent = totalSpent / receipts.length;
        const spendingSpike = receipts.find(r => r.totalAmount > averageSpent * SPIKE_MULTIPLIER);
        
        if (spendingSpike) {
            generatedAlerts.push({
                id: `spike-${spendingSpike.id}`,
                title: 'Spending Spike',
                description: `Your purchase of ₹${spendingSpike.totalAmount.toFixed(2)} at ${spendingSpike.vendor} is significantly higher than your average spend of ₹${averageSpent.toFixed(2)}.`,
                icon: <TrendingUp className="h-6 w-6" />,
                color: 'text-indigo-500',
            });
        }
        
        // 5. Budget Alerts
        const diningSpend = receipts.filter(r => r.category === 'Dining').reduce((sum, r) => sum + r.totalAmount, 0);
        if (diningSpend > BUDGET_LIMIT_DINING * 0.8) {
            generatedAlerts.push({
                id: 'budget-alert-dining',
                title: 'Budget Alert: Dining',
                description: `You've spent ₹${diningSpend.toFixed(2)} on Dining this period, which is close to your budget of ₹${BUDGET_LIMIT_DINING.toFixed(2)}.`,
                icon: <Target className="h-6 w-6" />,
                color: 'text-orange-500',
            });
        }
        
        // 6. Cashback / Loyalty Points Reminder (Mock)
        if (receipts.some(r => r.category === 'Shopping' || r.category === 'Groceries')) {
            generatedAlerts.push({
                id: 'loyalty-points-reminder',
                title: "Remember Your Rewards!",
                description: `Don't forget to use your credit card that offers cashback or loyalty points on shopping & grocery purchases.`,
                icon: <Wallet className="h-6 w-6" />,
                color: 'text-green-500',
            });
        }
        
        return generatedAlerts;
    }, [receipts]);
    
    const allAlerts = [...staticAlerts];
    const hasAlerts = allAlerts.length > 0 || financialTips.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Bell />
            Smart Reminders & Tips
        </CardTitle>
        <CardDescription>
            AI-powered alerts, trends, and financial recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isLoading && !hasAlerts ? (
             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center h-[300px]">
                <Lightbulb className="h-12 w-12 mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold tracking-tight">All Clear!</h3>
                <p className="text-muted-foreground mt-2">
                    No urgent reminders right now. Add more receipts for personalized tips.
                </p>
            </div>
        ) : (
             <div className="grid gap-4 md:grid-cols-2">
                {allAlerts.map((alert) => (
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
                {isLoading && Array.from({ length: 2 }).map((_, index) => (
                     <div key={`skel-${index}`} className="flex items-start gap-4 p-4 border rounded-lg bg-muted/30">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-4 w-4/5" />
                        </div>
                    </div>
                ))}
                {!isLoading && financialTips.map((tip, index) => (
                    <div key={`tip-${index}`} className="flex items-start gap-4 p-4 border rounded-lg bg-muted/30">
                        <div className="text-cyan-500">{financialTipIcons[tip.type] || <Info className="h-6 w-6"/>}</div>
                        <div className="flex-1">
                            <h4 className="font-semibold">{tip.title}</h4>
                            <p className="text-sm text-muted-foreground">
                                {tip.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
