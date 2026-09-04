# MLR Associates — Part 5: Senior Advocate War Room & Strategic Suite

This document contains all pages and layouts for the Senior Advocate Portal (`/senior`), including Daily Court Board, Strategy Builder, Cross-Examination Builder, Draft Generation & Review Queue, Pre-Hearing Readiness Checklists, Precedent/Judgment Vault, Analytics, and Notifications.

---

### File: `src/app/(portals)/senior/layout.tsx`

```typescript
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
            onClick={() => signOut({ callbackUrl: '/' })}
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
```

---

### File: `src/app/(portals)/senior/page.tsx`

```typescript
import { redirect } from 'next/navigation';

export default function SeniorRootPage() {
  redirect('/senior/dashboard');
}
```

---

### File: `src/app/(portals)/senior/dashboard/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/providers';
import {
  Gavel,
  Inbox,
  AlertTriangle,
  FileEdit,
  Sparkles,
  ChevronRight,
  Clock,
  User,
  BrainCircuit,
  BookMarked,
  CheckSquare,
  Shield
} from 'lucide-react';

export default function SeniorDashboardPage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    hearingsToday: 0,
    draftsPendingReview: 0,
    openEscalations: 0,
    casesArguedMonth: 0,
  });

  const [alerts, setAlerts] = useState<any[]>([]);
  const [juniorActivity, setJuniorActivity] = useState<any[]>([]);
  const [upcomingHearings, setUpcomingHearings] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    try {
      const [casesRes, queueRes, escalationsRes, tasksRes] = await Promise.all([
        fetch('/api/cases'),
        fetch('/api/review/queue'),
        fetch('/api/escalations'),
        fetch('/api/tasks'),
      ]);

      let hearingsTodayCount = 0;
      let upcomingList: any[] = [];
      const todayStr = new Date().toISOString().slice(0, 10);

      if (casesRes.ok) {
        const casesData = await casesRes.json();
        const activeHearings = casesData.filter((c: any) => c.nextHearing);
        hearingsTodayCount = activeHearings.filter((c: any) => (c.nextHearing as string).startsWith(todayStr)).length;
        setUpcomingHearings(activeHearings.slice(0, 5));
      }

      let pendingDrafts = 0;
      if (queueRes.ok) {
        const qData = await queueRes.json();
        if (qData.queue && qData.queue.drafts) {
          pendingDrafts = qData.queue.drafts.length;
        }
      }

      let openEscCount = 0;
      if (escalationsRes.ok) {
        const escData = await escalationsRes.json();
        if (escData.escalations) {
          const openEsc = escData.escalations.filter((e: any) => e.status === 'OPEN');
          openEscCount = openEsc.length;
          setAlerts(openEsc);
        }
      }

      if (tasksRes.ok) {
        const taskData = await tasksRes.json();
        setJuniorActivity(taskData.slice(0, 4));
      }

      setMetrics({
        hearingsToday: hearingsTodayCount,
        draftsPendingReview: pendingDrafts,
        openEscalations: openEscCount,
        casesArguedMonth: 12,
      });
    } catch {
      toast('Failed to load Senior Advocate dashboard.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#C9A84C]/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/30 text-xs font-bold text-[#F3E5AB] mb-3">
              <Sparkles className="h-3.5 w-3.5 text-[#C9A84C]" /> Senior Advocate Chambers Live
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white">
              Senior Counsel Chambers: <span className="gold-gradient-text">Advocate {session?.user?.name || ''}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Supervise case strategy, review junior submissions, monitor pre-hearing checklists, and dictate drafts.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/senior/strategy">
              <Button className="bg-gradient-to-r from-[#C9A84C] to-[#D4AF37] text-[#0A1628] font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg hover:scale-105 transition flex items-center gap-1.5">
                <BrainCircuit className="h-4 w-4" /> Case Strategy Board
              </Button>
            </Link>
            <Link href="/senior/drafts">
              <Button variant="outline" className="border-slate-700 bg-slate-900/80 text-slate-200 hover:border-[#C9A84C] text-xs font-bold px-4 py-2.5 rounded-xl">
                <FileEdit className="h-4 w-4 mr-1 text-[#C9A84C]" /> Tiptap Drafting Desk
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-[#C9A84C]/50 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hearings Today</span>
            <div className="h-9 w-9 rounded-xl bg-[#C9A84C]/20 text-[#C9A84C] flex items-center justify-center font-bold">
              <Gavel className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-heading gold-gradient-text mt-3 group-hover:scale-105 transition">
            {metrics.hearingsToday}
          </p>
          <p className="text-[10px] text-cyan-300 font-semibold mt-1">Bench Appearances</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-purple-500/50 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Review</span>
            <div className="h-9 w-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Inbox className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-heading text-purple-300 mt-3 group-hover:scale-105 transition">
            {metrics.draftsPendingReview}
          </p>
          <p className="text-[10px] text-purple-400 font-semibold mt-1">Junior Inbox</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-rose-500/50 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Escalations</span>
            <div className="h-9 w-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-heading text-rose-400 mt-3 group-hover:scale-105 transition">
            {metrics.openEscalations}
          </p>
          <p className="text-[10px] text-rose-400 font-semibold mt-1">Urgent Alerts</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-emerald-500/50 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Argued This Month</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-heading text-emerald-300 mt-3 group-hover:scale-105 transition">
            {metrics.casesArguedMonth}
          </p>
          <p className="text-[10px] text-emerald-400 font-semibold mt-1">Concluded Benches</p>
        </div>

      </div>

      {/* Priority Alerts Panel & Junior Activity Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Priority Alerts Panel */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border border-rose-900/50 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-500 animate-pulse" />
                <h3 className="text-base font-bold font-heading text-white">Priority Chambers Alerts</h3>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800">
                Action Required
              </span>
            </div>

            {alerts.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">No open junior escalations or urgent alerts pending.</p>
            ) : (
              <div className="space-y-3 text-xs">
                {alerts.map((al) => (
                  <div key={al.id} className="p-3.5 rounded-xl bg-slate-950 border border-rose-900/60 flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-white">📁 Case: {al.case?.caseNumber} - Escalated by Junior {al.junior?.name}</p>
                      <p className="text-rose-400 text-[11px] font-semibold mt-0.5">Reason: {al.reason} — "{al.description}"</p>
                    </div>
                    <Link href="/senior/review">
                      <Button size="sm" className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] px-3 py-1">
                        Review Now
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Junior Activity Widget */}
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
                <User className="h-4 w-4 text-[#C9A84C]" /> Live Junior Advocate Activity
              </h3>
              <Link href="/senior/review" className="text-xs font-bold text-[#C9A84C] hover:underline">
                View Unified Queue
              </Link>
            </div>

            {juniorActivity.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">No active task sessions.</p>
            ) : (
              <div className="space-y-3 text-xs">
                {juniorActivity.map((t) => (
                  <div key={t.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{t.junior?.name} → {t.title}</p>
                      <p className="text-[10px] text-slate-400">Case: {t.case?.caseNumber}</p>
                    </div>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-slate-800 text-[#C9A84C]">
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Action Dock & Upcoming Hearings */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <h3 className="text-base font-bold font-heading text-white mb-4">Chambers Quick Dock</h3>
            
            <div className="space-y-3 text-xs">
              <Link href="/senior/strategy" className="block">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-[#C9A84C] transition flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-[#C9A84C]/20 text-[#C9A84C] flex items-center justify-center font-bold">
                      <BrainCircuit className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-[#C9A84C]">Case Strategy Board</p>
                      <p className="text-[10px] text-slate-400">Theory & weak points</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-1 transition" />
                </div>
              </Link>

              <Link href="/senior/diary" className="block">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-400 transition flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                      <Gavel className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-cyan-400">Court Diary & Checklist</p>
                      <p className="text-[10px] text-slate-400">Hearings & 6-item check</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-1 transition" />
                </div>
              </Link>

              <Link href="/senior/vault" className="block">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-400 transition flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <BookMarked className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-emerald-400">Precedent Vault</p>
                      <p className="text-[10px] text-slate-400">Snippets & argument clauses</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
}
```

---

### File: `src/app/(portals)/senior/hearings/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers';
import { Gavel, Plus, Upload, MessageSquare, Tag } from 'lucide-react';

export default function SeniorHearingsPage() {
  const { toast } = useToast();
  const [cases, setCases] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    caseId: '',
    hearingDate: '',
    argued: '',
    judgeObservations: '',
    orderPassed: '',
    orderFileUrl: '',
    nextSteps: '',
    notifyClient: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [casesRes, notesRes] = await Promise.all([
        fetch('/api/cases'),
        fetch('/api/post-hearing'),
      ]);
      if (casesRes.ok) {
        const d = await casesRes.json();
        setCases(d.filter((c: any) => c.status !== 'INTAKE'));
      }
      if (notesRes.ok) {
        const d = await notesRes.json();
        setNotes(d.notes || []);
      }
    } catch {
      toast('Failed to load hearing notes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.caseId || !form.argued) {
      toast('Please select a case and enter argument summary.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/post-hearing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          nextSteps: form.nextSteps.split(',').map(s => s.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        toast('Post-hearing note saved!', 'success');
        setForm({ caseId: '', hearingDate: '', argued: '', judgeObservations: '', orderPassed: '', orderFileUrl: '', nextSteps: '', notifyClient: false });
        setShowForm(false);
        fetchData();
      } else {
        toast('Failed to save note.', 'error');
      }
    } catch {
      toast('Network error.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
            <Gavel className="h-6 w-6 text-[#C9A84C]" /> Post-Hearing Notes & Court Orders
          </h1>
          <p className="text-xs text-slate-300">Record arguments advanced, judge observations, orders passed, and next steps</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-[#C9A84C] to-[#D4AF37] text-[#0A1628] font-extrabold text-xs px-5 py-2 rounded-xl flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Add Hearing Note
        </Button>
      </div>

      {/* Add Note Form */}
      {showForm && (
        <Card className="border border-[#C9A84C]/30 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6">
          <h3 className="text-sm font-bold font-heading text-white mb-5">New Post-Hearing Entry</h3>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-bold text-[#F3E5AB]">Case *</Label>
                <select
                  value={form.caseId}
                  onChange={e => setForm(f => ({ ...f, caseId: e.target.value }))}
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl"
                  required
                >
                  <option value="">Select Case...</option>
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>{c.caseNumber} — {c.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-[#F3E5AB]">Hearing Date</Label>
                <Input
                  type="date"
                  value={form.hearingDate}
                  onChange={e => setForm(f => ({ ...f, hearingDate: e.target.value }))}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-[#F3E5AB]">Arguments Advanced *</Label>
              <Textarea
                placeholder="Summarise the arguments advanced before the bench..."
                value={form.argued}
                onChange={e => setForm(f => ({ ...f, argued: e.target.value }))}
                className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl min-h-[90px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Judge's Observations</Label>
                <Textarea
                  placeholder="e.g. Court expressed concern about delay in filing..."
                  value={form.judgeObservations}
                  onChange={e => setForm(f => ({ ...f, judgeObservations: e.target.value }))}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl min-h-[70px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Order Passed</Label>
                <Textarea
                  placeholder="e.g. Adjourned to 15th Sep for rejoinder arguments"
                  value={form.orderPassed}
                  onChange={e => setForm(f => ({ ...f, orderPassed: e.target.value }))}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl min-h-[70px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Scanned Order URL (Cloudinary)</Label>
                <Input
                  placeholder="https://res.cloudinary.com/..."
                  value={form.orderFileUrl}
                  onChange={e => setForm(f => ({ ...f, orderFileUrl: e.target.value }))}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Next Steps (comma-separated)</Label>
                <Input
                  placeholder="e.g. File rejoinder, Serve copy on opposite party"
                  value={form.nextSteps}
                  onChange={e => setForm(f => ({ ...f, nextSteps: e.target.value }))}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={form.notifyClient}
                onChange={e => setForm(f => ({ ...f, notifyClient: e.target.checked }))}
                className="h-4 w-4 accent-[#C9A84C]"
              />
              <span className="font-bold text-white">Notify client via SMS (Twilio) about this hearing update</span>
            </label>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-[#C9A84C] to-[#D4AF37] text-[#0A1628] font-extrabold text-xs px-6 py-2 rounded-xl">
                {submitting ? 'Saving...' : 'Save Post-Hearing Note'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-slate-800 text-slate-300 text-xs rounded-xl">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Past Hearing Notes */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 border-4 border-slate-800 border-t-[#C9A84C] rounded-full animate-spin" />
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm italic">No post-hearing notes recorded yet.</div>
      ) : (
        <div className="space-y-4">
          {notes.map((n: any) => (
            <Card key={n.id} className="border border-slate-800 bg-slate-900/80 rounded-2xl p-5 text-xs">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-extrabold text-white text-sm">📁 {n.case?.caseNumber}</p>
                  <p className="text-[#C9A84C] font-bold mt-0.5">
                    {new Date(n.hearingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                {n.orderPassed && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#C9A84C]/15 text-[#C9A84C] font-bold text-[10px] border border-[#C9A84C]/30">
                    Order Passed
                  </span>
                )}
              </div>
              <p className="text-slate-200 font-semibold">{n.argued}</p>
              {n.judgeObservations && (
                <p className="text-slate-400 mt-2 italic">Judge: "{n.judgeObservations}"</p>
              )}
              {n.orderPassed && (
                <p className="text-amber-300 font-bold mt-2">⚖️ {n.orderPassed}</p>
              )}
              {n.nextSteps?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {n.nextSteps.map((step: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-bold">
                      {step}
                    </span>
                  ))}
                </div>
              )}
              {n.orderFileUrl && (
                <a href={n.orderFileUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[#C9A84C] font-bold hover:underline text-[10px]">
                  <Upload className="h-3 w-3" /> View Scanned Court Order
                </a>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### File: `src/app/(portals)/senior/diary/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/providers';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Gavel, Calendar as CalendarIcon, AlertTriangle, CheckSquare, Plus, Clock } from 'lucide-react';

export default function SeniorDiaryPage() {
  const { toast } = useToast();

  const [cases, setCases] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [todaysHearings, setTodaysHearings] = useState<any[]>([]);
  const [hasConflict, setHasConflict] = useState(false);
  const [loading, setLoading] = useState(true);

  // Pre-hearing checklist modal state
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [checklist, setChecklist] = useState({
    documentsReady: false,
    argumentsDrafted: false,
    clientBriefed: false,
    juniorBriefed: false,
    vakalatnama: false,
    feeCollected: false,
    completionPct: 0,
  });
  const [savingChecklist, setSavingChecklist] = useState(false);

  const fetchDiaryData = async () => {
    try {
      const res = await fetch('/api/cases');
      if (res.ok) {
        const casesData = await res.json();
        setCases(casesData.filter((c: any) => c.status !== 'CLOSED'));

        const eventsList: any[] = [];
        const todayStr = new Date().toISOString().slice(0, 10);
        const todayList: any[] = [];

        casesData.forEach((c: any) => {
          if (c.nextHearing) {
            eventsList.push({
              id: `hearing_${c.id}`,
              title: `Bench: ${c.caseNumber}`,
              start: c.nextHearing,
              color: '#0A1628',
              extendedProps: { court: c.court, client: c.client?.name },
            });

            if ((c.nextHearing as string).startsWith(todayStr)) {
              todayList.push(c);
            }
          }
        });

        setCalendarEvents(eventsList);
        setTodaysHearings(todayList);
        setHasConflict(todayList.length >= 2);
      }
    } catch {
      toast('Failed to load court diary.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiaryData();
  }, []);

  const openChecklistModal = async (cItem: any) => {
    setSelectedCase(cItem);
    setChecklistOpen(true);
    try {
      const res = await fetch(`/api/checklist/${cItem.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.checklist) {
          setChecklist({
            documentsReady: data.checklist.documentsReady || false,
            argumentsDrafted: data.checklist.argumentsDrafted || false,
            clientBriefed: data.checklist.clientBriefed || false,
            juniorBriefed: data.checklist.juniorBriefed || false,
            vakalatnama: data.checklist.vakalatnama || false,
            feeCollected: data.checklist.feeCollected || false,
            completionPct: data.checklist.completionPct || 0,
          });
        }
      }
    } catch {
      // Ignore
    }
  };

  const handleToggleChecklist = async (key: string, val: boolean) => {
    const updated = { ...checklist, [key]: val };
    setChecklist(updated);

    if (!selectedCase) return;
    setSavingChecklist(true);
    try {
      const res = await fetch(`/api/checklist/${selectedCase.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.checklist) {
          setChecklist(data.checklist);
          toast(`Checklist updated (${data.checklist.completionPct}%)`, 'success');
        }
      }
    } catch {
      toast('Failed to save checklist.', 'error');
    } finally {
      setSavingChecklist(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
          <Gavel className="h-6 w-6 text-[#C9A84C]" /> Senior Court Diary & Pre-Hearing Checklist
        </h1>
        <p className="text-xs text-slate-300">
          Supervise personal court schedule, detect bench conflict clashes, and verify 6-item hearing preparation checklists
        </p>
      </div>

      {/* Conflict Warning Banner */}
      {hasConflict && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-600/60 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-400 animate-pulse" />
            <div>
              <p className="font-extrabold">Court Bench Clash Warning!</p>
              <p className="text-[11px] text-rose-200">You have {todaysHearings.length} overlapping hearings scheduled today across different court halls.</p>
            </div>
          </div>
          <span className="font-bold px-3 py-1 bg-rose-800 rounded-lg">High Conflict</span>
        </div>
      )}

      {/* FullCalendar Component */}
      <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 border-4 border-slate-800 border-t-[#C9A84C] rounded-full animate-spin" />
            </div>
          ) : (
            <div className="fc-theme-custom text-xs">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek',
                }}
                events={calendarEvents}
                eventClick={(info: { event: { id: string; extendedProps: Record<string, any> } }) => {
                  const caseId = info.event.id.replace('hearing_', '');
                  const targetCase = cases.find(c => c.id === caseId);
                  if (targetCase) openChecklistModal(targetCase);
                }}
                height="auto"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* PRE-HEARING CHECKLIST MODAL */}
      <Dialog open={checklistOpen} onOpenChange={setChecklistOpen}>
        <DialogContent className="bg-slate-900 text-slate-100 border border-slate-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-white flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-[#C9A84C]" /> Pre-Hearing Checklist ({checklist.completionPct}%)
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              📁 Case: {selectedCase?.caseNumber} - {selectedCase?.title}
            </DialogDescription>
          </DialogHeader>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full transition-all duration-300 ${
                checklist.completionPct === 100 ? 'bg-emerald-400' : 'bg-[#C9A84C]'
              }`}
              style={{ width: `${checklist.completionPct}%` }}
            />
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <span className="font-bold text-white">1. Core Brief & Case Files Ready</span>
              <input
                type="checkbox"
                checked={checklist.documentsReady}
                onChange={(e) => handleToggleChecklist('documentsReady', e.target.checked)}
                className="h-4 w-4 rounded accent-[#C9A84C]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <span className="font-bold text-white">2. Written Arguments Drafted</span>
              <input
                type="checkbox"
                checked={checklist.argumentsDrafted}
                onChange={(e) => handleToggleChecklist('argumentsDrafted', e.target.checked)}
                className="h-4 w-4 rounded accent-[#C9A84C]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <span className="font-bold text-white">3. Client Pre-Hearing Briefed</span>
              <input
                type="checkbox"
                checked={checklist.clientBriefed}
                onChange={(e) => handleToggleChecklist('clientBriefed', e.target.checked)}
                className="h-4 w-4 rounded accent-[#C9A84C]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <span className="font-bold text-white">4. Junior Advocate Briefed</span>
              <input
                type="checkbox"
                checked={checklist.juniorBriefed}
                onChange={(e) => handleToggleChecklist('juniorBriefed', e.target.checked)}
                className="h-4 w-4 rounded accent-[#C9A84C]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <span className="font-bold text-white">5. Vakalatnama Filed on Record</span>
              <input
                type="checkbox"
                checked={checklist.vakalatnama}
                onChange={(e) => handleToggleChecklist('vakalatnama', e.target.checked)}
                className="h-4 w-4 rounded accent-[#C9A84C]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <span className="font-bold text-white">6. Senior Retainer Fee Settled</span>
              <input
                type="checkbox"
                checked={checklist.feeCollected}
                onChange={(e) => handleToggleChecklist('feeCollected', e.target.checked)}
                className="h-4 w-4 rounded accent-[#C9A84C]"
              />
            </label>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
```

---

### File: `src/app/(portals)/senior/strategy/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers';
import { BrainCircuit, Shield, AlertTriangle, User, Scale, Plus, CheckCircle2, Save } from 'lucide-react';

export default function SeniorStrategyPage() {
  const { toast } = useToast();

  const [cases, setCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [loading, setLoading] = useState(true);

  // Strategy Form
  const [theory, setTheory] = useState('');
  const [keyArguments, setKeyArguments] = useState('');
  const [weakPoints, setWeakPoints] = useState('');
  const [counterArgs, setCounterArgs] = useState('');
  const [caseStrength, setCaseStrength] = useState('STRONG');
  const [strengthReason, setStrengthReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Opponent Profile Form
  const [opponentName, setOpponentName] = useState('');
  const [opponentFirm, setOpponentFirm] = useState('');
  const [opponentNotes, setOpponentNotes] = useState('');

  const fetchCases = async () => {
    try {
      const res = await fetch('/api/cases');
      if (res.ok) {
        const data = await res.json();
        setCases(data);
        if (data.length > 0) {
          setSelectedCaseId(data[0].id);
          fetchStrategyForCase(data[0].id);
        }
      }
    } catch {
      toast('Failed to load cases.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStrategyForCase = async (caseId: string) => {
    try {
      const res = await fetch(`/api/strategy/${caseId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.strategy) {
          setTheory(data.strategy.theory || '');
          setKeyArguments(data.strategy.keyArguments ? data.strategy.keyArguments.join(', ') : '');
          setWeakPoints(data.strategy.weakPoints ? data.strategy.weakPoints.join(', ') : '');
          setCounterArgs(data.strategy.counterArgs ? data.strategy.counterArgs.join(', ') : '');
          setCaseStrength(data.strategy.caseStrength || 'STRONG');
          setStrengthReason(data.strategy.strengthReason || '');
        } else {
          setTheory('');
          setKeyArguments('');
          setWeakPoints('');
          setCounterArgs('');
          setCaseStrength('STRONG');
          setStrengthReason('');
        }
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleSelectCase = (id: string) => {
    setSelectedCaseId(id);
    fetchStrategyForCase(id);
  };

  const handleSaveStrategy = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedCaseId) return;

    setSaving(true);
    try {
      const res = await fetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: selectedCaseId,
          theory,
          keyArguments: keyArguments.split(',').map(s => s.trim()).filter(Boolean),
          weakPoints: weakPoints.split(',').map(s => s.trim()).filter(Boolean),
          counterArgs: counterArgs.split(',').map(s => s.trim()).filter(Boolean),
          caseStrength,
          strengthReason,
        }),
      });

      if (res.ok) {
        toast('Case strategy auto-saved!', 'success');
        setLastSaved(new Date().toLocaleTimeString());
      } else {
        toast('Failed to save strategy.', 'error');
      }
    } catch {
      toast('Network error saving strategy.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddOpponent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !opponentName) {
      toast('Please enter opponent advocate name.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/opponent-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: selectedCaseId,
          advocateName: opponentName,
          firmName: opponentFirm,
          behaviorNotes: opponentNotes,
        }),
      });

      if (res.ok) {
        toast('Opponent profile recorded!', 'success');
        setOpponentName('');
        setOpponentFirm('');
        setOpponentNotes('');
      } else {
        toast('Failed to add opponent profile.', 'error');
      }
    } catch {
      toast('Network error saving opponent profile.', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      <div>
        <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-[#C9A84C]" /> Case Strategy Board & Intelligence
        </h1>
        <p className="text-xs text-slate-300">
          Formulate case theories, identify weak points, counter-arguments, and profile opponent counsel
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cases Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <h3 className="text-base font-bold font-heading text-white mb-3">Active Case Folders</h3>
            
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="h-6 w-6 border-3 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin" />
              </div>
            ) : cases.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No cases found.</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {cases.map((c) => {
                  const isSelected = selectedCaseId === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCase(c.id)}
                      className={`p-3 rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#C9A84C]/20 border-[#C9A84C] text-white shadow-lg'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <p className="font-extrabold text-xs">📁 {c.caseNumber}</p>
                      <p className="text-[11px] font-medium text-slate-400 truncate">{c.title}</p>
                      <span className="text-[9px] font-bold text-[#C9A84C] mt-1 inline-block">🏛️ {c.court}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Strategy Editor Panel */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border border-[#C9A84C]/30 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div>
                <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#C9A84C]" /> Case Strategy Brief
                </h3>
                {lastSaved && <p className="text-[10px] text-emerald-400 font-bold mt-0.5">✓ Auto-saved at {lastSaved}</p>}
              </div>

              <Button
                onClick={() => handleSaveStrategy()}
                disabled={saving}
                className="bg-gradient-to-r from-[#C9A84C] to-[#D4AF37] text-[#0A1628] font-extrabold text-xs px-5 py-2 rounded-xl shadow-lg flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Strategy'}
              </Button>
            </div>

            <form onSubmit={handleSaveStrategy} className="space-y-5 text-xs">
              <div className="space-y-1.5">
                <Label className="font-bold text-[#F3E5AB]">Theory of the Case *</Label>
                <Textarea
                  placeholder="Formulate the overarching legal theory, core narrative, and statutory foundation..."
                  value={theory}
                  onChange={(e) => setTheory(e.target.value)}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="font-bold text-emerald-400">Key Arguments (comma separated)</Label>
                  <Textarea
                    placeholder="e.g. Alibi witness testimony, Lack of Sec 65B Certificate"
                    value={keyArguments}
                    onChange={(e) => setKeyArguments(e.target.value)}
                    className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl min-h-[80px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bold text-rose-400">Weak Points & Vulnerabilities</Label>
                  <Textarea
                    placeholder="e.g. Delay in FIR lodging by 3 days, Missing original bill copies"
                    value={weakPoints}
                    onChange={(e) => setWeakPoints(e.target.value)}
                    className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl min-h-[80px]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-cyan-400">Counter-Arguments to Anticipate</Label>
                <Input
                  placeholder="e.g. Opponent will claim Sec 138 presumption of debt"
                  value={counterArgs}
                  onChange={(e) => setCounterArgs(e.target.value)}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div className="space-y-1.5">
                  <Label className="font-bold text-[#F3E5AB]">Case Strength Rating</Label>
                  <select
                    value={caseStrength}
                    onChange={(e) => setCaseStrength(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl font-bold"
                  >
                    <option value="STRONG">STRONG (High Win Probability)</option>
                    <option value="MODERATE">MODERATE (Requires Settlement/Evidence)</option>
                    <option value="WEAK">WEAK (High Risk)</option>
                    <option value="UNCERTAIN">UNCERTAIN (Bench Dependent)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bold text-[#F3E5AB]">Strength Justification</Label>
                  <Input
                    placeholder="e.g. Supported by Supreme Court 3-judge bench ruling"
                    value={strengthReason}
                    onChange={(e) => setStrengthReason(e.target.value)}
                    className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                  />
                </div>
              </div>
            </form>
          </Card>

          {/* Opponent Profile Form */}
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <h3 className="text-base font-bold font-heading text-white mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-[#C9A84C]" /> Opponent Advocate Intelligence Profile
            </h3>

            <form onSubmit={handleAddOpponent} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-300">Opposing Advocate Name *</Label>
                  <Input
                    placeholder="e.g. Senior Adv. Rajesh Verma"
                    value={opponentName}
                    onChange={(e) => setOpponentName(e.target.value)}
                    className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-300">Law Firm / Chambers</Label>
                  <Input
                    placeholder="e.g. Verma Legal Chambers"
                    value={opponentFirm}
                    onChange={(e) => setOpponentFirm(e.target.value)}
                    className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Behavioral & Tactical Notes</Label>
                <Input
                  placeholder="e.g. Tends to file last-minute interim applications to delay arguments..."
                  value={opponentNotes}
                  onChange={(e) => setOpponentNotes(e.target.value)}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                />
              </div>

              <Button
                type="submit"
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-5 py-2 rounded-xl"
              >
                Record Opponent Profile
              </Button>
            </form>
          </Card>
        </div>

      </div>

    </div>
  );
}
```

---

### File: `src/app/(portals)/senior/cross-exam/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers';
import { Scale, Plus, AlertTriangle, GripVertical, ChevronDown, ChevronRight, Printer } from 'lucide-react';

export default function SeniorCrossExamPage() {
  const { toast } = useToast();
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [builders, setBuilders] = useState<any[]>([]);
  const [selectedBuilder, setSelectedBuilder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Witness form
  const [witnessName, setWitnessName] = useState('');
  const [witnessRole, setWitnessRole] = useState('PW1');

  // Question form
  const [qTheme, setQTheme] = useState('GENERAL');
  const [qText, setQText] = useState('');
  const [qExpectedAnswer, setQExpectedAnswer] = useState('');
  const [qFollowUp, setQFollowUp] = useState('');
  const [qIsTrap, setQIsTrap] = useState(false);

  const [collapsedThemes, setCollapsedThemes] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    try {
      const [casesRes, buildersRes] = await Promise.all([
        fetch('/api/cases'),
        fetch('/api/cross-exam'),
      ]);
      if (casesRes.ok) {
        const d = await casesRes.json();
        setCases(d);
        if (d.length > 0 && !selectedCaseId) setSelectedCaseId(d[0].id);
      }
      if (buildersRes.ok) {
        const d = await buildersRes.json();
        setBuilders(d.builders || []);
      }
    } catch {
      toast('Failed to load cross-exam data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const fetchBuilderForCase = async (caseId: string) => {
    try {
      const res = await fetch(`/api/cross-exam?caseId=${caseId}`);
      if (res.ok) {
        const d = await res.json();
        setBuilders(d.builders || []);
        setSelectedBuilder(null);
      }
    } catch {}
  };

  const handleAddWitness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!witnessName || !selectedCaseId) return;
    try {
      const res = await fetch('/api/cross-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: selectedCaseId, witnessName, witnessRole }),
      });
      if (res.ok) {
        toast(`Witness ${witnessName} (${witnessRole}) added!`, 'success');
        setWitnessName('');
        fetchBuilderForCase(selectedCaseId);
      }
    } catch {
      toast('Failed to add witness.', 'error');
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuilder || !qText) return;
    try {
      const res = await fetch(`/api/cross-exam/${selectedBuilder.id}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: qTheme,
          question: qText,
          expectedAnswer: qExpectedAnswer,
          followUp: qFollowUp,
          isTrap: qIsTrap,
        }),
      });
      if (res.ok) {
        toast('Question added!', 'success');
        setQText('');
        setQExpectedAnswer('');
        setQFollowUp('');
        setQIsTrap(false);
        fetchBuilderForCase(selectedCaseId);
        // Refresh selected builder
        const updated = await (await fetch(`/api/cross-exam?caseId=${selectedCaseId}`)).json();
        const found = updated.builders?.find((b: any) => b.id === selectedBuilder.id);
        if (found) setSelectedBuilder(found);
      }
    } catch {
      toast('Failed to add question.', 'error');
    }
  };

  const toggleTheme = (theme: string) => {
    setCollapsedThemes(prev => {
      const next = new Set(prev);
      if (next.has(theme)) next.delete(theme);
      else next.add(theme);
      return next;
    });
  };

  const groupByTheme = (questions: any[]) => {
    const groups: Record<string, any[]> = {};
    questions.forEach(q => {
      if (!groups[q.theme]) groups[q.theme] = [];
      groups[q.theme].push(q);
    });
    return groups;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
          <Scale className="h-6 w-6 text-[#C9A84C]" /> Cross-Examination Builder
        </h1>
        <p className="text-xs text-slate-300">Build structured cross-examination question banks by witness, grouped by theme, with trap question highlighting</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Case & Witness Selection */}
        <div className="lg:col-span-4 space-y-5">
          {/* Case Selector */}
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 text-xs">
            <Label className="font-bold text-[#F3E5AB] mb-2 block">Select Case</Label>
            <select
              value={selectedCaseId}
              onChange={e => {
                setSelectedCaseId(e.target.value);
                fetchBuilderForCase(e.target.value);
              }}
              className="w-full h-10 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl"
            >
              {cases.map(c => <option key={c.id} value={c.id}>{c.caseNumber} — {c.title}</option>)}
            </select>
          </Card>

          {/* Add Witness Form */}
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 text-xs">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#C9A84C]" /> Add Witness
            </h3>
            <form onSubmit={handleAddWitness} className="space-y-3">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Witness Name *</Label>
                <Input placeholder="e.g. Ramesh Kumar" value={witnessName} onChange={e => setWitnessName(e.target.value)} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl" required />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Witness Role</Label>
                <select value={witnessRole} onChange={e => setWitnessRole(e.target.value)} className="w-full h-9 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl">
                  {['PW1', 'PW2', 'DW1', 'DW2', 'Expert', 'Complainant', 'IO'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <Button type="submit" className="w-full bg-[#C9A84C] text-[#0A1628] font-bold text-xs rounded-xl">Add Witness</Button>
            </form>
          </Card>

          {/* Witness List */}
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 text-xs">
            <h3 className="font-bold text-white mb-3">Witnesses for this Case</h3>
            {builders.length === 0 ? (
              <p className="text-slate-400 italic">No witnesses added yet.</p>
            ) : (
              <div className="space-y-2">
                {builders.map(b => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBuilder(b)}
                    className={`p-3 rounded-xl border cursor-pointer transition ${selectedBuilder?.id === b.id ? 'bg-[#C9A84C]/20 border-[#C9A84C] text-white' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600'}`}
                  >
                    <p className="font-extrabold">{b.witnessName}</p>
                    <p className="text-[10px] text-slate-400">{b.witnessRole} · {b.questions?.length || 0} questions</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Panel: Question Builder */}
        <div className="lg:col-span-8 space-y-5">
          {!selectedBuilder ? (
            <div className="flex flex-col items-center justify-center h-64 rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 text-slate-400 text-sm gap-3">
              <Scale className="h-10 w-10 text-slate-600" />
              <p>Select a witness from the left panel to build cross-examination questions</p>
            </div>
          ) : (
            <>
              {/* Add Question Form */}
              <Card className="border border-[#C9A84C]/30 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white text-sm">
                    Build Questions: <span className="text-[#C9A84C]">{selectedBuilder.witnessName}</span> ({selectedBuilder.witnessRole})
                  </h3>
                  <Button size="sm" onClick={() => window.print()} variant="outline" className="border-slate-700 text-slate-300 text-[10px] flex items-center gap-1">
                    <Printer className="h-3.5 w-3.5" /> Print Court Sheet
                  </Button>
                </div>

                <form onSubmit={handleAddQuestion} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="font-bold text-[#F3E5AB]">Theme / Category</Label>
                      <Input placeholder="e.g. Credibility, Identity, Scene" value={qTheme} onChange={e => setQTheme(e.target.value)} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl" />
                    </div>
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={qIsTrap} onChange={e => setQIsTrap(e.target.checked)} className="h-4 w-4 accent-rose-500" />
                        <span className="font-bold text-rose-400">Mark as Trap Question 🪤</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-bold text-[#F3E5AB]">Question *</Label>
                    <Input placeholder="e.g. You stated you saw the accused at 10 PM. Is that correct?" value={qText} onChange={e => setQText(e.target.value)} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl" required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="font-bold text-slate-300">Expected Answer</Label>
                      <Input placeholder="e.g. Yes, I saw him at the gate" value={qExpectedAnswer} onChange={e => setQExpectedAnswer(e.target.value)} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-bold text-slate-300">Follow-up Question</Label>
                      <Input placeholder="e.g. But you also said the lights were off?" value={qFollowUp} onChange={e => setQFollowUp(e.target.value)} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl" />
                    </div>
                  </div>

                  <Button type="submit" className="bg-gradient-to-r from-[#C9A84C] to-[#D4AF37] text-[#0A1628] font-extrabold text-xs px-5 py-2 rounded-xl">
                    Add Question
                  </Button>
                </form>
              </Card>

              {/* Question List Grouped by Theme */}
              {selectedBuilder.questions?.length > 0 && (
                <div className="space-y-3">
                  {Object.entries(groupByTheme(selectedBuilder.questions)).map(([theme, qs]) => (
                    <Card key={theme} className="border border-slate-800 bg-slate-900/80 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => toggleTheme(theme)}
                        className="w-full flex items-center justify-between p-4 text-xs font-bold text-left hover:bg-slate-800/50 transition"
                      >
                        <span className="text-[#C9A84C] font-extrabold uppercase tracking-wider">{theme} ({(qs as any[]).length})</span>
                        {collapsedThemes.has(theme) ? <ChevronRight className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                      </button>

                      {!collapsedThemes.has(theme) && (
                        <CardContent className="px-4 pb-4 space-y-2">
                          {(qs as any[]).map((q, i) => (
                            <div key={q.id} className={`p-3.5 rounded-xl border text-xs ${q.isTrap ? 'border-rose-800 bg-rose-950/40 border-l-4 border-l-rose-500' : 'border-slate-800 bg-slate-950'}`}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="font-bold text-white">Q{i + 1}: {q.question}</p>
                                  {q.expectedAnswer && <p className="text-slate-400 mt-1 italic">Expected: {q.expectedAnswer}</p>}
                                  {q.followUp && <p className="text-cyan-400 mt-1">Follow-up: {q.followUp}</p>}
                                </div>
                                {q.isTrap && (
                                  <span className="px-2 py-0.5 rounded-full bg-rose-900 text-rose-300 font-bold text-[9px] whitespace-nowrap">🪤 TRAP</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### File: `src/app/(portals)/senior/drafts/page.tsx`

```typescript
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers';
import {
  FileEdit, Plus, Save, FileText, Mic, MicOff,
  Bold, Italic, UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, List, ListOrdered,
  TableIcon, Highlighter, Send, Download
} from 'lucide-react';

export default function SeniorDraftsPage() {
  const { toast } = useToast();

  const [cases, setCases] = useState<any[]>([]);
  const [juniors, setJuniors] = useState<any[]>([]);
  const [draftsList, setDraftsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<any | null>(null);

  const [draftTitle, setDraftTitle] = useState('');
  const [draftCaseId, setDraftCaseId] = useState('');
  const [draftType, setDraftType] = useState('PETITION');
  const [draftStatus, setDraftStatus] = useState('DRAFTING');
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isDictating, setIsDictating] = useState(false);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: true }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[400px] focus:outline-none text-slate-100 text-sm leading-relaxed p-4',
      },
    },
    onUpdate: () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        handleAutoSave();
      }, 30000);
    },
  });

  const fetchData = async () => {
    try {
      const [casesRes, juniorsRes, draftsRes] = await Promise.all([
        fetch('/api/cases'),
        fetch('/api/juniors'),
        fetch('/api/senior-drafts'),
      ]);
      if (casesRes.ok) setCases(await casesRes.json());
      if (juniorsRes.ok) {
        const d = await juniorsRes.json();
        setJuniors(d.juniors || d || []);
      }
      if (draftsRes.ok) {
        const d = await draftsRes.json();
        setDraftsList(d.drafts || []);
      }
    } catch {
      toast('Failed to load drafts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  const handleAutoSave = useCallback(async () => {
    if (!draftTitle || !draftCaseId || !editor) return;
    setAutoSaving(true);
    try {
      const content = JSON.stringify(editor.getJSON());
      const method = selectedDraft ? 'PATCH' : 'POST';
      const url = selectedDraft ? `/api/senior-drafts/${selectedDraft.id}` : '/api/senior-drafts';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: draftCaseId, title: draftTitle, type: draftType, content }),
      });
      if (res.ok) {
        const data = await res.json();
        if (!selectedDraft && data.draft) setSelectedDraft(data.draft);
        setLastSaved(new Date().toLocaleTimeString('en-IN'));
        fetchData();
      }
    } catch {}
    setAutoSaving(false);
  }, [draftTitle, draftCaseId, draftType, editor, selectedDraft]);

  const startNewDraft = () => {
    setSelectedDraft(null);
    setDraftTitle('');
    setDraftCaseId(cases[0]?.id || '');
    setDraftType('PETITION');
    setDraftStatus('DRAFTING');
    editor?.commands.clearContent();
    setShowEditor(true);
    setLastSaved(null);
  };

  const openDraft = (d: any) => {
    setSelectedDraft(d);
    setDraftTitle(d.title);
    setDraftCaseId(d.caseId);
    setDraftType(d.type);
    setDraftStatus(d.status);
    try {
      const content = JSON.parse(d.content);
      editor?.commands.setContent(content);
    } catch {
      editor?.commands.setContent(d.content || '');
    }
    setShowEditor(true);
    setLastSaved(null);
  };

  const handleSpeechDictation = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast('Speech recognition is not supported in this browser.', 'error');
      return;
    }

    if (isDictating && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsDictating(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      editor?.commands.insertContent(transcript + ' ');
    };

    recognition.onerror = () => {
      setIsDictating(false);
      toast('Speech recognition error.', 'error');
    };

    recognition.onend = () => setIsDictating(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsDictating(true);
    toast('Dictation started. Speak now...', 'success');
  };

  const handleSendToJunior = async (juniorId: string) => {
    if (!selectedDraft?.id) {
      toast('Please save draft first.', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/senior-drafts/${selectedDraft.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ juniorId }),
      });
      if (res.ok) {
        toast('Draft sent to junior as FILING task!', 'success');
        fetchData();
      } else {
        toast('Failed to send draft to junior.', 'error');
      }
    } catch {
      toast('Network error.', 'error');
    }
  };

  const TYPE_OPTIONS = ['PETITION', 'AFFIDAVIT', 'NOTICE', 'ARGUMENT', 'OTHER'];

  return (
    <div className="space-y-6 max-w-full mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
            <FileEdit className="h-6 w-6 text-[#C9A84C]" /> Senior Drafting Desk
          </h1>
          <p className="text-xs text-slate-300">Rich-text legal drafting with Web Speech dictation and junior dispatch</p>
        </div>
        <Button onClick={startNewDraft} className="bg-gradient-to-r from-[#C9A84C] to-[#D4AF37] text-[#0A1628] font-extrabold text-xs px-5 py-2 rounded-xl flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> New Draft
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Drafts Sidebar */}
        <div className="lg:col-span-3 space-y-3">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#C9A84C] px-1">Draft Archive</p>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {loading ? (
              <div className="text-center py-8 text-xs text-slate-400">Loading...</div>
            ) : draftsList.length === 0 ? (
              <p className="text-xs text-slate-400 italic px-1">No drafts yet. Click + New Draft to begin.</p>
            ) : (
              draftsList.map((d) => (
                <div
                  key={d.id}
                  onClick={() => openDraft(d)}
                  className={`p-3 rounded-xl border cursor-pointer transition text-xs ${
                    selectedDraft?.id === d.id
                      ? 'bg-[#C9A84C]/20 border-[#C9A84C] text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <p className="font-extrabold truncate">{d.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{d.type} · {d.case?.caseNumber}</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block ${
                    d.status === 'FILED' ? 'bg-emerald-900 text-emerald-300' :
                    d.status === 'SENT_TO_JUNIOR' ? 'bg-amber-900 text-amber-300' :
                    'bg-slate-800 text-slate-300'
                  }`}>{d.status}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tiptap Editor */}
        <div className="lg:col-span-9">
          {showEditor ? (
            <div className="border border-[#C9A84C]/30 bg-slate-900/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
              {/* Draft Meta */}
              <div className="p-4 border-b border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="space-y-1">
                    <Label className="font-bold text-[#F3E5AB] text-[10px]">DOCUMENT TITLE</Label>
                    <Input
                      placeholder="e.g. Bail Application - State vs Kumar"
                      value={draftTitle}
                      onChange={e => setDraftTitle(e.target.value)}
                      className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="font-bold text-[#F3E5AB] text-[10px]">CASE</Label>
                    <select
                      value={draftCaseId}
                      onChange={e => setDraftCaseId(e.target.value)}
                      className="w-full h-9 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl"
                    >
                      <option value="">Select Case...</option>
                      {cases.map(c => <option key={c.id} value={c.id}>{c.caseNumber}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="font-bold text-[#F3E5AB] text-[10px]">DOCUMENT TYPE</Label>
                    <select
                      value={draftType}
                      onChange={e => setDraftType(e.target.value)}
                      className="w-full h-9 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl"
                    >
                      {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div className="px-4 py-2 border-b border-slate-800 flex flex-wrap gap-1 items-center">
                <button onClick={() => editor?.chain().focus().toggleBold().run()} className={`p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition ${editor?.isActive('bold') ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : ''}`}><Bold className="h-3.5 w-3.5" /></button>
                <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={`p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition ${editor?.isActive('italic') ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : ''}`}><Italic className="h-3.5 w-3.5" /></button>
                <button onClick={() => editor?.chain().focus().toggleUnderline().run()} className={`p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition ${editor?.isActive('underline') ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : ''}`}><UnderlineIcon className="h-3.5 w-3.5" /></button>
                <button onClick={() => editor?.chain().focus().toggleStrike().run()} className={`p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition ${editor?.isActive('strike') ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : ''}`}><Strikethrough className="h-3.5 w-3.5" /></button>
                <button onClick={() => editor?.chain().focus().toggleHighlight().run()} className={`p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition ${editor?.isActive('highlight') ? 'bg-amber-500/20 text-amber-400' : ''}`}><Highlighter className="h-3.5 w-3.5" /></button>

                <div className="w-px h-5 bg-slate-700 mx-1" />
                <button onClick={() => editor?.chain().focus().setTextAlign('left').run()} className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"><AlignLeft className="h-3.5 w-3.5" /></button>
                <button onClick={() => editor?.chain().focus().setTextAlign('center').run()} className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"><AlignCenter className="h-3.5 w-3.5" /></button>
                <button onClick={() => editor?.chain().focus().setTextAlign('right').run()} className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"><AlignRight className="h-3.5 w-3.5" /></button>

                <div className="w-px h-5 bg-slate-700 mx-1" />
                <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition ${editor?.isActive('bulletList') ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : ''}`}><List className="h-3.5 w-3.5" /></button>
                <button onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={`p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition ${editor?.isActive('orderedList') ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : ''}`}><ListOrdered className="h-3.5 w-3.5" /></button>
                <button onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3 }).run()} className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"><TableIcon className="h-3.5 w-3.5" /></button>

                <div className="w-px h-5 bg-slate-700 mx-1" />
                <button
                  onClick={handleSpeechDictation}
                  className={`p-1.5 rounded-lg transition flex items-center gap-1 text-[10px] font-bold ${isDictating ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-slate-300 hover:text-white'}`}
                >
                  {isDictating ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                  {isDictating ? 'Stop Dictation' : 'Dictate'}
                </button>

                <div className="ml-auto flex items-center gap-2">
                  {lastSaved && <span className="text-[10px] text-emerald-400 font-bold">✓ Saved {lastSaved}</span>}
                  <Button onClick={handleAutoSave} disabled={autoSaving} size="sm" className="bg-[#C9A84C] text-[#0A1628] font-bold text-[10px] px-3 py-1 rounded-lg flex items-center gap-1">
                    <Save className="h-3.5 w-3.5" /> {autoSaving ? 'Saving...' : 'Save Draft'}
                  </Button>
                </div>
              </div>

              {/* Editor Area */}
              <div className="bg-slate-950 min-h-[420px]">
                <EditorContent editor={editor} />
              </div>

              {/* Footer Actions */}
              <div className="px-4 py-3 border-t border-slate-800 flex flex-wrap gap-2 items-center justify-between">
                <div className="flex gap-2">
                  <select
                    className="h-8 px-2.5 bg-slate-950 border border-slate-800 text-white text-[10px] rounded-lg"
                    onChange={e => { if (e.target.value) handleSendToJunior(e.target.value); }}
                    defaultValue=""
                  >
                    <option value="">Send to Junior →</option>
                    {juniors.map((j: any) => (
                      <option key={j.id} value={j.id}>{j.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 text-[10px] font-bold">
                  <span className="text-slate-400 self-center">Export:</span>
                  <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 text-[10px] h-7 px-3 rounded-lg">PDF</Button>
                  <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 text-[10px] h-7 px-3 rounded-lg">DOCX</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 text-slate-400 text-sm gap-3">
              <FileEdit className="h-12 w-12 text-slate-600" />
              <p className="font-bold">Select a draft from the left sidebar or create a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### File: `src/app/(portals)/senior/review/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/providers';
import { Inbox, FileText, BookOpen, GraduationCap, Clock, CheckCircle2, RotateCcw, Download } from 'lucide-react';

export default function SeniorReviewQueuePage() {
  const { toast } = useToast();

  const [queue, setQueue] = useState<any>({
    drafts: [],
    researchLogs: [],
    learningItems: [],
    timeLogs: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'DRAFTS' | 'RESEARCH' | 'LEARNING' | 'TIMESHEETS'>('DRAFTS');

  // Review action modal / inline feedback state
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [reviewComments, setReviewComments] = useState('');

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/review/queue');
      if (res.ok) {
        const data = await res.json();
        if (data.queue) setQueue(data.queue);
      }
    } catch {
      toast('Failed to load review queue.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleReviewDraft = async (draftId: string, status: 'APPROVED' | 'REDO') => {
    try {
      const res = await fetch(`/api/drafts/${draftId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, comments: reviewComments }),
      });

      if (res.ok) {
        toast(`Draft marked as ${status}!`, 'success');
        setSelectedDraftId(null);
        setReviewComments('');
        fetchQueue();
      } else {
        toast('Failed to submit review.', 'error');
      }
    } catch {
      toast('Network error submitting review.', 'error');
    }
  };

  const handleApproveResearch = async (id: string, approved: boolean) => {
    try {
      const res = await fetch(`/api/research/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      });

      if (res.ok) {
        toast(`Research note ${approved ? 'APPROVED' : 'REJECTED'}!`, 'success');
        fetchQueue();
      }
    } catch {
      toast('Network error approving research.', 'error');
    }
  };

  const handleReviewLearning = async (id: string, status: 'REVIEWED' | 'REDO') => {
    try {
      const res = await fetch(`/api/learning/${id}/summary`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: 'Senior reviewed', status }),
      });

      if (res.ok) {
        toast(`Learning summary marked as ${status}!`, 'success');
        fetchQueue();
      }
    } catch {
      toast('Network error updating learning item.', 'error');
    }
  };

  const handleApproveTimeLog = async (id: string, approved: boolean) => {
    try {
      const res = await fetch('/api/timelogs/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logIds: [id], approved }),
      });

      if (res.ok) {
        toast(`Time log entry ${approved ? 'APPROVED' : 'REJECTED'}!`, 'success');
        fetchQueue();
      }
    } catch {
      toast('Network error approving time log.', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      <div>
        <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
          <Inbox className="h-6 w-6 text-[#C9A84C]" /> Unified Junior Review Queue
        </h1>
        <p className="text-xs text-slate-300">
          Review, comment, approve, or request REDO on all submissions across your junior advocate team
        </p>
      </div>

      {/* TABS HEADER */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('DRAFTS')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'DRAFTS'
              ? 'bg-[#C9A84C] text-[#0A1628] shadow-lg'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <FileText className="h-4 w-4" /> Legal Drafts ({queue.drafts?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('RESEARCH')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'RESEARCH'
              ? 'bg-[#C9A84C] text-[#0A1628] shadow-lg'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <BookOpen className="h-4 w-4" /> Research Notes ({queue.researchLogs?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('LEARNING')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'LEARNING'
              ? 'bg-[#C9A84C] text-[#0A1628] shadow-lg'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <GraduationCap className="h-4 w-4" /> Learning Summaries ({queue.learningItems?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('TIMESHEETS')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'TIMESHEETS'
              ? 'bg-[#C9A84C] text-[#0A1628] shadow-lg'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Clock className="h-4 w-4" /> Timesheet Logs ({queue.timeLogs?.length || 0})
        </button>
      </div>

      {/* TAB CONTENT */}
      <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 border-4 border-slate-800 border-t-[#C9A84C] rounded-full animate-spin" />
          </div>
        ) : (
          <div>
            {/* DRAFTS TAB */}
            {activeTab === 'DRAFTS' && (
              <div className="space-y-4 text-xs">
                {queue.drafts?.length === 0 ? (
                  <p className="text-slate-400 italic text-center py-10">No pending legal drafts awaiting review.</p>
                ) : (
                  queue.drafts?.map((d: any) => (
                    <div key={d.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="font-extrabold text-white text-sm">{d.title}</p>
                          <p className="text-[10px] text-slate-400">📁 Case: {d.case?.caseNumber} · Junior: {d.junior?.name}</p>
                        </div>
                        <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-[#C9A84C] font-bold hover:underline flex items-center gap-1">
                          <Download className="h-3.5 w-3.5" /> Download Draft PDF
                        </a>
                      </div>

                      {selectedDraftId === d.id ? (
                        <div className="space-y-3 pt-2">
                          <Textarea
                            placeholder="Add senior feedback notes for junior advocate..."
                            value={reviewComments}
                            onChange={(e) => setReviewComments(e.target.value)}
                            className="border-slate-800 bg-slate-900 text-white text-xs rounded-xl"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleReviewDraft(d.id, 'APPROVED')} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
                              Approve Draft
                            </Button>
                            <Button size="sm" onClick={() => handleReviewDraft(d.id, 'REDO')} className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs">
                              Request REDO
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setSelectedDraftId(null)} className="border-slate-800 text-slate-300 text-xs">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedDraftId(d.id);
                            setReviewComments('');
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4"
                        >
                          Review & Comment
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* RESEARCH TAB */}
            {activeTab === 'RESEARCH' && (
              <div className="space-y-4 text-xs">
                {queue.researchLogs?.length === 0 ? (
                  <p className="text-slate-400 italic text-center py-10">No research entries pending approval.</p>
                ) : (
                  queue.researchLogs?.map((r: any) => (
                    <div key={r.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-white">📁 Case: {r.case?.caseNumber} · Advocate: {r.junior?.name}</span>
                        <span className="bg-[#C9A84C]/15 text-[#C9A84C] px-2 py-0.5 rounded font-bold text-[10px]">{r.source}</span>
                      </div>
                      <p className="text-[#C9A84C] font-bold">Citations: {r.citations?.join(' | ') || 'N/A'}</p>
                      <p className="text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800">{r.summary}</p>
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" onClick={() => handleApproveResearch(r.id, true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
                          Approve Note
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* LEARNING TAB */}
            {activeTab === 'LEARNING' && (
              <div className="space-y-4 text-xs">
                {queue.learningItems?.length === 0 ? (
                  <p className="text-slate-400 italic text-center py-10">No learning summaries submitted for review.</p>
                ) : (
                  queue.learningItems?.map((l: any) => (
                    <div key={l.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-white">{l.title}</span>
                        <span className="text-slate-400 text-[10px]">Submitted by: {l.junior?.name}</span>
                      </div>
                      <p className="text-slate-200 bg-slate-900 p-3 rounded-lg border border-slate-800">{l.summary}</p>
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" onClick={() => handleReviewLearning(l.id, 'REVIEWED')} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
                          Mark Understood
                        </Button>
                        <Button size="sm" onClick={() => handleReviewLearning(l.id, 'REDO')} className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs">
                          Request REDO
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TIMESHEETS TAB */}
            {activeTab === 'TIMESHEETS' && (
              <div className="space-y-4 text-xs">
                {queue.timeLogs?.length === 0 ? (
                  <p className="text-slate-400 italic text-center py-10">No pending time log entries for approval.</p>
                ) : (
                  queue.timeLogs?.map((t: any) => (
                    <div key={t.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">{t.junior?.name} → {t.task?.title}</p>
                        <p className="text-[10px] text-slate-400">Category: {t.category} · Duration: {t.duration || 0} hrs</p>
                      </div>
                      <Button size="sm" onClick={() => handleApproveTimeLog(t.id, true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
                        Approve Log
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </Card>

    </div>
  );
}
```

---

### File: `src/app/(portals)/senior/checklist/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/providers';
import { CheckSquare, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export default function SeniorChecklistPage() {
  const { toast } = useToast();
  const [cases, setCases] = useState<any[]>([]);
  const [checklists, setChecklists] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [expandedCase, setExpandedCase] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/cases');
      if (res.ok) {
        const data = await res.json();
        const now = new Date();
        const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        const upcoming = data.filter((c: any) => {
          if (!c.nextHearing) return false;
          const d = new Date(c.nextHearing);
          return d >= now && d <= in14Days;
        });
        setCases(upcoming);

        // Fetch checklists for each upcoming case
        const checklistMap: Record<string, any> = {};
        await Promise.all(
          upcoming.map(async (c: any) => {
            try {
              const cRes = await fetch(`/api/checklist/${c.id}`);
              if (cRes.ok) {
                const cData = await cRes.json();
                checklistMap[c.id] = cData.checklist || null;
              }
            } catch {}
          })
        );
        setChecklists(checklistMap);
      }
    } catch {
      toast('Failed to load checklist data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggle = async (caseId: string, key: string, val: boolean) => {
    const existing = checklists[caseId] || {};
    const updated = { ...existing, [key]: val };
    const items = ['documentsReady', 'argumentsDrafted', 'clientBriefed', 'juniorBriefed', 'vakalatnama', 'feeCollected'];
    const completionPct = Math.round((items.filter(k => updated[k]).length / 6) * 100);

    try {
      const res = await fetch(`/api/checklist/${caseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updated, completionPct }),
      });
      if (res.ok) {
        const data = await res.json();
        setChecklists(prev => ({ ...prev, [caseId]: data.checklist }));
        toast(`Updated: ${completionPct}% ready`, 'success');
      }
    } catch {
      toast('Failed to update checklist.', 'error');
    }
  };

  const CHECKLIST_ITEMS = [
    { key: 'documentsReady', label: 'Brief & Case Files Ready' },
    { key: 'argumentsDrafted', label: 'Written Arguments Drafted' },
    { key: 'clientBriefed', label: 'Client Pre-Hearing Briefed' },
    { key: 'juniorBriefed', label: 'Junior Advocate Briefed' },
    { key: 'vakalatnama', label: 'Vakalatnama Filed on Record' },
    { key: 'feeCollected', label: 'Retainer Fee Collected' },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-[#C9A84C]" /> 14-Day Pre-Hearing Checklist
        </h1>
        <p className="text-xs text-slate-300">
          Track preparation status for all upcoming hearings in the next 14 days
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 border-4 border-slate-800 border-t-[#C9A84C] rounded-full animate-spin" />
        </div>
      ) : cases.length === 0 ? (
        <div className="text-center py-20 text-slate-400 text-sm">No hearings scheduled in the next 14 days.</div>
      ) : (
        <div className="space-y-4">
          {cases.map((c) => {
            const cl = checklists[c.id];
            const pct = cl?.completionPct ?? 0;
            const hearing = new Date(c.nextHearing);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const isTomorrow = hearing.toDateString() === tomorrow.toDateString();
            const rowColor = pct === 100 ? 'border-emerald-600/50' : isTomorrow && pct < 50 ? 'border-rose-600/60' : 'border-slate-800';
            const isExpanded = expandedCase === c.id;

            return (
              <Card key={c.id} className={`bg-slate-900/80 border ${rowColor} rounded-2xl overflow-hidden transition`}>
                <div
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedCase(isExpanded ? null : c.id)}
                >
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-slate-400 font-semibold">Case</p>
                      <p className="font-extrabold text-white">{c.caseNumber}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold">Court</p>
                      <p className="font-bold text-[#C9A84C]">{c.court}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold">Hearing Date</p>
                      <p className={`font-bold ${isTomorrow ? 'text-rose-400' : 'text-white'}`}>
                        {hearing.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {isTomorrow && ' ⚠️'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold">Completion</p>
                      <p className={`font-extrabold ${pct === 100 ? 'text-emerald-400' : pct < 50 ? 'text-rose-400' : 'text-amber-400'}`}>
                        {pct}%
                      </p>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    {pct === 100 ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : isTomorrow ? (
                      <AlertTriangle className="h-5 w-5 text-rose-400 animate-pulse" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-400" />
                    )}
                    <span className="text-xs text-slate-400">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="px-4 pb-1">
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${pct === 100 ? 'bg-emerald-400' : 'bg-[#C9A84C]'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Expanded checklist rows */}
                {isExpanded && (
                  <CardContent className="px-4 pb-4 pt-3 border-t border-slate-800 space-y-2 mt-2">
                    {CHECKLIST_ITEMS.map((item) => (
                      <label key={item.key} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-[#C9A84C]/40 transition">
                        <span className="font-semibold text-white">{item.label}</span>
                        <input
                          type="checkbox"
                          checked={cl?.[item.key] || false}
                          onChange={(e) => handleToggle(c.id, item.key, e.target.checked)}
                          className="h-4 w-4 rounded accent-[#C9A84C]"
                        />
                      </label>
                    ))}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

---

### File: `src/app/(portals)/senior/judgments/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers';
import { FileCheck, Plus, ExternalLink, Download, Tag, Upload } from 'lucide-react';

const LAW_AREAS = ['CRIMINAL', 'CIVIL', 'FAMILY', 'CORPORATE', 'PROPERTY'];

export default function SeniorJudgmentsPage() {
  const { toast } = useToast();
  const [judgments, setJudgments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '', court: '', year: '', lawArea: 'CRIMINAL',
    fileUrl: '', highlights: '', tags: '', isShared: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchJudgments = async () => {
    try {
      const res = await fetch('/api/judgments');
      if (res.ok) {
        const d = await res.json();
        setJudgments(d.judgments || []);
      }
    } catch {
      toast('Failed to load judgment library.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJudgments(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.court || !form.year || !form.fileUrl) {
      toast('Title, court, year, and PDF URL are required.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/judgments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          year: parseInt(form.year),
          highlights: form.highlights.split(',').map(h => h.trim()).filter(Boolean),
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        toast('Judgment added to library!', 'success');
        setForm({ title: '', court: '', year: '', lawArea: 'CRIMINAL', fileUrl: '', highlights: '', tags: '', isShared: false });
        setShowForm(false);
        fetchJudgments();
      } else {
        toast('Failed to save judgment.', 'error');
      }
    } catch {
      toast('Network error.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const AREA_COLORS: Record<string, string> = {
    CRIMINAL: 'text-rose-400 bg-rose-950 border-rose-800',
    CIVIL: 'text-blue-400 bg-blue-950 border-blue-800',
    FAMILY: 'text-purple-400 bg-purple-950 border-purple-800',
    CORPORATE: 'text-amber-400 bg-amber-950 border-amber-800',
    PROPERTY: 'text-emerald-400 bg-emerald-950 border-emerald-800',
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-[#C9A84C]" /> Senior Judgment Library
          </h1>
          <p className="text-xs text-slate-300">Upload, annotate, and share landmark court judgments with your team</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-[#C9A84C] to-[#D4AF37] text-[#0A1628] font-extrabold text-xs px-5 py-2 rounded-xl flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Add Judgment
        </Button>
      </div>

      {/* Add Judgment Form */}
      {showForm && (
        <Card className="border border-[#C9A84C]/30 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6">
          <h3 className="text-sm font-bold font-heading text-white mb-5">Upload Judgment PDF</h3>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="font-bold text-[#F3E5AB]">Judgment Title *</Label>
                <Input placeholder="e.g. Arnesh Kumar v. State of Bihar (2014)" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl" required />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-[#F3E5AB]">Court *</Label>
                <Input placeholder="e.g. Supreme Court of India" value={form.court} onChange={e => setForm(f => ({ ...f, court: e.target.value }))} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="font-bold text-[#F3E5AB]">Year *</Label>
                  <Input placeholder="2014" type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl" required />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-bold text-[#F3E5AB]">Law Area</Label>
                  <select value={form.lawArea} onChange={e => setForm(f => ({ ...f, lawArea: e.target.value }))} className="w-full h-10 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl">
                    {LAW_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-[#F3E5AB]">Cloudinary PDF URL *</Label>
              <Input placeholder="https://res.cloudinary.com/...judgment.pdf" value={form.fileUrl} onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Key Paragraph Highlights (comma-separated)</Label>
                <Input placeholder="e.g. Para 15, Para 22, Para 31" value={form.highlights} onChange={e => setForm(f => ({ ...f, highlights: e.target.value }))} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Tags (comma-separated)</Label>
                <Input placeholder="bail, arrest, Section 41A CrPC" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl" />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer text-xs">
              <input type="checkbox" checked={form.isShared} onChange={e => setForm(f => ({ ...f, isShared: e.target.checked }))} className="h-4 w-4 accent-[#C9A84C]" />
              <span className="font-bold text-white">Share with all firm members</span>
            </label>

            <div className="flex gap-3">
              <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-[#C9A84C] to-[#D4AF37] text-[#0A1628] font-extrabold text-xs px-6 py-2 rounded-xl">
                {submitting ? 'Uploading...' : 'Add to Library'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-slate-800 text-slate-300 text-xs rounded-xl">Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* PDF Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="w-full max-w-4xl h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="h-12 bg-slate-900 flex items-center justify-between px-4">
              <span className="text-xs font-bold text-white">Judgment Preview</span>
              <button onClick={() => setPreviewUrl(null)} className="text-slate-400 hover:text-white text-xs font-bold">✕ Close</button>
            </div>
            <iframe src={previewUrl} className="w-full h-[calc(100%-3rem)]" title="Judgment PDF" />
          </div>
        </div>
      )}

      {/* Judgment Cards */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 border-4 border-slate-800 border-t-[#C9A84C] rounded-full animate-spin" /></div>
      ) : judgments.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm italic">No judgments in library yet. Upload your first judgment above.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {judgments.map(j => (
            <Card key={j.id} className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 text-xs hover:border-[#C9A84C]/40 transition">
              <div className="mb-3">
                <p className="font-extrabold text-white text-sm leading-snug">{j.title}</p>
                <p className="text-slate-400 text-[10px] mt-1">{j.court} · {j.year}</p>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${AREA_COLORS[j.lawArea] || 'text-slate-400 bg-slate-800 border-slate-700'}`}>{j.lawArea}</span>
                  {j.isShared && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-900/60 text-emerald-400 border border-emerald-800">Shared</span>}
                </div>
              </div>

              {j.highlights?.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold text-[#C9A84C] mb-1">Key Paragraphs:</p>
                  <div className="flex gap-1 flex-wrap">
                    {j.highlights.map((h: string) => (
                      <span key={h} className="px-1.5 py-0.5 rounded bg-[#C9A84C]/10 text-[#C9A84C] text-[9px] font-bold">{h}</span>
                    ))}
                  </div>
                </div>
              )}

              {j.tags?.length > 0 && (
                <div className="flex gap-1 flex-wrap mb-3">
                  {j.tags.map((tag: string) => (
                    <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-400">#{tag}</span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button size="sm" onClick={() => setPreviewUrl(j.fileUrl)} className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] px-3 py-1 rounded-lg flex items-center gap-1 flex-1">
                  <ExternalLink className="h-3 w-3" /> Preview PDF
                </Button>
                <a href={j.fileUrl} download target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 font-bold text-[10px] px-2 py-1 rounded-lg">
                    <Download className="h-3 w-3" />
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### File: `src/app/(portals)/senior/vault/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers';
import { BookMarked, Plus, Search, Copy, Tag, Filter } from 'lucide-react';

const LAW_AREAS = ['ALL', 'CRIMINAL', 'CIVIL', 'FAMILY', 'CORPORATE', 'PROPERTY'];
const TYPES = ['ALL', 'ARGUMENT', 'CITATION', 'CLAUSE', 'TEMPLATE'];

export default function SeniorVaultPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterArea, setFilterArea] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  const [form, setForm] = useState({
    title: '',
    type: 'ARGUMENT',
    content: '',
    lawArea: 'CRIMINAL',
    court: '',
    year: '',
    tags: '',
    isShared: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/vault');
      if (res.ok) {
        const d = await res.json();
        setItems(d.items || []);
      }
    } catch {
      toast('Failed to load precedent vault.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      toast('Title and content are required.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
          year: form.year ? parseInt(form.year) : null,
        }),
      });
      if (res.ok) {
        toast('Precedent saved to vault!', 'success');
        setForm({ title: '', type: 'ARGUMENT', content: '', lawArea: 'CRIMINAL', court: '', year: '', tags: '', isShared: false });
        setShowForm(false);
        fetchItems();
      } else {
        toast('Failed to save precedent.', 'error');
      }
    } catch {
      toast('Network error.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast('Copied to clipboard!', 'success');
  };

  const AREA_COLORS: Record<string, string> = {
    CRIMINAL: 'text-rose-400 bg-rose-950',
    CIVIL: 'text-blue-400 bg-blue-950',
    FAMILY: 'text-purple-400 bg-purple-950',
    CORPORATE: 'text-amber-400 bg-amber-950',
    PROPERTY: 'text-emerald-400 bg-emerald-950',
  };

  const filtered = items.filter(it => {
    const matchesSearch = !search || it.title.toLowerCase().includes(search.toLowerCase()) || it.content.toLowerCase().includes(search.toLowerCase());
    const matchesArea = filterArea === 'ALL' || it.lawArea === filterArea;
    const matchesType = filterType === 'ALL' || it.type === filterType;
    return matchesSearch && matchesArea && matchesType;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-[#C9A84C]" /> Senior Precedent Vault
          </h1>
          <p className="text-xs text-slate-300">Store and retrieve argument snippets, legal clauses, case citations, and templates</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-[#C9A84C] to-[#D4AF37] text-[#0A1628] font-extrabold text-xs px-5 py-2 rounded-xl flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Add Precedent
        </Button>
      </div>

      {/* Add Form */}
      {showForm && (
        <Card className="border border-[#C9A84C]/30 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6">
          <h3 className="text-sm font-bold font-heading text-white mb-5">New Precedent Entry</h3>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="font-bold text-[#F3E5AB]">Title *</Label>
                <Input placeholder="e.g. Bail Application — IPC 302 Grounds" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl" required />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-[#F3E5AB]">Entry Type</Label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full h-10 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl">
                  {TYPES.filter(t => t !== 'ALL').map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-[#F3E5AB]">Content / Argument Snippet *</Label>
              <Textarea placeholder="Paste argument, clause text, or citation here..." value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl min-h-[120px]" required />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Law Area</Label>
                <select value={form.lawArea} onChange={e => setForm(f => ({ ...f, lawArea: e.target.value }))} className="w-full h-9 px-2 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl">
                  {LAW_AREAS.filter(a => a !== 'ALL').map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Court</Label>
                <Input placeholder="e.g. Supreme Court" value={form.court} onChange={e => setForm(f => ({ ...f, court: e.target.value }))} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Year</Label>
                <Input placeholder="e.g. 2023" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl h-9" type="number" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Tags (comma-separated)</Label>
                <Input placeholder="bail, IPC 302" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl h-9" />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer text-xs">
              <input type="checkbox" checked={form.isShared} onChange={e => setForm(f => ({ ...f, isShared: e.target.checked }))} className="h-4 w-4 accent-[#C9A84C]" />
              <span className="font-bold text-white">Share with all firm members (visible to all juniors & seniors)</span>
            </label>

            <div className="flex gap-3">
              <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-[#C9A84C] to-[#D4AF37] text-[#0A1628] font-extrabold text-xs px-6 py-2 rounded-xl">
                {submitting ? 'Saving...' : 'Add to Vault'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-slate-800 text-slate-300 text-xs rounded-xl">Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search vault entries..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 border-slate-800 bg-slate-900 text-white text-xs rounded-xl h-9"
          />
        </div>
        <div className="flex gap-2 text-xs font-bold flex-wrap">
          {LAW_AREAS.map(area => (
            <button key={area} onClick={() => setFilterArea(area)} className={`px-3 py-1.5 rounded-lg transition ${filterArea === area ? 'bg-[#C9A84C] text-[#0A1628]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of vault items */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 border-4 border-slate-800 border-t-[#C9A84C] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm italic">No precedents match your filters.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(it => (
            <Card key={it.id} className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 text-xs hover:border-[#C9A84C]/40 transition group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="font-extrabold text-white text-sm leading-tight">{it.title}</p>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${AREA_COLORS[it.lawArea] || 'text-slate-400 bg-slate-800'}`}>{it.lawArea}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#C9A84C]/15 text-[#C9A84C]">{it.type}</span>
                    {it.court && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-300">{it.court} {it.year || ''}</span>}
                  </div>
                </div>
                <button onClick={() => handleCopy(it.content)} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-[#C9A84C] hover:bg-slate-700 transition opacity-0 group-hover:opacity-100">
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>

              <p className="text-slate-300 line-clamp-3 leading-relaxed border-l-2 border-[#C9A84C]/30 pl-3 italic">{it.content}</p>

              {it.tags?.length > 0 && (
                <div className="flex gap-1 flex-wrap mt-3">
                  {it.tags.map((tag: string) => (
                    <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-400">#{tag}</span>
                  ))}
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <Button onClick={() => handleCopy(it.content)} size="sm" className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] px-3 py-1 rounded-lg flex items-center gap-1 flex-1">
                  <Copy className="h-3 w-3" /> Copy to Clipboard
                </Button>
                {it.isShared && (
                  <span className="px-2 py-1 rounded-lg bg-emerald-900/60 text-emerald-400 font-bold text-[9px] flex items-center">Shared</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### File: `src/app/(portals)/senior/analytics/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers';
import { BarChart3, TrendingUp, Scale, Gavel, FileEdit, Plus } from 'lucide-react';

const OUTCOME_COLORS: Record<string, string> = {
  WON: 'bg-emerald-900 text-emerald-300 border-emerald-700',
  LOST: 'bg-rose-900 text-rose-300 border-rose-700',
  SETTLED: 'bg-blue-900 text-blue-300 border-blue-700',
  WITHDRAWN: 'bg-slate-800 text-slate-300 border-slate-700',
  COMPROMISED: 'bg-amber-900 text-amber-300 border-amber-700',
};

export default function SeniorAnalyticsPage() {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOutcomeForm, setShowOutcomeForm] = useState(false);
  const [cases, setCases] = useState<any[]>([]);

  const [form, setForm] = useState({
    caseId: '',
    outcome: 'WON',
    court: '',
    lawArea: 'CRIMINAL',
    duration: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [analyticsRes, casesRes] = await Promise.all([
        fetch('/api/senior/analytics'),
        fetch('/api/cases'),
      ]);
      if (analyticsRes.ok) {
        const d = await analyticsRes.json();
        setAnalytics(d.analytics);
      }
      if (casesRes.ok) {
        const d = await casesRes.json();
        setCases(d);
      }
    } catch {
      toast('Failed to load analytics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleLogOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.caseId || !form.court || !form.duration) {
      toast('Case, court, and duration are required.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/case-outcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, duration: parseInt(form.duration) }),
      });
      if (res.ok) {
        toast('Case outcome logged!', 'success');
        setShowOutcomeForm(false);
        setForm({ caseId: '', outcome: 'WON', court: '', lawArea: 'CRIMINAL', duration: '', notes: '' });
        fetchData();
      } else {
        toast('Failed to log outcome.', 'error');
      }
    } catch {
      toast('Network error.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getOutcomeDistribution = () => {
    if (!analytics?.outcomes) return [];
    const map: Record<string, number> = {};
    analytics.outcomes.forEach((o: any) => {
      map[o.outcome] = (map[o.outcome] || 0) + 1;
    });
    return Object.entries(map).map(([outcome, count]) => ({ outcome, count }));
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-[#C9A84C]" /> Personal Chambers Analytics
          </h1>
          <p className="text-xs text-slate-300">Advocacy performance metrics, win rate analysis, and case outcome history</p>
        </div>
        <Button onClick={() => setShowOutcomeForm(!showOutcomeForm)} className="bg-gradient-to-r from-[#C9A84C] to-[#D4AF37] text-[#0A1628] font-extrabold text-xs px-5 py-2 rounded-xl flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Log Case Outcome
        </Button>
      </div>

      {/* Log Outcome Form */}
      {showOutcomeForm && (
        <Card className="border border-[#C9A84C]/30 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6">
          <h3 className="text-sm font-bold font-heading text-white mb-5">Log Case Outcome</h3>
          <form onSubmit={handleLogOutcome} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-bold text-[#F3E5AB]">Case *</Label>
                <select value={form.caseId} onChange={e => setForm(f => ({ ...f, caseId: e.target.value }))} className="w-full h-10 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl" required>
                  <option value="">Select closed case...</option>
                  {cases.map(c => <option key={c.id} value={c.id}>{c.caseNumber} — {c.title}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-[#F3E5AB]">Outcome *</Label>
                <select value={form.outcome} onChange={e => setForm(f => ({ ...f, outcome: e.target.value }))} className="w-full h-10 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl">
                  {['WON', 'LOST', 'SETTLED', 'WITHDRAWN', 'COMPROMISED'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-[#F3E5AB]">Court *</Label>
                <Input placeholder="e.g. Sessions Court, Chennai" value={form.court} onChange={e => setForm(f => ({ ...f, court: e.target.value }))} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="font-bold text-[#F3E5AB]">Law Area</Label>
                  <select value={form.lawArea} onChange={e => setForm(f => ({ ...f, lawArea: e.target.value }))} className="w-full h-10 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl">
                    {['CRIMINAL', 'CIVIL', 'FAMILY', 'CORPORATE', 'PROPERTY'].map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="font-bold text-[#F3E5AB]">Duration (days) *</Label>
                  <Input type="number" placeholder="e.g. 180" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl" required />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-[#C9A84C] to-[#D4AF37] text-[#0A1628] font-extrabold text-xs px-6 py-2 rounded-xl">
                {submitting ? 'Saving...' : 'Log Outcome'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowOutcomeForm(false)} className="border-slate-800 text-slate-300 text-xs rounded-xl">Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="h-8 w-8 border-4 border-slate-800 border-t-[#C9A84C] rounded-full animate-spin" /></div>
      ) : analytics ? (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-[#C9A84C]/50 transition group text-center">
              <div className="text-3xl font-extrabold font-heading gold-gradient-text">{analytics.activeCasesCount}</div>
              <p className="text-xs font-bold text-slate-400 mt-1">Active Cases</p>
            </div>
            <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-emerald-500/50 transition group text-center">
              <div className="text-3xl font-extrabold font-heading text-emerald-300">{analytics.winRate}%</div>
              <p className="text-xs font-bold text-slate-400 mt-1">Win Rate</p>
            </div>
            <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-blue-500/50 transition group text-center">
              <div className="text-3xl font-extrabold font-heading text-blue-300">{analytics.avgDuration}</div>
              <p className="text-xs font-bold text-slate-400 mt-1">Avg Duration (days)</p>
            </div>
            <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-purple-500/50 transition group text-center">
              <div className="text-3xl font-extrabold font-heading text-purple-300">{analytics.draftsCount}</div>
              <p className="text-xs font-bold text-slate-400 mt-1">Drafts Produced</p>
            </div>
          </div>

          {/* Outcome Distribution */}
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6">
            <h3 className="text-base font-bold font-heading text-white mb-5 flex items-center gap-2">
              <Scale className="h-5 w-5 text-[#C9A84C]" /> Case Outcome Distribution ({analytics.totalOutcomes} cases)
            </h3>
            <div className="space-y-3">
              {getOutcomeDistribution().map(({ outcome, count }) => {
                const pct = Math.round((count / analytics.totalOutcomes) * 100);
                return (
                  <div key={outcome} className="flex items-center gap-4 text-xs">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold border text-[10px] w-28 text-center ${OUTCOME_COLORS[outcome] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>{outcome}</span>
                    <div className="flex-1 bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${outcome === 'WON' ? 'bg-emerald-400' : outcome === 'LOST' ? 'bg-rose-500' : outcome === 'SETTLED' ? 'bg-blue-400' : 'bg-slate-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="font-extrabold text-white w-12 text-right">{count} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Case Outcome Log Table */}
          {analytics.outcomes?.length > 0 && (
            <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-800">
                <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
                  <Gavel className="h-5 w-5 text-[#C9A84C]" /> Case Outcome History
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800">
                    <tr>
                      {['Case', 'Court', 'Law Area', 'Outcome', 'Duration', 'Closed'].map(h => (
                        <th key={h} className="text-left px-4 py-3 font-extrabold text-[#C9A84C] uppercase tracking-wider text-[10px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.outcomes.map((o: any) => (
                      <tr key={o.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                        <td className="px-4 py-3 font-bold text-white">{o.case?.caseNumber}</td>
                        <td className="px-4 py-3 text-slate-300">{o.court}</td>
                        <td className="px-4 py-3 text-slate-300">{o.lawArea}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${OUTCOME_COLORS[o.outcome] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>{o.outcome}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-300">{o.duration} days</td>
                        <td className="px-4 py-3 text-slate-400">{new Date(o.closedAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-slate-400 text-sm">No analytics data available yet.</div>
      )}
    </div>
  );
}
```

---

### File: `src/app/(portals)/senior/clients/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers';
import { Briefcase, AlertTriangle, Shield, Info, Star } from 'lucide-react';

const FLAG_CONFIG: Record<string, { label: string; color: string; border: string; icon: React.ReactNode; desc: string }> = {
  VIP: { label: 'VIP Client', color: 'bg-amber-900/60 text-amber-300', border: 'border-amber-700', icon: <Star className="h-3.5 w-3.5 text-amber-400" />, desc: 'Notify senior on every update' },
  MEDIA_RISK: { label: 'Media Risk', color: 'bg-rose-900/60 text-rose-300', border: 'border-rose-700', icon: <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />, desc: 'No written details — media sensitive case' },
  PAYMENT_RISK: { label: 'Payment Risk', color: 'bg-orange-900/60 text-orange-300', border: 'border-orange-700', icon: <Shield className="h-3.5 w-3.5 text-orange-400" />, desc: 'Clear dues before next appointment' },
  SENSITIVE: { label: 'Sensitive', color: 'bg-purple-900/60 text-purple-300', border: 'border-purple-700', icon: <Info className="h-3.5 w-3.5 text-purple-400" />, desc: 'Restrict junior access to case docs' },
};

export default function SeniorClientsPage() {
  const { toast } = useToast();
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [briefData, setBriefData] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ privateNotes: '', clientFlags: [] as string[], reminders: '' });
  const [saving, setSaving] = useState(false);

  const fetchCases = async () => {
    try {
      const res = await fetch('/api/cases');
      if (res.ok) {
        const d = await res.json();
        setCases(d);
        if (d.length > 0) {
          setSelectedCaseId(d[0].id);
          setSelectedCase(d[0]);
          fetchBriefData(d[0].id);
        }
      }
    } catch {
      toast('Failed to load cases.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchBriefData = async (caseId: string) => {
    try {
      const res = await fetch(`/api/client-brief/${caseId}`);
      if (res.ok) {
        const d = await res.json();
        setBriefData(d.brief);
        setEvents(d.events || []);
        setCalls(d.calls || []);
        if (d.brief) {
          setForm({
            privateNotes: d.brief.privateNotes || '',
            clientFlags: d.brief.clientFlags || [],
            reminders: d.brief.reminders?.join(', ') || '',
          });
        } else {
          setForm({ privateNotes: '', clientFlags: [], reminders: '' });
        }
      }
    } catch {}
  };

  useEffect(() => { fetchCases(); }, []);

  const handleSelectCase = (id: string) => {
    const c = cases.find(c => c.id === id);
    setSelectedCaseId(id);
    setSelectedCase(c);
    fetchBriefData(id);
  };

  const toggleFlag = (flag: string) => {
    setForm(f => ({
      ...f,
      clientFlags: f.clientFlags.includes(flag) ? f.clientFlags.filter(x => x !== flag) : [...f.clientFlags, flag],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/client-brief/${selectedCaseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privateNotes: form.privateNotes,
          clientFlags: form.clientFlags,
          reminders: form.reminders.split(',').map(r => r.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        toast('Client brief saved!', 'success');
        fetchBriefData(selectedCaseId);
      } else {
        toast('Failed to save brief.', 'error');
      }
    } catch {
      toast('Network error.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-[#C9A84C]" /> Client Pre-Consultation Briefing
        </h1>
        <p className="text-xs text-slate-300">Pre-consultation intelligence brief with case history, call logs, risk flags, and private senior notes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cases Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5">
            <h3 className="font-bold text-white text-sm mb-3">My Case Folders</h3>
            {loading ? (
              <div className="flex justify-center py-8"><div className="h-6 w-6 border-3 border-slate-800 border-t-[#C9A84C] rounded-full animate-spin" /></div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 text-xs">
                {cases.map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCase(c.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition ${selectedCaseId === c.id ? 'bg-[#C9A84C]/20 border-[#C9A84C] text-white' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'}`}
                  >
                    <p className="font-extrabold">📁 {c.caseNumber}</p>
                    <p className="text-[10px] text-slate-400 truncate">{c.title}</p>
                    <p className="text-[10px] text-[#C9A84C] mt-0.5">👤 {c.client?.name || 'Unknown'}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Brief Editor */}
        <div className="lg:col-span-8 space-y-5">
          {selectedCase && (
            <>
              {/* Warning Banners for active flags */}
              {form.clientFlags.includes('MEDIA_RISK') && (
                <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-700 text-xs text-rose-200 font-bold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400" /> MEDIA RISK — Do not share written case details via email or WhatsApp
                </div>
              )}
              {form.clientFlags.includes('PAYMENT_RISK') && (
                <div className="p-3.5 rounded-xl bg-orange-950/80 border border-orange-700 text-xs text-orange-200 font-bold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-orange-400" /> PAYMENT RISK — Clear outstanding dues before next appointment
                </div>
              )}

              {/* Client Flags */}
              <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 text-xs">
                <h3 className="font-bold text-white mb-3">Client Risk Flags</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(FLAG_CONFIG).map(([key, cfg]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleFlag(key)}
                      className={`p-3 rounded-xl border text-left transition ${form.clientFlags.includes(key) ? `${cfg.color} ${cfg.border}` : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                    >
                      <div className="flex items-center gap-1.5 font-extrabold">{cfg.icon} {cfg.label}</div>
                      <p className="text-[10px] mt-0.5 opacity-70">{cfg.desc}</p>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Recent Case Activity */}
              <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 text-xs">
                <h3 className="font-bold text-white mb-3">Last 5 Case Events</h3>
                {events.length === 0 ? (
                  <p className="text-slate-400 italic">No case events logged.</p>
                ) : (
                  <div className="space-y-2">
                    {events.map(ev => (
                      <div key={ev.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                        <div className="h-2 w-2 rounded-full bg-[#C9A84C] mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-white">{ev.title}</p>
                          <p className="text-[10px] text-slate-400">{new Date(ev.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Last 3 Client Calls */}
              {calls.length > 0 && (
                <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 text-xs">
                  <h3 className="font-bold text-white mb-3">Last 3 Client Interactions</h3>
                  <div className="space-y-2">
                    {calls.map(c => (
                      <div key={c.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                        <p className="font-bold text-white">{c.summary}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{c.duration} min · {new Date(c.date).toLocaleDateString('en-IN')}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Private Notes & Reminders */}
              <Card className="border border-[#C9A84C]/30 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 text-xs">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#C9A84C]" /> Private Senior Notes (Not visible to client or juniors)
                </h3>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="font-bold text-[#F3E5AB]">Confidential Notes</Label>
                    <Textarea
                      placeholder="Private observations about client behavior, litigation risk, or internal strategy..."
                      value={form.privateNotes}
                      onChange={e => setForm(f => ({ ...f, privateNotes: e.target.value }))}
                      className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-300">Reminders (comma-separated)</Label>
                    <Input
                      placeholder="e.g. Call before every hearing, Verify address proof"
                      value={form.reminders}
                      onChange={e => setForm(f => ({ ...f, reminders: e.target.value }))}
                      className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                    />
                  </div>
                  <Button type="submit" disabled={saving} className="bg-gradient-to-r from-[#C9A84C] to-[#D4AF37] text-[#0A1628] font-extrabold text-xs px-6 py-2 rounded-xl">
                    {saving ? 'Saving...' : 'Save Client Brief'}
                  </Button>
                </form>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### File: `src/app/(portals)/senior/notifications/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/providers';
import { Bell, AlertTriangle, CheckCircle2, Info, BrainCircuit, FileText, Inbox, Clock } from 'lucide-react';
import Link from 'next/link';

const NOTIFICATION_CONFIG: Record<string, { color: string; border: string; icon: React.ReactNode }> = {
  ESCALATION: { color: 'bg-rose-950/60', border: 'border-rose-800', icon: <AlertTriangle className="h-4 w-4 text-rose-400" /> },
  CHECKLIST: { color: 'bg-amber-950/60', border: 'border-amber-800', icon: <Clock className="h-4 w-4 text-amber-400" /> },
  FILING: { color: 'bg-blue-950/60', border: 'border-blue-800', icon: <FileText className="h-4 w-4 text-blue-400" /> },
  PAYMENT: { color: 'bg-emerald-950/60', border: 'border-emerald-800', icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" /> },
  DIGEST: { color: 'bg-slate-900', border: 'border-slate-800', icon: <Info className="h-4 w-4 text-slate-400" /> },
};

const PAGE_MAP: Record<string, string> = {
  ESCALATION: '/senior/review',
  CHECKLIST: '/senior/checklist',
  FILING: '/senior/drafts',
  PAYMENT: '/admin/finance',
  DIGEST: '/senior/dashboard',
};

export default function SeniorNotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/senior/notifications');
      if (res.ok) {
        const d = await res.json();
        setNotifications(d.notifications || []);
        setUnreadCount(d.unreadCount || 0);
      }
    } catch {
      toast('Failed to load notifications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/senior/notifications/read', { method: 'POST' });
      if (res.ok) {
        toast('All notifications marked as read.', 'success');
        fetchNotifications();
      }
    } catch {
      toast('Failed to mark notifications.', 'error');
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const priorityTypes = ['ESCALATION', 'CHECKLIST', 'FILING'];
  const priority = notifications.filter(n => priorityTypes.includes(n.type));
  const standard = notifications.filter(n => !priorityTypes.includes(n.type));

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
            <Bell className="h-6 w-6 text-[#C9A84C]" /> Senior Chambers Notifications
            {unreadCount > 0 && (
              <span className="ml-1 h-6 w-6 rounded-full bg-rose-600 text-white text-[11px] font-extrabold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-300">Escalations, checklist alerts, draft submissions, and case updates from your team</p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllRead} className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-5 py-2 rounded-xl border border-slate-700">
            Mark All as Read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 border-4 border-slate-800 border-t-[#C9A84C] rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="h-16 w-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 text-sm font-bold">No notifications yet. Your chambers inbox is clear.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Priority Alerts */}
          {priority.length > 0 && (
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-rose-400 mb-3 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Priority Alerts ({priority.length})
              </p>
              <div className="space-y-3">
                {priority.map(n => {
                  const cfg = NOTIFICATION_CONFIG[n.type] || NOTIFICATION_CONFIG['DIGEST'];
                  const link = PAGE_MAP[n.type] || '/senior/dashboard';
                  return (
                    <Link href={link} key={n.id}>
                      <div className={`p-4 rounded-2xl border ${cfg.color} ${cfg.border} flex items-start gap-3 cursor-pointer hover:brightness-110 transition ${!n.read ? 'ring-1 ring-rose-700/40' : 'opacity-70'}`}>
                        <div className="flex-shrink-0 mt-0.5">{cfg.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-extrabold text-white text-xs truncate">{n.title}</p>
                            {!n.read && <span className="h-2 w-2 rounded-full bg-rose-500 flex-shrink-0" />}
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5">{n.body}</p>
                          <p className="text-[10px] text-slate-500 mt-1">{new Date(n.createdAt).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Standard Notifications */}
          {standard.length > 0 && (
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" /> All Notifications ({standard.length})
              </p>
              <div className="space-y-2.5">
                {standard.map(n => {
                  const cfg = NOTIFICATION_CONFIG[n.type] || NOTIFICATION_CONFIG['DIGEST'];
                  const link = PAGE_MAP[n.type] || '/senior/dashboard';
                  return (
                    <Link href={link} key={n.id}>
                      <div className={`p-3.5 rounded-xl border ${cfg.color} ${cfg.border} flex items-start gap-3 cursor-pointer hover:brightness-110 transition ${!n.read ? '' : 'opacity-60'}`}>
                        <div className="flex-shrink-0 mt-0.5">{cfg.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-bold text-white text-xs truncate">{n.title}</p>
                            {!n.read && <span className="h-2 w-2 rounded-full bg-blue-400 flex-shrink-0" />}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{n.body}</p>
                          <p className="text-[10px] text-slate-500 mt-1">{new Date(n.createdAt).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

