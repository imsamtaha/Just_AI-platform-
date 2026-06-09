"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Upload, Search, FileText, Globe, Youtube, Sparkles, X, Loader2, Plus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { UploadDropzone } from "@/lib/uploadthing";
import toast from "react-hot-toast";
import { formatRelativeTime, formatBytes } from "@/lib/utils";

interface KnowledgeItem {
  id: string;
  title: string;
  type: string;
  sourceUrl?: string;
  fileSize?: number;
  chunkCount: number;
  createdAt: string;
}

const typeIcons: Record<string, string> = { PDF: "📄", DOCX: "📝", PPTX: "📊", WEBSITE: "🌐", VIDEO: "🎬", TEXT: "📃" };
const typeColors: Record<string, string> = {
  PDF: "text-red-400 bg-red-500/10",
  DOCX: "text-blue-400 bg-blue-500/10",
  PPTX: "text-orange-400 bg-orange-500/10",
  WEBSITE: "text-green-400 bg-green-500/10",
  VIDEO: "text-purple-400 bg-purple-500/10",
  TEXT: "text-gray-400 bg-gray-500/10",
};

export default function KnowledgePage() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [searching, setSearching] = useState(false);
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [addingUrl, setAddingUrl] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      const res = await fetch("/api/knowledge");
      const data = await res.json();
      if (data.items) setItems(data.items);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setAnswer("");
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setAnswer(data.answer || "No relevant information found.");
    } catch {
      setAnswer("Could not search knowledge base. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const addUrl = async () => {
    if (!urlInput.trim()) return;
    setAddingUrl(true);
    try {
      const res = await fetch("/api/knowledge", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput, type: "WEBSITE" }),
      });
      const data = await res.json();
      if (data.item) {
        setItems(prev => [data.item, ...prev]);
        toast.success("URL added to knowledge base");
        setUrlInput("");
        setShowUrlInput(false);
      }
    } catch {
      toast.error("Failed to add URL");
    } finally {
      setAddingUrl(false);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await fetch(`/api/knowledge?id=${id}`, { method: "DELETE" });
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success("Removed from knowledge base");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const totalChunks = items.reduce((sum, i) => sum + i.chunkCount, 0);
  const totalSize = items.reduce((sum, i) => sum + (i.fileSize || 0), 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Knowledge Base" subtitle="AI-powered RAG search across all your documents" />
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
        {/* Search */}
        <div className="card-3d rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
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
              className="px-5 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </div>
          <AnimatePresence>
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
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Area */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Add to Knowledge Base</h2>

            <UploadDropzone
              endpoint="documentUploader"
              onClientUploadComplete={async (files) => {
                for (const file of files) {
                  try {
                    await fetch("/api/knowledge", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        title: file.name,
                        sourceUrl: file.url,
                        type: file.name.endsWith(".pdf") ? "PDF"
                          : file.name.endsWith(".docx") ? "DOCX"
                          : file.name.endsWith(".pptx") ? "PPTX"
                          : "TEXT",
                        fileSize: file.size,
                      }),
                    });
                  } catch {}
                }
                toast.success(`${files.length} file(s) added to knowledge base`);
                loadItems();
              }}
              onUploadError={(error) => {
                toast.error(`Upload failed: ${error.message}`);
              }}
              appearance={{
                container: "border-2 border-dashed border-white/10 hover:border-orange-500/30 rounded-2xl p-6 bg-transparent transition-all ut-uploading:border-orange-500/50",
                uploadIcon: "text-orange-400/40",
                label: "text-white/40 text-sm",
                allowedContent: "text-white/20 text-xs",
                button: "bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-4 py-2 text-sm font-medium transition-all ut-ready:bg-orange-500 ut-uploading:cursor-not-allowed",
              }}
            />

            <div className="space-y-2">
              <button
                onClick={() => setShowUrlInput(v => !v)}
                className="w-full flex items-center gap-2 px-3 py-2.5 bg-white/3 hover:bg-white/5 border border-white/5 rounded-xl text-xs text-white/50 hover:text-white/70 transition-all"
              >
                <Globe className="w-3.5 h-3.5" />
                Add Website URL
              </button>

              <AnimatePresence>
                {showUrlInput && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-2 pt-1">
                      <input
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addUrl()}
                        placeholder="https://example.com/page"
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/40"
                      />
                      <button
                        onClick={addUrl}
                        disabled={addingUrl || !urlInput.trim()}
                        className="px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-lg text-xs transition-all"
                      >
                        {addingUrl ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {[
                { icon: Youtube, label: "YouTube Video" },
                { icon: FileText, label: "Plain Text" },
              ].map((source) => (
                <button
                  key={source.label}
                  className="w-full flex items-center gap-2 px-3 py-2.5 bg-white/3 hover:bg-white/5 border border-white/5 rounded-xl text-xs text-white/50 hover:text-white/70 transition-all"
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
                { label: "Documents", value: String(items.length) },
                { label: "Total Chunks", value: String(totalChunks) },
                { label: "Storage Used", value: totalSize > 0 ? formatBytes(totalSize) : "—" },
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
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
              Documents ({items.length})
            </h2>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-white/3 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="card-3d rounded-2xl p-12 text-center">
                <BookOpen className="w-12 h-12 text-orange-400/20 mx-auto mb-3" />
                <p className="text-white/40 text-sm mb-1">No documents yet</p>
                <p className="text-white/20 text-xs">Upload PDFs, docs, or add website URLs</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: i * 0.05 }}
                      className="card-3d rounded-xl p-4 flex items-center gap-4 group hover:scale-[1.01] transition-all"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${typeColors[item.type] || "bg-white/10"} flex-shrink-0`}>
                        {typeIcons[item.type] || "📄"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white/80 truncate">{item.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[item.type] || "text-white/40 bg-white/5"}`}>
                            {item.type}
                          </span>
                          {item.fileSize && <span className="text-xs text-white/30">{formatBytes(item.fileSize)}</span>}
                          <span className="text-xs text-white/30">{item.chunkCount} chunks</span>
                          <span className="text-xs text-white/20">{formatRelativeTime(item.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => { setQuery(`Tell me about ${item.title}`); }}
                          className="p-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg transition-all"
                        >
                          <Search className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-1.5 bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 rounded-lg transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
