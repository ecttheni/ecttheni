"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

// Social media icons as simple SVGs to avoid lucide version dependency
const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const Footer = () => {
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

  return (
    <footer className="bg-brand-dark text-white pt-20 pb-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-2">
              {settings["site_logo"]?.imageUrl ? (
                <img src={settings["site_logo"].imageUrl} alt="Logo" className="h-10 w-auto object-contain" />
              ) : (
                <div className="w-10 h-10 bg-brand-blue rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  E
                </div>
              )}
              <div>
                <span className="text-lg font-bold leading-none block">ECT THENI</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-medium">
                  Engineers Club Tamilnadu
                </span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering civil engineers in Theni District through networking, professional development, and community support.
            </p>
            <div className="flex items-center space-x-4">
              <Link href={getVal("social_facebook", "https://facebook.com")} target="_blank" className="p-2 bg-gray-800 rounded-lg hover:bg-brand-blue transition-colors">
                <FacebookIcon />
              </Link>
              <Link href={getVal("social_instagram", "https://instagram.com")} target="_blank" className="p-2 bg-gray-800 rounded-lg hover:bg-brand-blue transition-colors">
                <InstagramIcon />
              </Link>
              <Link href={getVal("social_twitter", "https://twitter.com")} target="_blank" className="p-2 bg-gray-800 rounded-lg hover:bg-brand-blue transition-colors">
                <TwitterIcon />
              </Link>
              <Link href="#" target="_blank" className="p-2 bg-gray-800 rounded-lg hover:bg-brand-blue transition-colors">
                <LinkedinIcon />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-4 text-gray-400 text-sm">
              {[
                { label: "About Us", href: "/about" },
                { label: "Office Bearers", href: "/bearers" },
                { label: "Member Directory", href: "/members" },
                { label: "Events & Meetings", href: "/events" },
                { label: "Photo Gallery", href: "/gallery" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-brand-blue transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">Support</h3>
            <ul className="space-y-4 text-gray-400 text-sm">
              {[
                { label: "Contact Support", href: "/contact" },
                { label: "Member Login", href: "/login" },
                { label: "Member Dashboard", href: "/dashboard" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-brand-blue transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">Contact Us</h3>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-brand-blue shrink-0 mt-0.5" />
                <span className="whitespace-pre-wrap">{getVal("contact_address", "Engineers Club Theni Center, Civil Engineers Building, Theni, Tamil Nadu — 625 531.")}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-brand-blue shrink-0" />
                <span>{getVal("contact_phone", "+91 98765 43210")}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-brand-blue shrink-0" />
                <span>{getVal("contact_email", "info@ecttheni.com")}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-gray-800 text-center text-gray-400 text-xs">
          <p>{getVal("footer_text", `© ${new Date().getFullYear()} Engineers Club Tamilnadu - Theni Center. All Rights Reserved.`)}</p>
          <p className="mt-2">Designed and developed for Civil Engineers.</p>
        </div>
      </div>
    </footer>
  );
};
