"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Target, Eye, CheckCircle, Users, Award, Building2, Loader2 } from "lucide-react";
import { getAllSettings } from "@/lib/actions/content";

const defaultMilestones = [
  { year: "2025", title: "Association Founded", desc: "Engineers Club Tamilnadu - Theni Center officially established." },
];

const values = [
  { icon: CheckCircle, title: "Integrity", desc: "Upholding the highest professional and ethical standards in all we do." },
  { icon: Users, title: "Community", desc: "Building strong bonds among civil engineers across Theni District." },
  { icon: Award, title: "Excellence", desc: "Striving for the highest quality in knowledge sharing and technical education." },
  { icon: Building2, title: "Development", desc: "Contributing to the infrastructure and economic development of the region." },
];

export default function AboutPage() {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await getAllSettings();
      if (res.success && res.data?.milestones?.content) {
        try {
          setMilestones(JSON.parse(res.data.milestones.content));
        } catch {
          setMilestones(defaultMilestones);
        }
      } else {
        setMilestones(defaultMilestones);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <main className="bg-mesh min-h-screen">
      <Navbar />

      {/* Hero */}
      <header className="pt-32 pb-20 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto space-y-5"
        >
          <div className="inline-flex items-center space-x-2 bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
            <Award size={14} />
            <span>Est. 2000 · Theni District</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight">
            About <span className="text-brand-blue">ECT Theni</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            The Engineers Club Tamilnadu - Theni Center is a premier professional association uniting
            civil engineers across Theni District to foster growth, collaboration, and community service.
          </p>
        </motion.div>
      </header>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-brand-blue rounded-[2.5rem] p-10 text-white space-y-5"
            >
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Target size={28} />
              </div>
              <h2 className="text-2xl font-bold">Our Mission</h2>
              <p className="text-blue-100 leading-relaxed">
                To empower civil engineers in Theni District by providing a platform for professional
                networking, continuous skill development, knowledge exchange, and community welfare —
                enabling members to achieve their highest professional potential.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-brand-dark rounded-[2.5rem] p-10 text-white space-y-5"
            >
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                <Eye size={28} />
              </div>
              <h2 className="text-2xl font-bold">Our Vision</h2>
              <p className="text-white leading-relaxed">
                To be the most influential and respected professional body for civil engineers in the
                Theni region — recognized for advancing infrastructure quality, engineering education,
                and the professional welfare of our members.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-brand-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14 space-y-3">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">Our Core Values</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">The principles that guide every decision and initiative of our club.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-8 border border-border shadow-sm hover:shadow-xl hover:shadow-brand-blue/5 transition-all text-center space-y-4 group"
              >
                <div className="w-14 h-14 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue mx-auto group-hover:bg-brand-blue group-hover:text-white transition-all">
                  <v.icon size={26} />
                </div>
                <h3 className="text-lg font-bold text-foreground">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14 space-y-3">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">Our Journey</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Key milestones in the history of ECT Theni Center.</p>
          </div>

          <div className="relative max-w-3xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-brand-blue/20" />

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-brand-blue" size={40} />
              </div>
            ) : milestones.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No milestones added yet.</p>
            ) : (
              <div className="space-y-10">
                {milestones.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="relative pl-20"
                  >
                    {/* Dot */}
                    <div className="absolute left-4 top-1 w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center text-white text-[10px] font-bold -translate-x-1/2 shadow-lg shadow-brand-blue/30">
                      {i + 1}
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-6 border border-border">
                      <div className="text-brand-blue font-bold text-sm mb-1">{m.year}</div>
                      <div className="text-foreground font-bold text-lg">{m.title}</div>
                      <div className="text-muted-foreground text-sm mt-1">{m.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
