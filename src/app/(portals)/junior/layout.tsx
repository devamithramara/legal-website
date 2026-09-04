'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Home,
  CheckSquare,
  Calendar,
  FileText,
  Clock,
  BookOpen,
  PhoneCall,
  AlertTriangle,
  GraduationCap,
  ClipboardList,
  LogOut,
  Shield,
  User,
  Sparkles
} from 'lucide-react';

const JUNIOR_NAV_LINKS = [
  { label: 'Home', href: '/junior/dashboard', icon: Home },
  { label: 'Tasks', href: '/junior/tasks', icon: CheckSquare },
  { label: 'Time', href: '/junior/time', icon: Clock },
  { label: 'Diary', href: '/junior/diary', icon: Calendar },
  { label: 'Drafts', href: '/junior/drafts', icon: FileText },
  { label: 'Research', href: '/junior/research', icon: BookOpen },
  { label: 'Calls', href: '/junior/calls', icon: PhoneCall },
  { label: 'Escalations', href: '/junior/escalations', icon: AlertTriangle },
  { label: 'Learning', href: '/junior/learning', icon: GraduationCap },
  { label: 'Daily Log', href: '/junior/log', icon: ClipboardList },
];

const MOBILE_PRIMARY_LINKS = [
  { label: 'Home', href: '/junior/dashboard', icon: Home },
  { label: 'Tasks', href: '/junior/tasks', icon: CheckSquare },
  { label: 'Diary', href: '/junior/diary', icon: Calendar },
  { label: 'Drafts', href: '/junior/drafts', icon: FileText },
  { label: 'Log', href: '/junior/log', icon: ClipboardList },
];

export default function JuniorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="flex-1 flex flex-col min-h-screen mesh-bg text-slate-100 font-sans pb-20 lg:pb-0">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0B132B]/90 backdrop-blur-xl border-b border-[#E2C044]/25 shadow-xl h-16 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#E2C044] via-[#F3E5AB] to-[#B8860B] p-[2px] shadow-md shadow-[#E2C044]/20">
            <div className="h-full w-full bg-[#0B132B] rounded-[6px] flex items-center justify-center">
              <Shield className="h-5 w-5 text-[#E2C044]" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-base tracking-wider gold-gradient-text">
              MLR ASSOCIATES
            </span>
            <span className="text-[9px] text-cyan-300/80 font-bold uppercase tracking-widest">
              Junior Advocate Workspace
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right text-[10px]">
            <span className="font-bold text-white flex items-center gap-1">
              <User className="h-3 w-3 text-[#E2C044]" /> {session?.user?.name || 'Advocate'}
            </span>
            <span className="text-cyan-400 font-semibold">{session?.user?.role || 'JUNIOR'}</span>
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
        <aside className="hidden lg:flex flex-col w-60 bg-[#0B132B]/95 backdrop-blur-2xl border-r border-[#E2C044]/15 flex-shrink-0">
          <div className="flex-1 py-6 space-y-1 px-3 overflow-y-auto">
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-[#E2C044] mb-3">
              Workspace Benches
            </p>
            {JUNIOR_NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] shadow-lg shadow-[#E2C044]/20'
                      : 'text-slate-300 hover:bg-slate-900/80 hover:text-[#E2C044]'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#0B132B]' : 'text-[#E2C044]'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-800 text-[10px] text-slate-400 text-center font-bold">
            Encrypted Legal Workspace
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0B132B]/95 backdrop-blur-2xl border-t border-[#E2C044]/25 shadow-2xl flex items-center justify-around z-50 px-2">
        {MOBILE_PRIMARY_LINKS.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition duration-200 ${
                isActive
                  ? 'text-[#E2C044] font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-[#E2C044]' : 'text-slate-400'}`} />
              <span className="text-[9px] tracking-tight">{link.label}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
