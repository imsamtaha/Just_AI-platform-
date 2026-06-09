"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { User, Bell, Shield, CreditCard, Zap, Key, Check, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useAppStore } from "@/store";
import toast from "react-hot-toast";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "ai", label: "AI Preferences", icon: Zap },
  { id: "api", label: "API Keys", icon: Key },
];

const AI_MODELS = [
  { id: "GPT4O", label: "GPT-4o" },
  { id: "GPT4O_MINI", label: "GPT-4o mini" },
  { id: "CLAUDE3_SONNET", label: "Claude 3 Sonnet" },
  { id: "CLAUDE3_HAIKU", label: "Claude 3 Haiku" },
  { id: "GEMINI_PRO", label: "Gemini Pro" },
  { id: "GEMINI_FLASH", label: "Gemini Flash" },
  { id: "DEEPSEEK_CHAT", label: "DeepSeek Chat" },
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full relative transition-colors ${value ? "bg-orange-500" : "bg-white/10"}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { user } = useUser();
  const { activeModel, setActiveModel } = useAppStore();
  const [saving, setSaving] = useState(false);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  const saveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const name = `${formData.get("firstName")} ${formData.get("lastName")}`.trim();
    try {
      await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const openBillingPortal = async () => {
    try {
      const res = await fetch("/api/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "portal" }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      toast.error("Failed to open billing portal");
    }
  };

  const upgradePlan = async (priceId: string) => {
    try {
      const res = await fetch("/api/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "checkout", priceId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      toast.error("Failed to start checkout");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Settings" subtitle="Manage your account and preferences" />
      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-56 border-r border-white/5 p-4 space-y-1 flex-shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-all ${
                activeTab === tab.id
                  ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              <tab.icon className="w-4 h-4 flex-shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-8">
          {/* Profile */}
          {activeTab === "profile" && (
            <form onSubmit={saveProfile} className="max-w-lg space-y-6">
              <h2 className="text-lg font-bold text-white">Profile Information</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white text-xl font-black">
                  {user?.firstName?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="text-sm font-medium text-white/70">{user?.primaryEmailAddress?.emailAddress}</p>
                  <p className="text-xs text-white/30 mt-0.5">Profile photo is managed by Clerk</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/40 block mb-1.5">First Name</label>
                  <input
                    name="firstName"
                    defaultValue={user?.firstName || ""}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/40"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 block mb-1.5">Last Name</label>
                  <input
                    name="lastName"
                    defaultValue={user?.lastName || ""}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/40"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1.5">Email</label>
                <input
                  defaultValue={user?.primaryEmailAddress?.emailAddress || ""}
                  disabled
                  className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white/40 cursor-not-allowed"
                />
                <p className="text-xs text-white/20 mt-1">Email is managed through Clerk</p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Changes
              </button>
            </form>
          )}

          {/* Billing */}
          {activeTab === "billing" && (
            <div className="max-w-lg space-y-6">
              <h2 className="text-lg font-bold text-white">Billing & Subscription</h2>
              <div className="card-3d rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-white">Current Plan</h3>
                    <p className="text-sm text-white/40">Free tier · Upgrade for unlimited access</p>
                  </div>
                  <span className="text-xs px-3 py-1 bg-white/5 text-white/40 border border-white/10 rounded-full">Free</span>
                </div>
                <div className="space-y-2 mb-5">
                  {["10 AI chats/day", "5 writer generations/day", "1GB storage", "1 team member"].map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm text-white/50">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      {f}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => upgradePlan("price_pro_monthly")}
                    className="py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-all"
                  >
                    Upgrade to Pro · $29/mo
                  </button>
                  <button
                    onClick={openBillingPortal}
                    className="py-2.5 bg-white/5 hover:bg-white/10 text-white/50 rounded-xl text-sm transition-all"
                  >
                    Manage Billing
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { plan: "Pro", price: "$29/mo", features: ["Unlimited AI chats", "All modules", "10GB storage", "5 team members"] },
                  { plan: "Business", price: "$79/mo", features: ["Everything in Pro", "Automations", "100GB storage", "25 team members"] },
                ].map(tier => (
                  <div key={tier.plan} className="card-3d rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-white">{tier.plan}</h3>
                        <p className="text-xs text-orange-400">{tier.price}</p>
                      </div>
                      <button
                        onClick={() => upgradePlan(`price_${tier.plan.toLowerCase()}_monthly`)}
                        className="px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 rounded-lg text-xs transition-all"
                      >
                        Upgrade
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {tier.features.map(f => (
                        <div key={f} className="flex items-center gap-1.5 text-xs text-white/40">
                          <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Preferences */}
          {activeTab === "ai" && (
            <div className="max-w-lg space-y-6">
              <h2 className="text-lg font-bold text-white">AI Preferences</h2>
              <div className="space-y-3">
                <div className="card-3d rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-white/80">Default AI Model</h3>
                      <p className="text-xs text-white/40">Model used for all new conversations</p>
                    </div>
                    <select
                      value={activeModel}
                      onChange={e => setActiveModel(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/60 focus:outline-none appearance-none"
                    >
                      {AI_MODELS.map(m => (
                        <option key={m.id} value={m.id} className="bg-[#0D0D0D]">{m.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="card-3d rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-white/80">Memory System</h3>
                      <p className="text-xs text-white/40">Enable AI to remember your preferences</p>
                    </div>
                    <Toggle value={memoryEnabled} onChange={setMemoryEnabled} />
                  </div>
                </div>

                <div className="card-3d rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-white/80">Auto-save Chats</h3>
                      <p className="text-xs text-white/40">Automatically save all conversations</p>
                    </div>
                    <Toggle value={autoSave} onChange={setAutoSave} />
                  </div>
                </div>

                <button
                  onClick={() => toast.success("AI preferences saved!")}
                  className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-all"
                >
                  <Check className="w-4 h-4" />
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* Notifications, Security, API */}
          {(activeTab === "notifications" || activeTab === "security" || activeTab === "api") && (
            <div className="max-w-lg">
              <h2 className="text-lg font-bold text-white mb-4">{tabs.find(t => t.id === activeTab)?.label}</h2>
              <div className="card-3d rounded-2xl p-8 flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                    {(() => { const t = tabs.find(tab => tab.id === activeTab); return t ? <t.icon className="w-6 h-6 text-white/20" /> : null; })()}
                  </div>
                  <p className="text-white/40 text-sm">{tabs.find(t => t.id === activeTab)?.label} settings coming soon</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
