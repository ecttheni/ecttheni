"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    async function loadSettings() {
      const { getAllSettings } = await import("@/lib/actions/content");
      const res = await getAllSettings();
      if (res.success && res.data) setSettings(res.data);
    }
    loadSettings();
  }, []);

  const getVal = (key: string, fallback: string) => settings[key]?.content || fallback;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const { submitContactInquiry } = await import("@/lib/actions/inquiries");
    const res = await submitContactInquiry({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    });

    setSubmitting(false);
    if (res.success) {
      setSubmitted(true);
    }
  }

  const contactInfo = [
    {
      icon: MapPin,
      label: "Visit Us",
      value: getVal("contact_address", "Civil Engineers Building, Theni, Tamil Nadu — 625 531"),
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: Phone,
      label: "Call Us",
      value: getVal("contact_phone", "+91 98765 43210"),
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: Mail,
      label: "Email Us",
      value: getVal("contact_email", "info@ecttheni.com"),
      color: "bg-purple-50 text-purple-600",
    },
    {
      icon: Clock,
      label: "Office Hours",
      value: "Mon – Sat, 10:00 AM – 5:00 PM",
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <main className="bg-mesh min-h-screen">
      <Navbar />

      {/* Header */}
      <header className="pt-32 pb-16 text-center container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center space-x-2 bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
            <MessageSquare size={14} />
            <span>Get In Touch</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">Contact Us</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Have a question, or want to learn more about joining the Engineers Club? We'd love to hear from you.
          </p>
        </motion.div>
      </header>

      <section className="pb-24 container mx-auto px-4">
        <div className="grid lg:grid-cols-5 gap-10 max-w-6xl mx-auto">

          {/* Left: Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            {contactInfo.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-6 border border-border shadow-sm flex items-start space-x-5"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${item.color}`}>
                  <item.icon size={22} />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{item.label}</div>
                  <div className="font-semibold text-foreground text-sm leading-relaxed">{item.value}</div>
                </div>
              </motion.div>
            ))}

            {/* Map Integration */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-gray-100 rounded-3xl h-52 border border-border overflow-hidden relative"
            >
              <iframe 
                src="https://www.google.com/maps?q=Theni+District,+Tamil+Nadu&output=embed" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              />
            </motion.div>
          </div>

          {/* Right: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 bg-white rounded-[2.5rem] border border-border shadow-sm p-10"
          >
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-5 py-16">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={40} className="text-emerald-600" />
                </div>
                <h2 className="text-2xl font-extrabold text-foreground">Message Sent!</h2>
                <p className="text-muted-foreground max-w-sm">
                  Thank you for reaching out. Our team will get back to you within 24–48 hours.
                </p>
                <Button variant="outline" onClick={() => setSubmitted(false)}>Send Another</Button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-extrabold text-foreground mb-1">Send a Message</h2>
                <p className="text-muted-foreground text-sm mb-8">Fill in the form and we'll respond as soon as possible.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="Er. Full Name"
                        className="w-full px-4 py-3 bg-white border border-border rounded-xl text-foreground outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="email@example.com"
                        className="w-full px-4 py-3 bg-white border border-border rounded-xl text-foreground outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subject</label>
                    <select name="subject" className="w-full px-4 py-3 bg-white border border-border rounded-xl outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all text-sm text-foreground">
                      <option>Membership Enquiry</option>
                      <option>Event Information</option>
                      <option>General Question</option>
                      <option>Feedback / Suggestion</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Message</label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      placeholder="Tell us how we can help you..."
                      className="w-full px-4 py-3 bg-white border border-border rounded-xl text-foreground outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all text-sm resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    isLoading={submitting}
                    rightIcon={<Send size={18} />}
                    className="w-full"
                  >
                    Send Message
                  </Button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
