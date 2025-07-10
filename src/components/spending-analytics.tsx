'use client';

import * as React from 'react';
import { Pie, PieChart, Cell, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import type { Receipt } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Tooltip as UiTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format, isSameMonth } from 'date-fns';

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
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const { chartData, chartConfig, totalSpent, vendorData, dailySpending } = React.useMemo(() => {
    const visibleReceipts = receipts.filter(r => isSameMonth(new Date(r.date), currentMonth));
    
    const categoryTotals = visibleReceipts.reduce((acc, receipt) => {
      const category = receipt.category || 'Other';
      acc[category] = (acc[category] || 0) + receipt.totalAmount;
      return acc;
    }, {} as { [key: string]: number });
    
    const vendorStats = visibleReceipts.reduce((acc, receipt) => {
      if (!acc[receipt.vendor]) {
        acc[receipt.vendor] = { count: 0, total: 0 };
      }
      acc[receipt.vendor].count += 1;
      acc[receipt.vendor].total += receipt.totalAmount;
      return acc;
    }, {} as { [key: string]: { count: number; total: number } });

    const totalSpent = visibleReceipts.reduce((sum, r) => sum + r.totalAmount, 0);

    const dailySpending = visibleReceipts.reduce((acc, receipt) => {
        const day = format(new Date(receipt.date), 'yyyy-MM-dd');
        acc[day] = (acc[day] || 0) + receipt.totalAmount;
        return acc;
    }, {} as Record<string, number>);

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

    const vendorData = Object.entries(vendorStats)
        .map(([vendor, stats]) => ({
            vendor,
            ...stats,
        }))
        .sort((a, b) => b.total - a.total);

    return { chartData, chartConfig, totalSpent, vendorData, dailySpending };
  }, [receipts, currentMonth]);
  
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

  const getDayStyle = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const amount = dailySpending[dateString];
    if (!amount) return {};
    
    // Simple scale for opacity based on spending
    const maxSpending = Math.max(...Object.values(dailySpending), 1);
    const opacity = Math.max(0.1, Math.min(1, (amount / maxSpending) * 2));
    
    return {
      backgroundColor: `hsl(var(--primary) / ${opacity})`,
      color: opacity > 0.6 ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
    };
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Spending Breakdown for {format(currentMonth, 'MMMM yyyy')}</CardTitle>
          <CardDescription>Here's a summary of your spending for the selected month.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8 items-start">
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
            <div className="space-y-8">
              <div className="text-center md:text-left">
                  <p className="text-sm text-muted-foreground">Total Spent this Month</p>
                  <p className="text-5xl font-bold text-primary">₹{totalSpent.toFixed(2)}</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                      <h4 className="font-medium">Top Categories</h4>
                      <ScrollArea className="h-48">
                          <ul className="space-y-2 pr-4">
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
                      </ScrollArea>
                  </div>

                  <div className="space-y-2">
                      <h4 className="font-medium">Vendor Breakdown</h4>
                       <ScrollArea className="h-48">
                          <ul className="space-y-2 pr-4">
                              {vendorData.map((vendor) => (
                                  <li key={vendor.vendor} className="p-2 rounded-md bg-muted/50">
                                      <div className="flex items-center justify-between">
                                         <span className="text-sm font-medium">{vendor.vendor}</span>
                                         <span className="font-mono font-semibold">₹{vendor.total.toFixed(2)}</span>
                                      </div>
                                      <p className="text-xs text-muted-foreground">{vendor.count} {vendor.count > 1 ? 'purchases' : 'purchase'}</p>
                                  </li>
                              ))}
                          </ul>
                      </ScrollArea>
                  </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Spending Heatmap</CardTitle>
            <CardDescription>Visualize your daily spending. Darker days mean more spending.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
            <TooltipProvider>
                <Calendar
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    modifiers={{
                        spent: Object.keys(dailySpending).map(d => new Date(d))
                    }}
                    components={{
                        Day: ({ date, displayMonth }) => {
                            const dateString = format(date, 'yyyy-MM-dd');
                            const amount = dailySpending[dateString];
                            
                            if (!isSameMonth(date, displayMonth)) {
                                return <div className="h-9 w-9"></div>;
                            }

                            return (
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <div
                                            className="h-9 w-9 p-0 relative flex items-center justify-center rounded-md"
                                            style={getDayStyle(date)}
                                        >
                                            {date.getDate()}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {amount ? `Spent ₹${amount.toFixed(2)}` : 'No spending'}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        },
                    }}
                    className="p-0"
                />
            </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
}
