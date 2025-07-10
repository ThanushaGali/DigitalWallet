'use client';

import * as React from 'react';
import { Pie, PieChart, Cell, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import type { Receipt } from '@/types';

interface SpendingAnalyticsProps {
  receipts: Receipt[];
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function SpendingAnalytics({ receipts }: SpendingAnalyticsProps) {
  const { chartData, chartConfig, totalSpent } = React.useMemo(() => {
    const categoryTotals = receipts.reduce((acc, receipt) => {
      const category = receipt.category || 'Other';
      acc[category] = (acc[category] || 0) + receipt.totalAmount;
      return acc;
    }, {} as { [key: string]: number });

    const totalSpent = receipts.reduce((sum, r) => sum + r.totalAmount, 0);

    const chartConfig: ChartConfig = {};
    const chartData = Object.entries(categoryTotals)
      .map(([name, value], index) => {
        chartConfig[name.toLowerCase()] = {
          label: name,
          color: COLORS[index % COLORS.length],
        };
        return {
          name,
          value: parseFloat(value.toFixed(2)),
          fill: COLORS[index % COLORS.length],
        };
      })
      .sort((a, b) => b.value - a.value);

    return { chartData, chartConfig, totalSpent };
  }, [receipts]);
  
  if (receipts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Analytics</CardTitle>
          <CardDescription>No data to analyze yet. Add some receipts!</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80">
          <p className="text-muted-foreground">Upload a receipt to see your spending breakdown.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Analytics</CardTitle>
        <CardDescription>Here's a breakdown of your spending by category for the current period.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[300px]">
              <PieChart>
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel indicator="dot" formatter={(value, name, props) => (
                    <div className="flex flex-col gap-0.5">
                      <div className="font-medium">{props.payload.name}</div>
                      <div className="text-muted-foreground">₹{Number(value).toFixed(2)}</div>
                    </div>
                  )} />}
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  innerRadius={80}
                  paddingAngle={5}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>
          <div className="space-y-4">
            <div className="text-center md:text-left">
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-5xl font-bold text-primary">₹{totalSpent.toFixed(2)}</p>
            </div>
            <div className="space-y-2">
                <h4 className="font-medium">Top Categories</h4>
                <ul className="space-y-2">
                    {chartData.map((entry) => (
                        <li key={entry.name} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                                <span className="text-sm font-medium">{entry.name}</span>
                            </div>
                            <span className="font-mono font-semibold">₹{entry.value.toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
