"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Search, Filter, Mail, Phone, Star, TrendingUp, DollarSign, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Contact {
  id: string;
  firstName: string;
  lastName?: string;
  company?: string;
  email?: string;
  phone?: string;
  aiScore?: number;
  status?: string;
  value?: number;
}

const statusColors: Record<string, string> = {
  HOT: "text-red-400 bg-red-500/10 border-red-500/20",
  WARM: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  COLD: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  QUALIFIED: "text-green-400 bg-green-500/10 border-green-500/20",
};

function AddContactModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: Contact) => void }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", company: "", position: "" });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.firstName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/crm/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.id) {
        onCreated(data);
        toast.success("Contact added!");
        onClose();
      }
    } catch {
      toast.error("Failed to add contact");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-[#0D0D0D] border border-white/10 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Add Contact</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 block mb-1.5">First Name *</label>
              <input
                value={form.firstName}
                onChange={e => set("firstName", e.target.value)}
                placeholder="John"
                autoFocus
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/40"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 block mb-1.5">Last Name</label>
              <input
                value={form.lastName}
                onChange={e => set("lastName", e.target.value)}
                placeholder="Smith"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/40"
              />
            </div>
          </div>
          {[
            { key: "email", label: "Email", placeholder: "john@company.com" },
            { key: "phone", label: "Phone", placeholder: "+1 555-0100" },
            { key: "company", label: "Company", placeholder: "Acme Corp" },
            { key: "position", label: "Position", placeholder: "CEO" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-white/40 block mb-1.5">{f.label}</label>
              <input
                value={form[f.key as keyof typeof form]}
                onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/40"
              />
            </div>
          ))}
          <button
            onClick={save}
            disabled={!form.firstName.trim() || saving}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 mt-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Contact
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CRMPage() {
  const [activeTab, setActiveTab] = useState<"contacts" | "pipeline">("contacts");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddContact, setShowAddContact] = useState(false);

  const loadContacts = useCallback(async () => {
    try {
      const res = await fetch(`/api/crm/contacts${search ? `?search=${encodeURIComponent(search)}` : ""}`);
      const data = await res.json();
      if (Array.isArray(data)) setContacts(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(loadContacts, 300);
    return () => clearTimeout(t);
  }, [loadContacts]);

  const filtered = contacts.filter(c =>
    `${c.firstName} ${c.lastName || ""} ${c.company || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  const hotLeads = contacts.filter(c => c.status === "HOT" || (c.aiScore || 0) > 80).length;

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        <Header title="CRM" subtitle="Contacts, leads, deals & AI-powered insights" />
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Contacts", value: contacts.length, icon: Users, color: "text-orange-400" },
              { label: "Hot Leads", value: hotLeads, icon: Star, color: "text-red-400" },
              { label: "Pipeline Value", value: "—", icon: DollarSign, color: "text-green-400" },
              { label: "Win Rate", value: "—", icon: TrendingUp, color: "text-orange-300" },
            ].map((stat) => (
              <div key={stat.label} className="card-3d rounded-xl p-4">
                <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <div className="text-2xl font-black text-white">
                  {loading ? "—" : stat.value}
                </div>
                <div className="text-sm text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs + Actions */}
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
            <button
              onClick={() => setShowAddContact(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-all ml-auto"
            >
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
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/[0.08] text-white/50 rounded-xl text-sm hover:bg-white/10 transition-all">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>

              {loading ? (
                <div className="h-48 bg-white/3 rounded-2xl animate-pulse" />
              ) : filtered.length === 0 ? (
                <div className="card-3d rounded-2xl p-12 text-center">
                  <Users className="w-12 h-12 text-orange-400/20 mx-auto mb-3" />
                  <p className="text-white/40 text-sm mb-1">
                    {search ? "No contacts match your search" : "No contacts yet"}
                  </p>
                  {!search && (
                    <button
                      onClick={() => setShowAddContact(true)}
                      className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-all mt-3"
                    >
                      Add First Contact
                    </button>
                  )}
                </div>
              ) : (
                <div className="card-3d rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        {["Contact", "Company", "AI Score", "Status", "Actions"].map(h => (
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
                          className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-all group"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {contact.firstName.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white/90">
                                  {contact.firstName} {contact.lastName || ""}
                                </p>
                                <p className="text-xs text-white/30">{contact.email || "—"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-white/60">{contact.company || "—"}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-orange-500 rounded-full"
                                  style={{ width: `${contact.aiScore || 0}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-orange-400">{contact.aiScore || 0}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            {contact.status ? (
                              <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[contact.status] || "text-white/40 bg-white/5 border-white/10"}`}>
                                {contact.status}
                              </span>
                            ) : (
                              <span className="text-xs text-white/20">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                              {contact.email && (
                                <a
                                  href={`mailto:${contact.email}`}
                                  className="p-1.5 bg-white/5 hover:bg-orange-500/10 text-white/40 hover:text-orange-400 rounded-lg transition-all"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {contact.phone && (
                                <a
                                  href={`tel:${contact.phone}`}
                                  className="p-1.5 bg-white/5 hover:bg-orange-500/10 text-white/40 hover:text-orange-400 rounded-lg transition-all"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="card-3d rounded-2xl p-8 flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-orange-400/20 mx-auto mb-3" />
                <p className="text-white/40 text-sm">Pipeline view coming soon</p>
                <p className="text-white/20 text-xs mt-1">Visual deal stages with drag-and-drop</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAddContact && (
          <AddContactModal
            onClose={() => setShowAddContact(false)}
            onCreated={(c) => setContacts(prev => [c, ...prev])}
          />
        )}
      </AnimatePresence>
    </>
  );
}
