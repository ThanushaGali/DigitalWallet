'use client';

import * as React from 'react';
import type { Receipt } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart2 } from 'lucide-react';

interface SpendingAnalysisProps {
  receipts: Receipt[];
}

export function SpendingAnalysis({ receipts }: SpendingAnalysisProps) {
  const categorySpending = React.useMemo(() => {
    const spendingMap: { [key: string]: number } = {};

    receipts.forEach((receipt) => {
      if (!receipt.isFraudulent) {
        spendingMap[receipt.category] = (spendingMap[receipt.category] || 0) + receipt.totalAmount;
      }
    });

    return Object.entries(spendingMap)
      .map(([name, total]) => ({ name, total: Math.round(total) }))
      .sort((a, b) => b.total - a.total);
  }, [receipts]);

  const chartConfig = {
    total: {
      label: 'Total Spent',
      color: 'hsl(var(--primary))',
    },
  };
  
  if (receipts.length === 0) {
    return (
      <Card>
        <CardHeader>
           <CardTitle className="flex items-center gap-2">
            <BarChart2 />
            Spending Analysis
          </CardTitle>
          <CardDescription>
            Visual insights into your spending habits.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center h-[400px]">
              <h3 className="text-2xl font-bold tracking-tight">No data to analyze</h3>
              <p className="text-muted-foreground mt-2">
                Add some receipts to see your spending analysis.
              </p>
            </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <BarChart2 />
            Spending Analysis
        </CardTitle>
        <CardDescription>
            Here's a breakdown of your spending by category.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <BarChart data={categorySpending} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent
                        formatter={(value, name, item) => (
                        <div className="flex flex-col">
                            <span className="font-bold">{item.payload.name}</span>
                            <span>Total: ₹{value}</span>
                        </div>
                        )}
                    />}
                />
                 <Bar dataKey="total" fill="var(--color-total)" radius={4} />
            </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
