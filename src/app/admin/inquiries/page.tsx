"use client";

import React, { useState, useEffect } from "react";
import {
  getContactInquiries,
  getRegistrationInquiries,
  updateInquiryStatus,
  deleteInquiry,
} from "@/lib/actions/inquiries";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { Loader2, MessageSquare, UserPlus, Trash2, CheckCircle, XCircle, Eye, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

type Inquiry = {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message?: string | null;
  company?: string;
  designation?: string;
  experience?: string | null;
  status: string;
  notes?: string | null;
  createdAt: Date;
};

export default function AdminInquiries() {
  const [activeTab, setActiveTab] = useState<"contact" | "registration">("contact");
  const [contactInquiries, setContactInquiries] = useState<Inquiry[]>([]);
  const [regInquiries, setRegInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [updateNotes, setUpdateNotes] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [contactRes, regRes] = await Promise.all([
      getContactInquiries(),
      getRegistrationInquiries(),
    ]);
    if (contactRes.success && "data" in contactRes) setContactInquiries(contactRes.data || []);
    if (regRes.success && "data" in regRes) setRegInquiries(regRes.data || []);
    setLoading(false);
  }

  async function handleStatusChange(id: string, status: string) {
    const res = await updateInquiryStatus(activeTab, id, status, updateNotes || undefined);
    if (res.success) {
      toast.success("Status updated");
      fetchData();
      setSelectedInquiry(null);
      setUpdateNotes("");
    } else {
      toast.error("Failed to update status");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    const res = await deleteInquiry(activeTab, id);
    if (res.success) {
      toast.success("Inquiry deleted");
      fetchData();
    } else {
      toast.error("Failed to delete");
    }
  }

  const inquiries = activeTab === "contact" ? contactInquiries : regInquiries;
  const filtered = filterStatus === "ALL" ? inquiries : inquiries.filter((i) => i.status === filterStatus);

  const statusColors: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-700",
    REVIEWED: "bg-amber-100 text-amber-700",
    APPROVED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  function formatDate(date: Date | string) {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const stats = {
    contact: {
      total: contactInquiries.length,
      new: contactInquiries.filter((i) => i.status === "NEW").length,
      approved: contactInquiries.filter((i) => i.status === "APPROVED").length,
    },
    registration: {
      total: regInquiries.length,
      new: regInquiries.filter((i) => i.status === "NEW").length,
      approved: regInquiries.filter((i) => i.status === "APPROVED").length,
    },
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-blue" size={40} /></div>;
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-dark">Inquiries</h1>
          <p className="text-muted-foreground mt-1">Manage contact messages and membership applications.</p>
        </div>
        <Button variant="outline" leftIcon={<RefreshCw size={18} />} onClick={fetchData}>
          Refresh
        </Button>
      </header>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-border">
          <div className="text-sm font-bold text-muted-foreground uppercase">Total</div>
          <div className="text-3xl font-extrabold text-brand-dark mt-1">{stats[activeTab].total}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border">
          <div className="text-sm font-bold text-muted-foreground uppercase">New</div>
          <div className="text-3xl font-extrabold text-blue-600 mt-1">{stats[activeTab].new}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border">
          <div className="text-sm font-bold text-muted-foreground uppercase">Approved</div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-1">{stats[activeTab].approved}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-white p-1.5 rounded-2xl border border-border w-fit">
        <button
          onClick={() => { setActiveTab("contact"); setFilterStatus("ALL"); }}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "contact" ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquare size={16} />
          <span>Contact Messages</span>
        </button>
        <button
          onClick={() => { setActiveTab("registration"); setFilterStatus("ALL"); }}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "registration" ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserPlus size={16} />
          <span>Registrations</span>
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-bold text-muted-foreground uppercase">Filter:</span>
        {["ALL", "NEW", "REVIEWED", "APPROVED", "REJECTED"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === status
                ? "bg-brand-dark text-white"
                : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Inquiry List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border p-16 text-center">
          <MessageSquare size={40} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground">No inquiries found</h3>
          <p className="text-muted-foreground text-sm mt-1">
            {activeTab === "contact" ? "No contact messages yet." : "No registration applications yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((inquiry) => (
            <motion.div
              key={inquiry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-bold text-foreground text-lg">
                      {activeTab === "contact" ? inquiry.name : inquiry.fullName}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColors[inquiry.status]}`}>
                      {inquiry.status}
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center space-x-1">
                      <span className="font-semibold text-foreground">Email:</span>
                      <span>{inquiry.email}</span>
                    </span>
                    {inquiry.phone && (
                      <span className="flex items-center space-x-1">
                        <span className="font-semibold text-foreground">Phone:</span>
                        <span>{inquiry.phone}</span>
                      </span>
                    )}
                    {activeTab === "registration" && (
                      <>
                        <span className="flex items-center space-x-1">
                          <span className="font-semibold text-foreground">Company:</span>
                          <span>{inquiry.company}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span className="font-semibold text-foreground">Designation:</span>
                          <span>{inquiry.designation}</span>
                        </span>
                        {inquiry.experience && (
                          <span className="flex items-center space-x-1">
                            <span className="font-semibold text-foreground">Experience:</span>
                            <span>{inquiry.experience}</span>
                          </span>
                        )}
                      </>
                    )}
                    {activeTab === "contact" && inquiry.subject && (
                      <span className="flex items-center space-x-1">
                        <span className="font-semibold text-foreground">Subject:</span>
                        <span>{inquiry.subject}</span>
                      </span>
                    )}
                    <span className="flex items-center space-x-1">
                      <span className="font-semibold text-foreground">Date:</span>
                      <span>{formatDate(inquiry.createdAt)}</span>
                    </span>
                  </div>
                  {activeTab === "contact" && inquiry.message && (
                    <p className="mt-3 text-sm text-muted-foreground bg-gray-50 rounded-xl p-4 border border-border">
                      {inquiry.message}
                    </p>
                  )}
                  {inquiry.notes && (
                    <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                      <span className="font-bold">Admin Note:</span> {inquiry.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-4 shrink-0">
                  <button
                    onClick={() => setSelectedInquiry(inquiry)}
                    className="p-2 text-muted-foreground hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"
                    title="Update Status"
                  >
                    <CheckCircle size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(inquiry.id)}
                    className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Status Update Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full space-y-6">
            <h3 className="text-xl font-bold text-brand-dark">Update Status</h3>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Inquiry From</label>
              <p className="text-sm font-semibold text-foreground">
                {activeTab === "contact" ? selectedInquiry.name : selectedInquiry.fullName} ({selectedInquiry.email})
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Status</label>
              <select
                defaultValue={selectedInquiry.status}
                id="status-select"
                className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark text-sm outline-none focus:border-brand-blue"
              >
                <option value="NEW">New</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Admin Note (Optional)</label>
              <textarea
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark text-sm outline-none focus:border-brand-blue resize-none"
                placeholder="Add a note..."
              />
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setSelectedInquiry(null); setUpdateNotes(""); }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  const select = document.getElementById("status-select") as HTMLSelectElement;
                  handleStatusChange(selectedInquiry.id, select.value);
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
