"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Filter, Edit, Trash, Shield, Loader2, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { getMembers, createMember, deleteMember, resetMemberPassword } from "@/lib/actions/members";

export default function AdminMembers() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<{ memberName: string; password: string } | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setLoading(true);
    const result = await getMembers();
    if (result.success) {
      setMembers(result.data || []);
    }
    setLoading(false);
  }

  async function handleAddMember(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await createMember(formData);
    
    if (result.success) {
      setMessage({ type: "success", text: "Member registered successfully!" });
      setTempPassword((result as any).temporaryPassword || null);
      setShowAddForm(false);
      fetchMembers();
    } else {
      setMessage({ type: "error", text: (result as any).error || "Failed to register member" });
    }
    setSubmitting(false);
  }

  async function handleDeleteMember(id: string) {
    if (!confirm("Are you sure you want to delete this member?")) return;
    
    const result = await deleteMember(id);
    if (result.success) {
      fetchMembers();
    } else if ("error" in result) {
      alert(result.error);
    }
  }

  async function handleResetPassword(member: any) {
    if (!confirm(`Reset password for ${member.memberDetails?.fullName || member.email}?`)) return;

    setResettingId(member.id);
    const result = await resetMemberPassword(member.id);
    setResettingId(null);

    if (result.success) {
      setResetResult({
        memberName: member.memberDetails?.fullName || member.email,
        password: (result as any).temporaryPassword || "",
      });
    } else {
      alert((result as any).error || "Failed to reset password");
    }
  }

  const filteredMembers = members.filter(member => 
    member.memberDetails?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.memberDetails?.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-dark">Member Management</h1>
          <p className="text-muted-foreground mt-1">Manage all registered members and their status.</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          leftIcon={<Plus size={20} />}
        >
          Add New Member
        </Button>
      </header>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl flex items-start space-x-3 ${
            message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 size={20} className="mt-0.5 shrink-0" /> : <AlertCircle size={20} className="mt-0.5 shrink-0" />}
          <div>
            <p className="text-sm font-medium">{message.text}</p>
            {tempPassword && (
              <p className="text-sm font-semibold mt-1">
                Temporary Password: <span className="font-mono bg-emerald-100 px-2 py-0.5 rounded text-emerald-800">{tempPassword}</span>
              </p>
            )}
          </div>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search by name, company, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-border rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
          />
        </div>
        <Button variant="outline" leftIcon={<Filter size={18} />} className="md:w-32">
          Filter
        </Button>
      </div>

      <div className="bg-white rounded-[2rem] border border-border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-border">
            <tr>
              <th className="px-8 py-5 text-xs font-bold uppercase text-muted-foreground tracking-wider">Member</th>
              <th className="px-8 py-5 text-xs font-bold uppercase text-muted-foreground tracking-wider">Status</th>
              <th className="px-8 py-5 text-xs font-bold uppercase text-muted-foreground tracking-wider">Year</th>
              <th className="px-8 py-5 text-xs font-bold uppercase text-muted-foreground tracking-wider">Designation</th>
              <th className="px-8 py-5 text-xs font-bold uppercase text-muted-foreground tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="animate-spin text-brand-blue" size={40} />
                    <p className="text-muted-foreground font-medium">Loading members...</p>
                  </div>
                </td>
              </tr>
            ) : filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-muted-foreground">
                  No members found.
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue font-bold">
                        {member.memberDetails?.fullName?.charAt(0) || "U"}
                      </div>
                      <div>
                        <div className="font-bold text-brand-dark">{member.memberDetails?.fullName}</div>
                        <div className="text-xs text-muted-foreground">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      member.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-medium text-brand-dark">{member.entryYear}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-medium text-muted-foreground">{member.memberDetails?.designation || "Member"}</div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleResetPassword(member)}
                        disabled={resettingId === member.id}
                        className="p-2 hover:bg-amber-500/10 rounded-lg text-amber-500 transition-all disabled:opacity-50"
                        title="Reset Password"
                      >
                        {resettingId === member.id ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
                      </button>
                      <button className="p-2 hover:bg-amber-500/10 rounded-lg text-amber-500 transition-all" title="Assign Role">
                        <Shield size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteMember(member.id)}
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

      {/* Reset Password Result Modal */}
      <AnimatePresence>
        {resetResult && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setResetResult(null)}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={32} className="text-emerald-600" />
                </div>
                <h2 className="text-2xl font-extrabold text-brand-dark mb-2">Password Reset</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Password for <span className="font-semibold text-brand-dark">{resetResult.memberName}</span> has been reset.
                </p>
                <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">New Temporary Password</p>
                  <p className="text-lg font-mono font-bold text-brand-dark bg-white border border-border rounded-xl px-4 py-3 select-all">
                    {resetResult.password}
                  </p>
                </div>
                <button
                  onClick={() => setResetResult(null)}
                  className="w-full px-6 py-3 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue/90 transition-all"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Member Modal (Overlay) */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <h2 className="text-2xl font-extrabold text-brand-dark mb-2">Register New Member</h2>
                <p className="text-muted-foreground mb-8 text-sm">Fill in the details to add a new member to the directory.</p>
                
                <form onSubmit={handleAddMember} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                      <input name="fullName" type="text" required className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl outline-none focus:border-brand-blue transition-all" placeholder="e.g. Er. Rajesh" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email (Login ID)</label>
                      <input name="email" type="email" required className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl outline-none focus:border-brand-blue transition-all" placeholder="email@example.com" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Company Name</label>
                      <input name="company" type="text" className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl outline-none focus:border-brand-blue transition-all" placeholder="Firm/Company" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Designation</label>
                      <input name="designation" type="text" className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl outline-none focus:border-brand-blue transition-all" placeholder="e.g. Chief Engineer" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Entry Year</label>
                      <input name="entryYear" type="number" required className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl outline-none focus:border-brand-blue transition-all" defaultValue={new Date().getFullYear()} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Renewal Cycle</label>
                      <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl outline-none focus:border-brand-blue transition-all" defaultValue={`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`} readOnly />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fees Paid</label>
                      <select name="fees" className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl outline-none focus:border-brand-blue transition-all">
                        <option>₹2000 (New)</option>
                        <option>₹1000 (Renewal)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-4 pt-6">
                    <Button variant="ghost" onClick={() => setShowAddForm(false)} type="button">Cancel</Button>
                    <Button type="submit" isLoading={submitting}>Create Member Profile</Button>
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
