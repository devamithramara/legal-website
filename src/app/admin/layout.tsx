'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Home, 
  Users, 
  Briefcase, 
  Calendar, 
  UsersRound, 
  IndianRupee, 
  BarChart3, 
  LogOut,
  UserCheck,
  FolderOpen,
  Bell
} from 'lucide-react';

const ADMIN_LINKS = [
  { label: 'Overview', href: '/admin', icon: Home },
  { label: 'Clients', href: '/admin/clients', icon: Users },
  { label: 'Cases', href: '/admin/cases', icon: Briefcase },
  { label: 'Files', href: '/admin/files', icon: FolderOpen },
  { label: 'Calendar', href: '/admin/calendar', icon: Calendar },
  { label: 'Juniors', href: '/admin/juniors', icon: UsersRound },
  { label: 'Reminders', href: '/admin/reminders', icon: Bell },
  { label: 'Finances', href: '/admin/finance', icon: IndianRupee },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F5F0E8] text-[#0A1628] pb-16 lg:pb-0">
      {/* Top Header bar */}
      <header className="bg-[#0A1628] text-white h-14 flex items-center justify-between px-6 border-b border-[#C9A84C]/20 shadow-md">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#C9A84C]" />
          <span className="font-heading font-bold tracking-wider text-sm">MLR ASSOCIATES ADMIN</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right text-[10px] text-gray-400 font-semibold">
            <span>{session?.user?.name}</span>
            <span>Firm Admin Portal</span>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-gray-400 hover:text-rose-500 transition focus:outline-none"
            title="Log Out"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Desktop Sidebar Panel */}
        <aside className="hidden lg:flex flex-col w-56 bg-[#0A1628] text-white border-r border-[#C9A84C]/10 flex-shrink-0">
          <div className="flex-1 py-6 space-y-1 px-3">
            {ADMIN_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded text-xs font-semibold tracking-wide transition duration-200 ${
                    isActive 
                      ? 'bg-[#C9A84C] text-[#0A1628]' 
                      : 'hover:bg-white/5 hover:text-[#C9A84C] text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="p-4 border-t border-[#C9A84C]/10 text-[9px] text-gray-500 text-center uppercase tracking-wider font-bold">
            Secure Admin Terminal
          </div>
        </aside>

        {/* Core Main content container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0A1628] border-t border-[#C9A84C]/20 shadow-2xl flex items-center justify-around z-40 px-2">
        {ADMIN_LINKS.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1.5 py-1 px-1 rounded transition duration-200 ${
                isActive 
                  ? 'text-[#C9A84C]' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[8px] font-bold tracking-tight">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
