"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import {
  User, Building2, MapPin, Briefcase, ArrowLeft,
  Mail, Phone, Loader2, FolderOpen, Image as ImageIcon, ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { getMemberBySlug } from "@/lib/actions/members";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";

export default function MemberProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { data: session } = useSession();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getMemberBySlug(slug).then((result) => {
      if (result.success && result.data) {
        setMember(result.data);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <main className="bg-mesh min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="animate-spin text-brand-blue" size={48} />
        </div>
      </main>
    );
  }

  if (notFound || !member) {
    return (
      <main className="bg-mesh min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4 text-center px-4">
          <User size={64} className="text-muted-foreground" />
          <h1 className="text-2xl font-bold text-foreground">Member Not Found</h1>
          <p className="text-muted-foreground">This member profile does not exist or has been removed.</p>
          <Link href="/members" className="text-brand-blue font-semibold hover:underline">← Back to Directory</Link>
        </div>
      </main>
    );
  }

  const details = member.memberDetails;

  return (
    <main className="bg-mesh min-h-screen">
      <Navbar />

      <div className="pt-32 pb-24 container mx-auto px-4 max-w-5xl">
        {/* Back link */}
        <Link
          href="/members"
          className="inline-flex items-center space-x-2 text-muted-foreground hover:text-brand-blue transition-colors font-medium mb-8 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Directory</span>
        </Link>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border border-border shadow-sm overflow-hidden mb-8"
        >
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-brand-blue to-blue-600" />

          <div className="px-10 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-12 mb-8">
              <div className="w-24 h-24 bg-white border-4 border-white rounded-full shadow-lg flex items-center justify-center text-brand-blue font-bold text-3xl overflow-hidden">
                {details?.photoUrl ? (
                  <img src={details.photoUrl} alt={details.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span>{details?.fullName?.charAt(0) || "?"}</span>
                )}
              </div>
              <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-xs font-bold">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span>{member.status}</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h1 className="text-3xl font-extrabold text-foreground">{details?.fullName || "Unknown"}</h1>
                <p className="text-brand-blue font-semibold">{details?.designation || "Member"}</p>
                <div className="space-y-2 text-muted-foreground text-sm">
                  {details?.company && (
                    <div className="flex items-center space-x-2">
                      <Building2 size={16} className="text-brand-blue shrink-0" />
                      <span>{details.company}</span>
                    </div>
                  )}
                  {details?.companyAddress && (
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} className="text-brand-blue shrink-0" />
                      <span>{details.companyAddress}</span>
                    </div>
                  )}
                  {details?.mobile && (
                    <div className="flex items-center space-x-2">
                      <Phone size={16} className="text-brand-blue shrink-0" />
                      <span>{details.mobile}</span>
                    </div>
                  )}
                  {details?.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} className="text-brand-blue shrink-0" />
                      <span>{details.location}</span>
                    </div>
                  )}
                  {member.email && session && (
                    <div className="flex items-center space-x-2">
                      <Mail size={16} className="text-brand-blue shrink-0" />
                      <span>{member.email}</span>
                    </div>
                  )}
                  {member.email && !session && (
                    <div className="flex items-center space-x-2 text-muted-foreground italic text-xs">
                      <Mail size={16} className="shrink-0" />
                      <span>Login to view email</span>
                    </div>
                  )}
                  {details?.experience && (
                    <div className="flex items-center space-x-2">
                      <Briefcase size={16} className="text-brand-blue shrink-0" />
                      <span>{details.experience} experience</span>
                    </div>
                  )}
                  {details?.workingPlaces && (
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} className="text-brand-blue shrink-0" />
                      <span>Works in: {details.workingPlaces}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {member.entryYear && (
                  <div className="bg-gray-50 rounded-2xl p-4 border border-border">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Member Since</div>
                    <div className="text-2xl font-bold text-foreground">{member.entryYear}</div>
                  </div>
                )}
                {details?.additionalBusiness && (
                  <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">Additional Business</div>
                    <div className="text-sm font-semibold text-amber-900">{details.additionalBusiness}</div>
                  </div>
                )}
                {details?.requirements && (
                  <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                    <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">Requirements</div>
                    <div className="text-sm font-semibold text-blue-900">{details.requirements}</div>
                  </div>
                )}
                {(details?.instagramUrl || details?.facebookUrl) && (
                  <div className="bg-white rounded-2xl p-4 border border-border space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Social Media</div>
                    <div className="flex flex-col space-y-1.5">
                      {details?.instagramUrl && (
                        <a href={details.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 text-sm font-semibold text-pink-600 hover:underline">
                          <span>Instagram</span>
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {details?.facebookUrl && (
                        <a href={details.facebookUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 text-sm font-semibold text-blue-600 hover:underline">
                          <span>Facebook</span>
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* About */}
            {details?.aboutUs && (
              <div className="mt-8 pt-8 border-t border-border">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">About</h2>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{details.aboutUs}</p>
              </div>
            )}

            {/* Personal */}
            <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-4">
              {details?.dateOfBirth && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date of Birth</div>
                  <div className="text-sm font-semibold text-foreground mt-1">{format(new Date(details.dateOfBirth), "PPP")}</div>
                </div>
              )}
              {details?.dateOfAnniversary && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Anniversary</div>
                  <div className="text-sm font-semibold text-foreground mt-1">{format(new Date(details.dateOfAnniversary), "PPP")}</div>
                </div>
              )}
            </div>

            {/* Skills */}
            {details?.skills && (
              <div className="mt-6 pt-6 border-t border-border">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Skills & Expertise</h2>
                <div className="flex flex-wrap gap-2">
                  {details.skills.split(",").map((skill: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-brand-blue/10 text-brand-blue rounded-full text-xs font-semibold">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Projects */}
        {details?.projects && details.projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[2.5rem] border border-border shadow-sm p-10 mb-8"
          >
            <div className="flex items-center space-x-3 mb-8">
              <FolderOpen className="text-brand-blue" size={24} />
              <h2 className="text-xl font-bold text-foreground">Projects</h2>
            </div>
             <div className="grid md:grid-cols-2 gap-4">
               {details.projects.slice(0, 4).map((project: any) => (
                 <div key={project.id} className="bg-gray-50 rounded-2xl p-5 border border-border">
                   {project.photoUrl && (
                     <img
                       src={project.photoUrl}
                       alt={project.name}
                       className="w-full h-32 object-cover rounded-xl mb-3"
                     />
                   )}
                   <h3 className="font-bold text-foreground">{project.name}</h3>
                   {project.description && (
                     <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{project.description}</p>
                   )}
                 </div>
               ))}
             </div>
          </motion.div>
        )}

         {/* Gallery */}
         {details?.gallery && details.gallery.length > 0 && (
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="bg-white rounded-[2.5rem] border border-border shadow-sm p-10"
           >
             <div className="flex items-center space-x-3 mb-8">
               <ImageIcon className="text-brand-blue" size={24} />
               <h2 className="text-xl font-bold text-foreground">Gallery</h2>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               {details.gallery.slice(0, 6).map((img: any) => (
                 <div key={img.id} className="aspect-square rounded-2xl overflow-hidden border border-border">
                   <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                 </div>
               ))}
             </div>
           </motion.div>
         )}
      </div>

      <Footer />
    </main>
  );
}
