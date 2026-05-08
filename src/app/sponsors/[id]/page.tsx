import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Globe, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function SponsorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sponsor = await prisma.sponsor.findUnique({
    where: { id }
  });

  if (!sponsor) {
    notFound();
  }

  return (
    <main className="bg-mesh min-h-screen">
      <Navbar />
      
      <div className="pt-32 pb-24 container mx-auto px-4">
        <Link href="/" className="inline-flex items-center space-x-2 text-muted-foreground hover:text-brand-blue mb-8 transition-colors font-semibold">
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </Link>
        
        <div className="bg-white rounded-[2.5rem] border border-border shadow-sm p-10 md:p-16 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/3 flex justify-center">
              {sponsor.logoUrl ? (
                <div className="p-8 bg-gray-50 border border-border rounded-3xl w-full flex items-center justify-center">
                  <img src={sponsor.logoUrl} alt={sponsor.name} className="w-full h-auto object-contain" />
                </div>
              ) : (
                <div className="w-48 h-48 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue font-bold text-3xl">
                  {sponsor.name.charAt(0)}
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-6 text-center md:text-left">
              <div className="inline-block px-3 py-1 bg-brand-blue/10 text-brand-blue text-xs font-bold uppercase tracking-wider rounded-lg">
                Official Sponsor
              </div>
              <h1 className="text-4xl font-extrabold text-brand-dark">{sponsor.name}</h1>
              
              {sponsor.description && (
                <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {sponsor.description}
                </p>
              )}
              
              {sponsor.websiteUrl && (
                <div className="pt-6">
                  <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" rightIcon={<ExternalLink size={18} />}>
                      Visit Website
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
