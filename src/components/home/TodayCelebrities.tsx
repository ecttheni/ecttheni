"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gift, Heart, Users, Phone, MapPin, Building2, Cake, PartyPopper } from "lucide-react";
import Link from "next/link";

type Celebrity = {
  id: string;
  fullName: string;
  mobile: string | null;
  company: string | null;
  location: string | null;
  photoUrl: string | null;
  slug: string | null;
};

export default function TodayCelebrities() {
  const [birthdays, setBirthdays] = useState<Celebrity[]>([]);
  const [marriages, setMarriages] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"birthday" | "married">("birthday");

  useEffect(() => {
    fetch("/api/today-celebrities")
      .then((res) => res.json())
      .then((data) => {
        setBirthdays(data.birthdays || []);
        setMarriages(data.marriages || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total = birthdays.length + marriages.length;
  if (!loading && total === 0) return null;

  const activeList = tab === "birthday" ? birthdays : marriages;

  const maskPhone = (phone: string) => {
    if (phone.length >= 10) {
      return phone.slice(0, 5) + "XXXXX";
    }
    return phone;
  };

  return (
    <section className="py-24 bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-[2.5rem] border border-border shadow-lg overflow-hidden"
        >
          <div className="p-10 pb-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  <PartyPopper size={14} />
                  <span>Today Celebrities</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">
                  The Best Gifts come from the heart...
                </h2>
                <p className="text-muted-foreground">
                  Celebrate our special members celebrating today
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setTab("birthday")}
                  className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    tab === "birthday"
                      ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20"
                      : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
                  }`}
                >
                  <Cake size={16} />
                  <span>Birthday Celebrities</span>
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    tab === "birthday" ? "bg-white/20" : "bg-gray-200"
                  }`}>{birthdays.length}</span>
                </button>
                <button
                  onClick={() => setTab("married")}
                  className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    tab === "married"
                      ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20"
                      : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
                  }`}
                >
                  <Heart size={16} />
                  <span>Married Celebrities</span>
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    tab === "married" ? "bg-white/20" : "bg-gray-200"
                  }`}>{marriages.length}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-10">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
              </div>
            ) : activeList.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Users size={48} className="mx-auto text-muted-foreground/40" />
                <p className="text-muted-foreground font-medium">
                  No {tab === "birthday" ? "birthday" : "anniversary"} celebrations today
                </p>
                <p className="text-sm text-muted-foreground/60">Check back tomorrow!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {activeList.map((member, i) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="group relative bg-gray-50 rounded-2xl border border-border overflow-hidden hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300"
                  >
                    {member.mobile && (
                      <div className={`absolute top-3 left-3 z-10 inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white ${
                        tab === "birthday" ? "bg-brand-blue/90" : "bg-pink-500/90"
                      }`}>
                        <Phone size={10} />
                        <span>{maskPhone(member.mobile)}</span>
                      </div>
                    )}

                    <Link href={`/members/${member.slug || member.id}`} className="block">
                      <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={member.fullName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-white/80 rounded-full flex items-center justify-center">
                            <span className="text-3xl font-bold text-muted-foreground">
                              {member.fullName?.charAt(0) || "?"}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-5 space-y-2">
                        <h3 className="font-extrabold text-foreground text-base leading-tight group-hover:text-brand-blue transition-colors">
                          {member.fullName}
                        </h3>
                        {member.company && (
                          <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
                            <Building2 size={12} className="shrink-0" />
                            <span className="truncate">{member.company}</span>
                          </div>
                        )}
                        {member.location && (
                          <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
                            <MapPin size={12} className="shrink-0" />
                            <span>{member.location}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
