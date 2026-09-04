'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, PhoneCall, Clock, ShieldAlert, X, ChevronUp, Calendar, Sparkles } from 'lucide-react';

export function OfficeHoursBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-[#E2C044]/40 text-xs font-semibold backdrop-blur-md shadow-lg">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E2C044] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E2C044]"></span>
      </span>
      <span className="text-slate-200">Chambers Active:</span>
      <span className="gold-gradient-text font-bold">Mon - Sat (9:00 AM - 7:30 PM)</span>
    </div>
  );
}

export function FloatingWidgets() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Expanded Quick Options */}
      {expanded && (
        <div className="flex flex-col gap-2.5 animate-in slide-in-from-bottom duration-300">
          <a
            href="https://wa.me/919876543210?text=Hello%20MLR%20Associates,%20I%20need%20legal%20consultation"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-xl transition-all hover:scale-105"
          >
            <MessageSquare className="h-4 w-4" />
            <span>WhatsApp Quick Desk</span>
          </a>

          <a
            href="tel:+919876543210"
            className="flex items-center gap-3 bg-slate-900 border border-[#E2C044]/50 text-[#E2C044] text-xs font-bold px-4 py-2.5 rounded-full shadow-xl transition-all hover:scale-105 backdrop-blur-md"
          >
            <PhoneCall className="h-4 w-4 text-emerald-400" />
            <span>Call Senior Counsel</span>
          </a>

          <Link
            href="/book"
            className="flex items-center gap-3 bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] text-xs font-extrabold px-4 py-2.5 rounded-full shadow-xl transition-all hover:scale-105"
          >
            <Calendar className="h-4 w-4 text-[#0B132B]" />
            <span>Book Calendar Slot</span>
          </Link>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`h-14 w-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          expanded
            ? 'bg-slate-800 text-slate-200 border-2 border-slate-600 scale-105'
            : 'bg-gradient-to-tr from-[#E2C044] via-[#F3E5AB] to-[#B8860B] text-[#0B132B] shadow-[#E2C044]/30 hover:scale-110 gold-glow'
        }`}
        title="Quick Legal Help"
      >
        {expanded ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-[#0B132B]" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
        )}
      </button>
    </div>
  );
}
