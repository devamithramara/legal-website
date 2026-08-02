'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Menu, X, Shield, Calendar, MapPin, Star, Upload, User } from 'lucide-react';

export function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardUrl = () => {
    if (!session?.user) return '/login';
    const role = session.user.role;
    if (role === 'ADMIN') return '/admin';
    if (role === 'JUNIOR' || role === 'INTERN') return '/junior';
    return '/dashboard';
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0A1628] border-b border-[#C9A84C]/20 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-[#C9A84C]" />
              <span className="font-heading font-bold text-lg tracking-wider text-[#F5F0E8] hover:text-[#C9A84C] transition duration-200">
                MLR ASSOCIATES
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/book" className="text-sm font-medium text-[#F5F0E8] hover:text-[#C9A84C] transition flex items-center gap-1">
              <Calendar className="h-4 w-4" /> Book
            </Link>
            <Link href="/upload" className="text-sm font-medium text-[#F5F0E8] hover:text-[#C9A84C] transition flex items-center gap-1">
              <Upload className="h-4 w-4" /> Upload
            </Link>
            <Link href="/testimonials" className="text-sm font-medium text-[#F5F0E8] hover:text-[#C9A84C] transition flex items-center gap-1">
              <Star className="h-4 w-4" /> Reviews
            </Link>
            <Link href="/contact" className="text-sm font-medium text-[#F5F0E8] hover:text-[#C9A84C] transition flex items-center gap-1">
              <MapPin className="h-4 w-4" /> Office
            </Link>
          </nav>

          {/* Auth Action */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                <Link href={getDashboardUrl()}>
                  <Button className="bg-[#C9A84C] text-[#0A1628] hover:bg-[#C9A84C]/95 font-semibold text-xs py-1.5 px-3.5 flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="border-[#F5F0E8]/20 hover:border-[#C9A84C] text-[#F5F0E8] hover:text-[#C9A84C] font-semibold text-xs py-1.5 px-3.5"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button className="bg-[#C9A84C] text-[#0A1628] hover:bg-[#C9A84C]/95 font-semibold text-xs py-1.5 px-3.5">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[#F5F0E8] hover:text-[#C9A84C] focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A1628] border-t border-[#C9A84C]/10 px-2 pt-2 pb-4 space-y-1 sm:px-3">
          <Link
            href="/book"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-[#F5F0E8] hover:bg-[#0A1628]/80 hover:text-[#C9A84C]"
          >
            Book Appointment
          </Link>
          <Link
            href="/upload"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-[#F5F0E8] hover:bg-[#0A1628]/80 hover:text-[#C9A84C]"
          >
            Upload Documents
          </Link>
          <Link
            href="/testimonials"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-[#F5F0E8] hover:bg-[#0A1628]/80 hover:text-[#C9A84C]"
          >
            Client Reviews
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-[#F5F0E8] hover:bg-[#0A1628]/80 hover:text-[#C9A84C]"
          >
            Office Location
          </Link>
          
          <div className="pt-4 border-t border-[#C9A84C]/10 flex flex-col gap-2">
            {session ? (
              <>
                <Link href={getDashboardUrl()} onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-[#C9A84C] text-[#0A1628] hover:bg-[#C9A84C]/95 font-semibold py-2">
                    Go to Dashboard
                  </Button>
                </Link>
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="w-full bg-transparent border border-[#F5F0E8]/20 hover:border-[#C9A84C] text-[#F5F0E8] hover:text-[#C9A84C] font-semibold py-2"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-[#C9A84C] text-[#0A1628] hover:bg-[#C9A84C]/95 font-semibold py-2">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
