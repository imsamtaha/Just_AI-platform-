"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, MessageSquare, Target, PenTool, Briefcase,
  FolderOpen, BookOpen, Zap, Users, BarChart2, Check,
  ArrowRight, ArrowLeft,
} from "lucide-react";

const STEPS = [
  {
    id: "welcome",
    title: "Welcome to SAM AI",
    subtitle: "Your all-in-one AI productivity ecosystem",
  },
  {
    id: "use-cases",
    title: "What will you use SAM AI for?",
    subtitle: "Select all that apply — we'll personalize your experience",
  },
  {
    id: "model",
    title: "Choose your default AI model",
    subtitle: "You can change this at any time",
  },
  {
    id: "ready",
    title: "You're all set!",
    subtitle: "Start exploring SAM AI",
  },
];

const USE_CASES = [
  { id: "chat", label: "AI Chat & Research", icon: MessageSquare },
  { id: "planner", label: "Goals & Planning", icon: Target },
  { id: "writer", label: "Content Writing", icon: PenTool },
  { id: "consultant", label: "Business Strategy", icon: Briefcase },
  { id: "projects", label: "Project Management", icon: FolderOpen },
  { id: "knowledge", label: "Knowledge Base / RAG", icon: BookOpen },
  { id: "automations", label: "Workflow Automation", icon: Zap },
  { id: "crm", label: "CRM & Sales", icon: Users },
  { id: "analytics", label: "Analytics & Reports", icon: BarChart2 },
];

const MODELS = [
  { id: "GPT4O", label: "GPT-4o", desc: "Best overall performance", badge: "Recommended", provider: "OpenAI" },
  { id: "CLAUDE3_SONNET", label: "Claude 3 Sonnet", desc: "Excellent for writing & analysis", provider: "Anthropic" },
  { id: "GEMINI_PRO", label: "Gemini Pro", desc: "Great for coding & research", provider: "Google" },
  { id: "DEEPSEEK_CHAT", label: "DeepSeek Chat", desc: "Cost-effective & capable", provider: "DeepSeek" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("GPT4O");
  const [saving, setSaving] = useState(false);

  const toggleUseCase = (id: string) => {
    setSelectedUseCases(prev =>
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    );
  };

  const finish = async () => {
    setSaving(true);
    try {
      await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingComplete: true }),
      });
    } catch {}
    router.push("/dashboard");
  };

  const canNext = step !== 1 || selectedUseCases.length > 0;

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex-1 flex items-center gap-2">
              <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-orange-500" : "bg-white/10"}`} />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {/* Step header */}
            <div className="text-center mb-8">
              {step === 0 && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center mx-auto mb-6 glow-orange"
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>
              )}
              <h1 className="text-3xl font-bold text-white mb-2">{STEPS[step].title}</h1>
              <p className="text-white/40">{STEPS[step].subtitle}</p>
            </div>

            {/* Step content */}
            {step === 0 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { icon: MessageSquare, label: "10+ AI Models" },
                  { icon: Zap, label: "Smart Automations" },
                  { icon: BarChart2, label: "Deep Analytics" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="card-3d rounded-2xl p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6 text-orange-400" />
                    </div>
                    <p className="text-sm font-medium text-white/70">{label}</p>
                  </div>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="grid grid-cols-3 gap-3 mb-8">
                {USE_CASES.map(({ id, label, icon: Icon }) => {
                  const selected = selectedUseCases.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() => toggleUseCase(id)}
                      className={`relative p-4 rounded-xl border text-left transition-all ${
                        selected
                          ? "bg-orange-500/10 border-orange-500/40 shadow-lg shadow-orange-500/10"
                          : "bg-white/3 border-white/10 hover:border-white/20 hover:bg-white/5"
                      }`}
                    >
                      {selected && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${selected ? "bg-orange-500/20" : "bg-white/5"}`}>
                        <Icon className={`w-4 h-4 ${selected ? "text-orange-400" : "text-white/40"}`} />
                      </div>
                      <p className={`text-xs font-medium leading-tight ${selected ? "text-white/90" : "text-white/50"}`}>
                        {label}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3 mb-8">
                {MODELS.map(m => {
                  const selected = selectedModel === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedModel(m.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                        selected
                          ? "bg-orange-500/10 border-orange-500/40"
                          : "bg-white/3 border-white/10 hover:border-white/20 hover:bg-white/5"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${selected ? "bg-orange-500/20" : "bg-white/5"}`}>
                        <Sparkles className={`w-5 h-5 ${selected ? "text-orange-400" : "text-white/30"}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-semibold ${selected ? "text-white" : "text-white/70"}`}>{m.label}</p>
                          {m.badge && (
                            <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                              {m.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/30 mt-0.5">{m.desc} · {m.provider}</p>
                      </div>
                      {selected && (
                        <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {step === 3 && (
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/30"
                >
                  <Check className="w-10 h-10 text-white" />
                </motion.div>
                <p className="text-white/50 mb-6 max-w-sm mx-auto">
                  Your workspace is ready. Explore all 10 AI-powered modules to supercharge your productivity.
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-left">
                  {[
                    "Start a chat with AI Assistant",
                    "Create your first goal in Planner",
                    "Generate content with AI Writer",
                    "Upload docs to Knowledge Base",
                  ].map(tip => (
                    <div key={tip} className="flex items-start gap-2 card-3d rounded-lg p-3">
                      <ArrowRight className="w-3.5 h-3.5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-white/50">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(s => s - 1)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  step === 0 ? "invisible" : "text-white/40 hover:text-white/70 hover:bg-white/5"
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canNext}
                  className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-30 text-white rounded-xl text-sm font-medium transition-all"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={finish}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all"
                >
                  {saving ? "Loading..." : "Go to Dashboard"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
