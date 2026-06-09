"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { motion } from "framer-motion";
import { FileText, Upload, Search, Grid, List, Share2, Download, Trash2, Eye, Plus } from "lucide-react";

const documents = [
  { id: "1", name: "Q4 Marketing Strategy.pdf", category: "Marketing", size: "2.4 MB", type: "PDF", sharedWith: 3, updatedAt: "2h ago", version: 2 },
  { id: "2", name: "Product Roadmap 2025.pptx", category: "Product", size: "8.1 MB", type: "PPT", sharedWith: 5, updatedAt: "1d ago", version: 3 },
  { id: "3", name: "Investor Deck v4.pdf", category: "Finance", size: "3.6 MB", type: "PDF", sharedWith: 2, updatedAt: "3d ago", version: 4 },
  { id: "4", name: "Team Org Chart.docx", category: "HR", size: "0.4 MB", type: "DOCX", sharedWith: 0, updatedAt: "1w ago", version: 1 },
  { id: "5", name: "Sales Playbook 2024.pdf", category: "Sales", size: "1.9 MB", type: "PDF", sharedWith: 8, updatedAt: "2w ago", version: 5 },
  { id: "6", name: "API Documentation.md", category: "Technical", size: "0.2 MB", type: "MD", sharedWith: 12, updatedAt: "3d ago", version: 7 },
];

const categories = ["All", "Marketing", "Product", "Finance", "HR", "Sales", "Technical"];

const typeColors: Record<string, string> = {
  PDF: "text-red-400 bg-red-500/10",
  PPT: "text-orange-400 bg-orange-500/10",
  DOCX: "text-blue-400 bg-blue-500/10",
  MD: "text-green-400 bg-green-500/10",
};

export default function DocumentsPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = documents.filter(d =>
    (category === "All" || d.category === category) &&
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Document Center" subtitle="AI search, version control & secure sharing" />
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-5">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/40"
            />
          </div>
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl">
            {[Grid, List].map((Icon, i) => (
              <button
                key={i}
                onClick={() => setView(i === 0 ? "grid" : "list")}
                className={`p-2 rounded-lg transition-all ${(i === 0 ? "grid" : "list") === view ? "bg-orange-500 text-white" : "text-white/40 hover:text-white/70"}`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-all">
            <Upload className="w-4 h-4" />
            Upload
          </button>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm transition-all ${cat === category ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {view === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="card-3d rounded-2xl p-4 group cursor-pointer hover:scale-105 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-3 ${typeColors[doc.type] || "bg-white/10"}`}>
                  {doc.type === "PDF" ? "📄" : doc.type === "PPT" ? "📊" : doc.type === "DOCX" ? "📝" : "📃"}
                </div>
                <h3 className="text-sm font-medium text-white/80 mb-1 line-clamp-2">{doc.name}</h3>
                <div className="flex items-center justify-between text-xs text-white/30">
                  <span>{doc.size}</span>
                  <span>v{doc.version}</span>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-full ${typeColors[doc.type]}`}>{doc.type}</span>
                  <span className="text-white/25">{doc.updatedAt}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-3 opacity-0 group-hover:opacity-100 transition-all">
                  <button className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg text-xs transition-all">
                    <Eye className="w-3 h-3" />
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-white/5 hover:bg-white/10 text-white/50 rounded-lg text-xs transition-all">
                    <Share2 className="w-3 h-3" />
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-white/5 hover:bg-white/10 text-white/50 rounded-lg text-xs transition-all">
                    <Download className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
            <div className="border-2 border-dashed border-white/8 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500/30 transition-all group min-h-[180px]">
              <Plus className="w-8 h-8 text-white/20 group-hover:text-orange-400 mb-2 transition-colors" />
              <p className="text-xs text-white/25 group-hover:text-white/50 transition-colors">Upload Document</p>
            </div>
          </div>
        ) : (
          <div className="card-3d rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Name", "Category", "Size", "Version", "Shared", "Updated", "Actions"].map(h => (
                    <th key={h} className="text-left text-xs text-white/30 uppercase tracking-wider px-5 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc, i) => (
                  <tr key={doc.id} className="border-b border-white/5 hover:bg-white/3 transition-all group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${typeColors[doc.type]}`}>
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-sm text-white/80">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-white/40">{doc.category}</td>
                    <td className="px-5 py-4 text-sm text-white/40">{doc.size}</td>
                    <td className="px-5 py-4 text-sm text-white/40">v{doc.version}</td>
                    <td className="px-5 py-4 text-sm text-white/40">{doc.sharedWith} users</td>
                    <td className="px-5 py-4 text-sm text-white/30">{doc.updatedAt}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                        <button className="p-1.5 bg-white/5 hover:bg-orange-500/10 text-white/40 hover:text-orange-400 rounded-lg transition-all"><Eye className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/80 rounded-lg transition-all"><Download className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
