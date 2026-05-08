"use client";

import React, { useState, useEffect } from "react";
import { Users, UserPlus, ShieldCheck, Calendar, ArrowUpRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { getDashboardStats } from "@/lib/actions/dashboard";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const result = await getDashboardStats();
      if (result.success && result.data) {
        const s = result.data;
        setStats([
          { label: "Total Members", value: s.totalMembers.toString(), icon: Users, color: "bg-blue-500", href: "/admin/members" },
          { label: "Active Bearers", value: s.totalBearers.toString(), icon: ShieldCheck, color: "bg-emerald-500", href: "/admin/bearers" },
          { label: "Upcoming Events", value: s.upcomingEvents.toString(), icon: Calendar, color: "bg-amber-500", href: "/admin/events" },
          { label: "New Applications", value: s.newApplications.toString(), icon: UserPlus, color: "bg-purple-500", href: "/admin/applications" },
        ]);
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-extrabold text-brand-dark">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back, Admin. Here's what's happening today.</p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-brand-blue" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-3xl border border-border shadow-sm flex items-center space-x-4"
            >
              <div className={`p-4 ${stat.color} rounded-2xl text-white`}>
                <stat.icon size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-brand-dark">{stat.value}</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-border shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-brand-dark">Recent Activity</h2>
            <button className="text-sm font-bold text-brand-blue hover:underline flex items-center space-x-1">
              <span>View All</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground italic">Integration with activity logs coming soon...</p>
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center space-x-4 opacity-50">
                <div className="w-10 h-10 bg-gray-100 rounded-full" />
                <div className="flex-1">
                  <div className="text-sm font-bold text-brand-dark">Member activity placeholder</div>
                  <div className="text-xs text-muted-foreground">---</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-border shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-brand-dark">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/admin/members" className="p-6 bg-brand-blue/5 border border-brand-blue/10 rounded-2xl text-left hover:bg-brand-blue/10 transition-all group">
              <UserPlus className="text-brand-blue mb-3" size={24} />
              <div className="font-bold text-brand-dark">Add New Member</div>
              <div className="text-xs text-muted-foreground">Register a new civil engineer</div>
            </Link>
            <Link href="/admin/events" className="p-6 bg-brand-dark/5 border border-brand-dark/10 rounded-2xl text-left hover:bg-brand-dark/10 transition-all group">
              <Calendar className="text-brand-dark mb-3" size={24} />
              <div className="font-bold text-brand-dark">Post New Event</div>
              <div className="text-xs text-muted-foreground">Announce a technical seminar</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
