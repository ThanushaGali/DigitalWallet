'use client';

import * as React from 'react';
import type { Receipt } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertCircle, Target, IndianRupee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExpenseBudgetsProps {
  receipts: Receipt[];
}

const ALL_CATEGORIES = [
  'Groceries',
  'Dining',
  'Travel',
  'Health',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Rent',
  'Other',
];

const initialBudgets: Record<string, number> = {
  Groceries: 8000,
  Dining: 4000,
  Shopping: 5000,
  Travel: 3000,
  Utilities: 2000,
};

export function ExpenseBudgets({ receipts }: ExpenseBudgetsProps) {
  const [budgets, setBudgets] = React.useState<Record<string, number>>(initialBudgets);
  const [editingCategory, setEditingCategory] = React.useState<string | null>(null);
  const [newBudget, setNewBudget] = React.useState('');
  const { toast } = useToast();

  const spendingByCategory = React.useMemo(() => {
    return receipts.reduce((acc, receipt) => {
      acc[receipt.category] = (acc[receipt.category] || 0) + receipt.totalAmount;
      return acc;
    }, {} as Record<string, number>);
  }, [receipts]);

  const handleSetBudget = (category: string) => {
    const budgetValue = parseFloat(newBudget);
    if (!isNaN(budgetValue) && budgetValue >= 0) {
      setBudgets(prev => ({ ...prev, [category]: budgetValue }));
      setEditingCategory(null);
      setNewBudget('');
      toast({
        title: 'Budget Updated',
        description: `Budget for ${category} set to ₹${budgetValue.toFixed(2)}.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid Input',
        description: 'Please enter a valid positive number for the budget.',
      });
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage > 100) return 'bg-destructive';
    if (percentage > 75) return 'bg-amber-500';
    return 'bg-primary';
  };

  const activeCategories = Array.from(new Set([...Object.keys(budgets), ...Object.keys(spendingByCategory)]));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target />
          Expense Budgets
        </CardTitle>
        <CardDescription>Set monthly budgets for your spending categories and track your progress.</CardDescription>
      </CardHeader>
      <CardContent>
        {activeCategories.length === 0 ? (
           <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center h-[300px]">
            <h3 className="text-xl font-bold tracking-tight">No spending or budgets yet</h3>
            <p className="text-muted-foreground mt-2">
              Add a receipt or set a budget to start tracking.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeCategories.map(category => {
              const spent = spendingByCategory[category] || 0;
              const budget = budgets[category] || 0;
              const percentage = budget > 0 ? (spent / budget) * 100 : 0;
              const isEditing = editingCategory === category;

              return (
                <div key={category} className="space-y-2">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <h4 className="font-semibold text-lg">{category}</h4>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <IndianRupee className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            value={newBudget}
                            onChange={(e) => setNewBudget(e.target.value)}
                            placeholder={`e.g., ${budget || 5000}`}
                            className="w-32 pl-8"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleSetBudget(category)}
                          />
                        </div>
                        <Button size="sm" onClick={() => handleSetBudget(category)}>Set</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingCategory(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">₹{spent.toFixed(2)}</span> / {budget > 0 ? `₹${budget.toFixed(2)}` : 'No budget set'}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingCategory(category);
                            setNewBudget(budget > 0 ? String(budget) : '');
                          }}
                        >
                          {budget > 0 ? 'Edit' : 'Set Budget'}
                        </Button>
                      </div>
                    )}
                  </div>
                  {budget > 0 && (
                    <>
                      <Progress value={Math.min(percentage, 100)} className="h-3" indicatorClassName={getProgressColor(percentage)} />
                      {percentage > 100 && (
                        <div className="flex items-center gap-1.5 text-xs text-destructive">
                          <AlertCircle className="h-3.5 w-3.5" />
                          You've exceeded your budget by ₹{(spent - budget).toFixed(2)}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Add this to ui/progress.tsx if it's not already there.
// For now, adding a temporary solution directly here to avoid file conflicts.
declare module '@/components/ui/progress' {
    interface ProgressProps {
        indicatorClassName?: string;
    }
}
// This is a monkey patch for the Progress component to allow custom indicator colors.
// A better solution would be to modify the component directly if possible.
const originalProgress = Progress;
(originalProgress as any).render = (props: React.ComponentProps<typeof Progress> & { indicatorClassName?: string }) => {
    const { className, value, indicatorClassName, ...rest } = props;
    return (
        <originalProgress.type
            ref={props.ref}
            className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
            {...rest}
            value={value}
        >
            <div
                className={cn("h-full w-full flex-1 bg-primary transition-all", indicatorClassName)}
                style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
            />
        </originalProgress.type>
    );
};
