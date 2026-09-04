'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Home,
  BrainCircuit,
  Inbox,
  Calendar,
  CheckSquare,
  Gavel,
  FileEdit,
  BookMarked,
  FileCheck,
  Scale,
  Briefcase,
  BarChart3,
  Bell,
  LogOut,
  Shield,
  User,
  Sparkles
} from 'lucide-react';

const SENIOR_NAV_LINKS = [
  { label: 'Overview', href: '/senior/dashboard', icon: Home },
  { label: 'Case Strategy', href: '/senior/strategy', icon: BrainCircuit },
  { label: 'Review Queue', href: '/senior/review', icon: Inbox },
  { label: 'Court Diary', href: '/senior/diary', icon: Calendar },
  { label: 'Checklists', href: '/senior/checklist', icon: CheckSquare },
  { label: 'Post-Hearings', href: '/senior/hearings', icon: Gavel },
  { label: 'Drafting Desk', href: '/senior/drafts', icon: FileEdit },
  { label: 'Precedent Vault', href: '/senior/vault', icon: BookMarked },
  { label: 'Judgment Lib', href: '/senior/judgments', icon: FileCheck },
  { label: 'Cross-Exam', href: '/senior/cross-exam', icon: Scale },
  { label: 'Client Briefs', href: '/senior/clients', icon: Briefcase },
  { label: 'Analytics', href: '/senior/analytics', icon: BarChart3 },
];

const MOBILE_PRIMARY_LINKS = [
  { label: 'Home', href: '/senior/dashboard', icon: Home },
  { label: 'Diary', href: '/senior/diary', icon: Calendar },
  { label: 'Drafts', href: '/senior/drafts', icon: FileEdit },
  { label: 'Review', href: '/senior/review', icon: Inbox },
  { label: 'Vault', href: '/senior/vault', icon: BookMarked },
];

export default function SeniorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const fetchNotificationCount = async () => {
    try {
      const res = await fetch('/api/senior/notifications');
      if (res.ok) {
        const data = await res.json();
        setUnreadNotifications(data.unreadCount || 0);
      }
    } catch {
      // Ignore count fetch errors
    }
  };

  useEffect(() => {
    fetchNotificationCount();
  }, [pathname]);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#070D19] text-slate-100 font-sans pb-20 lg:pb-0">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0A1628]/95 backdrop-blur-xl border-b border-[#C9A84C]/30 shadow-xl h-16 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#C9A84C] via-[#F3E5AB] to-[#B8860B] p-[2px] shadow-md shadow-[#C9A84C]/20">
            <div className="h-full w-full bg-[#0A1628] rounded-[6px] flex items-center justify-center">
              <Shield className="h-5 w-5 text-[#C9A84C]" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-base tracking-wider text-[#F3E5AB]">
              MLR ASSOCIATES
            </span>
            <span className="text-[9px] text-[#C9A84C] font-bold uppercase tracking-widest">
              Senior Advocate Chambers
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/senior/notifications" className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-[#C9A84C] transition">
            <Bell className="h-4.5 w-4.5" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-600 text-white text-[9px] font-extrabold flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </Link>

          <div className="hidden sm:flex flex-col text-right text-[10px]">
            <span className="font-bold text-white flex items-center gap-1">
              <User className="h-3 w-3 text-[#C9A84C]" /> {session?.user?.name || 'Senior Counsel'}
            </span>
            <span className="text-[#C9A84C] font-semibold">{session?.user?.role || 'SENIOR'} ADVOCATE</span>
          </div>

          <button
            onClick={async () => {
              await signOut({ redirect: false });
              window.location.href = '/login';
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Desktop Left Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-[#0A1628]/95 backdrop-blur-2xl border-r border-[#C9A84C]/20 flex-shrink-0">
          <div className="flex-1 py-6 space-y-1 px-3 overflow-y-auto">
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-[#C9A84C] mb-3">
              Chambers Benches
            </p>
            {SENIOR_NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#C9A84C] to-[#D4AF37] text-[#0A1628] shadow-lg shadow-[#C9A84C]/20'
                      : 'text-slate-300 hover:bg-slate-900/80 hover:text-[#C9A84C]'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#0A1628]' : 'text-[#C9A84C]'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-800 text-[10px] text-slate-400 text-center font-bold">
            Encrypted Senior Chambers Terminal
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0A1628]/95 backdrop-blur-2xl border-t border-[#C9A84C]/25 shadow-2xl flex items-center justify-around z-50 px-2">
        {MOBILE_PRIMARY_LINKS.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition duration-200 ${
                isActive
                  ? 'text-[#C9A84C] font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-[#C9A84C]' : 'text-slate-400'}`} />
              <span className="text-[9px] tracking-tight">{link.label}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
