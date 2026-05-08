"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { ArrowRight, Users, Calendar, Award, Building2, MapPin, Mail, Phone, Loader2, Handshake, PartyPopper, Globe } from "lucide-react";
import Link from "next/link";
import { getAllSettings } from "@/lib/actions/content";
import { getEvents } from "@/lib/actions/events";
import { format } from "date-fns";
import { sanitizeHTML } from "@/lib/sanitize";
import TodayCelebrities from "@/components/home/TodayCelebrities";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function Home() {
  const [settings, setSettings] = useState<any>({});
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { getSponsors } = await import("@/lib/actions/sponsors");
      const [settingsRes, evts, sponsorsRes] = await Promise.all([
        getAllSettings(),
        getEvents(),
        getSponsors()
      ]);
      
      if (settingsRes.success && settingsRes.data) {
        setSettings(settingsRes.data);
      }
      if (evts.success) setRecentEvents(evts.data?.slice(0, 3) || []);
      if (sponsorsRes.success && sponsorsRes.data) setSponsors(sponsorsRes.data);
      
      setLoading(false);
    }
    fetchData();
  }, []);

  const getVal = (key: string, fallback: string) => settings[key]?.content || fallback;
  const getImg = (key: string) => settings[key]?.imageUrl || null;

  return (
    <main className="relative">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              {...fadeInUp}
              className="inline-flex items-center space-x-2 bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider"
            >
              <Award size={14} />
              <span>Engineers Club Tamilnadu - Theni Center</span>
            </motion.div>
            
            <motion.h1
              {...fadeInUp}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-7xl font-extrabold text-foreground leading-tight"
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(getVal("hero_title", "Building the Future of <br /><span class='text-brand-blue'>Civil Engineering</span> in Theni")) }}
            />
            
            <motion.p
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              {getVal("hero_subtitle", "A premier professional organization dedicated to the growth, networking, and support of Civil Engineers in Theni District.")}
            </motion.p>
            
            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4"
            >
              <Link href="/register">
                <Button size="lg" rightIcon={<ArrowRight size={20} />}>
                  Join the Club
                </Button>
              </Link>
              <Link href="/members">
                <Button variant="outline" size="lg">
                  Explore Directory
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -z-10 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-0 -z-10 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl" />
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white/50 backdrop-blur-sm border-y border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: "Registered Members", value: "65+", icon: Users },
              { label: "Sponsored Meetings", value: "12+", icon: Handshake },
              { label: "Social Events", value: "3+", icon: PartyPopper },
              { label: "State Level Members", value: "550+", icon: Globe },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-2">
                <div className="p-3 bg-brand-blue/10 rounded-2xl text-brand-blue mb-2">
                  <stat.icon size={24} />
                </div>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs uppercase tracking-widest text-foreground/80 font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TodayCelebrities />

      {/* Welcome & Messages */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark">Leadership Messages</h2>
            <div className="w-20 h-1.5 bg-brand-blue rounded-full mx-auto mt-4" />
          </div>
          <div className="grid lg:grid-cols-3 gap-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-3xl p-8 border border-border"
            >
              <div className="w-16 h-16 bg-brand-blue/10 rounded-full overflow-hidden border-2 border-brand-blue/20 flex items-center justify-center mx-auto mb-6">
                {getImg("state_president_message") ? (
                  <img src={getImg("state_president_message")} alt="State President" className="w-full h-full object-cover" />
                ) : (
                  <Users size={32} className="text-gray-400" />
                )}
              </div>
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-brand-dark">{getVal("state_president_name", "Er. [Name]")}</h3>
                  <div className="text-brand-blue font-medium text-sm mt-1">State President, ECT Tamilnadu</div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed italic">
                  "{getVal("state_president_message", "I am proud to represent our civil engineering community at the state level. Our Theni Center continues to be a beacon of professional excellence and collaboration.")}"
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gray-50 rounded-3xl p-8 border border-border"
            >
              <div className="w-16 h-16 bg-brand-blue/10 rounded-full overflow-hidden border-2 border-brand-blue/20 flex items-center justify-center mx-auto mb-6">
                {getImg("president_message") ? (
                  <img src={getImg("president_message")} alt="President" className="w-full h-full object-cover" />
                ) : (
                  <Users size={32} className="text-gray-400" />
                )}
              </div>
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-brand-dark">{getVal("president_name", "Er. [Name]")}</h3>
                  <div className="text-brand-blue font-medium text-sm mt-1">President, ECT Theni</div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed italic">
                  "{getVal("president_message", "As the President of ECT Theni Center, it is my honor to welcome you to our professional community. We are committed to fostering excellence in civil engineering and supporting our members in their professional journey.")}"
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gray-50 rounded-3xl p-8 border border-border"
            >
              <div className="w-16 h-16 bg-brand-blue/10 rounded-full overflow-hidden border-2 border-brand-blue/20 flex items-center justify-center mx-auto mb-6">
                {getImg("secretary_message") ? (
                  <img src={getImg("secretary_message")} alt="Secretary" className="w-full h-full object-cover" />
                ) : (
                  <Users size={32} className="text-gray-400" />
                )}
              </div>
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-brand-dark">{getVal("secretary_name", "Er. [Name]")}</h3>
                  <div className="text-brand-blue font-medium text-sm mt-1">Secretary, ECT Theni</div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed italic">
                  "{getVal("secretary_message", "Our center serves as a hub for knowledge sharing and collaboration. We encourage all members to actively participate in our events and utilize the resources available through our directory.")}"
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-24 bg-brand-light">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-dark">Upcoming Events</h2>
              <p className="text-muted-foreground max-w-xl">
                Stay updated with our technical seminars, monthly meetings, and social gatherings.
              </p>
            </div>
            <Link href="/events">
              <Button variant="outline">View All Events</Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-3 flex justify-center py-20">
                <Loader2 className="animate-spin text-brand-blue" size={40} />
              </div>
            ) : recentEvents.length === 0 ? (
              <p className="col-span-3 text-center text-muted-foreground italic">No upcoming events at the moment.</p>
            ) : (
              recentEvents.map((event) => (
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
                        <span>Theni Center Hall</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{format(new Date(event.date), "p")}</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-border mt-4">
                      <Link href={`/events/${event.id}`}>
                        <Button variant="outline" className="w-full" rightIcon={<ArrowRight size={16} />}>
                          View Details & Book
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      {sponsors.length > 0 && (
        <section className="py-20 bg-white border-y border-border overflow-hidden">
          <div className="container mx-auto px-4 md:px-6 mb-10 text-center">
            <h2 className="text-3xl font-bold text-brand-dark">Our Sponsors</h2>
            <div className="w-20 h-1.5 bg-brand-blue rounded-full mx-auto mt-4" />
          </div>
          <div className="relative w-full flex overflow-hidden group">
            <motion.div
              className="flex space-x-12 px-6 items-center"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
            >
              {[...sponsors, ...sponsors].map((sponsor, idx) => (
                <Link key={`${sponsor.id}-${idx}`} href={`/sponsors/${sponsor.id}`} className="shrink-0 flex items-center justify-center bg-gray-50 border border-border rounded-2xl p-6 w-48 h-32 hover:border-brand-blue transition-colors group-hover:pause">
                  {sponsor.logoUrl ? (
                    <img src={sponsor.logoUrl} alt={sponsor.name} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="font-bold text-muted-foreground">{sponsor.name}</span>
                  )}
                </Link>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-brand-dark rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="grid lg:grid-cols-2">
              <div className="p-12 md:p-20 space-y-8">
                <h2 className="text-3xl md:text-5xl font-bold text-white">Get in Touch</h2>
                <p className="text-gray-400 text-lg">
                  Have questions or want to learn more about the Engineers Club? Reach out to us today.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4 text-white">
                    <div className="p-3 bg-brand-blue rounded-2xl">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <div className="font-bold">Address</div>
                      <div className="text-gray-400 text-sm whitespace-pre-wrap">{getVal("contact_address", "Civil Engineers Building, Theni, Tamil Nadu.")}</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 text-white">
                    <div className="p-3 bg-brand-blue rounded-2xl">
                      <Phone size={24} />
                    </div>
                    <div>
                      <div className="font-bold">Phone</div>
                      <div className="text-gray-400 text-sm">{getVal("contact_phone", "+91 98765 43210")}</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 text-white">
                    <div className="p-3 bg-brand-blue rounded-2xl">
                      <Mail size={24} />
                    </div>
                    <div>
                      <div className="font-bold">Email</div>
                      <div className="text-gray-400 text-sm">{getVal("contact_email", "info@ecttheni.com")}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-100 min-h-[400px] relative">
                <iframe 
                  src="https://www.google.com/maps?q=Theni+District,+Tamil+Nadu&output=embed" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
