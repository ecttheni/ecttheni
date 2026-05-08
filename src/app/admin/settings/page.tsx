"use client";

import React, { useState, useEffect } from "react";
import { Save, Loader2, MessageSquare, Image as ImageIcon, CheckCircle2, Layout, Phone, Link as LinkIcon, Plus, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { getAllSettings, updateSiteSettings } from "@/lib/actions/content";
import toast from "react-hot-toast";

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [milestones, setMilestones] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const res = await getAllSettings();
      if (res.success && res.data) {
        setSettings(res.data);
        try {
          const parsed = res.data.milestones?.content ? JSON.parse(res.data.milestones.content) : [];
          setMilestones(parsed);
        } catch {
          setMilestones([]);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  function addMilestone() {
    setMilestones([...milestones, { year: "", title: "", desc: "" }]);
  }

  function removeMilestone(index: number) {
    setMilestones(milestones.filter((_, i) => i !== index));
  }

  function updateMilestone(index: number, field: string, value: string) {
    const updated = milestones.map((m, i) => (i === index ? { ...m, [field]: value } : m));
    setMilestones(updated);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    formData.set("milestones_content", JSON.stringify(milestones));
    const res = await updateSiteSettings(formData);
    
    setSaving(false);
    if (res.success) {
      toast.success("Settings updated successfully");
      const fetchRes = await getAllSettings();
      if (fetchRes.success && fetchRes.data) setSettings(fetchRes.data);
    } else {
      toast.error("Failed to update settings");
    }
  }

  const getVal = (key: string) => settings[key]?.content || "";
  const getImg = (key: string) => settings[key]?.imageUrl || "";

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-blue" size={40} /></div>;

  return (
    <form onSubmit={handleSave} className="space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-dark">Site Settings</h1>
          <p className="text-muted-foreground mt-1">Manage dynamic content, leadership profiles, and contact details.</p>
        </div>
        <Button 
          type="submit"
          isLoading={saving}
          leftIcon={<Save size={20} />}
          variant="primary"
        >
          Save All Changes
        </Button>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* State President Profile */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2.5rem] border border-border shadow-sm space-y-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><MessageSquare size={20} /></div>
            <h2 className="text-xl font-bold text-brand-dark">State President's Profile</h2>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Name</label>
            <input type="text" name="state_president_name_content" defaultValue={getVal("state_president_name")} className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark text-sm outline-none focus:border-brand-blue" placeholder="e.g. Er. State President" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Message</label>
            <textarea name="state_president_message_content" defaultValue={getVal("state_president_message")} rows={4} className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark text-sm outline-none focus:border-brand-blue resize-none" placeholder="State president's welcome message..." />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Photo Upload</label>
            <div className="flex items-center space-x-4">
              {getImg("state_president_message") && <img src={getImg("state_president_message")} alt="State President" className="w-12 h-12 rounded-full object-cover" />}
              <div className="flex-1">
                <input type="file" name="state_president_message_file" accept="image/*" className="w-full px-4 py-2 bg-white border border-border rounded-xl text-sm" />
                <input type="hidden" name="state_president_message_url" value={getImg("state_president_message")} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* President Profile */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded-[2.5rem] border border-border shadow-sm space-y-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><MessageSquare size={20} /></div>
            <h2 className="text-xl font-bold text-brand-dark">President's Profile</h2>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Name</label>
            <input type="text" name="president_name_content" defaultValue={getVal("president_name")} className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark text-sm outline-none focus:border-brand-blue" placeholder="e.g. Er. John Doe" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Message</label>
            <textarea name="president_message_content" defaultValue={getVal("president_message")} rows={4} className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark text-sm outline-none focus:border-brand-blue resize-none" placeholder="Welcome message..." />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Photo Upload</label>
            <div className="flex items-center space-x-4">
              {getImg("president_message") && <img src={getImg("president_message")} alt="President" className="w-12 h-12 rounded-full object-cover" />}
              <div className="flex-1">
                <input type="file" name="president_message_file" accept="image/*" className="w-full px-4 py-2 bg-white border border-border rounded-xl text-sm" />
                <input type="hidden" name="president_message_url" value={getImg("president_message")} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Secretary Profile */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded-[2.5rem] border border-border shadow-sm space-y-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><MessageSquare size={20} /></div>
            <h2 className="text-xl font-bold text-brand-dark">Secretary's Profile</h2>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Name</label>
            <input type="text" name="secretary_name_content" defaultValue={getVal("secretary_name")} className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark text-sm outline-none focus:border-brand-blue" placeholder="e.g. Er. Jane Doe" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Message</label>
            <textarea name="secretary_message_content" defaultValue={getVal("secretary_message")} rows={4} className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark text-sm outline-none focus:border-brand-blue resize-none" placeholder="Welcome message..." />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Photo Upload</label>
            <div className="flex items-center space-x-4">
              {getImg("secretary_message") && <img src={getImg("secretary_message")} alt="Secretary" className="w-12 h-12 rounded-full object-cover" />}
              <div className="flex-1">
                <input type="file" name="secretary_message_file" accept="image/*" className="w-full px-4 py-2 bg-white border border-border rounded-xl text-sm" />
                <input type="hidden" name="secretary_message_url" value={getImg("secretary_message")} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Branding & Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2.5rem] border border-border shadow-sm space-y-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Layout size={20} /></div>
            <h2 className="text-xl font-bold text-brand-dark">Home Page & Branding</h2>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Site Logo (Optional)</label>
            <div className="flex items-center space-x-4">
              {getImg("site_logo") && <img src={getImg("site_logo")} alt="Logo" className="w-16 h-auto object-contain bg-gray-100 rounded-lg p-2" />}
              <div className="flex-1">
                <input type="file" name="site_logo_file" accept="image/*" className="w-full px-4 py-2 bg-white border border-border rounded-xl text-sm" />
                <input type="hidden" name="site_logo_url" value={getImg("site_logo")} />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Hero Title (HTML supported)</label>
            <textarea name="hero_title_content" defaultValue={getVal("hero_title")} rows={3} className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark text-sm outline-none focus:border-brand-blue" placeholder="Building the Future of <br/><span class='text-brand-blue'>Civil Engineering</span> in Theni" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Hero Subtitle</label>
            <textarea name="hero_subtitle_content" defaultValue={getVal("hero_subtitle")} rows={3} className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark text-sm outline-none focus:border-brand-blue" placeholder="A premier professional organization..." />
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2.5rem] border border-border shadow-sm space-y-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Phone size={20} /></div>
            <h2 className="text-xl font-bold text-brand-dark">Contact Information</h2>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Address</label>
            <textarea name="contact_address_content" defaultValue={getVal("contact_address")} rows={2} className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark text-sm outline-none focus:border-brand-blue resize-none" placeholder="Civil Engineers Building, Theni..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Phone</label>
              <input type="text" name="contact_phone_content" defaultValue={getVal("contact_phone")} className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark text-sm outline-none focus:border-brand-blue" placeholder="+91 98765..." />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Email</label>
              <input type="text" name="contact_email_content" defaultValue={getVal("contact_email")} className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark text-sm outline-none focus:border-brand-blue" placeholder="info@ecttheni.com" />
            </div>
          </div>
        </motion.div>
        
        {/* Journey Milestones */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-border shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-sky-50 text-sky-600 rounded-lg"><Calendar size={20} /></div>
              <h2 className="text-xl font-bold text-brand-dark">Our Journey Milestones</h2>
            </div>
            <Button type="button" variant="outline" leftIcon={<Plus size={18} />} onClick={addMilestone} className="text-sm">
              Add Milestone
            </Button>
          </div>

          {milestones.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No milestones added. Click "Add Milestone" to begin.</p>
          ) : (
            <div className="space-y-4">
              {milestones.map((m, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-5 border border-border space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-muted-foreground">Milestone #{i + 1}</span>
                    <button type="button" onClick={() => removeMilestone(i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-12 gap-4">
                    <div className="md:col-span-3">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Year / Month</label>
                      <input type="text" value={m.year} onChange={(e) => updateMilestone(i, "year", e.target.value)} className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark text-sm outline-none focus:border-brand-blue mt-1" placeholder="e.g. May 2025" />
                    </div>
                    <div className="md:col-span-4">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Title</label>
                      <input type="text" value={m.title} onChange={(e) => updateMilestone(i, "title", e.target.value)} className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark text-sm outline-none focus:border-brand-blue mt-1" placeholder="e.g. Association Founded" />
                    </div>
                    <div className="md:col-span-5">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Description</label>
                      <input type="text" value={m.desc} onChange={(e) => updateMilestone(i, "desc", e.target.value)} className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark text-sm outline-none focus:border-brand-blue mt-1" placeholder="Brief description..." />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-border shadow-sm space-y-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><LinkIcon size={20} /></div>
            <h2 className="text-xl font-bold text-brand-dark">Social Media & Footer</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Facebook URL</label>
              <input type="text" name="social_facebook_content" defaultValue={getVal("social_facebook")} className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark text-sm outline-none focus:border-brand-blue" placeholder="https://facebook.com/..." />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Twitter URL</label>
              <input type="text" name="social_twitter_content" defaultValue={getVal("social_twitter")} className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark text-sm outline-none focus:border-brand-blue" placeholder="https://twitter.com/..." />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Instagram URL</label>
              <input type="text" name="social_instagram_content" defaultValue={getVal("social_instagram")} className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark text-sm outline-none focus:border-brand-blue" placeholder="https://instagram.com/..." />
            </div>
          </div>
          <div className="space-y-2 pt-4">
            <label className="text-xs font-bold uppercase text-muted-foreground">Footer Copyright Text</label>
            <input type="text" name="footer_text_content" defaultValue={getVal("footer_text")} className="w-full px-4 py-3 bg-white border border-border rounded-xl text-brand-dark text-sm outline-none focus:border-brand-blue" placeholder="© 2026 Engineers Club Tamilnadu - Theni Center..." />
          </div>
        </motion.div>
      </div>

    </form>
  );
}
