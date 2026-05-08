"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, User, Mail, Building2, Briefcase, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const { submitRegistrationInquiry } = await import("@/lib/actions/inquiries");
    const res = await submitRegistrationInquiry({
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      company: formData.get("company") as string,
      designation: formData.get("designation") as string,
      phone: formData.get("phone") as string,
      experience: formData.get("experience") as string,
    });

    setSubmitting(false);
    if (res.success) {
      setSubmitted(true);
    }
  }

  return (
    <main className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center space-x-2 text-muted-foreground hover:text-brand-blue transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-semibold">Back to Home</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl shadow-brand-blue/10 border border-white">
          {submitted ? (
            <div className="text-center space-y-5 py-8">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={40} className="text-emerald-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-foreground">Application Submitted!</h2>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Thank you for your interest in joining ECT Theni. Our admin team will review your application and contact you within 2–3 working days.
              </p>
              <div className="pt-4 space-y-3">
                <Link href="/">
                  <Button className="w-full">Back to Home</Button>
                </Link>
                <Link href="/members" className="block text-center text-sm font-semibold text-brand-blue hover:underline">
                  Browse Member Directory
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center space-y-3 mb-8">
                <div className="w-14 h-14 bg-brand-blue rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-brand-blue/30">
                  E
                </div>
                <h1 className="text-3xl font-extrabold text-foreground">Join ECT Theni</h1>
                <p className="text-muted-foreground text-sm">
                  Submit your membership application below. Admin will verify and create your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="Er. Your Name"
                      className="w-full pl-10 pr-4 py-3.5 bg-white border border-border rounded-2xl text-brand-dark outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-3.5 bg-white border border-border rounded-2xl text-brand-dark outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Company / Firm *</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                      type="text"
                      name="company"
                      required
                      placeholder="Your company or firm name"
                      className="w-full pl-10 pr-4 py-3.5 bg-white border border-border rounded-2xl text-brand-dark outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Designation *</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                      type="text"
                      name="designation"
                      required
                      placeholder="e.g. Structural Engineer"
                      className="w-full pl-10 pr-4 py-3.5 bg-white border border-border rounded-2xl text-brand-dark outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3.5 bg-white border border-border rounded-2xl text-brand-dark outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Years of Experience</label>
                  <select name="experience" className="w-full px-4 py-3.5 bg-white border border-border rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all text-sm text-brand-dark">
                    <option value="">Select experience</option>
                    <option>0–2 years</option>
                    <option>2–5 years</option>
                    <option>5–10 years</option>
                    <option>10–20 years</option>
                    <option>20+ years</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  isLoading={submitting}
                  rightIcon={<Send size={18} />}
                >
                  Submit Application
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-border text-center">
                <p className="text-sm text-muted-foreground">
                  Already a member?{" "}
                  <Link href="/login" className="text-brand-blue font-bold hover:underline">
                    Sign In
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </main>
  );
}
