import { Header } from "@/components/layout/header";
import { DashboardOverview } from "@/components/dashboard/overview-cards";
import { DashboardAiInput } from "@/components/dashboard/ai-input";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title={`Good day, ${user?.firstName || "there"} 👋`}
        subtitle="Here's what's happening with your productivity"
      />
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
        {/* AI Input */}
        <DashboardAiInput />

        {/* Overview Cards */}
        <DashboardOverview />

        {/* Recent Activity */}
        <RecentActivity />
      </div>
    </div>
  );
}
