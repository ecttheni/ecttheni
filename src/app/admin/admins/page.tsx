"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Plus, Trash, Edit, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from "@/lib/actions/admins";

export default function AdminAdmins() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    setLoading(true);
    const result = await getAdmins();
    if (result.success) {
      setAdmins((result as any).data || []);
    }
    setLoading(false);
  }

  function openAdd() {
    setEditingId(null);
    setShowPassword(false);
    setMessage(null);
    setShowModal(true);
  }

  function openEdit(admin: any) {
    setEditingId(admin.id);
    setShowPassword(false);
    setMessage(null);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = editingId
      ? await updateAdmin(editingId, formData)
      : await createAdmin(formData);

    if (result.success) {
      setMessage({ type: "success", text: editingId ? "Admin updated successfully" : "Admin created successfully" });
      setShowModal(false);
      fetchAdmins();
    } else {
      setMessage({ type: "error", text: (result as any).error || "Operation failed" });
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this admin?")) return;
    const result = await deleteAdmin(id);
    if (result.success) {
      fetchAdmins();
    } else {
      alert((result as any).error || "Failed to delete admin");
    }
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-dark">Admin Management</h1>
          <p className="text-muted-foreground mt-1">Create, edit, and manage administrator accounts.</p>
        </div>
        <Button onClick={openAdd} leftIcon={<Plus size={20} />}>
          Add Admin
        </Button>
      </header>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl flex items-center space-x-3 ${
            message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="text-sm font-medium">{message.text}</p>
        </motion.div>
      )}

      <div className="bg-white rounded-[2rem] border border-border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-border">
            <tr>
              <th className="px-8 py-5 text-xs font-bold uppercase text-muted-foreground tracking-wider">Email</th>
              <th className="px-8 py-5 text-xs font-bold uppercase text-muted-foreground tracking-wider">Status</th>
              <th className="px-8 py-5 text-xs font-bold uppercase text-muted-foreground tracking-wider">Created</th>
              <th className="px-8 py-5 text-xs font-bold uppercase text-muted-foreground tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="animate-spin text-brand-blue" size={40} />
                    <p className="text-muted-foreground font-medium">Loading admins...</p>
                  </div>
                </td>
              </tr>
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-muted-foreground">
                  No admins found.
                </td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold">
                        <Shield size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-brand-dark">{admin.email}</div>
                        <div className="text-xs text-muted-foreground">{admin.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      admin.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"
                    }`}>
                      {admin.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-medium text-muted-foreground">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEdit(admin)}
                        className="p-2 hover:bg-brand-blue/10 rounded-lg text-brand-blue transition-all"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(admin.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-all"
                        title="Delete"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <h2 className="text-2xl font-extrabold text-brand-dark mb-2">
                  {editingId ? "Edit Admin" : "Add New Admin"}
                </h2>
                <p className="text-muted-foreground mb-8 text-sm">
                  {editingId
                    ? "Update admin email, status, or set a new password."
                    : "Create a new admin account with full access rights."}
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Email Address
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      defaultValue=""
                      className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl outline-none focus:border-brand-blue transition-all"
                      placeholder="admin@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Password {editingId && <span className="text-muted-foreground/60 font-normal normal-case">(leave blank to keep current)</span>}
                    </label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        minLength={editingId ? 0 : 8}
                        className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl outline-none focus:border-brand-blue transition-all pr-12"
                        placeholder={editingId ? "New password (optional)" : "Min 8 characters"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {editingId && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</label>
                      <select
                        name="status"
                        defaultValue="ACTIVE"
                        className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl outline-none focus:border-brand-blue transition-all"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    </div>
                  )}

                  <div className="flex items-center justify-end space-x-4 pt-4">
                    <Button variant="ghost" onClick={() => setShowModal(false)} type="button">
                      Cancel
                    </Button>
                    <Button type="submit" isLoading={submitting}>
                      {editingId ? "Save Changes" : "Create Admin"}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
