"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Bearers", href: "/bearers" },
  { name: "Members", href: "/members" },
  { name: "Events", href: "/events" },
  { name: "Gallery", href: "/gallery" },
  { name: "Contact", href: "/contact" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    async function fetchLogo() {
      const { getPageContent } = await import("@/lib/actions/content");
      const res = await getPageContent("site_logo");
      if (res.success && res.data?.imageUrl) {
        setLogoUrl(res.data.imageUrl);
      }
    }
    fetchLogo();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-white/80 dark:bg-brand-dark/80 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
            ) : (
              <div className="w-10 h-10 bg-brand-blue rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-blue/30">
                E
              </div>
            )}
            <div className="hidden md:block">
              <span className={cn(
                "text-lg font-bold leading-none block transition-colors",
                "text-brand-dark"
              )}>
                ECT THENI
              </span>
              <span className={cn(
                "text-[10px] uppercase tracking-wider block font-medium transition-colors",
                "text-muted-foreground"
              )}>
                Engineers Club Tamilnadu
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname === link.href 
                    ? "text-brand-blue" 
                    : "text-muted-foreground hover:text-brand-blue"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                <Link
                  href={session.user.role === "ADMIN" ? "/admin" : "/dashboard"}
                  className="hidden md:flex items-center space-x-2 text-sm font-medium bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-full hover:bg-brand-blue/20 transition-all"
                >
                  {session.user.role === "ADMIN" ? <LayoutDashboard size={16} /> : <User size={16} />}
                  <span>{session.user.role === "ADMIN" ? "Dashboard" : "My Profile"}</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-brand-blue text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-blue/90 transition-all shadow-md shadow-brand-blue/20"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className={cn(
                "md:hidden p-2 transition-colors text-brand-dark"
              )}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-brand-dark border-t border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "text-lg font-medium py-2",
                    pathname === link.href ? "text-brand-blue" : "text-muted-foreground"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-border">
                {session ? (
                  <Link
                    href={session.user.role === "ADMIN" ? "/admin" : "/dashboard"}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 text-brand-blue font-semibold"
                  >
                    <User size={20} />
                    <span>{session.user.role === "ADMIN" ? "Admin Dashboard" : "My Profile"}</span>
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="block text-center bg-brand-blue text-white py-3 rounded-xl font-bold"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
