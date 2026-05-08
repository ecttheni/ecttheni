import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TermsPage() {
  return (
    <main className="bg-mesh min-h-screen">
      <Navbar />
      <div className="pt-32 pb-24 container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-extrabold text-foreground mb-4">Terms of Service</h1>
        <p className="text-muted-foreground text-sm mb-10">Last updated: May 2026</p>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-dark">1. Acceptance of Terms</h2>
            <p>By accessing and using the Engineers Club Tamilnadu - Theni Center (ECT Theni) web portal, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use this portal.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-dark">2. Membership Eligibility</h2>
            <p>Membership in ECT Theni is open to qualified civil engineers and related professionals in the Theni District. All membership applications are subject to approval by the club administration. The club reserves the right to refuse or revoke membership.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-dark">3. Member Responsibilities</h2>
            <p>Members agree to: (a) provide accurate and truthful information in their profile; (b) maintain confidentiality of their login credentials; (c) use the portal only for legitimate professional networking purposes; (d) not share member directory information with non-members; and (e) conduct themselves professionally in all club interactions.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-dark">4. Intellectual Property</h2>
            <p>All content on this portal, including text, graphics, logos, and software, is the property of ECT Theni. Members may not reproduce, distribute, or create derivative works without prior written permission.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-dark">5. Limitation of Liability</h2>
            <p>ECT Theni shall not be liable for any indirect, incidental, or consequential damages arising from your use of this portal. The portal is provided "as is" without warranties of any kind.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-dark">6. Governing Law</h2>
            <p>These terms are governed by the laws of India. Any disputes shall be resolved in the courts of Theni District, Tamil Nadu.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-dark">7. Changes to Terms</h2>
            <p>ECT Theni reserves the right to modify these terms at any time. Continued use of the portal after changes constitutes acceptance of the new terms.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-dark">8. Contact</h2>
            <p>Questions about these terms can be sent to <a href="mailto:info@ecttheni.com" className="text-brand-blue hover:underline">info@ecttheni.com</a>.</p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
