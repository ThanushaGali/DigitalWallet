// This is a protected route.
// The layout will handle redirecting unauthenticated users.
import { Dashboard } from "@/components/dashboard";

export default function Home() {
  return (
    <Dashboard />
  );
}
