"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { User, Bell, Shield, CreditCard, Zap, Key, Palette } from "lucide-react";
import { useUser } from "@clerk/nextjs";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "ai", label: "AI Preferences", icon: Zap },
  { id: "api", label: "API Keys", icon: Key },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { user } = useUser();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Settings" subtitle="Manage your account and preferences" />
      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-56 border-r border-white/5 p-4 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-all ${activeTab === tab.id ? "bg-orange-500/15 text-orange-400 border border-orange-500/20" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}
            >
              <tab.icon className="w-4 h-4 flex-shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-8">
          {activeTab === "profile" && (
            <div className="max-w-lg space-y-6">
              <h2 className="text-lg font-bold text-white">Profile Information</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white text-xl font-black">
                  {user?.firstName?.charAt(0) || "U"}
                </div>
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 rounded-xl text-sm transition-all">
                  Change Photo
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "First Name", value: user?.firstName || "" },
                  { label: "Last Name", value: user?.lastName || "" },
                ].map(field => (
                  <div key={field.label}>
                    <label className="text-xs text-white/40 block mb-1.5">{field.label}</label>
                    <input
                      defaultValue={field.value}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/40"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1.5">Email</label>
                <input
                  defaultValue={user?.primaryEmailAddress?.emailAddress || ""}
                  disabled
                  className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white/40 cursor-not-allowed"
                />
              </div>
              <button className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-all">
                Save Changes
              </button>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="max-w-lg space-y-6">
              <h2 className="text-lg font-bold text-white">Billing & Subscription</h2>
              <div className="card-3d rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-white">Pro Plan</h3>
                    <p className="text-sm text-white/40">$29/month · Renews Dec 31, 2024</p>
                  </div>
                  <span className="text-xs px-3 py-1 bg-orange-500/15 text-orange-400 border border-orange-500/20 rounded-full">Active</span>
                </div>
                <div className="space-y-2">
                  {["Unlimited AI chats", "All AI modules", "Automations", "10GB storage"].map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm text-white/50">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                      {f}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-5 pt-4 border-t border-white/5">
                  <button className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-all">
                    Upgrade to Business
                  </button>
                  <button className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/50 rounded-xl text-sm transition-all">
                    Manage
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="max-w-lg space-y-6">
              <h2 className="text-lg font-bold text-white">AI Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: "Default AI Model", desc: "Model used for all new chats", type: "select", options: ["GPT-4o", "Claude 3 Sonnet", "Gemini Pro"] },
                  { label: "Response Style", desc: "How AI formats responses", type: "select", options: ["Balanced", "Concise", "Detailed", "Creative"] },
                  { label: "Memory System", desc: "Enable AI to remember your preferences", type: "toggle", value: true },
                  { label: "Auto-save chats", desc: "Automatically save all conversations", type: "toggle", value: true },
                ].map(pref => (
                  <div key={pref.label} className="card-3d rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-white/80">{pref.label}</h3>
                        <p className="text-xs text-white/40">{pref.desc}</p>
                      </div>
                      {pref.type === "select" ? (
                        <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/60 focus:outline-none">
                          {pref.options?.map(o => <option key={o} className="bg-[#0D0D0D]">{o}</option>)}
                        </select>
                      ) : (
                        <div className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${pref.value ? "bg-orange-500" : "bg-white/10"}`}>
                          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${pref.value ? "translate-x-5" : "translate-x-0.5"}`} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeTab === "notifications" || activeTab === "security" || activeTab === "api") && (
            <div className="max-w-lg">
              <h2 className="text-lg font-bold text-white mb-4">{tabs.find(t => t.id === activeTab)?.label}</h2>
              <div className="card-3d rounded-2xl p-8 flex items-center justify-center min-h-[300px]">
                <p className="text-white/30 text-sm">Settings coming soon</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
