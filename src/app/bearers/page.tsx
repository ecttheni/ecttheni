"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { User, ShieldCheck, Loader2 } from "lucide-react";
import { getBearers } from "@/lib/actions/bearers";

export default function BearersPage() {
  const [bearers, setBearers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBearers() {
      const result = await getBearers();
      if (result.success) {
        setBearers(result.data || []);
      }
      setLoading(false);
    }
    fetchBearers();
  }, []);

  const centerBearers = bearers.filter(b => !b.isStateLevel);
  const stateBearers = bearers.filter(b => b.isStateLevel);

  return (
    <main className="bg-mesh min-h-screen">
      <Navbar />
      
      <header className="pt-32 pb-16 text-center container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">Office Bearers</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The dedicated team leading the Engineers Club Tamilnadu - Theni Center.
          </p>
        </motion.div>
      </header>

      <section className="py-16 container mx-auto px-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-brand-blue mb-4" size={40} />
            <p className="text-muted-foreground font-medium">Loading office bearers...</p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Main Bearers */}
            <div className="space-y-10">
              <div className="flex items-center space-x-4">
                <ShieldCheck className="text-brand-blue" size={32} />
                <h2 className="text-2xl font-bold text-foreground">Theni Center Team</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {centerBearers.length > 0 ? centerBearers.map((bearer, i) => (
                  <motion.div
                    key={bearer.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-border flex flex-col items-center text-center space-y-4 hover:shadow-xl hover:shadow-brand-blue/5 transition-all group"
                  >
                    <div className="w-24 h-24 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue group-hover:scale-110 transition-transform overflow-hidden shadow-inner">
                      {bearer.photoUrl ? (
                        <img src={bearer.photoUrl} alt={bearer.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={48} />
                      )}
                    </div>
                    <div>
                      <div className="text-brand-blue font-extrabold text-[10px] uppercase tracking-widest mb-1">{bearer.designation}</div>
                      <div className="text-foreground font-extrabold text-lg leading-tight">{bearer.name}</div>
                      {(bearer.mobile || bearer.company) && (
                        <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col space-y-0.5">
                          {bearer.mobile && <div className="text-[11px] font-bold text-muted-foreground">Ph: {bearer.mobile}</div>}
                          {bearer.company && <div className="text-[11px] font-bold text-brand-blue truncate max-w-[150px]">{bearer.company}</div>}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )) : (
                  <p className="col-span-full text-center text-muted-foreground italic">No center bearers listed yet.</p>
                )}
              </div>
            </div>

            {/* State Bearers */}
            <div className="pt-20 space-y-10 border-t border-border">
              <div className="flex items-center space-x-4">
                <ShieldCheck className="text-brand-blue" size={32} />
                <h2 className="text-2xl font-bold text-foreground">State Office Bearers</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stateBearers.length > 0 ? stateBearers.map((bearer, i) => (
                  <motion.div
                    key={bearer.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-brand-dark rounded-3xl p-8 text-white flex flex-col items-center text-center space-y-4 hover:shadow-2xl hover:shadow-brand-dark/20 transition-all"
                  >
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-white/20 overflow-hidden shadow-inner">
                      {bearer.photoUrl ? (
                        <img src={bearer.photoUrl} alt={bearer.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={40} />
                      )}
                    </div>
                    <div>
                      <div className="text-brand-blue font-extrabold text-[10px] uppercase tracking-widest mb-1">{bearer.designation}</div>
                      <div className="text-xl font-extrabold leading-tight">{bearer.name}</div>
                      {(bearer.mobile || bearer.company) && (
                        <div className="mt-3 pt-3 border-t border-white/10 flex flex-col space-y-1">
                          {bearer.mobile && <div className="text-[11px] font-medium text-gray-400">Ph: {bearer.mobile}</div>}
                          {bearer.company && <div className="text-[11px] font-semibold text-brand-blue">{bearer.company}</div>}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )) : (
                  <p className="col-span-full text-center text-muted-foreground italic">No state bearers listed yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
