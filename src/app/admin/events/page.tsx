"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Edit, Trash, Loader2, Calendar as CalendarIcon, Info, Users, Download, X, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { getEvents, createEvent, updateEvent, deleteEvent, getEventBookings } from "@/lib/actions/events";
import { format } from "date-fns";
import { compressImage } from "@/lib/compress";

export default function AdminEvents() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: "", date: "", location: "", description: "", imageUrl: "" });
  const [compressedPhoto, setCompressedPhoto] = useState<File | null>(null);
  const [showBookings, setShowBookings] = useState(false);
  const [bookingsEvent, setBookingsEvent] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    const result = await getEvents();
    if (result.success) {
      setEvents(result.data || []);
    }
    setLoading(false);
  }

  function formatDateForInput(dateValue: any) {
    if (!dateValue) return "";
    const d = dateValue instanceof Date ? dateValue : new Date(dateValue);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  function openAddForm() {
    setEditingId(null);
    setFormData({ title: "", date: "", location: "", description: "", imageUrl: "" });
    setCompressedPhoto(null);
    setShowAddForm(true);
  }

  function openEditForm(event: any) {
    setEditingId(event.id);
    setCompressedPhoto(null);
    setFormData({
      title: event.title || "",
      date: formatDateForInput(event.date),
      location: event.location || "",
      description: event.description || "",
      imageUrl: event.imageUrl || "",
    });
    setShowAddForm(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("date", formData.date);
    fd.append("location", formData.location);
    fd.append("description", formData.description);
    fd.append("imageUrl", formData.imageUrl);
    if (compressedPhoto) fd.append("photo", compressedPhoto);
    
    const result = editingId 
      ? await updateEvent(editingId, fd)
      : await createEvent(fd);
    
    setSubmitting(false);
    if (result.success) {
      setShowAddForm(false);
      setEditingId(null);
      setCompressedPhoto(null);
      fetchEvents();
    } else if ("error" in result) {
      alert(result.error);
    }
  }

  function handleFormChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this event?")) return;
    const result = await deleteEvent(id);
    if (result.success) fetchEvents();
    else if ("error" in result) alert(result.error);
  }

  async function openBookings(event: any) {
    setBookingsEvent(event);
    setLoadingBookings(true);
    setShowBookings(true);
    const result = await getEventBookings(event.id);
    if (result.success) {
      setBookings((result as any).data || []);
    } else {
      setBookings([]);
    }
    setLoadingBookings(false);
  }

  function handlePrint() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const rows = bookings
      .map(
        (b: any, i: number) => `
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #ddd; text-align: center;">${i + 1}</td>
          <td style="padding: 8px 12px; border: 1px solid #ddd; font-weight: 600;">${b.fullName}</td>
          <td style="padding: 8px 12px; border: 1px solid #ddd;">${b.email}</td>
          <td style="padding: 8px 12px; border: 1px solid #ddd;">${b.mobile || "\u2014"}</td>
          <td style="padding: 8px 12px; border: 1px solid #ddd;">${b.company || "\u2014"}</td>
          <td style="padding: 8px 12px; border: 1px solid #ddd;">${b.location || "\u2014"}</td>
        </tr>`
      )
      .join("");

    const eventDate = bookingsEvent ? format(new Date(bookingsEvent.date), "PPP p") : "";

    printWindow.document.write(`
      <html>
        <head>
          <title>Bookings - ${bookingsEvent?.title || "Event"}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            h1 { font-size: 24px; margin-bottom: 4px; }
            .meta { color: #666; font-size: 14px; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; }
            th { padding: 10px 12px; border: 1px solid #ddd; background: #f5f5f5; font-size: 11px; text-transform: uppercase; text-align: left; }
            td { padding: 8px 12px; border: 1px solid #ddd; font-size: 13px; }
            .footer { margin-top: 24px; font-size: 11px; color: #999; text-align: center; }
          </style>
        </head>
        <body>
          <h1>${bookingsEvent?.title || "Event"}</h1>
          <div class="meta">${eventDate} &middot; Total Booked: ${bookings.length}</div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Company</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="footer">Generated on ${new Date().toLocaleDateString()} from ECT Theni Admin Panel</div>
          <script>window.print();window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-dark">Event Management</h1>
          <p className="text-muted-foreground mt-1">Announce and manage club events, meetings, and seminars.</p>
        </div>
        <Button 
          onClick={openAddForm}
          leftIcon={<Plus size={20} />}
        >
          Add New Event
        </Button>
      </header>

      <div className="bg-white rounded-[2rem] border border-border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-border">
            <tr>
              <th className="px-8 py-5 text-xs font-bold uppercase text-muted-foreground tracking-wider">Event</th>
              <th className="px-8 py-5 text-xs font-bold uppercase text-muted-foreground tracking-wider">Date & Time</th>
              <th className="px-8 py-5 text-xs font-bold uppercase text-muted-foreground tracking-wider">Bookings</th>
              <th className="px-8 py-5 text-xs font-bold uppercase text-muted-foreground tracking-wider">Description</th>
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
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-muted-foreground">No events found.</td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-6 font-bold text-brand-dark">{event.title}</td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-medium">{format(new Date(event.date), "PPP")}</div>
                    <div className="text-xs text-muted-foreground">{format(new Date(event.date), "p")}</div>
                  </td>
                  <td className="px-8 py-6">
                    <button
                      onClick={() => openBookings(event)}
                      className="inline-flex items-center space-x-2 px-3 py-1.5 bg-brand-blue/10 text-brand-blue rounded-xl text-sm font-bold hover:bg-brand-blue/20 transition-colors"
                    >
                      <Users size={16} />
                      <span>{event._count?.bookings ?? 0} Booked</span>
                    </button>
                  </td>
                  <td className="px-8 py-6 text-sm text-muted-foreground max-w-xs truncate">{event.description}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => openEditForm(event)} className="p-2 hover:bg-brand-blue/10 rounded-lg text-brand-blue"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(event.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-500"><Trash size={18} /></button>
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
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl p-10">
               <h2 className="text-2xl font-extrabold text-brand-dark mb-8">{editingId ? "Edit Event" : "Post New Event"}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Event Title</label>
                    <input name="title" value={formData.title} onChange={e => handleFormChange("title", e.target.value)} required className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark outline-none focus:border-brand-blue" placeholder="e.g. Technical Seminar on BIM" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location</label>
                    <input name="location" type="text" value={formData.location} onChange={e => handleFormChange("location", e.target.value)} className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark outline-none focus:border-brand-blue" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date & Time</label>
                      <input name="date" type="datetime-local" value={formData.date} onChange={e => handleFormChange("date", e.target.value)} required className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark outline-none focus:border-brand-blue" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Event Photo</label>
                      <input
                        name="photo"
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) setCompressedPhoto(await compressImage(file));
                        }}
                        className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark outline-none focus:border-brand-blue"
                      />
                      <input type="hidden" name="imageUrl" value={formData.imageUrl} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</label>
                    <textarea name="description" value={formData.description} onChange={e => handleFormChange("description", e.target.value)} rows={4} className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark outline-none focus:border-brand-blue resize-none" placeholder="Details about the event..."></textarea>
                  </div>
                  <div className="flex items-center justify-end space-x-4 pt-6">
                    <Button variant="ghost" onClick={() => setShowAddForm(false)} type="button">Cancel</Button>
                    <Button type="submit" isLoading={submitting}>{editingId ? "Update Event" : "Post Event"}</Button>
                  </div>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bookings Modal */}
      <AnimatePresence>
        {showBookings && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookings(false)}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-8 pb-0 flex items-center justify-between shrink-0 no-print">
                <div>
                  <h2 className="text-2xl font-extrabold text-brand-dark">{bookingsEvent?.title}</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    {bookingsEvent && format(new Date(bookingsEvent.date), "PPP p")} &middot; {bookings.length} member{bookings.length !== 1 ? "s" : ""} booked
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrint}
                    className="p-2.5 hover:bg-brand-blue/10 rounded-xl text-brand-blue transition-colors"
                    title="Print / PDF"
                  >
                    <Printer size={20} />
                  </button>
                  <button
                    onClick={() => setShowBookings(false)}
                    className="p-2.5 hover:bg-gray-100 rounded-xl text-muted-foreground transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Printable Content */}
              <div ref={printRef} className="p-8 overflow-y-auto">
                {loadingBookings ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-brand-blue" size={40} />
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">
                    <Users size={48} className="mx-auto mb-4 text-muted-foreground/40" />
                    <p className="font-medium">No bookings yet for this event.</p>
                  </div>
                ) : (
                  <>
                    {/* Print header - only visible in print */}
                    <div className="hidden print:block mb-8">
                      <h1 className="text-2xl font-bold">{bookingsEvent?.title}</h1>
                      <p className="text-sm text-gray-600">
                        {bookingsEvent && format(new Date(bookingsEvent.date), "PPP p")}
                        {" | "}Total Booked: {bookings.length}
                      </p>
                    </div>

                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-border">
                        <tr>
                          <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground tracking-wider">#</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground tracking-wider">Name</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground tracking-wider">Email</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground tracking-wider">Mobile</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground tracking-wider">Company</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground tracking-wider">Location</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {bookings.map((b: any, i: number) => (
                          <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-muted-foreground font-medium">{i + 1}</td>
                            <td className="px-6 py-4 font-semibold text-brand-dark">{b.fullName}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{b.email}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{b.mobile || "\u2014"}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{b.company || "\u2014"}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{b.location || "\u2014"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Print footer */}
                    <div className="hidden print:block mt-8 text-xs text-gray-400 text-center">
                      Generated on {new Date().toLocaleDateString()} from ECT Theni Admin Panel
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
