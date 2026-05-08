"use client";

import React, { useState } from "react";
import { bookEvent } from "@/lib/actions/events";
import { Button } from "@/components/ui/Button";
import { Check, CalendarPlus } from "lucide-react";

export default function BookingButton({ eventId, userId, initialBooked }: { eventId: string, userId: string, initialBooked: boolean }) {
  const [isBooked, setIsBooked] = useState(initialBooked);
  const [loading, setLoading] = useState(false);

  async function handleBook() {
    setLoading(true);
    const res = await bookEvent(eventId, userId);
    if (res.success) {
      setIsBooked(res.booked || false);
    } else {
      alert("Failed to update booking.");
    }
    setLoading(false);
  }

  if (isBooked) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-2 text-emerald-600 font-bold bg-emerald-50 py-3 rounded-xl">
          <Check size={20} />
          <span>You're Attending!</span>
        </div>
        <button 
          onClick={handleBook}
          disabled={loading}
          className="text-sm text-red-500 hover:text-red-700 font-semibold underline disabled:opacity-50"
        >
          Cancel Registration
        </button>
      </div>
    );
  }

  return (
    <Button 
      onClick={handleBook} 
      isLoading={loading}
      rightIcon={<CalendarPlus size={18} />}
      className="w-full"
    >
      Book Your Spot
    </Button>
  );
}
