"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { PenTool, Sparkles, Copy, Download, RefreshCw, ChevronDown } from "lucide-react";

const contentTypes = [
  { id: "blog", label: "Blog Post", icon: "📝" },
  { id: "social", label: "Social Media", icon: "📱" },
  { id: "linkedin", label: "LinkedIn Post", icon: "💼" },
  { id: "email", label: "Sales Email", icon: "📧" },
  { id: "marketing", label: "Marketing Campaign", icon: "📣" },
  { id: "business-plan", label: "Business Plan", icon: "📋" },
  { id: "product", label: "Product Description", icon: "🛍️" },
  { id: "newsletter", label: "Newsletter", icon: "📰" },
  { id: "script", label: "Video Script", icon: "🎬" },
  { id: "pitch", label: "Pitch Deck Content", icon: "📊" },
];

const tones = ["Professional", "Casual", "Persuasive", "Informative", "Creative", "Formal"];
const lengths = ["Short (150 words)", "Medium (400 words)", "Long (800 words)", "Extended (1500+ words)"];

const tools = [
  { label: "Rewrite", icon: RefreshCw },
  { label: "Expand", icon: ChevronDown },
  { label: "Summarize", icon: PenTool },
  { label: "Improve Tone", icon: Sparkles },
];

export default function WriterPage() {
  const [selectedType, setSelectedType] = useState("blog");
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium (400 words)");
  const [output, setOutput] = useState("");
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedType, prompt, tone, length }),
      });
      const data = await res.json();
      setOutput(data.content || "");
    } catch {
      setOutput("Failed to generate content. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="AI Writer" subtitle="Professional content generation at scale" />

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Left: Controls */}
          <div className="space-y-5">
            {/* Content Type */}
            <div>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-3">
                Content Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {contentTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition-all ${
                      selectedType === type.id
                        ? "bg-orange-500/15 border border-orange-500/30 text-orange-400"
                        : "bg-white/3 border border-white/5 text-white/50 hover:bg-white/5 hover:text-white/70"
                    }`}
                  >
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt */}
            <div>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2">
                Your Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to write about..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/40 resize-none transition-colors"
              />
            </div>

            {/* Tone & Length */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/70 focus:outline-none focus:border-orange-500/40 appearance-none"
                >
                  {tones.map(t => <option key={t} className="bg-[#0D0D0D]">{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2">Length</label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/70 focus:outline-none focus:border-orange-500/40 appearance-none"
                >
                  {lengths.map(l => <option key={l} className="bg-[#0D0D0D]">{l}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={generate}
              disabled={!prompt.trim() || generating}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-semibold rounded-xl transition-all glow-orange-sm hover:scale-[1.02]"
            >
              <Sparkles className="w-5 h-5" />
              {generating ? "Generating..." : "Generate Content"}
            </button>
          </div>

          {/* Right: Output */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Output</label>
              {output && (
                <div className="flex items-center gap-2">
                  {tools.map((tool) => (
                    <button
                      key={tool.label}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/8 text-white/50 hover:text-white/80 rounded-lg text-xs transition-all"
                    >
                      <tool.icon className="w-3 h-3" />
                      {tool.label}
                    </button>
                  ))}
                  <button
                    onClick={() => navigator.clipboard.writeText(output)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 rounded-lg text-xs transition-all"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 relative">
              {generating ? (
                <div className="absolute inset-0 card-3d rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center mx-auto mb-3 animate-pulse">
                      <Sparkles className="w-6 h-6 text-orange-400" />
                    </div>
                    <p className="text-white/50 text-sm">Generating your content...</p>
                    <div className="flex justify-center gap-1.5 mt-3">
                      {[0, 0.2, 0.4].map(d => (
                        <div key={d} className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              ) : output ? (
                <textarea
                  value={output}
                  onChange={(e) => setOutput(e.target.value)}
                  className="w-full h-full min-h-[400px] bg-white/3 border border-white/8 rounded-2xl px-5 py-4 text-sm text-white/80 focus:outline-none focus:border-orange-500/30 resize-none scrollbar-thin leading-relaxed"
                />
              ) : (
                <div className="card-3d rounded-2xl h-full min-h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <PenTool className="w-12 h-12 text-orange-400/20 mx-auto mb-3" />
                    <p className="text-white/30 text-sm">Your generated content will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
