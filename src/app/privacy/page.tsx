import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPage() {
  return (
    <main className="bg-mesh min-h-screen">
      <Navbar />
      <div className="pt-32 pb-24 container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-extrabold text-foreground mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-10">Last updated: May 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-muted-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-dark">1. Information We Collect</h2>
            <p>We collect information that you provide directly to us when you register as a member, including your name, email address, company name, designation, and professional details. We use this information solely to operate and improve the Engineers Club Tamilnadu - Theni Center member portal.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-dark">2. How We Use Your Information</h2>
            <p>Your information is used to maintain your member profile, send notifications about club events, communicate important updates, and display your professional profile in our member directory (visible only to other authenticated members).</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-dark">3. Data Sharing</h2>
            <p>We do not sell, rent, or trade your personal information to third parties. Member directory information is visible only to authenticated club members. Administrative users may access member data for club management purposes.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-dark">4. Data Security</h2>
            <p>We implement industry-standard security measures including password hashing and encrypted connections to protect your personal data. However, no internet transmission is completely secure and we cannot guarantee absolute security.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-dark">5. Your Rights</h2>
            <p>You have the right to access, update, or request deletion of your personal information. Contact us at info@ecttheni.com to exercise these rights.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-dark">6. Contact</h2>
            <p>For any privacy-related questions, please contact us at <a href="mailto:info@ecttheni.com" className="text-brand-blue hover:underline">info@ecttheni.com</a>.</p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
