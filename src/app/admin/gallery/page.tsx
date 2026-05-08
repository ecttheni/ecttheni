"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash, Loader2, Image as ImageIcon, Grid, List, Upload, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { compressImage } from "@/lib/compress";

async function fetchGallery() {
  const res = await fetch("/api/gallery?grouped=true");
  if (!res.ok) return { groups: [] };
  return res.json();
}

async function fetchEvents() {
  const res = await fetch("/api/gallery/events");
  if (!res.ok) return [];
  return res.json();
}

export default function AdminGallery() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [uploadResults, setUploadResults] = useState<{ file: string; success: boolean; error?: string }[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [googleAlbumUrl, setGoogleAlbumUrl] = useState("");
  const [existingCaptions, setExistingCaptions] = useState<string[]>([]);
  const [eventId, setEventId] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([loadGallery(), loadEvents()]);
  }, []);

  async function loadGallery() {
    setLoading(true);
    const data = await fetchGallery();
    const g = Array.isArray(data.groups) ? data.groups : [];
    setGroups(g);
    setExistingCaptions(g.filter((grp: any) => grp.type === "caption").map((grp: any) => grp.title));
    setCollapsedGroups(new Set(g.filter((grp: any) => grp.type === "caption").map((grp: any) => grp.id)));
    setLoading(false);
  }

  async function loadEvents() {
    const data = await fetchEvents();
    setEvents(data);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const valid: File[] = [];
    const results: { file: string; success: boolean; error?: string }[] = [];

    for (const file of files) {
      if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
        results.push({ file: file.name, success: false, error: " is not a supported image type" });
        continue;
      }
      try {
        const compressed = await compressImage(file);
        valid.push(compressed);
        if (compressed !== file) {
          results.push({ file: `${file.name} (compressed)`, success: true });
        }
      } catch {
        results.push({ file: file.name, success: false, error: " compression failed" });
      }
    }

    setSelectedFiles(valid);
    setUploadResults(results);
  }

  async function handleUpload() {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setUploadResults([]);

    const results: { file: string; success: boolean; error?: string }[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      setUploadProgress({ current: i + 1, total: selectedFiles.length });

      const fd = new FormData();
      fd.append("file", file);
      if (caption.trim()) fd.append("caption", caption.trim());
      if (googleAlbumUrl.trim()) fd.append("googleAlbumUrl", googleAlbumUrl.trim());
      if (eventId) fd.append("eventId", eventId);

      try {
        const res = await fetch("/api/gallery", { method: "POST", body: fd });
        if (res.ok) {
          results.push({ file: file.name, success: true });
        } else {
          const data = await res.json();
          results.push({ file: file.name, success: false, error: data.error || "Upload failed" });
        }
      } catch {
        results.push({ file: file.name, success: false, error: "Network error" });
      }
    }

    setUploadResults(results);
    setUploading(false);
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    loadGallery();

    if (results.every((r) => r.success)) {
      setTimeout(() => {
        setShowAddForm(false);
        setCaption("");
        setGoogleAlbumUrl("");
        setEventId("");
        setUploadResults([]);
      }, 1500);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this image from the gallery?")) return;
    await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
    loadGallery();
  }

  function toggleGroup(id: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const groupBadge = (type: string) => {
    switch (type) {
      case "event": return "bg-brand-blue/10 text-brand-blue";
      case "caption": return "bg-purple-50 text-purple-600";
      default: return "bg-gray-100 text-muted-foreground";
    }
  };

  const groupLabel = (type: string) => {
    switch (type) {
      case "event": return "Event";
      case "caption": return "Caption";
      default: return "Misc";
    }
  };

  const allItems = groups.flatMap((g: any) =>
    (g.photos || []).map((p: any) => ({ ...p, _groupTitle: g.title, _groupType: g.type }))
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-dark">Gallery Management</h1>
          <p className="text-muted-foreground mt-1">Manage the public photo gallery — grouped by event or caption.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-white border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-3 transition-colors ${viewMode === "grid" ? "bg-brand-blue text-white" : "text-muted-foreground hover:bg-gray-50"}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-3 transition-colors ${viewMode === "list" ? "bg-brand-blue text-white" : "text-muted-foreground hover:bg-gray-50"}`}
            >
              <List size={18} />
            </button>
          </div>
          <Button onClick={() => setShowAddForm(true)} leftIcon={<Plus size={20} />}>
            Add Photo
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-brand-blue" size={40} />
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-dashed border-border p-20 text-center space-y-4">
          <ImageIcon size={48} className="text-muted-foreground mx-auto" />
          <p className="text-muted-foreground font-medium">No photos in the gallery yet.</p>
          <Button onClick={() => setShowAddForm(true)} leftIcon={<Plus size={18} />} variant="outline">
            Add First Photo
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="space-y-10">
          {groups.map((group: any) => {
            const isCollapsed = collapsedGroups.has(group.id);
            return (
              <div key={group.id}>
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="flex items-center space-x-3 mb-4 group"
                >
                  <span className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${groupBadge(group.type)}`}>
                    <FolderOpen size={14} />
                    <span>{groupLabel(group.type)}</span>
                  </span>
                  <h3 className="text-lg font-bold text-brand-dark">{group.title}</h3>
                  <span className="text-xs text-muted-foreground">({group.photos.length})</span>
                  <span className="text-muted-foreground transition-transform duration-200" style={{ transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)" }}>
                    ▼
                  </span>
                </button>
                {!isCollapsed && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {group.photos.map((item: any) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group rounded-2xl overflow-hidden aspect-square bg-gray-100 border border-border"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.caption || "Gallery image"}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x400/e2e8f0/94a3b8?text=Image"; }}
                        />
                        <div className="absolute inset-0 bg-brand-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-2 p-4">
                          {item.caption && (
                            <p className="text-white text-xs text-center font-medium leading-snug">{item.caption}</p>
                          )}
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-border overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="px-8 py-5 text-xs font-bold uppercase text-muted-foreground tracking-wider">Preview</th>
                <th className="px-8 py-5 text-xs font-bold uppercase text-muted-foreground tracking-wider">Image URL</th>
                <th className="px-8 py-5 text-xs font-bold uppercase text-muted-foreground tracking-wider">Caption</th>
                <th className="px-8 py-5 text-xs font-bold uppercase text-muted-foreground tracking-wider">Group</th>
                <th className="px-8 py-5 text-xs font-bold uppercase text-muted-foreground tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allItems.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-4">
                    <img
                      src={item.imageUrl}
                      alt={item.caption || ""}
                      className="w-16 h-16 object-cover rounded-xl border border-border"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/64x64/e2e8f0/94a3b8?text=Img"; }}
                    />
                  </td>
                  <td className="px-8 py-4 max-w-xs">
                    <p className="text-xs text-muted-foreground truncate">{item.imageUrl}</p>
                  </td>
                  <td className="px-8 py-4 text-sm font-medium text-brand-dark">{item.caption || "\u2014"}</td>
                  <td className="px-8 py-4">
                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${groupBadge(item._groupType)}`}>
                      <span>{item._groupTitle}</span>
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-all">
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Photo Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!uploading) setShowAddForm(false);
              }}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-10"
            >
              <h2 className="text-2xl font-extrabold text-brand-dark mb-2">Add Photos</h2>
              <p className="text-muted-foreground text-sm mb-8">
                Select images from your computer to upload. Each photo must be under <strong>1 MB</strong>.
              </p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Choose Images</label>
                  <div
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-brand-blue/50 hover:bg-brand-blue/5 transition-all"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={uploading}
                    />
                    <Upload size={36} className="mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">
                      {selectedFiles.length > 0
                        ? `${selectedFiles.length} file(s) selected`
                        : "Click to select photos"}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">JPG, PNG, WebP, GIF &middot; Max 1 MB each</p>
                  </div>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-3 max-h-32 overflow-y-auto space-y-1">
                    {selectedFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="truncate pr-2">{f.name}</span>
                        <span>{(f.size / 1024).toFixed(1)} KB</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Linked Event (Optional)</label>
                  <select
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark outline-none focus:border-brand-blue transition-all text-sm"
                    disabled={uploading}
                  >
                    <option value="">No event (grouped by caption instead)</option>
                    {events.map((ev: any) => (
                      <option key={ev.id} value={ev.id}>{ev.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Caption (Optional &mdash; applies to all)</label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="e.g. Annual General Meeting 2025"
                    className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark outline-none focus:border-brand-blue transition-all text-sm"
                    disabled={uploading}
                  />
                </div>

                {existingCaptions.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Or add to existing caption</label>
                    <select
                      value=""
                      onChange={(e) => { if (e.target.value) setCaption(e.target.value); }}
                      className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark outline-none focus:border-brand-blue transition-all text-sm"
                      disabled={uploading}
                    >
                      <option value="">-- Select existing caption --</option>
                      {existingCaptions.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Google Album Link (Optional)</label>
                  <input
                    type="url"
                    value={googleAlbumUrl}
                    onChange={(e) => setGoogleAlbumUrl(e.target.value)}
                    placeholder="https://photos.google.com/..."
                    className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark outline-none focus:border-brand-blue transition-all text-sm"
                    disabled={uploading}
                  />
                  <p className="text-[10px] text-muted-foreground">When provided, a &ldquo;View More Photos&rdquo; button will appear on the gallery detail page.</p>
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Uploading...</span>
                      <span>{uploadProgress.current} of {uploadProgress.total}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                        className="h-full bg-brand-blue rounded-full"
                      />
                    </div>
                  </div>
                )}

                {uploadResults.length > 0 && (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {uploadResults.map((r, i) => (
                      <div
                        key={i}
                        className={`flex items-center space-x-2 text-xs px-3 py-1.5 rounded-lg ${
                          r.success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                        }`}
                      >
                        <span className="truncate">{r.file}</span>
                        <span>{r.success ? "\u2713" : r.error}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-end space-x-4 pt-4">
                  <Button variant="ghost" type="button" onClick={() => {
                    if (!uploading) {
                      setShowAddForm(false);
                      setCaption("");
                      setGoogleAlbumUrl("");
                      setEventId("");
                      setSelectedFiles([]);
                      setUploadResults([]);
                    }
                  }} disabled={uploading}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    isLoading={uploading}
                    disabled={selectedFiles.length === 0 || uploading}
                    leftIcon={<Upload size={16} />}
                  >
                    {uploading ? "Uploading..." : `Upload ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}`}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
