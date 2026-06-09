import { Header } from "@/components/layout/header";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Users, DollarSign, Zap, TrendingUp, Activity, Shield } from "lucide-react";

export const metadata = { title: "Admin Panel" };

export default async function AdminPage() {
  const user = await currentUser();
  if (!user || user.publicMetadata?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const stats = [
    { label: "Total Users", value: "1,284", change: "+42 this week", icon: Users, color: "text-orange-400" },
    { label: "MRR", value: "$28,450", change: "+$3,200 vs last month", icon: DollarSign, color: "text-green-400" },
    { label: "AI Requests Today", value: "8,420", change: "+15% vs yesterday", icon: Zap, color: "text-orange-300" },
    { label: "Active Subscriptions", value: "847", change: "65.9% conversion", icon: TrendingUp, color: "text-amber-400" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Admin Panel" subtitle="Platform management and analytics" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Alert */}
        <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/25 rounded-xl px-4 py-3">
          <Shield className="w-4 h-4 text-orange-400 flex-shrink-0" />
          <p className="text-sm text-orange-400">Admin access. All actions are logged.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="card-3d rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <Activity className="w-4 h-4 text-white/10" />
              </div>
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-sm text-white/40 mt-0.5">{stat.label}</div>
              <div className="text-xs text-green-400 mt-1">{stat.change}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Signups */}
          <div className="card-3d rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Recent Signups</h3>
            <div className="space-y-3">
              {[
                { name: "Alex Thompson", email: "alex@company.com", plan: "Pro", joined: "2h ago" },
                { name: "Maria Santos", email: "maria@startup.io", plan: "Free", joined: "5h ago" },
                { name: "David Kim", email: "david@enterprise.com", plan: "Business", joined: "1d ago" },
                { name: "Emma Wilson", email: "emma@design.co", plan: "Pro", joined: "2d ago" },
              ].map((user, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 truncate">{user.name}</p>
                    <p className="text-xs text-white/30 truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${user.plan === "Business" ? "bg-orange-500/20 text-orange-400" : user.plan === "Pro" ? "bg-orange-400/20 text-orange-300" : "bg-white/10 text-white/40"}`}>
                      {user.plan}
                    </span>
                    <span className="text-xs text-white/25">{user.joined}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="card-3d rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Revenue Breakdown</h3>
            <div className="space-y-4">
              {[
                { plan: "Free", users: 437, revenue: 0, percent: 0 },
                { plan: "Pro ($29/mo)", users: 624, revenue: 18096, percent: 63.6 },
                { plan: "Business ($99/mo)", users: 185, revenue: 18315, percent: 64.4 },
                { plan: "Enterprise", users: 38, revenue: 57000, percent: 100 },
              ].map((row) => (
                <div key={row.plan} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">{row.plan}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-white/30 text-xs">{row.users} users</span>
                      <span className="text-green-400 font-medium">{row.revenue > 0 ? `$${row.revenue.toLocaleString()}` : "—"}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full" style={{ width: `${row.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Admin Actions */}
        <div className="card-3d rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            {[
              "Manage Users",
              "View AI Usage",
              "Edit System Prompts",
              "Export Analytics",
              "Review Audit Logs",
              "System Health",
            ].map(action => (
              <button key={action} className="px-4 py-2 bg-white/5 hover:bg-orange-500/10 border border-white/8 hover:border-orange-500/20 text-white/50 hover:text-orange-400 rounded-xl text-sm transition-all">
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
