"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Bot, Brain, Zap, Target, Users, Database, BarChart3, Workflow, BookOpen, FileText, CheckCircle, Star } from "lucide-react";

const features = [
  { icon: Bot, title: "AI Assistant", desc: "GPT-4, Claude, Gemini — multi-model chat with memory", color: "from-orange-500 to-orange-600" },
  { icon: Target, title: "AI Planner", desc: "Turn goals into AI-generated actionable plans", color: "from-orange-600 to-red-600" },
  { icon: FileText, title: "AI Writer", desc: "Blogs, emails, scripts, marketing — all types of content", color: "from-orange-400 to-orange-500" },
  { icon: Brain, title: "Business Consultant", desc: "SWOT, market analysis, revenue planning", color: "from-orange-500 to-amber-500" },
  { icon: Workflow, title: "AI Automations", desc: "Visual workflow builder — Zapier meets AI", color: "from-orange-600 to-orange-700" },
  { icon: BookOpen, title: "Knowledge Base", desc: "Upload PDFs, websites, videos — AI-powered RAG search", color: "from-orange-400 to-orange-600" },
  { icon: Users, title: "CRM + Leads", desc: "AI lead scoring, pipelines, follow-up suggestions", color: "from-orange-500 to-red-500" },
  { icon: BarChart3, title: "Analytics", desc: "Productivity scores, AI usage, revenue metrics", color: "from-orange-600 to-orange-500" },
  { icon: Database, title: "Project Manager", desc: "Kanban, sprints, AI task creation and prioritization", color: "from-amber-500 to-orange-500" },
  { icon: Zap, title: "Document Center", desc: "AI search, version control, secure sharing", color: "from-orange-500 to-orange-400" },
];

const plans = [
  { name: "Starter", price: "Free", desc: "Get started with AI", features: ["10 AI chats/day", "Basic writer", "5 planner tasks", "1GB storage"], cta: "Start Free", highlight: false },
  { name: "Pro", price: "$29", period: "/month", desc: "For professionals", features: ["Unlimited AI chats", "All AI modules", "Automations", "Knowledge Base", "10GB storage", "Priority support"], cta: "Start Pro", highlight: true },
  { name: "Business", price: "$99", period: "/month", desc: "For teams", features: ["Everything in Pro", "Team collaboration", "CRM + pipelines", "Admin panel", "100GB storage", "Custom AI prompts", "API access"], cta: "Start Business", highlight: false },
];

const stats = [
  { value: "10+", label: "AI Modules" },
  { value: "4", label: "AI Models" },
  { value: "99.9%", label: "Uptime" },
  { value: "50K+", label: "Users" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-50 border-b border-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center glow-orange-sm">
              <span className="text-white font-black text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-gradient">SAM AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#features" className="hover:text-orange-400 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-orange-400 transition-colors">Pricing</a>
            <a href="#" className="hover:text-orange-400 transition-colors">Docs</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link href="/sign-up" className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-all hover:shadow-orange-sm font-medium">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 glass-orange px-4 py-2 rounded-full text-orange-400 text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              Powered by GPT-4, Claude 3, Gemini & DeepSeek
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black mb-6 leading-[1.05] tracking-tight"
          >
            Your{" "}
            <span className="text-gradient">AI-Powered</span>
            <br />
            Productivity Ecosystem
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            SAM AI combines ChatGPT, Notion AI, ClickUp, Jasper, Zapier, CRM, and Business
            Consulting into one premium platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/sign-up"
              className="group flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all glow-orange hover:scale-105"
            >
              Start Building Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/sign-in"
              className="flex items-center gap-2 glass px-8 py-4 rounded-xl font-semibold text-lg text-white/70 hover:text-white transition-all"
            >
              Sign In
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-2xl mx-auto"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black text-gradient">{stat.value}</div>
                <div className="text-sm text-white/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative rounded-2xl overflow-hidden card-3d p-1"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent" />
            <div className="bg-[#0D0D0D] rounded-xl overflow-hidden">
              {/* Mock browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 mx-4 bg-white/5 rounded-md px-3 py-1 text-xs text-white/30 text-center">
                  app.samai.com/dashboard
                </div>
              </div>
              {/* Mock dashboard */}
              <div className="p-6 grid grid-cols-12 gap-4 min-h-[400px]">
                {/* Sidebar */}
                <div className="col-span-2 space-y-2">
                  {["Dashboard", "Assistant", "Planner", "Writer", "Projects", "CRM"].map((item) => (
                    <div key={item} className={`px-3 py-2 rounded-lg text-xs ${item === "Dashboard" ? "bg-orange-500/20 text-orange-400" : "text-white/30"}`}>
                      {item}
                    </div>
                  ))}
                </div>
                {/* Main content */}
                <div className="col-span-10 space-y-4">
                  <div className="glass-orange rounded-xl p-4">
                    <div className="text-xs text-orange-400 mb-2">Ask SAM anything...</div>
                    <div className="flex gap-2">
                      {["Summarize", "Plan", "Write", "Analyze"].map((btn) => (
                        <div key={btn} className="bg-orange-500/20 text-orange-400 text-xs px-3 py-1.5 rounded-lg">{btn}</div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: "Tasks", value: "12", sub: "3 due today" },
                      { label: "Focus", value: "4.2h", sub: "Today" },
                      { label: "Projects", value: "5", sub: "Active" },
                      { label: "AI Usage", value: "86%", sub: "Plan usage" },
                    ].map((card) => (
                      <div key={card.label} className="card-3d rounded-xl p-3">
                        <div className="text-xs text-white/40">{card.label}</div>
                        <div className="text-2xl font-bold text-white mt-1">{card.value}</div>
                        <div className="text-xs text-orange-400 mt-0.5">{card.sub}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="card-3d rounded-xl p-4 space-y-2">
                      <div className="text-xs text-white/50 font-medium">Recent Chats</div>
                      {["Market analysis for Q4", "Write product description", "Business roadmap"].map(c => (
                        <div key={c} className="text-xs text-white/30 py-1 border-b border-white/5">{c}</div>
                      ))}
                    </div>
                    <div className="card-3d rounded-xl p-4 space-y-2">
                      <div className="text-xs text-white/50 font-medium">Active Goals</div>
                      {["Launch MVP", "Grow to 1000 users", "Revenue: $10K MRR"].map(g => (
                        <div key={g} className="flex items-center gap-2 text-xs text-white/30 py-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500/60" />
                          {g}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Everything You Need,{" "}
              <span className="text-gradient">Powered by AI</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              10 powerful modules working together seamlessly
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                viewport={{ once: true }}
                className="card-3d rounded-2xl p-6 group hover:scale-105 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:shadow-orange transition-all`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Simple, <span className="text-gradient">Transparent</span> Pricing
            </h2>
            <p className="text-white/50 text-lg">Start free. Scale as you grow.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`relative rounded-2xl p-8 ${plan.highlight ? "card-3d orange-border-glow" : "card-3d"}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-white/40 text-sm">{plan.desc}</p>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-black text-white">{plan.price}</span>
                  {plan.period && <span className="text-white/40">{plan.period}</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                      <CheckCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  className={`block text-center py-3 rounded-xl font-semibold transition-all ${
                    plan.highlight
                      ? "bg-orange-500 hover:bg-orange-600 text-white glow-orange-sm"
                      : "glass hover:bg-white/5 text-white"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-white/30 text-sm mt-8">
            Enterprise plans available. Contact us for custom pricing.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card-3d rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-orange-glow" />
            <div className="relative">
              <div className="flex items-center justify-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-orange-500 fill-orange-500" />
                ))}
              </div>
              <h2 className="text-4xl font-black mb-4">
                Start Building with <span className="text-gradient">SAM AI</span> Today
              </h2>
              <p className="text-white/50 mb-8">
                Join thousands of professionals using SAM AI to work smarter and achieve more.
              </p>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all glow-orange hover:scale-105"
              >
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
                <span className="text-white font-black text-xs">S</span>
              </div>
              <span className="font-bold text-gradient">SAM AI</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/40">
              <a href="#" className="hover:text-white/70 transition-colors">Privacy</a>
              <a href="#" className="hover:text-white/70 transition-colors">Terms</a>
              <a href="#" className="hover:text-white/70 transition-colors">Contact</a>
            </div>
            <p className="text-white/20 text-sm">
              © 2024 SAM AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
