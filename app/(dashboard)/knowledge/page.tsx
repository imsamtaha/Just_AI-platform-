"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { motion } from "framer-motion";
import { BookOpen, Upload, Search, FileText, Globe, Youtube, Sparkles, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

const knowledgeItems = [
  { id: "1", title: "Product Strategy 2024.pdf", type: "PDF", size: "2.4 MB", chunks: 45, createdAt: "2d ago" },
  { id: "2", title: "Market Research Report.docx", type: "DOCX", size: "1.8 MB", chunks: 32, createdAt: "5d ago" },
  { id: "3", title: "Competitor Analysis.pptx", type: "PPT", size: "5.1 MB", chunks: 28, createdAt: "1w ago" },
  { id: "4", title: "https://techcrunch.com/saas-trends", type: "WEBSITE", size: "—", chunks: 15, createdAt: "2d ago" },
];

const typeIcons = { PDF: "📄", DOCX: "📝", PPT: "📊", WEBSITE: "🌐", VIDEO: "🎬", TEXT: "📃" };
const typeColors: Record<string, string> = {
  PDF: "text-red-400 bg-red-500/10",
  DOCX: "text-blue-400 bg-blue-500/10",
  PPT: "text-orange-400 bg-orange-500/10",
  WEBSITE: "text-green-400 bg-green-500/10",
  VIDEO: "text-purple-400 bg-purple-500/10",
};

export default function KnowledgePage() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [searching, setSearching] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setAnswer(data.answer || "");
    } catch {
      setAnswer("Could not search knowledge base.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Knowledge Base" subtitle="AI-powered RAG search across all your documents" />
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
        {/* Search */}
        <div className="card-3d rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-semibold text-orange-400">Ask Your Knowledge Base</span>
          </div>
          <div className="flex gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="Ask anything about your documents..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/40"
            />
            <button
              onClick={search}
              disabled={!query.trim() || searching}
              className="px-5 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-all"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
          {answer && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-orange-500/5 border border-orange-500/15 rounded-xl"
            >
              <div className="flex items-start gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <span className="text-xs font-medium text-orange-400">AI Answer</span>
              </div>
              <ReactMarkdown className="prose prose-invert prose-sm max-w-none prose-p:text-white/70 prose-strong:text-white">
                {answer}
              </ReactMarkdown>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Area */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Add to Knowledge Base</h2>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                dragOver ? "border-orange-500/60 bg-orange-500/5" : "border-white/10 hover:border-orange-500/30"
              }`}
            >
              <Upload className="w-10 h-10 text-orange-400/40 mx-auto mb-3" />
              <p className="text-sm text-white/40 mb-1">Drop files here or click to upload</p>
              <p className="text-xs text-white/20">PDF, DOCX, PPT, TXT, CSV, XLSX</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Globe, label: "Website URL" },
                { icon: Youtube, label: "YouTube Video" },
                { icon: FileText, label: "Plain Text" },
              ].map((source) => (
                <button
                  key={source.label}
                  className="flex items-center gap-2 px-3 py-2.5 bg-white/3 hover:bg-white/5 border border-white/5 rounded-xl text-xs text-white/50 hover:text-white/70 transition-all"
                >
                  <source.icon className="w-3.5 h-3.5" />
                  {source.label}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="card-3d rounded-xl p-4 space-y-3">
              <h3 className="text-xs text-white/40 font-medium uppercase tracking-wider">Stats</h3>
              {[
                { label: "Documents", value: "4" },
                { label: "Total Chunks", value: "120" },
                { label: "Storage Used", value: "9.3 MB" },
                { label: "Searches", value: "28" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <span className="text-xs text-white/40">{stat.label}</span>
                  <span className="text-xs font-semibold text-white/70">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Documents List */}
          <div className="lg:col-span-2">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Documents ({knowledgeItems.length})</h2>
            <div className="space-y-3">
              {knowledgeItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="card-3d rounded-xl p-4 flex items-center gap-4 group hover:scale-[1.01] transition-all"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${typeColors[item.type] || "bg-white/10"} flex-shrink-0`}>
                    {typeIcons[item.type as keyof typeof typeIcons] || "📄"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/80 truncate">{item.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[item.type]}`}>{item.type}</span>
                      <span className="text-xs text-white/30">{item.size}</span>
                      <span className="text-xs text-white/30">{item.chunks} chunks</span>
                      <span className="text-xs text-white/20">{item.createdAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button className="p-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg text-xs transition-all">
                      <Search className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 rounded-lg text-xs transition-all">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
