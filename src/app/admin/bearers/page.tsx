"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash, Loader2, Shield, ArrowUpDown, Save, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { getBearers, createBearer, updateBearer, deleteBearer } from "@/lib/actions/bearers";

export default function AdminBearers() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [bearers, setBearers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBearers();
  }, []);

  async function fetchBearers() {
    setLoading(true);
    const result = await getBearers();
    if (result.success) {
      setBearers(result.data || []);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const result = editingId 
      ? await updateBearer(editingId, formData)
      : await createBearer(formData);
    
    if (result.success) {
      setShowAddForm(false);
      setEditingId(null);
      fetchBearers();
    } else if ("error" in result) {
      alert(result.error);
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    const result = await deleteBearer(id);
    if (result.success) fetchBearers();
    else if ("error" in result) alert(result.error);
  }

  const startEdit = (bearer: any) => {
    setEditingId(bearer.id);
    setShowAddForm(true);
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-dark">Office Bearers</h1>
          <p className="text-muted-foreground mt-1">Manage center and state level office bearers.</p>
        </div>
        <Button 
          onClick={() => {
            setEditingId(null);
            setShowAddForm(true);
          }}
          leftIcon={<Plus size={20} />}
        >
          Add New Bearer
        </Button>
      </header>

      <div className="bg-white rounded-[2rem] border border-border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-border">
            <tr>
              <th className="px-8 py-5 text-xs font-bold uppercase text-muted-foreground tracking-wider">Order</th>
              <th className="px-8 py-5 text-xs font-bold uppercase text-muted-foreground tracking-wider">Name</th>
              <th className="px-8 py-5 text-xs font-bold uppercase text-muted-foreground tracking-wider">Designation</th>
              <th className="px-8 py-5 text-xs font-bold uppercase text-muted-foreground tracking-wider">Level</th>
              <th className="px-8 py-5 text-xs font-bold uppercase text-muted-foreground tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <Loader2 className="animate-spin text-brand-blue mx-auto" size={40} />
                </td>
              </tr>
            ) : bearers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-muted-foreground">No bearers added.</td>
              </tr>
            ) : (
              bearers.map((bearer) => (
                <tr key={bearer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-6 font-mono text-sm">{bearer.order}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      {bearer.photoUrl && (
                        <img src={bearer.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                      )}
                      <span className="font-bold text-brand-dark">{bearer.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-muted-foreground">{bearer.designation}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${bearer.isStateLevel ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                      {bearer.isStateLevel ? "State" : "Center"}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => startEdit(bearer)} className="p-2 hover:bg-brand-blue/10 rounded-lg text-brand-blue transition-all"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(bearer.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-all"><Trash size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddForm(false)} className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl p-10">
              <h2 className="text-2xl font-extrabold text-brand-dark mb-8">{editingId ? "Edit Bearer" : "Add New Bearer"}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                  <input name="name" defaultValue={editingId ? bearers.find(b => b.id === editingId)?.name : ""} required className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark outline-none focus:border-brand-blue" placeholder="Er. Name" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Designation</label>
                  <input name="designation" defaultValue={editingId ? bearers.find(b => b.id === editingId)?.designation : ""} required className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark outline-none focus:border-brand-blue" placeholder="e.g. Secretary" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Level</label>
                    <select name="isStateLevel" defaultValue={editingId ? (bearers.find(b => b.id === editingId)?.isStateLevel ? "true" : "false") : "false"} className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark outline-none focus:border-brand-blue">
                      <option value="false">Theni Center</option>
                      <option value="true">State Level</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Display Order</label>
                    <input name="order" type="number" defaultValue={editingId ? bearers.find(b => b.id === editingId)?.order : 0} className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark outline-none focus:border-brand-blue" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mobile No.</label>
                    <input name="mobile" defaultValue={editingId ? bearers.find(b => b.id === editingId)?.mobile : ""} className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark outline-none focus:border-brand-blue" placeholder="9876543210" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Company Name</label>
                    <input name="company" defaultValue={editingId ? bearers.find(b => b.id === editingId)?.company : ""} className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark outline-none focus:border-brand-blue" placeholder="Company Ltd" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Bearer Photo</label>
                  <input name="photo" type="file" accept="image/*" className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark outline-none focus:border-brand-blue" />
                  <input type="hidden" name="photoUrl" defaultValue={editingId ? bearers.find(b => b.id === editingId)?.photoUrl : ""} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Brief Info</label>
                  <textarea name="briefInfo" defaultValue={editingId ? bearers.find(b => b.id === editingId)?.briefInfo : ""} rows={2} className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark outline-none focus:border-brand-blue resize-none" placeholder="Short biography..." />
                </div>
                <div className="flex items-center justify-end space-x-4 pt-6">
                  <Button variant="ghost" onClick={() => setShowAddForm(false)} type="button">Cancel</Button>
                  <Button type="submit" isLoading={submitting}>{editingId ? "Update Bearer" : "Add Bearer"}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
