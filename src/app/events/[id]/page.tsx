import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, Calendar, MapPin, Info, Users } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import BookingButton from "./BookingButton";

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      bookings: true,
    }
  }) as {
    id: string;
    title: string;
    location: string | null;
    description: string | null;
    imageUrl: string | null;
    date: Date;
    bookings: { id: string; userId: string; eventId: string; createdAt: Date }[];
    createdAt: Date;
  };

  if (!event) {
    notFound();
  }

  const isBooked = session?.user?.id 
    ? event.bookings.some(b => b.userId === session.user.id) 
    : false;

  return (
    <main className="bg-mesh min-h-screen">
      <Navbar />
      
      <div className="pt-32 pb-24 container mx-auto px-4 max-w-5xl">
        <Link href="/" className="inline-flex items-center space-x-2 text-muted-foreground hover:text-brand-blue mb-8 transition-colors font-semibold">
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </Link>

        <div className="bg-white rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
          {event.imageUrl ? (
            <div className="w-full h-64 md:h-96 relative bg-gray-100">
              <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full h-64 md:h-96 relative bg-brand-blue/10 flex items-center justify-center">
              <Calendar size={80} className="text-brand-blue/30" />
            </div>
          )}

          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-8">
              <div className="space-y-4 flex-1">
                <div className="inline-block px-4 py-2 bg-brand-blue/10 text-brand-blue text-sm font-bold uppercase tracking-wider rounded-xl">
                  {format(event.date, "MMMM dd, yyyy - h:mm a")}
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-brand-dark leading-tight">{event.title}</h1>
                
                 <div className="flex flex-wrap gap-6 text-muted-foreground pt-4 border-t border-border mt-6">
                   <div className="flex items-center space-x-2">
                     <MapPin size={20} className="text-brand-blue" />
                     <span className="font-medium text-brand-dark">{event.location || 'Theni Center Hall'}</span>
                   </div>
                   <div className="flex items-center space-x-2">
                     <Users size={20} className="text-brand-blue" />
                     <span className="font-medium text-brand-dark">{event.bookings.length} Attending</span>
                   </div>
                 </div>
              </div>

              <div className="md:w-72 shrink-0 bg-gray-50 rounded-3xl p-6 border border-border text-center">
                <h3 className="font-bold text-lg mb-2">Event Registration</h3>
                {!session ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">You must be a logged-in member to book events.</p>
                    <Link href="/login">
                      <button className="w-full py-3 bg-brand-dark text-white rounded-xl font-bold hover:bg-black transition-colors">
                        Login to Book
                      </button>
                    </Link>
                  </div>
                ) : session.user.role === "ADMIN" ? (
                  <p className="text-sm text-brand-blue font-bold">Admins can view bookings from the Dashboard.</p>
                ) : (
                  <BookingButton eventId={event.id} userId={session.user.id} initialBooked={isBooked} />
                )}
              </div>
            </div>

            {event.description && (
              <div className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold flex items-center space-x-2">
                  <Info size={24} className="text-brand-blue" />
                  <span>About This Event</span>
                </h2>
                <div className="prose max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
