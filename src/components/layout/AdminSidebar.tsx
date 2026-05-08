"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Image as ImageIcon, 
  Calendar, 
  Settings, 
  LogOut,
  ShieldCheck,
  ChevronRight,
  Handshake,
  MessageSquare,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const menuItems = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Manage Members", href: "/admin/members", icon: Users },
  { name: "Office Bearers", href: "/admin/bearers", icon: ShieldCheck },
  { name: "Admins", href: "/admin/admins", icon: Shield },
  { name: "Events & Meetings", href: "/admin/events", icon: Calendar },
  { name: "Sponsors", href: "/admin/sponsors", icon: Handshake },
  { name: "Gallery Content", href: "/admin/gallery", icon: ImageIcon },
  { name: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-brand-dark min-h-screen text-white flex flex-col fixed left-0 top-0 z-50">
      <div className="p-8">
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-blue/30">
            E
          </div>
          <div>
            <span className="text-lg font-bold leading-none block">ADMIN</span>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-medium">
              ECT THENI CENTER
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group",
              pathname === item.href 
                ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" 
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <div className="flex items-center space-x-3">
              <item.icon size={20} />
              <span className="font-semibold text-sm">{item.name}</span>
            </div>
            {pathname === item.href && <ChevronRight size={16} />}
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5">
        <button
          onClick={() => signOut()}
          className="flex items-center space-x-3 w-full px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
        >
          <LogOut size={20} />
          <span className="font-semibold text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};
