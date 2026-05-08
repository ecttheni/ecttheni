"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, Loader2, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface GalleryPhoto {
  id: string;
  imageUrl: string;
  caption: string | null;
  eventId: string | null;
}

interface Group {
  type: "event" | "caption" | "uncategorized";
  id: string;
  title: string;
  thumbnail: string | null;
  photos: GalleryPhoto[];
  googleAlbumUrl?: string | null;
}

export default function GalleryPage() {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [lightbox, setLightbox] = useState<GalleryPhoto | null>(null);

  useEffect(() => {
    fetch("/api/gallery?grouped=true")
      .then((res) => res.json())
      .then((data) => {
        setGroups(Array.isArray(data.groups) ? data.groups : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="bg-mesh min-h-screen">
      <Navbar />

      <header className="pt-32 pb-16 text-center container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 max-w-2xl mx-auto"
        >
          {selectedGroup ? (
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setSelectedGroup(null)}
                className="p-2 bg-white border border-border rounded-xl hover:bg-gray-50 transition-all"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">{selectedGroup.title}</h1>
                <p className="text-muted-foreground mt-1">{selectedGroup.photos.length} photo{selectedGroup.photos.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">Photo Gallery</h1>
              <p className="text-muted-foreground">
                A collection of memories from our events, seminars, and community gatherings.
              </p>
            </>
          )}
        </motion.div>
      </header>

      <section className="pb-24 container mx-auto px-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-brand-blue" size={40} />
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-border p-20 text-center space-y-4 max-w-md mx-auto">
            <ImageIcon size={48} className="text-muted-foreground mx-auto" />
            <p className="text-muted-foreground font-medium">No photos have been added yet.</p>
            <p className="text-xs text-muted-foreground">Check back after our next event!</p>
          </div>
        ) : selectedGroup ? (
          <>
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {selectedGroup.photos.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setLightbox(item)}
                  className="break-inside-avoid rounded-2xl overflow-hidden cursor-pointer group border border-border shadow-sm hover:shadow-xl hover:shadow-brand-blue/10 transition-all"
                >
                  <div className="relative">
                    <img
                      src={item.imageUrl}
                      alt={item.caption || "Gallery photo"}
                      className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/400x300/e2e8f0/94a3b8?text=Photo";
                      }}
                    />
                    {item.caption && (
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-brand-dark/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs font-medium">{item.caption}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {selectedGroup.googleAlbumUrl && (
              <div className="flex justify-center mt-12">
                <Link
                  href={selectedGroup.googleAlbumUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-8 py-4 bg-brand-blue text-white rounded-2xl font-bold text-lg hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20"
                >
                  <span>View More Photos</span>
                  <ExternalLink size={20} />
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => {
              const thumb = group.thumbnail;
              return (
                <motion.button
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -6 }}
                  onClick={() => setSelectedGroup(group)}
                  className="text-left w-full bg-white rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:shadow-brand-blue/10 transition-all group"
                >
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={group.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/640x360/e2e8f0/94a3b8?text=Group";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={48} className="text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg leading-tight">{group.title}</h3>
                      <p className="text-white/80 text-xs mt-1">{group.photos.length} photo{group.photos.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[70] bg-brand-dark/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="max-w-4xl w-full space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightbox.imageUrl}
                alt={lightbox.caption || ""}
                className="w-full rounded-3xl object-contain max-h-[75vh]"
              />
              {lightbox.caption && (
                <p className="text-white text-center text-sm font-medium">{lightbox.caption}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
