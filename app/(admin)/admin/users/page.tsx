"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { motion } from "framer-motion";
import { Search, Filter, MoreHorizontal, ShieldCheck, User, Crown } from "lucide-react";

interface AdminUser {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  plan: string;
  role: string;
  createdAt: string;
  _count: { chats: number; tasks: number };
}

const planColors: Record<string, string> = {
  FREE: "text-white/40 bg-white/5 border-white/10",
  PRO: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  BUSINESS: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  ENTERPRISE: "text-purple-400 bg-purple-500/10 border-purple-500/20",
};

const roleColors: Record<string, string> = {
  USER: "text-white/40",
  ADMIN: "text-orange-400",
  SUPERADMIN: "text-red-400",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "20",
      ...(search ? { search } : {}),
      ...(planFilter ? { plan: planFilter } : {}),
    });

    fetch(`/api/admin/users?${params}`)
      .then(r => r.json())
      .then(data => {
        setUsers(data.users || []);
        setTotal(data.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, planFilter]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="User Management" subtitle="Manage all platform users" />
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-5">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or email..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/40"
            />
          </div>
          <select
            value={planFilter}
            onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/60 focus:outline-none appearance-none min-w-[120px]"
          >
            <option value="" className="bg-[#0D0D0D]">All Plans</option>
            {["FREE", "PRO", "BUSINESS", "ENTERPRISE"].map(p => (
              <option key={p} value={p} className="bg-[#0D0D0D]">{p}</option>
            ))}
          </select>
          <div className="text-sm text-white/30">{total} users total</div>
        </div>

        {/* Table */}
        <div className="card-3d rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {["User", "Plan", "Role", "Chats", "Tasks", "Joined", "Actions"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-white/30 uppercase tracking-wider px-5 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-white/5 rounded shimmer" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/5 hover:bg-white/3 transition-all group"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/90">{user.name || "—"}</p>
                        <p className="text-xs text-white/30">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full border ${planColors[user.plan] || planColors.FREE}`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className={`flex items-center gap-1 text-xs font-medium ${roleColors[user.role] || roleColors.USER}`}>
                      {user.role === "ADMIN" ? <ShieldCheck className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      {user.role}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-white/50">{user._count?.chats || 0}</td>
                  <td className="px-5 py-4 text-sm text-white/50">{user._count?.tasks || 0}</td>
                  <td className="px-5 py-4 text-xs text-white/30">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <button className="p-1.5 opacity-0 group-hover:opacity-100 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/80 rounded-lg transition-all">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/30">
              Showing {Math.min((page - 1) * 20 + 1, total)}–{Math.min(page * 20, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white/60 rounded-lg text-sm transition-all"
              >
                Previous
              </button>
              <button
                disabled={page * 20 >= total}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white/60 rounded-lg text-sm transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
