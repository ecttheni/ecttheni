"use client";

import React, { useState, useEffect } from "react";
import { getSponsors, createSponsor, deleteSponsor, updateSponsor } from "@/lib/actions/sponsors";
import { Plus, Trash2, Edit, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminSponsors() {
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    websiteUrl: "",
    order: "0",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    const res = await getSponsors();
    if (res.success && res.data) {
      setSponsors(res.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("description", formData.description);
    fd.append("websiteUrl", formData.websiteUrl);
    fd.append("order", formData.order);
    if (logoFile) {
      fd.append("logo", logoFile);
    }

    if (editingId) {
      await updateSponsor(editingId, fd);
    } else {
      await createSponsor(fd);
    }

    setFormData({ name: "", description: "", websiteUrl: "", order: "0" });
    setLogoFile(null);
    setEditingId(null);
    await loadData();
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this sponsor?")) return;
    await deleteSponsor(id);
    await loadData();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-brand-dark">Manage Sponsors</h1>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
        <h2 className="text-xl font-bold mb-4">{editingId ? "Edit Sponsor" : "Add New Sponsor"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground">Sponsor Name</label>
              <input 
                type="text" 
                required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground">Website URL</label>
              <input 
                type="url" 
                value={formData.websiteUrl}
                onChange={e => setFormData({...formData, websiteUrl: e.target.value})}
                className="w-full px-4 py-2 border rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground">Description (Optional)</label>
            <textarea 
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 border rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground">Display Order</label>
              <input 
                type="number" 
                value={formData.order}
                onChange={e => setFormData({...formData, order: e.target.value})}
                className="w-full px-4 py-2 border rounded-xl"
              />
            </div>
<div className="space-y-2">
  <label className="text-sm font-bold text-muted-foreground">Sponsor Logo</label>
  {editingId && logoUrl ? (
    <div className="mb-2 flex items-center space-x-3">
      <img src={logoUrl} alt="Current logo" className="h-8 w-auto object-contain border rounded" />
      <span className="text-xs text-muted-foreground">Current logo</span>
    </div>
  ) : null}
  <input 
    type="file" 
    accept="image/*"
    onChange={e => setLogoFile(e.target.files?.[0] || null)}
    className="w-full px-4 py-2 border rounded-xl"
  />
</div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
{editingId && (
  <Button type="button" variant="outline" onClick={() => {
    setEditingId(null);
    setFormData({ name: "", description: "", websiteUrl: "", order: "0" });
    setLogoUrl(null);
    setLogoFile(null);
  }}>Cancel Edit</Button>
)}
            <Button type="submit" isLoading={submitting}>
              {editingId ? "Update Sponsor" : "Add Sponsor"}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-brand-blue" /></div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="text-left py-4 px-6 font-bold text-muted-foreground text-sm">Logo</th>
                <th className="text-left py-4 px-6 font-bold text-muted-foreground text-sm">Name</th>
                <th className="text-left py-4 px-6 font-bold text-muted-foreground text-sm">Order</th>
                <th className="text-right py-4 px-6 font-bold text-muted-foreground text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sponsors.map((sp) => (
                <tr key={sp.id} className="hover:bg-gray-50/50">
                  <td className="py-4 px-6">
                    {sp.logoUrl ? (
                      <img src={sp.logoUrl} alt="Logo" className="h-10 object-contain" />
                    ) : (
                      <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                        <ImageIcon className="text-gray-400" size={20} />
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6 font-semibold">{sp.name}</td>
                  <td className="py-4 px-6 text-muted-foreground">{sp.order}</td>
                  <td className="py-4 px-6 text-right space-x-2">
<button 
                       onClick={() => {
                         setEditingId(sp.id);
                         setFormData({
                           name: sp.name,
                           description: sp.description || "",
                           websiteUrl: sp.websiteUrl || "",
                           order: sp.order.toString(),
                         });
                         setLogoUrl(sp.logoUrl || null);
                         setLogoFile(null);
                       }}
                       className="p-2 text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"
                     >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(sp.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {sponsors.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No sponsors found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
