import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Bell, Bot } from "lucide-react";

export function SmartAlerts() {
    const alerts = [
      {
        id: 1,
        title: "Budget Alert: Dining Out",
        description: "You've spent $150 of your $200 dining budget this month. Only $50 left!",
        variant: "destructive",
        icon: <AlertTriangle className="h-4 w-4" />,
      },
      {
        id: 2,
        title: "Subscription Renewal: Music+",
        description: "Your Music+ subscription for $9.99 is scheduled to renew in 3 days.",
        variant: "default",
        icon: <Bell className="h-4 w-4" />,
      },
      {
        id: 3,
        title: "AI Suggestion: Groceries",
        description: "We noticed you frequently buy almond milk. Consider buying a larger size to save up to 15% monthly.",
        variant: "default",
        icon: <Bot className="h-4 w-4 text-primary" />,
      },
    ];

  return (
    <div className="max-w-3xl mx-auto space-y-4">
        {alerts.map((alert) => (
            <Alert key={alert.id} variant={alert.variant as "default" | "destructive"}>
                {alert.icon}
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>{alert.description}</AlertDescription>
            </Alert>
        ))}
    </div>
  );
}
