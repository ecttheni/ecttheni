"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Calendar, MapPin, Loader2, Info, ArrowRight } from "lucide-react";
import { getEvents, checkBooking } from "@/lib/actions/events";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    async function fetchEvents() {
      const result = await getEvents();
      if (result.success) {
        const eventsWithStatus = await Promise.all(
          (result.data || []).map(async (event: any) => {
            if (session?.user?.id) {
              const bookingResult = await checkBooking(event.id, session.user.id);
              return {
                ...event,
                isBooked: bookingResult?.booked || false
              };
            }
            return {
              ...event,
              isBooked: false
            };
          })
        );
        setEvents(eventsWithStatus);
      }
      setLoading(false);
    }
    fetchEvents();
  }, [session]);

  return (
    <main className="bg-mesh min-h-screen">
      <Navbar />
      
      <header className="pt-32 pb-16 text-center container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">Events & Meetings</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stay updated with our technical seminars, monthly meetings, and social gatherings.
          </p>
        </motion.div>
      </header>

      <section className="py-16 container mx-auto px-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-brand-blue mb-4" size={40} />
            <p className="text-muted-foreground font-medium">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-border shadow-sm max-w-md mx-auto">
            <Info className="mx-auto text-brand-blue mb-4" size={48} />
            <h3 className="text-xl font-bold text-foreground mb-2">No Upcoming Events</h3>
            <p className="text-muted-foreground">Check back later for announcements about meetings and seminars.</p>
          </div>
        ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm border border-border group"
                >
                  <div className="h-48 bg-gray-100 relative flex items-center justify-center overflow-hidden">
                    {event.imageUrl ? (
                      <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                      <Calendar size={48} className="text-brand-blue/10" />
                    )}
                    <div className="absolute top-4 left-4 bg-brand-blue text-white px-3 py-1 rounded-lg text-xs font-bold uppercase">
                      {format(new Date(event.date), "MMM dd, yyyy")}
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-brand-blue transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground space-x-4">
                      <div className="flex items-center space-x-1">
                        <MapPin size={14} />
                        <span>{event.location || "Theni Center Hall"}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{format(new Date(event.date), "p")}</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-border mt-4">
                      <Link href={`/events/${event.id}`}>
                        <Button variant="outline" className="w-full" rightIcon={<ArrowRight size={16} />}>
                          View Event & Book
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
           )}
         </section>

      <Footer />
    </main>
  );
}
