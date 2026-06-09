"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Upload, Search, Grid, List, Download, Trash2, Eye,
  Plus, X, Loader2,
} from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";
import { formatBytes, formatRelativeTime } from "@/lib/utils";
import toast from "react-hot-toast";

interface Document {
  id: string;
  name: string;
  category?: string;
  fileSize?: number;
  mimeType?: string;
  fileUrl?: string;
  tags: string[];
  isPublic: boolean;
  updatedAt: string;
}

const CATEGORIES = ["All", "Marketing", "Product", "Finance", "HR", "Sales", "Technical", "Other"];

const typeFromMime = (mimeType?: string, name?: string): string => {
  if (!mimeType && !name) return "FILE";
  const ext = name?.split(".").pop()?.toUpperCase();
  if (mimeType?.includes("pdf") || ext === "PDF") return "PDF";
  if (mimeType?.includes("presentation") || ext === "PPTX") return "PPT";
  if (mimeType?.includes("wordprocessing") || ext === "DOCX") return "DOCX";
  if (mimeType?.includes("text/plain") || ext === "TXT") return "TXT";
  if (mimeType?.includes("spreadsheet") || ext === "XLSX") return "XLSX";
  if (mimeType?.includes("image") || ["PNG", "JPG", "JPEG"].includes(ext || "")) return "IMG";
  return ext || "FILE";
};

const typeColors: Record<string, string> = {
  PDF: "text-red-400 bg-red-500/10",
  PPT: "text-orange-400 bg-orange-500/10",
  DOCX: "text-blue-400 bg-blue-500/10",
  TXT: "text-gray-400 bg-gray-500/10",
  XLSX: "text-green-400 bg-green-500/10",
  IMG: "text-purple-400 bg-purple-500/10",
  FILE: "text-white/40 bg-white/5",
};

export default function DocumentsPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  const loadDocuments = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (category !== "All") params.set("category", category);
      if (search) params.set("search", search);
      const res = await fetch(`/api/documents?${params}`);
      const data = await res.json();
      if (Array.isArray(data)) setDocuments(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    const t = setTimeout(loadDocuments, 300);
    return () => clearTimeout(t);
  }, [loadDocuments]);

  const deleteDoc = async (id: string) => {
    try {
      await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
      setDocuments(prev => prev.filter(d => d.id !== id));
      toast.success("Document deleted");
    } catch {
      toast.error("Failed to delete document");
    }
  };

  const handleUploadComplete = async (files: { name: string; url: string; size: number }[]) => {
    for (const file of files) {
      try {
        const res = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            fileUrl: file.url,
            fileSize: file.size,
            category: category !== "All" ? category : "Other",
          }),
        });
        const data = await res.json();
        if (data.id) setDocuments(prev => [data, ...prev]);
      } catch {}
    }
    toast.success(`${files.length} file(s) uploaded!`);
    setShowUpload(false);
  };

  const filtered = documents;
  const totalSize = documents.reduce((s, d) => s + (d.fileSize || 0), 0);

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
              onChange={e => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/40"
            />
          </div>
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl">
            {([Grid, List] as const).map((Icon, i) => (
              <button
                key={i}
                onClick={() => setView(i === 0 ? "grid" : "list")}
                className={`p-2 rounded-lg transition-all ${(i === 0 ? "grid" : "list") === view ? "bg-orange-500 text-white" : "text-white/40 hover:text-white/70"}`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-all"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                category === cat
                  ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
                  : "bg-white/3 text-white/40 border border-white/5 hover:border-white/10 hover:text-white/60"
              }`}
            >
              {cat}
            </button>
          ))}
          {totalSize > 0 && (
            <span className="text-xs text-white/20 ml-auto">{formatBytes(totalSize)} used</span>
          )}
        </div>

        {/* Documents */}
        {loading ? (
          <div className={view === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-2"}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`bg-white/3 rounded-xl animate-pulse ${view === "grid" ? "h-40" : "h-16"}`} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card-3d rounded-2xl p-12 text-center">
            <FileText className="w-12 h-12 text-orange-400/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm mb-1">No documents {search ? "match your search" : "yet"}</p>
            {!search && (
              <button
                onClick={() => setShowUpload(true)}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-all mt-3"
              >
                Upload First Document
              </button>
            )}
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {filtered.map((doc, i) => {
                const type = typeFromMime(doc.mimeType, doc.name);
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="card-3d rounded-2xl p-4 group hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-3 ${typeColors[type] || "bg-white/5 text-white/40"}`}>
                      <FileText className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-white/80 truncate mb-1">{doc.name}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${typeColors[type] || "text-white/30"}`}>{type}</span>
                      {doc.fileSize && <span className="text-xs text-white/30">{formatBytes(doc.fileSize)}</span>}
                    </div>
                    <p className="text-xs text-white/20">{formatRelativeTime(doc.updatedAt)}</p>
                    <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-all">
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-white/5 hover:bg-orange-500/10 text-white/40 hover:text-orange-400 rounded-lg transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => deleteDoc(doc.id)}
                        className="p-1.5 bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="card-3d rounded-2xl overflow-hidden">
            {filtered.map((doc, i) => {
              const type = typeFromMime(doc.mimeType, doc.name);
              return (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0 hover:bg-white/3 transition-all group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColors[type] || "bg-white/5 text-white/40"}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/80 truncate">{doc.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {doc.category && <span className="text-xs text-white/30">{doc.category}</span>}
                      {doc.fileSize && <span className="text-xs text-white/30">{formatBytes(doc.fileSize)}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-white/20 flex-shrink-0">{formatRelativeTime(doc.updatedAt)}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    {doc.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-white/5 hover:bg-orange-500/10 text-white/40 hover:text-orange-400 rounded-lg transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => deleteDoc(doc.id)}
                      className="p-1.5 bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-[#0D0D0D] border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">Upload Documents</h2>
                <button onClick={() => setShowUpload(false)} className="text-white/30 hover:text-white/70 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <UploadButton
                endpoint="documentUploader"
                onClientUploadComplete={handleUploadComplete}
                onUploadError={(error) => { toast.error(`Upload failed: ${error.message}`); }}
                appearance={{
                  button: "w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-4 py-3 text-sm font-medium transition-all ut-ready:bg-orange-500 ut-uploading:cursor-not-allowed",
                  container: "w-full",
                }}
              />
              <p className="text-xs text-white/20 text-center mt-3">
                Supports PDF, DOCX, PPTX, TXT — up to 32MB per file
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
