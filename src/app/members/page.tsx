"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Search, User, Building2, MapPin, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getMembers } from "@/lib/actions/members";

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const result = await getMembers();
      if (result.success) {
        setMembers(shuffleArray(result.data || []));
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredMembers = members.filter(m =>
    m.memberDetails?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    m.memberDetails?.company?.toLowerCase().includes(search.toLowerCase()) ||
    m.memberDetails?.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="bg-mesh min-h-screen">
      <Navbar />

      <header className="pt-32 pb-16 text-center container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">Member Directory</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Connect with professional civil engineers and construction experts across Theni District.
          </p>
        </motion.div>

        <div className="relative max-w-md mx-auto mt-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search by name, company, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-border rounded-2xl shadow-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all"
          />
        </div>
      </header>

      <section className="pb-24 container mx-auto px-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-brand-blue mb-4" size={40} />
            <p className="text-muted-foreground font-medium">Loading members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-border shadow-sm max-w-md mx-auto">
            <User className="mx-auto text-brand-blue mb-4" size={48} />
            <h3 className="text-xl font-bold text-foreground mb-2">No Members Found</h3>
            <p className="text-muted-foreground">No members match your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredMembers.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="bg-white rounded-3xl p-6 shadow-sm border border-border flex flex-col items-center text-center space-y-4 hover:shadow-xl hover:shadow-brand-blue/5 transition-all group"
              >
                <div className="w-24 h-24 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue group-hover:scale-110 transition-transform overflow-hidden shadow-inner">
                  {member.memberDetails?.photoUrl ? (
                    <img src={member.memberDetails.photoUrl} alt={member.memberDetails.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} />
                  )}
                </div>
                <div className="w-full">
                  <div className="text-foreground font-extrabold text-lg leading-tight">
                    {member.memberDetails?.fullName || "Unknown"}
                  </div>
                  <div className="text-[11px] text-brand-blue font-bold uppercase tracking-widest mt-1">
                    {member.memberDetails?.designation || "Member"}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col space-y-1.5">
                    {member.memberDetails?.company && (
                      <div className="flex items-center justify-center space-x-1.5 text-muted-foreground">
                        <Building2 size={12} className="text-brand-blue shrink-0" />
                        <span className="text-[11px] font-semibold truncate">{member.memberDetails.company}</span>
                      </div>
                    )}
                    {member.memberDetails?.location && (
                      <div className="flex items-center justify-center space-x-1.5 text-muted-foreground">
                        <MapPin size={12} className="text-brand-blue shrink-0" />
                        <span className="text-[11px] font-semibold truncate">{member.memberDetails.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Link
                  href={`/members/${member.slug || member.id}`}
                  className="w-full mt-2 inline-flex items-center justify-center space-x-2 text-brand-blue font-bold text-xs hover:bg-brand-blue/5 px-4 py-2.5 rounded-xl transition-colors"
                >
                  <span>View Portfolio</span>
                  <ExternalLink size={14} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
