'use client';

import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, Clock } from 'lucide-react';

// Get current date/time in Indian Standard Time (IST)
export function getISTDate() {
  const d = new Date();
  const localTime = d.getTime();
  const localOffset = d.getTimezoneOffset() * 60000;
  const utc = localTime + localOffset;
  const istOffset = 5.5 * 3600000; // IST is UTC + 5:30
  return new Date(utc + istOffset);
}

export function OfficeHoursBadge() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkStatus = () => {
      const istDate = getISTDate();
      const day = istDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const hour = istDate.getHours();
      
      // Office hours: Mon-Sat, 10 AM to 6 PM IST
      const isWorkingDay = day !== 0; // Sunday closed
      const isWorkingHour = hour >= 10 && hour < 18;
      
      setIsOpen(isWorkingDay && isWorkingHour);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
      isOpen 
        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
        : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
    }`}>
      <Clock className="h-3.5 w-3.5" />
      <span>{isOpen ? 'Open Now (IST)' : 'Closed (IST)'}</span>
    </div>
  );
}

export function FloatingWidgets() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Phone Button */}
      <a
        href="tel:+919444019923"
        className="flex items-center justify-center h-12 w-12 rounded-full bg-[#0A1628] hover:bg-[#0A1628]/90 text-[#C9A84C] border border-[#C9A84C]/30 shadow-lg transition duration-300 hover:scale-110"
        title="Call Firm Office"
      >
        <Phone className="h-5 w-5" />
      </a>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/919444019923?text=Hello%2C%20I%20would%20like%20to%20inquire%20about%20a%20legal%20consultation."
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#22c35e] text-white shadow-xl transition duration-300 hover:scale-110 animate-pulse"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </div>
  );
}
