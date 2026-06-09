"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Briefcase, Sparkles, Download, TrendingUp, Search, Target, DollarSign, Users } from "lucide-react";
import ReactMarkdown from "react-markdown";

const analysisTypes = [
  { id: "swot", label: "SWOT Analysis", icon: Target, desc: "Strengths, Weaknesses, Opportunities, Threats" },
  { id: "market", label: "Market Analysis", icon: TrendingUp, desc: "Market size, trends, and opportunities" },
  { id: "competitor", label: "Competitor Research", icon: Search, desc: "Competitive landscape analysis" },
  { id: "startup", label: "Startup Validation", icon: Sparkles, desc: "Validate your business idea" },
  { id: "revenue", label: "Revenue Planning", icon: DollarSign, desc: "Revenue models and forecasting" },
  { id: "sales", label: "Sales Strategy", icon: Users, desc: "Go-to-market and sales playbook" },
  { id: "roadmap", label: "Business Roadmap", icon: Briefcase, desc: "Strategic roadmap for growth" },
];

export default function ConsultantPage() {
  const [selectedType, setSelectedType] = useState("swot");
  const [businessInfo, setBusinessInfo] = useState("");
  const [output, setOutput] = useState("");
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    if (!businessInfo.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/consultant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedType, businessInfo }),
      });
      const data = await res.json();
      setOutput(data.content || "");
    } catch {
      setOutput("Failed to generate analysis. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const selectedAnalysis = analysisTypes.find(t => t.id === selectedType);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="AI Business Consultant" subtitle="AI-powered strategic business analysis" />
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Type selector */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-3">Analysis Type</label>
              <div className="space-y-2">
                {analysisTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      selectedType === type.id
                        ? "bg-orange-500/15 border border-orange-500/30 text-orange-400"
                        : "bg-white/3 border border-white/5 text-white/50 hover:bg-white/5"
                    }`}
                  >
                    <type.icon className="w-4 h-4 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium">{type.label}</div>
                      <div className="text-xs opacity-60">{type.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2">Business Information</label>
              <textarea
                value={businessInfo}
                onChange={(e) => setBusinessInfo(e.target.value)}
                placeholder={`Describe your business for ${selectedAnalysis?.label}...\n\nInclude: industry, target market, product/service, current stage, key challenges...`}
                rows={8}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/40 resize-none"
              />
            </div>

            <button
              onClick={generate}
              disabled={!businessInfo.trim() || generating}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-semibold rounded-xl transition-all"
            >
              <Sparkles className="w-5 h-5" />
              {generating ? "Analyzing..." : `Generate ${selectedAnalysis?.label}`}
            </button>
          </div>

          {/* Right: Report output */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Analysis Report</label>
              {output && (
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg text-xs hover:bg-orange-500/20 transition-all">
                  <Download className="w-3.5 h-3.5" />
                  Export PDF
                </button>
              )}
            </div>

            {generating ? (
              <div className="card-3d rounded-2xl p-8 flex items-center justify-center min-h-[500px]">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Briefcase className="w-8 h-8 text-orange-400" />
                  </div>
                  <p className="text-white/50">Analyzing your business...</p>
                  <p className="text-white/30 text-sm mt-1">Generating comprehensive {selectedAnalysis?.label}</p>
                  <div className="flex justify-center gap-1.5 mt-4">
                    {[0, 0.2, 0.4].map(d => (
                      <div key={d} className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            ) : output ? (
              <div className="card-3d rounded-2xl p-6 min-h-[500px] overflow-y-auto scrollbar-thin">
                <ReactMarkdown className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-headings:font-bold prose-h1:text-xl prose-h2:text-lg prose-h2:text-orange-400 prose-h3:text-base prose-h3:text-white/80 prose-p:text-white/70 prose-li:text-white/70 prose-strong:text-white prose-code:text-orange-400 prose-ul:space-y-1">
                  {output}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="card-3d rounded-2xl p-8 flex items-center justify-center min-h-[500px]">
                <div className="text-center">
                  <Briefcase className="w-16 h-16 text-orange-400/20 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white/30 mb-2">Ready to Consult</h3>
                  <p className="text-white/20 text-sm max-w-xs">
                    Select an analysis type, describe your business, and get professional AI-generated strategic insights.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
