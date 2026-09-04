'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Menu, X, Shield, Calendar, MapPin, Star, Upload, User, PhoneCall, Sparkles } from 'lucide-react';

export function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const getDashboardUrl = () => {
    if (!session?.user) return '/login';
    const role = session.user.role;
    if (role === 'ADMIN') return '/admin';
    if (role === 'JUNIOR' || role === 'INTERN') return '/junior';
    return '/dashboard';
  };

  const navLinks = [
    { href: '/book', label: 'Book Slot', icon: Calendar },
    { href: '/upload', label: 'Upload Files', icon: Upload },
    { href: '/testimonials', label: 'Reviews', icon: Star },
    { href: '/contact', label: 'Chambers', icon: MapPin },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B132B]/85 backdrop-blur-xl border-b border-[#E2C044]/25 shadow-2xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#E2C044] via-[#F3E5AB] to-[#B8860B] p-[2px] shadow-lg shadow-[#E2C044]/20 group-hover:scale-105 transition-transform duration-300">
                <div className="h-full w-full bg-[#0B132B] rounded-[10px] flex items-center justify-center">
                  <Shield className="h-6 w-6 text-[#E2C044] group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-xl tracking-wider gold-gradient-text">
                  MLR ASSOCIATES
                </span>
                <span className="text-[10px] text-cyan-300/80 font-medium tracking-widest uppercase">
                  Advocates & Legal Consultants
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-[#1C2541]/70 p-1.5 rounded-full border border-slate-700/60 shadow-inner">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#E2C044] to-[#C9A84C] text-[#0B132B] shadow-md shadow-[#E2C044]/30 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#0B132B]' : 'text-[#E2C044]'}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Emergency Helpline & Auth */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:+919876543210"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-medium hover:bg-emerald-900/60 transition duration-200"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <PhoneCall className="h-3.5 w-3.5 text-emerald-400" />
              <span>Urgent Legal Line</span>
            </a>

            {session ? (
              <div className="flex items-center gap-2">
                <Link href={getDashboardUrl()}>
                  <Button className="bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] hover:brightness-110 font-bold text-xs px-4 py-2 rounded-lg shadow-lg shadow-[#E2C044]/25 flex items-center gap-1.5 transition">
                    <User className="h-3.5 w-3.5" /> Portal
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={async () => {
                    await signOut({ redirect: false });
                    window.location.href = '/login';
                  }}
                  className="border-slate-700 text-slate-300 hover:text-rose-400 hover:border-rose-500/50 bg-slate-900/50 text-xs px-3 py-2 rounded-lg transition"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button className="bg-gradient-to-r from-[#E2C044] to-[#D97706] text-[#0B132B] hover:brightness-110 font-bold text-xs px-5 py-2 rounded-lg shadow-lg shadow-[#E2C044]/20 flex items-center gap-1.5 transition">
                  <Sparkles className="h-3.5 w-3.5" /> Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 hover:text-[#E2C044] transition"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B132B]/95 backdrop-blur-2xl border-t border-[#E2C044]/20 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 hover:text-[#E2C044] text-xs font-semibold"
                >
                  <Icon className="h-4 w-4 text-[#E2C044]" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <a
            href="tel:+919876543210"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-xs font-semibold"
          >
            <PhoneCall className="h-4 w-4" /> 24/7 Legal Emergency Call
          </a>

          <div className="pt-2">
            {session ? (
              <div className="flex gap-2">
                <Link href={getDashboardUrl()} className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] font-bold py-2.5 rounded-xl">
                    Open Dashboard
                  </Button>
                </Link>
                <Button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await signOut({ redirect: false });
                    window.location.href = '/login';
                  }}
                  className="bg-slate-900 border border-slate-800 text-slate-300 font-semibold py-2.5 rounded-xl"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] font-bold py-2.5 rounded-xl">
                  Client & Advocate Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
