"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Zap, Star } from "lucide-react";

const plans = [
  {
    id: "free",
    name: "Starter",
    price: { monthly: 0, annual: 0 },
    desc: "Perfect for getting started",
    color: "border-white/10",
    badge: null,
    features: [
      { text: "10 AI chats per day", included: true },
      { text: "Basic AI writer (5/day)", included: true },
      { text: "20 planner tasks", included: true },
      { text: "5 knowledge documents", included: true },
      { text: "1GB storage", included: true },
      { text: "Automations", included: false },
      { text: "CRM access", included: false },
      { text: "Team collaboration", included: false },
      { text: "API access", included: false },
    ],
    cta: "Start Free",
    href: "/sign-up",
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: { monthly: 29, annual: 23 },
    desc: "For professionals & freelancers",
    color: "border-orange-500/40",
    badge: "Most Popular",
    features: [
      { text: "Unlimited AI chats", included: true },
      { text: "All AI models (GPT-4o, Claude, Gemini)", included: true },
      { text: "Unlimited AI writer", included: true },
      { text: "Unlimited planner tasks & goals", included: true },
      { text: "100 knowledge documents", included: true },
      { text: "10 automations", included: true },
      { text: "10GB storage", included: true },
      { text: "Priority support", included: true },
      { text: "Team collaboration", included: false },
    ],
    cta: "Start Pro",
    href: "/sign-up",
    highlight: true,
  },
  {
    id: "business",
    name: "Business",
    price: { monthly: 99, annual: 79 },
    desc: "For teams & growing businesses",
    color: "border-white/10",
    badge: null,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "25 team members", included: true },
      { text: "Full CRM + pipelines", included: true },
      { text: "50 automations", included: true },
      { text: "1000 knowledge documents", included: true },
      { text: "100GB storage", included: true },
      { text: "Custom AI system prompts", included: true },
      { text: "API access", included: true },
      { text: "Dedicated support", included: true },
    ],
    cta: "Start Business",
    href: "/sign-up",
    highlight: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: { monthly: null, annual: null },
    desc: "For large organizations",
    color: "border-white/10",
    badge: null,
    features: [
      { text: "Everything in Business", included: true },
      { text: "Unlimited team members", included: true },
      { text: "Unlimited automations", included: true },
      { text: "Unlimited storage", included: true },
      { text: "Custom AI model fine-tuning", included: true },
      { text: "SSO / SAML", included: true },
      { text: "Audit logs & compliance", included: true },
      { text: "SLA guarantee (99.99%)", included: true },
      { text: "Dedicated account manager", included: true },
    ],
    cta: "Contact Sales",
    href: "mailto:sales@samai.com",
    highlight: false,
  },
];

const faqs = [
  { q: "Can I switch plans anytime?", a: "Yes, you can upgrade or downgrade at any time. Changes take effect immediately and billing is prorated." },
  { q: "What AI models are included?", a: "Pro and Business plans include GPT-4o, Claude 3 Sonnet, Gemini 1.5 Pro, and DeepSeek Chat. GPT-4 and Claude 3 Opus are also available." },
  { q: "Is there a free trial?", a: "The Starter plan is free forever. Pro and Business plans come with a 14-day free trial — no credit card required." },
  { q: "How does the Knowledge Base work?", a: "Upload PDFs, Word docs, presentations, or paste website URLs. SAM AI processes them with RAG (Retrieval-Augmented Generation) so you can ask questions and get AI answers based on your content." },
  { q: "Can I use my own API keys?", a: "On the Business and Enterprise plans, you can bring your own OpenAI, Anthropic, or Google AI API keys to avoid usage limits." },
  { q: "What happens to my data?", a: "Your data is encrypted at rest and in transit. We never use your data to train AI models. GDPR compliant with EU data residency available on Enterprise." },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />

      {/* Nav */}
      <nav className="border-b border-white/5 backdrop-blur-xl px-6 h-16 flex items-center justify-between relative z-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
            <span className="text-white font-black text-sm">S</span>
          </div>
          <span className="text-xl font-black text-gradient">SAM AI</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2">Sign In</Link>
          <Link href="/sign-up" className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-all font-medium">Get Started</Link>
        </div>
      </nav>

      <div className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 glass-orange px-4 py-2 rounded-full text-orange-400 text-sm mb-6">
              <Zap className="w-4 h-4" />
              14-day free trial on all paid plans
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black mb-4"
          >
            Simple, <span className="text-gradient">Transparent</span> Pricing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-lg max-w-xl mx-auto mb-8"
          >
            Start free, scale as you grow. No hidden fees, no surprises.
          </motion.p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 p-1 bg-white/5 rounded-xl">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!annual ? "bg-orange-500 text-white" : "text-white/50 hover:text-white"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${annual ? "bg-orange-500 text-white" : "text-white/50 hover:text-white"}`}
            >
              Annual
              <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">-20%</span>
            </button>
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-24">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-6 card-3d border ${plan.color} ${plan.highlight ? "scale-105" : ""}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap flex items-center gap-1">
                  <Star className="w-3 h-3 fill-white" />
                  {plan.badge}
                </div>
              )}

              <div className="mb-5">
                <h2 className="text-xl font-bold text-white mb-1">{plan.name}</h2>
                <p className="text-sm text-white/40">{plan.desc}</p>
              </div>

              <div className="mb-6">
                {plan.price.monthly !== null ? (
                  <div>
                    <span className="text-4xl font-black text-white">
                      ${annual ? plan.price.annual : plan.price.monthly}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-white/40 text-sm ml-1">/month</span>
                    )}
                    {annual && plan.price.monthly > 0 && (
                      <div className="text-xs text-green-400 mt-1">Billed annually</div>
                    )}
                  </div>
                ) : (
                  <div className="text-3xl font-black text-white">Custom</div>
                )}
              </div>

              <ul className="space-y-2.5 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <CheckCircle
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${f.included ? "text-orange-500" : "text-white/15"}`}
                    />
                    <span className={f.included ? "text-white/70" : "text-white/25 line-through"}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                  plan.highlight
                    ? "bg-orange-500 hover:bg-orange-600 text-white glow-orange-sm"
                    : "bg-white/8 hover:bg-white/12 text-white/80 border border-white/10"
                }`}
              >
                {plan.cta} {plan.price.monthly !== null && <ArrowRight className="inline w-4 h-4 ml-1" />}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Feature comparison teaser */}
        <div className="card-3d rounded-2xl p-8 mb-24 text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Compare All Features</h3>
          <p className="text-white/40 mb-6">Full feature matrix available on request</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "AI Models", desc: "GPT-4o, Claude 3, Gemini, DeepSeek" },
              { label: "Modules", desc: "10 AI-powered productivity modules" },
              { label: "Integrations", desc: "Slack, Stripe, webhooks, API" },
              { label: "Security", desc: "SOC2, GDPR, encryption at rest" },
            ].map(f => (
              <div key={f.label} className="text-left p-4 bg-white/3 rounded-xl">
                <div className="text-sm font-semibold text-orange-400 mb-1">{f.label}</div>
                <div className="text-xs text-white/40">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-10">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="card-3d rounded-xl p-5"
              >
                <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
