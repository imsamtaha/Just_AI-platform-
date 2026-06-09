"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { motion } from "framer-motion";
import { Users, Plus, Search, Filter, Mail, Phone, Star, TrendingUp, DollarSign } from "lucide-react";

const contacts = [
  { id: "1", name: "Sarah Johnson", company: "TechCorp", email: "sarah@techcorp.com", phone: "+1 555-0101", score: 92, status: "HOT", value: "$12,000" },
  { id: "2", name: "Michael Chen", company: "StartupXYZ", email: "michael@startupxyz.com", phone: "+1 555-0102", score: 78, status: "WARM", value: "$5,500" },
  { id: "3", name: "Emily Davis", company: "Enterprise Inc", email: "emily@enterprise.com", phone: "+1 555-0103", score: 65, status: "WARM", value: "$8,200" },
  { id: "4", name: "James Wilson", company: "Agency Pro", email: "james@agencypro.com", phone: "+1 555-0104", score: 45, status: "COLD", value: "$2,100" },
  { id: "5", name: "Lisa Martinez", company: "GrowthCo", email: "lisa@growthco.com", phone: "+1 555-0105", score: 88, status: "HOT", value: "$15,000" },
];

const pipeline = [
  { stage: "New Leads", count: 8, value: "$42K", color: "#666" },
  { stage: "Contacted", count: 5, value: "$28K", color: "#FF7A00" },
  { stage: "Qualified", count: 4, value: "$35K", color: "#FFB570" },
  { stage: "Proposal", count: 3, value: "$48K", color: "#FF9B42" },
  { stage: "Negotiation", count: 2, value: "$31K", color: "#FFCA80" },
  { stage: "Won", count: 7, value: "$89K", color: "#4ade80" },
];

const statusColors: Record<string, string> = {
  HOT: "text-red-400 bg-red-500/10 border-red-500/20",
  WARM: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  COLD: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

export default function CRMPage() {
  const [activeTab, setActiveTab] = useState<"contacts" | "pipeline">("contacts");
  const [search, setSearch] = useState("");

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="CRM" subtitle="Contacts, leads, deals & AI-powered insights" />
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Contacts", value: "142", icon: Users, color: "text-orange-400" },
            { label: "Hot Leads", value: "12", icon: Star, color: "text-red-400" },
            { label: "Pipeline Value", value: "$273K", icon: DollarSign, color: "text-green-400" },
            { label: "Win Rate", value: "64%", icon: TrendingUp, color: "text-orange-300" },
          ].map((stat) => (
            <div key={stat.label} className="card-3d rounded-xl p-4">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-sm text-white/40">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl">
            {(["contacts", "pipeline"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${tab === activeTab ? "bg-orange-500 text-white" : "text-white/40 hover:text-white/70"}`}
              >
                {tab === "contacts" ? "Contacts & Leads" : "Pipeline"}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-all ml-auto">
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>

        {activeTab === "contacts" ? (
          <>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/40"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/8 text-white/50 rounded-xl text-sm hover:bg-white/10 transition-all">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
            <div className="card-3d rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Contact", "Company", "AI Score", "Status", "Value", "Actions"].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-white/30 uppercase tracking-wider px-5 py-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((contact, i) => (
                    <motion.tr
                      key={contact.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/3 transition-all group"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {contact.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white/90">{contact.name}</p>
                            <p className="text-xs text-white/30">{contact.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-white/60">{contact.company}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${contact.score}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-orange-400">{contact.score}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[contact.status]}`}>{contact.status}</span>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-green-400">{contact.value}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button className="p-1.5 bg-white/5 hover:bg-orange-500/10 text-white/40 hover:text-orange-400 rounded-lg transition-all">
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 bg-white/5 hover:bg-orange-500/10 text-white/40 hover:text-orange-400 rounded-lg transition-all">
                            <Phone className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          /* Pipeline */
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {pipeline.map((stage, i) => (
              <motion.div
                key={stage.stage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card-3d rounded-2xl p-4 text-center"
              >
                <div className="w-3 h-3 rounded-full mx-auto mb-3" style={{ backgroundColor: stage.color }} />
                <h3 className="text-xs font-semibold text-white/60 mb-2">{stage.stage}</h3>
                <div className="text-2xl font-black text-white mb-0.5">{stage.count}</div>
                <div className="text-xs font-semibold text-green-400">{stage.value}</div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
