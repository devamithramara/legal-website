# MLR Associates — Part 6: Junior Advocate & Intern Execution Board

This document contains all pages and layouts for the Junior Advocate Portal (`/junior`), covering Task Management, Daily EOD Logs, Live Billable Time Tracking, Legal Research Filing, Draft Submissions, Urgent Escalations Desk, Client Calling Logs, Court Diary, and Learning/Mentorship Hub.

---

### File: `src/app/(portals)/junior/layout.tsx`

```typescript
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
```

---

### File: `src/app/(portals)/junior/page.tsx`

```typescript
import { redirect } from 'next/navigation';

export default function JuniorRootPage() {
  redirect('/junior/dashboard');
}
```

---

### File: `src/app/(portals)/junior/dashboard/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/providers';
import {
  CheckSquare,
  Clock,
  Calendar,
  FileText,
  Sparkles,
  AlertTriangle,
  Play,
  Gavel,
  Upload,
  PhoneCall,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';

export default function JuniorDashboard() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    tasksDueToday: 0,
    hoursLoggedThisWeek: 0,
    hearingsThisWeek: 0,
    pendingApprovals: 0,
  });

  const [todaysHearings, setTodaysHearings] = useState<any[]>([]);
  const [todaysTasks, setTodaysTasks] = useState<any[]>([]);
  const [pendingDraftsCount, setPendingDraftsCount] = useState(0);

  const fetchDashboardData = async () => {
    try {
      const [tasksRes, timesheetRes, draftsRes, casesRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/timelogs/timesheet'),
        fetch('/api/drafts'),
        fetch('/api/cases'),
      ]);

      let dueTodayCount = 0;
      let tasksList: any[] = [];
      if (tasksRes.ok) {
        tasksList = await tasksRes.json();
        const todayStr = new Date().toISOString().slice(0, 10);
        dueTodayCount = tasksList.filter((t: any) => t.deadline && (t.deadline as string).startsWith(todayStr) && t.status !== 'DONE').length;
        setTodaysTasks(tasksList.filter((t: any) => t.status !== 'DONE').slice(0, 4));
      }

      let weeklyHours = 0;
      if (timesheetRes.ok) {
        const timeData = await timesheetRes.json();
        if (timeData.logs) {
          weeklyHours = timeData.logs.reduce((acc: number, l: any) => acc + (l.duration || 0), 0);
        }
      }

      let pendingDrafts = 0;
      if (draftsRes.ok) {
        const draftsData = await draftsRes.json();
        if (draftsData.drafts) {
          pendingDrafts = draftsData.drafts.filter((d: any) => d.status === 'UNDER_REVIEW').length;
          setPendingDraftsCount(pendingDrafts);
        }
      }

      let hearingsCount = 0;
      if (casesRes.ok) {
        const casesData = await casesRes.json();
        const now = new Date();
        const hearings = casesData.filter((c: any) => c.nextHearing);
        hearingsCount = hearings.length;

        // Today's hearings
        const todayStr = now.toISOString().slice(0, 10);
        setTodaysHearings(hearings.filter((c: any) => (c.nextHearing as string).startsWith(todayStr)));
      }

      setMetrics({
        tasksDueToday: dueTodayCount,
        hoursLoggedThisWeek: Math.round(weeklyHours * 10) / 10,
        hearingsThisWeek: hearingsCount,
        pendingApprovals: pendingDrafts,
      });
    } catch {
      toast('Failed to load junior dashboard.', 'error');
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
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#E2C044]/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E2C044]/15 border border-[#E2C044]/30 text-xs font-bold text-[#E2C044] mb-3">
              <Sparkles className="h-3.5 w-3.5" /> Active Chambers Session
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white">
              Welcome Back, <span className="gold-gradient-text">{session?.user?.name || 'Advocate'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Review today's court appearances, active draft pipelines, and urgent deadlines.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/junior/time">
              <Button className="bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg hover:scale-105 transition flex items-center gap-1.5">
                <Play className="h-4 w-4 fill-current" /> Start Active Timer
              </Button>
            </Link>
            <Link href="/junior/log">
              <Button variant="outline" className="border-slate-700 bg-slate-900/80 text-slate-200 hover:border-[#E2C044] text-xs font-bold px-4 py-2.5 rounded-xl">
                Submit Daily Work Log
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-rose-500/50 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tasks Due Today</span>
            <div className="h-9 w-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <CheckSquare className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-heading text-white mt-3 group-hover:scale-105 transition">
            {metrics.tasksDueToday}
          </p>
          <p className="text-[10px] text-rose-400 font-semibold mt-1">Action Required</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-[#E2C044]/50 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hours This Week</span>
            <div className="h-9 w-9 rounded-xl bg-[#E2C044]/20 text-[#E2C044] flex items-center justify-center font-bold">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-heading gold-gradient-text mt-3 group-hover:scale-105 transition">
            {metrics.hoursLoggedThisWeek} hrs
          </p>
          <p className="text-[10px] text-emerald-400 font-semibold mt-1">Timesheet Active</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-cyan-500/50 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hearings This Week</span>
            <div className="h-9 w-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <Gavel className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-heading cyan-gradient-text mt-3 group-hover:scale-105 transition">
            {metrics.hearingsThisWeek}
          </p>
          <p className="text-[10px] text-cyan-300 font-semibold mt-1">Assigned Benches</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-purple-500/50 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Drafts</span>
            <div className="h-9 w-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-heading text-purple-300 mt-3 group-hover:scale-105 transition">
            {metrics.pendingApprovals}
          </p>
          <p className="text-[10px] text-purple-400 font-semibold mt-1">Senior Review Pipeline</p>
        </div>

      </div>

      {/* Morning Digest Panel & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Morning Digest Panel */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#E2C044]" />
                <h3 className="text-base font-bold font-heading text-white">Morning Cause & Task Digest</h3>
              </div>
              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-slate-800 text-[#E2C044] border border-[#E2C044]/30">
                Live Session
              </span>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Today's Hearings */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#E2C044] flex items-center gap-1.5">
                    <Gavel className="h-4 w-4" /> Today's Scheduled Hearings ({todaysHearings.length})
                  </span>
                  <Link href="/junior/diary" className="text-[11px] font-bold text-cyan-400 hover:underline">
                    View Diary
                  </Link>
                </div>
                {todaysHearings.length === 0 ? (
                  <p className="text-slate-400 italic">No court hearings listed for your bench today.</p>
                ) : (
                  <div className="space-y-2 pt-1">
                    {todaysHearings.map((h, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 text-slate-200">
                        <span className="font-bold">📁 Case {h.caseNumber}</span>
                        <span className="text-xs text-rose-400 font-semibold">{h.court}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tasks Due Today */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                    <CheckSquare className="h-4 w-4" /> Priority Tasks Due
                  </span>
                  <Link href="/junior/tasks" className="text-[11px] font-bold text-cyan-400 hover:underline">
                    Open Kanban
                  </Link>
                </div>
                {todaysTasks.length === 0 ? (
                  <p className="text-slate-400 italic">All assigned tasks are up to date.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {todaysTasks.map((t, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <span className="font-bold text-slate-200 truncate max-w-[150px]">{t.title}</span>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                          t.priority === 'URGENT' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {t.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </Card>
        </div>

        {/* Quick Action Dock */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <h3 className="text-base font-bold font-heading text-white mb-4">Quick Advocate Actions</h3>
            
            <div className="space-y-3 text-xs">
              <Link href="/junior/time" className="block">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-[#E2C044] transition flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-[#E2C044]/20 text-[#E2C044] flex items-center justify-center font-bold">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-[#E2C044]">Start Time Log</p>
                      <p className="text-[10px] text-slate-400">Track research & drafting</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-1 transition" />
                </div>
              </Link>

              <Link href="/junior/diary" className="block">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-400 transition flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                      <Gavel className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-cyan-400">Log Court Appearance</p>
                      <p className="text-[10px] text-slate-400">Record hearing outcome</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-1 transition" />
                </div>
              </Link>

              <Link href="/junior/drafts" className="block">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-400 transition flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                      <Upload className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-purple-400">Submit Legal Draft</p>
                      <p className="text-[10px] text-slate-400">Upload Cloudinary file</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-1 transition" />
                </div>
              </Link>

              <Link href="/junior/escalations" className="block">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500 transition flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-rose-400">Raise Escalation</p>
                      <p className="text-[10px] text-slate-400">Alert senior counsels</p>
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

### File: `src/app/(portals)/junior/tasks/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/providers';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Play,
  Paperclip,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Shield,
  FileText,
  BookOpen,
  PhoneCall,
  Gavel,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

interface TaskItem {
  id: string;
  caseId: string;
  title: string;
  type: string;
  priority: string;
  status: string;
  deadline: string | null;
  notes: string | null;
  billableHours: number;
  case: { caseNumber: string; title: string };
  junior?: { name: string };
}

export default function JuniorTasksPage() {
  const { toast } = useToast();

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch {
      toast('Failed to load assigned tasks.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast(`Task moved to ${newStatus}`, 'success');
        fetchTasks();
      } else {
        toast('Failed to update task status.', 'error');
      }
    } catch {
      toast('Network error updating task.', 'error');
    }
  };

  const handleStartTimer = async (taskId: string) => {
    try {
      const res = await fetch('/api/timelogs/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, category: 'RESEARCH' }),
      });

      if (res.ok) {
        toast('Task timer started! Track active session in Time Tracker.', 'success');
        fetchTasks();
      } else {
        toast('Failed to start timer.', 'error');
      }
    } catch {
      toast('Network error starting timer.', 'error');
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.case?.caseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
    return matchesSearch && matchesPriority && matchesType;
  });

  const columns = [
    { id: 'ASSIGNED', title: 'ASSIGNED', color: 'border-[#E2C044]/40 bg-slate-900/60' },
    { id: 'IN_PROGRESS', title: 'IN PROGRESS', color: 'border-cyan-500/40 bg-slate-900/60' },
    { id: 'REVIEW', title: 'REVIEW', color: 'border-purple-500/40 bg-slate-900/60' },
    { id: 'DONE', title: 'DONE', color: 'border-emerald-500/40 bg-slate-900/60' },
  ];

  const getTypeIcon = (type: string) => {
    if (type === 'DRAFT') return FileText;
    if (type === 'RESEARCH') return BookOpen;
    if (type === 'COURT') return Gavel;
    if (type === 'CLIENT_CALL') return PhoneCall;
    return CheckSquare;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-[#E2C044]" /> Task Kanban Board
          </h1>
          <p className="text-xs text-slate-300">
            Manage assigned legal tasks, start timers, and move tasks through senior review
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-48">
            <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
            <Input
              placeholder="Search task..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs border-slate-800 bg-slate-900 text-white rounded-xl"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 font-bold cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">URGENT (Red)</option>
            <option value="NORMAL">NORMAL (Blue)</option>
            <option value="LOW">LOW (Gray)</option>
          </select>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter(t => (t.status || 'ASSIGNED') === col.id);

          return (
            <div key={col.id} className={`rounded-2xl p-4 border ${col.color} min-h-[500px] flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                  <span className="text-xs font-extrabold text-white tracking-wider flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#E2C044]"></span>
                    {col.title}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-[#E2C044]">
                    {colTasks.length}
                  </span>
                </div>

                {/* Task Cards */}
                <div className="space-y-4">
                  {colTasks.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl text-[11px] text-slate-500 font-semibold">
                      No tasks in {col.title}
                    </div>
                  ) : (
                    colTasks.map((t) => {
                      const TypeIcon = getTypeIcon(t.type);
                      const isUrgent = t.priority === 'URGENT';
                      const deadlineFormatted = t.deadline
                        ? new Date(t.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        : 'No deadline';

                      return (
                        <div
                          key={t.id}
                          className={`glass-card rounded-xl p-4 border transition hover:border-[#E2C044]/60 ${
                            isUrgent ? 'border-rose-500/50 bg-rose-950/20' : 'border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-[#E2C044] bg-[#E2C044]/15 px-2 py-0.5 rounded-md">
                              📁 {t.case?.caseNumber}
                            </span>
                            <span
                              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                                t.priority === 'URGENT'
                                  ? 'bg-rose-600 text-white'
                                  : t.priority === 'NORMAL'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-700 text-slate-300'
                              }`}
                            >
                              {t.priority}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                            <TypeIcon className="h-3.5 w-3.5 text-[#E2C044]" />
                            {t.title}
                          </h4>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-2.5 mt-2">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-[#E2C044]" /> {deadlineFormatted}
                            </span>
                            <span>{t.billableHours} hrs</span>
                          </div>

                          {/* Column Move Actions */}
                          <div className="mt-3 pt-2 flex items-center justify-between gap-1 text-[10px]">
                            {col.id !== 'ASSIGNED' && (
                              <button
                                onClick={() => handleUpdateStatus(t.id, col.id === 'DONE' ? 'REVIEW' : col.id === 'REVIEW' ? 'IN_PROGRESS' : 'ASSIGNED')}
                                className="text-slate-400 hover:text-white"
                              >
                                ← Prev
                              </button>
                            )}

                            <button
                              onClick={() => handleStartTimer(t.id)}
                              className="text-[#E2C044] font-bold hover:underline flex items-center gap-1"
                            >
                              <Play className="h-2.5 w-2.5 fill-current" /> Timer
                            </button>

                            {col.id !== 'DONE' && (
                              <button
                                onClick={() => handleUpdateStatus(t.id, col.id === 'ASSIGNED' ? 'IN_PROGRESS' : col.id === 'IN_PROGRESS' ? 'REVIEW' : 'DONE')}
                                className="text-cyan-400 font-bold hover:underline"
                              >
                                Next →
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
```

---

### File: `src/app/(portals)/junior/log/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers';
import { ClipboardList, CheckCircle2, Clock, Calendar, AlertTriangle } from 'lucide-react';

export default function JuniorDailyLogPage() {
  const { toast } = useToast();

  const [tasks, setTasks] = useState<any[]>([]);
  const [pastLogs, setPastLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [hoursWorked, setHoursWorked] = useState('8');
  const [courtVisited, setCourtVisited] = useState(false);
  const [issues, setIssues] = useState('');
  const [escalate, setEscalate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [tasksRes, logsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/dailylog'),
      ]);

      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (logsRes.ok) {
        const lData = await logsRes.json();
        if (lData.dailyLogs) setPastLogs(lData.dailyLogs);
      }
    } catch {
      toast('Failed to load daily log data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleTaskSelection = (id: string) => {
    setSelectedTaskIds(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSubmitDailyLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hoursWorked) {
      toast('Please enter total hours worked today.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/dailylog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasksCompleted: selectedTaskIds,
          hoursWorked: parseFloat(hoursWorked),
          courtVisited,
          issues,
          escalate,
        }),
      });

      if (res.ok) {
        toast('End-of-Day Work Log successfully submitted!', 'success');
        fetchData();
      } else {
        toast('Failed to submit daily work log.', 'error');
      }
    } catch {
      toast('Network error submitting log.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      <div>
        <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-[#E2C044]" /> End-of-Day Daily Work Log
        </h1>
        <p className="text-xs text-slate-300">
          Required EOD submission for junior advocates summarizing completed tasks, court visits, and hours logged
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form */}
        <div className="lg:col-span-5">
          <Card className="border border-[#E2C044]/30 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-[#E2C044]" /> Today's EOD Report Form
              </CardTitle>
            </CardHeader>

            <form onSubmit={handleSubmitDailyLog} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Tasks Completed Today</Label>
                <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-950 border border-slate-800">
                  {tasks.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">No assigned tasks found.</p>
                  ) : (
                    tasks.map(t => (
                      <label key={t.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTaskIds.includes(t.id)}
                          onChange={() => toggleTaskSelection(t.id)}
                          className="h-3.5 w-3.5 rounded accent-[#E2C044]"
                        />
                        <span className="text-white font-bold truncate max-w-[220px]">{t.title}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Total Hours Worked Today *</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={hoursWorked}
                  onChange={(e) => setHoursWorked(e.target.value)}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Attended Court / Bench Today?</p>
                  <p className="text-[10px] text-slate-400">Physical court presence</p>
                </div>
                <input
                  type="checkbox"
                  checked={courtVisited}
                  onChange={(e) => setCourtVisited(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#E2C044] cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Issues Faced / Bench Notes</Label>
                <Textarea
                  placeholder="Record any procedural bottlenecks, document delays, or judge observations..."
                  value={issues}
                  onChange={(e) => setIssues(e.target.value)}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl min-h-[80px]"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Flag EOD Escalation
                  </p>
                  <p className="text-[10px] text-slate-400">Notifies Senior Counsel</p>
                </div>
                <input
                  type="checkbox"
                  checked={escalate}
                  onChange={(e) => setEscalate(e.target.checked)}
                  className="h-4 w-4 rounded accent-rose-500 cursor-pointer"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] font-extrabold py-2.5 rounded-xl text-xs shadow-lg"
              >
                {submitting ? 'Submitting Log...' : 'Submit Daily Work Log'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Submissions History */}
        <div className="lg:col-span-7">
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <h3 className="text-base font-bold font-heading text-white mb-4">Past Daily Log Submissions</h3>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-7 w-7 border-3 border-slate-800 border-t-[#E2C044] rounded-full animate-spin" />
              </div>
            ) : pastLogs.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500 font-semibold">
                No past daily logs submitted.
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {pastLogs.map((log) => (
                  <div key={log.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white">
                        📅 {new Date(log.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="font-extrabold text-[#E2C044] bg-[#E2C044]/15 px-2.5 py-0.5 rounded text-[10px]">
                        {log.hoursWorked} hrs worked
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px]">
                      <span className={log.courtVisited ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                        🏛️ Court Visited: {log.courtVisited ? 'YES' : 'NO'}
                      </span>
                      {log.escalate && (
                        <span className="text-rose-400 font-bold bg-rose-950 px-2 py-0.5 rounded">
                          ⚠️ Escalated
                        </span>
                      )}
                    </div>

                    {log.issues && (
                      <p className="text-slate-300 text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        {log.issues}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

      </div>

    </div>
  );
}
```

---

### File: `src/app/(portals)/junior/time/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers';
import { Clock, Play, Square, Plus, CheckCircle2, AlertCircle, FileText, Calendar } from 'lucide-react';

export default function JuniorTimePage() {
  const { toast } = useToast();

  const [activeTimer, setActiveTimer] = useState<any | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [category, setCategory] = useState('RESEARCH');
  const [description, setDescription] = useState('');

  // Manual Entry Form
  const [manualTaskId, setManualTaskId] = useState('');
  const [manualStartTime, setManualStartTime] = useState('');
  const [manualEndTime, setManualEndTime] = useState('');
  const [manualDesc, setManualDesc] = useState('');

  // Timesheet
  const [timesheetLogs, setTimesheetLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasksAndLogs = async () => {
    try {
      const [tasksRes, timesheetRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/timelogs/timesheet'),
      ]);

      if (tasksRes.ok) {
        const data = await tasksRes.json();
        setTasks(data);
      }

      if (timesheetRes.ok) {
        const data = await timesheetRes.json();
        if (data.logs) {
          setTimesheetLogs(data.logs);
          // Check if there is an active unstopped timer
          const running = data.logs.find((l: any) => !l.endTime);
          if (running) {
            setActiveTimer(running);
            const diffMs = new Date().getTime() - new Date(running.startTime).getTime();
            setElapsedSeconds(Math.floor(diffMs / 1000));
          }
        }
      }
    } catch {
      toast('Failed to load time logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndLogs();
  }, []);

  // Timer interval ticker
  useEffect(() => {
    let interval: any = null;
    if (activeTimer) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const handleStartTimer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId) {
      toast('Please select a task to start tracking.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/timelogs/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: selectedTaskId, category, description }),
      });

      const data = await res.json();
      if (res.ok) {
        toast('Timer started!', 'success');
        setActiveTimer(data.timeLog);
        setElapsedSeconds(0);
        fetchTasksAndLogs();
      } else {
        toast(data.error || 'Failed to start timer.', 'error');
      }
    } catch {
      toast('Network error starting timer.', 'error');
    }
  };

  const handleStopTimer = async () => {
    if (!activeTimer) return;
    try {
      const res = await fetch(`/api/timelogs/${activeTimer.id}/stop`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      if (res.ok) {
        toast('Timer stopped & duration saved!', 'success');
        setActiveTimer(null);
        setElapsedSeconds(0);
        fetchTasksAndLogs();
      } else {
        toast('Failed to stop timer.', 'error');
      }
    } catch {
      toast('Network error stopping timer.', 'error');
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTaskId || !manualStartTime || !manualEndTime) {
      toast('Please select task, start time, and end time.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/timelogs/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: manualTaskId,
          category,
          startTime: manualStartTime,
          endTime: manualEndTime,
          description: manualDesc,
        }),
      });

      if (res.ok) {
        toast('Manual time log recorded!', 'success');
        setManualTaskId('');
        setManualStartTime('');
        setManualEndTime('');
        setManualDesc('');
        fetchTasksAndLogs();
      } else {
        toast('Failed to record time log.', 'error');
      }
    } catch {
      toast('Network error recording log.', 'error');
    }
  };

  const formatTimerDigits = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalWeeklyHours = timesheetLogs.reduce((acc, l) => acc + (l.duration || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
          <Clock className="h-6 w-6 text-[#E2C044]" /> Time Tracker & Timesheets
        </h1>
        <p className="text-xs text-slate-300">
          Track active task hours, submit manual entries, and view weekly billable timesheets
        </p>
      </div>

      {/* ACTIVE TIMER WIDGET */}
      <div className="glass-panel rounded-3xl p-8 border border-[#E2C044]/30 shadow-2xl relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E2C044] flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              Live Stopwatch Widget
            </span>
            <div className="text-5xl font-black font-heading gold-gradient-text tracking-widest">
              {formatTimerDigits(elapsedSeconds)}
            </div>
            {activeTimer && (
              <p className="text-xs text-slate-300">
                Tracking: <span className="font-bold text-white">{activeTimer.task?.title || 'Active Session'}</span>
              </p>
            )}
          </div>

          {!activeTimer ? (
            <form onSubmit={handleStartTimer} className="flex flex-col sm:flex-row items-end gap-3 w-full md:w-auto">
              <div className="w-full sm:w-64 space-y-1">
                <Label className="text-xs font-bold text-slate-300">Select Task</Label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-900 border border-slate-800 text-white text-xs rounded-xl font-bold"
                >
                  <option value="">Choose task to start...</option>
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>{t.case?.caseNumber} - {t.title}</option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                className="bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-lg hover:scale-105 transition flex items-center gap-2"
              >
                <Play className="h-4 w-4 fill-current" /> Start Timer
              </Button>
            </form>
          ) : (
            <Button
              onClick={handleStopTimer}
              className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs px-8 py-3 rounded-xl shadow-lg flex items-center gap-2"
            >
              <Square className="h-4 w-4 fill-current" /> Stop & Save Duration
            </Button>
          )}
        </div>
      </div>

      {/* MANUAL ENTRY & TIMESHEET GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Manual Log Entry Form */}
        <div className="lg:col-span-4">
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#E2C044]" /> Manual Time Entry
              </CardTitle>
            </CardHeader>

            <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Task</Label>
                <select
                  value={manualTaskId}
                  onChange={(e) => setManualTaskId(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl font-bold"
                  required
                >
                  <option value="">Choose task...</option>
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>{t.case?.caseNumber} - {t.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Category</Label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl font-bold"
                >
                  <option value="RESEARCH">RESEARCH</option>
                  <option value="DRAFTING">DRAFTING</option>
                  <option value="COURT">COURT</option>
                  <option value="CLIENT">CLIENT</option>
                  <option value="FILING">FILING</option>
                  <option value="TRAVEL">TRAVEL</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-300">Start Time</Label>
                  <Input
                    type="datetime-local"
                    value={manualStartTime}
                    onChange={(e) => setManualStartTime(e.target.value)}
                    className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                    style={{ colorScheme: 'dark' }}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-300">End Time</Label>
                  <Input
                    type="datetime-local"
                    value={manualEndTime}
                    onChange={(e) => setManualEndTime(e.target.value)}
                    className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                    style={{ colorScheme: 'dark' }}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Description</Label>
                <Input
                  placeholder="Summary of work performed..."
                  value={manualDesc}
                  onChange={(e) => setManualDesc(e.target.value)}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs"
              >
                Log Time Entry
              </Button>
            </form>
          </Card>
        </div>

        {/* Weekly Timesheet Table */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold font-heading text-white">Weekly Timesheet Log</h3>
                <p className="text-xs text-slate-400">Total Hours This Week: <span className="gold-gradient-text font-extrabold">{totalWeeklyHours} hrs</span></p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="h-7 w-7 border-3 border-slate-800 border-t-[#E2C044] rounded-full animate-spin" />
              </div>
            ) : timesheetLogs.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500 font-semibold">
                No time logs recorded for this week.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Task</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3 text-right">Approval</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {timesheetLogs.map((l) => {
                      const isOvertime = (l.duration || 0) > 8;
                      return (
                        <tr key={l.id} className={`hover:bg-slate-800/40 transition ${isOvertime ? 'bg-amber-950/20' : ''}`}>
                          <td className="py-3 px-3 text-slate-300 font-medium">
                            {new Date(l.startTime).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-[#E2C044] bg-[#E2C044]/15 px-2 py-0.5 rounded text-[10px]">
                              {l.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-white font-bold">
                            {l.task?.title}
                          </td>
                          <td className="py-3 px-3 font-extrabold text-white">
                            {l.duration ? `${l.duration} hrs` : 'Running...'}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              l.approved ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-400' : 'bg-amber-950 border border-amber-500/40 text-amber-400'
                            }`}>
                              {l.approved ? 'APPROVED' : 'PENDING'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

      </div>

    </div>
  );
}
```

---

### File: `src/app/(portals)/junior/research/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers';
import { BookOpen, CheckCircle2, Search, Plus, Shield } from 'lucide-react';

export default function JuniorResearchPage() {
  const { toast } = useToast();

  const [cases, setCases] = useState<any[]>([]);
  const [researchLogs, setResearchLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [sections, setSections] = useState('');
  const [citations, setCitations] = useState('');
  const [source, setSource] = useState('SCC');
  const [summary, setSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [casesRes, researchRes] = await Promise.all([
        fetch('/api/cases'),
        fetch('/api/research'),
      ]);

      if (casesRes.ok) setCases(await casesRes.json());
      if (researchRes.ok) {
        const data = await researchRes.json();
        if (data.researchLogs) setResearchLogs(data.researchLogs);
      }
    } catch {
      toast('Failed to load research repository.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !summary || summary.length < 10) {
      toast('Please select case and provide a detailed research summary (min 10 chars).', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: selectedCaseId,
          sections: sections.split(',').map(s => s.trim()).filter(Boolean),
          citations: citations.split(',').map(c => c.trim()).filter(Boolean),
          source,
          summary,
        }),
      });

      if (res.ok) {
        toast('Research log submitted for senior review!', 'success');
        setSections('');
        setCitations('');
        setSummary('');
        fetchData();
      } else {
        toast('Failed to submit research log.', 'error');
      }
    } catch {
      toast('Network error submitting research.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      <div>
        <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-[#E2C044]" /> Legal Case Law & Statute Research Repo
        </h1>
        <p className="text-xs text-slate-300">
          Document statutory provisions, SCC/Manupatra citations, and ratio decidendi for assigned cases
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* New Research Form */}
        <div className="lg:col-span-4">
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#E2C044]" /> Log New Case Law Research
              </CardTitle>
            </CardHeader>

            <form onSubmit={handleSubmitResearch} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Select Case *</Label>
                <select
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl font-bold"
                  required
                >
                  <option value="">Choose case...</option>
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>{c.caseNumber} - {c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Source Legal Database *</Label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl font-bold"
                >
                  <option value="SCC">SCC ONLINE</option>
                  <option value="MANUPATRA">MANUPATRA</option>
                  <option value="INDIANKANOON">INDIANKANOON</option>
                  <option value="BARE_ACT">BARE ACT STATUTE</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Statutory Sections (comma separated)</Label>
                <Input
                  placeholder="e.g. Sec 438 CrPC, Sec 420 IPC"
                  value={sections}
                  onChange={(e) => setSections(e.target.value)}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Citations (comma separated)</Label>
                <Input
                  placeholder="e.g. (2021) 4 SCC 121, AIR 2019 SC 332"
                  value={citations}
                  onChange={(e) => setCitations(e.target.value)}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Ratio & Precedent Summary *</Label>
                <Textarea
                  placeholder="Summarize key holdings, factual matrices, and relevance to case strategy..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl min-h-[100px]"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] font-extrabold py-2.5 rounded-xl text-xs shadow-lg"
              >
                {submitting ? 'Submitting...' : 'Submit Research Note'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Research History Table */}
        <div className="lg:col-span-8">
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <h3 className="text-base font-bold font-heading text-white mb-4">Case Law Research Repository</h3>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-7 w-7 border-3 border-slate-800 border-t-[#E2C044] rounded-full animate-spin" />
              </div>
            ) : researchLogs.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500 font-semibold">
                No research entries logged yet.
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {researchLogs.map((r) => (
                  <div key={r.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">📁 Case: {r.case?.caseNumber} - {r.case?.title}</span>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                        r.approved ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                      }`}>
                        {r.approved ? 'APPROVED' : 'PENDING REVIEW'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="bg-[#E2C044]/15 text-[#E2C044] px-2 py-0.5 rounded font-bold">{r.source}</span>
                      {r.sections && r.sections.length > 0 && (
                        <span className="text-cyan-300 font-semibold">Sections: {r.sections.join(', ')}</span>
                      )}
                    </div>

                    {r.citations && r.citations.length > 0 && (
                      <p className="text-[11px] font-bold text-[#E2C044]">📜 Citations: {r.citations.join(' | ')}</p>
                    )}

                    <p className="text-slate-300 text-xs leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                      {r.summary}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

      </div>

    </div>
  );
}
```

---

### File: `src/app/(portals)/junior/drafts/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers';
import { FileText, Upload, Download, CheckCircle2, AlertCircle, Copy, BookOpen } from 'lucide-react';

export default function JuniorDraftsPage() {
  const { toast } = useToast();

  const [cases, setCases] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('PETITION');
  const [fileUrl, setFileUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [casesRes, draftsRes, templatesRes] = await Promise.all([
        fetch('/api/cases'),
        fetch('/api/drafts'),
        fetch('/api/templates'),
      ]);

      if (casesRes.ok) setCases(await casesRes.json());
      if (draftsRes.ok) {
        const dData = await draftsRes.json();
        if (dData.drafts) setDrafts(dData.drafts);
      }
      if (templatesRes.ok) {
        const tData = await templatesRes.json();
        if (tData.templates) setTemplates(tData.templates);
      }
    } catch {
      toast('Failed to load drafts pipeline.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setFileUrl(data.url);
        toast('Document uploaded to Cloudinary!', 'success');
      } else {
        toast('File upload failed.', 'error');
      }
    } catch {
      toast('Network error uploading file.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !title || !fileUrl) {
      toast('Please fill all required fields and upload document.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: selectedCaseId, title, type, fileUrl }),
      });

      if (res.ok) {
        toast('Draft submitted for Senior Counsel review!', 'success');
        setTitle('');
        setFileUrl('');
        fetchData();
      } else {
        toast('Failed to submit draft.', 'error');
      }
    } catch {
      toast('Network error submitting draft.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
          <FileText className="h-6 w-6 text-[#E2C044]" /> Legal Draft Pipeline & Template Library
        </h1>
        <p className="text-xs text-slate-300">
          Upload legal petitions, affidavits, and written statements for senior review & access court templates
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Draft Submission Form */}
        <div className="lg:col-span-4">
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="h-4 w-4 text-[#E2C044]" /> Submit New Draft
              </CardTitle>
            </CardHeader>

            <form onSubmit={handleSubmitDraft} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Select Case *</Label>
                <select
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl font-bold"
                  required
                >
                  <option value="">Choose case...</option>
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>{c.caseNumber} - {c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Draft Type *</Label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl font-bold"
                >
                  <option value="PETITION">PETITION</option>
                  <option value="AFFIDAVIT">AFFIDAVIT</option>
                  <option value="NOTICE">LEGAL NOTICE</option>
                  <option value="WRITTEN_STATEMENT">WRITTEN STATEMENT</option>
                  <option value="VAKALATNAMA">VAKALATNAMA</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Draft Title *</Label>
                <Input
                  placeholder="e.g. Interim Stay Application under Sec 151"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Upload Draft File (Cloudinary) *</Label>
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl cursor-pointer"
                  disabled={uploading}
                />
                {uploading && <p className="text-[10px] text-[#E2C044] animate-pulse">Uploading file to Cloudinary...</p>}
                {fileUrl && <p className="text-[10px] text-emerald-400 font-bold">✓ File attached ready for submission</p>}
              </div>

              <Button
                type="submit"
                disabled={submitting || !fileUrl}
                className="w-full bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] font-extrabold py-2.5 rounded-xl text-xs shadow-lg"
              >
                {submitting ? 'Submitting...' : 'Submit Draft for Review'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Draft Pipeline Table & Template Sidebar */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Pipeline Table */}
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <h3 className="text-base font-bold font-heading text-white mb-4">Submitted Drafts Pipeline</h3>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-7 w-7 border-3 border-slate-800 border-t-[#E2C044] rounded-full animate-spin" />
              </div>
            ) : drafts.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500 font-semibold">
                No legal drafts submitted yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Title & Case</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Ver</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Senior Comments</th>
                      <th className="py-2.5 px-3 text-right">File</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {drafts.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3">
                          <p className="font-extrabold text-white">{d.title}</p>
                          <p className="text-[10px] text-slate-400">Case: {d.case?.caseNumber}</p>
                        </td>
                        <td className="py-3 px-3 text-[#E2C044] font-bold text-[10px]">{d.type}</td>
                        <td className="py-3 px-3 font-bold text-slate-300">v{d.version}</td>
                        <td className="py-3 px-3">
                          <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            d.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' :
                            d.status === 'REDO' ? 'bg-amber-950 text-amber-400 border border-amber-500/40' :
                            'bg-purple-950 text-purple-300 border border-purple-500/40'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300 italic text-[11px]">
                          {d.comments || 'No senior notes yet'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-[#E2C044] font-bold hover:underline inline-flex items-center gap-1 text-[11px]">
                            <Download className="h-3 w-3" /> Get
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Template Library Sidebar */}
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#E2C044]" /> Court Template Library
              </h3>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-slate-800 text-slate-300">Read & Download Only</span>
            </div>

            {templates.length === 0 ? (
              <div className="text-xs text-slate-400 italic">Standard court templates (Bail Application, Vakalatnama, Stay Petition) available upon upload by Admin.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {templates.map(t => (
                  <div key={t.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{t.title}</p>
                      <p className="text-[10px] text-[#E2C044] font-bold">{t.type}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setType(t.type);
                        setTitle(`${t.title} - Draft`);
                        toast(`Pre-filled draft form with template: ${t.title}`, 'info');
                      }}
                      className="bg-slate-800 text-slate-200 text-[10px] font-bold px-2.5 py-1"
                    >
                      Use Base
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

        </div>

      </div>

    </div>
  );
}
```

---

### File: `src/app/(portals)/junior/escalations/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers';
import { AlertTriangle, Shield, CheckCircle2, Clock } from 'lucide-react';

export default function JuniorEscalationsPage() {
  const { toast } = useToast();

  const [cases, setCases] = useState<any[]>([]);
  const [escalations, setEscalations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [reason, setReason] = useState('STRATEGY_INPUT');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [casesRes, escalationsRes] = await Promise.all([
        fetch('/api/cases'),
        fetch('/api/escalations'),
      ]);

      if (casesRes.ok) setCases(await casesRes.json());
      if (escalationsRes.ok) {
        const data = await escalationsRes.json();
        if (data.escalations) setEscalations(data.escalations);
      }
    } catch {
      toast('Failed to load escalations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRaiseEscalation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !description) {
      toast('Please select case and enter escalation description.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/escalations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: selectedCaseId,
          reason,
          description,
        }),
      });

      if (res.ok) {
        toast('Escalation raised to Senior Counsel!', 'info');
        setDescription('');
        fetchData();
      } else {
        toast('Failed to raise escalation.', 'error');
      }
    } catch {
      toast('Network error raising escalation.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      <div>
        <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-rose-500" /> Senior Counsel Escalations Desk
        </h1>
        <p className="text-xs text-slate-300">
          Flag critical case strategy issues, uncooperative clients, or unexpected court filings directly to Admin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Raise Form */}
        <div className="lg:col-span-4">
          <Card className="border border-rose-900/40 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Raise Senior Escalation
              </CardTitle>
            </CardHeader>

            <form onSubmit={handleRaiseEscalation} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Select Case *</Label>
                <select
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl font-bold"
                  required
                >
                  <option value="">Choose case...</option>
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>{c.caseNumber} - {c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Escalation Reason *</Label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl font-bold"
                >
                  <option value="UNREACHABLE_CLIENT">UNREACHABLE / UNCOOPERATIVE CLIENT</option>
                  <option value="UNEXPECTED_FILING">UNEXPECTED COURT FILING / IMPLEADMENT</option>
                  <option value="STRATEGY_INPUT">SENIOR STRATEGY / BENCH GUIDANCE</option>
                  <option value="OTHER">OTHER CRITICAL ISSUES</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Detailed Description *</Label>
                <Textarea
                  placeholder="Explain why senior advocate intervention is required immediately..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl min-h-[100px]"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-lg"
              >
                {submitting ? 'Raising...' : 'Submit Escalation Alert'}
              </Button>
            </form>
          </Card>
        </div>

        {/* History Table */}
        <div className="lg:col-span-8">
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <h3 className="text-base font-bold font-heading text-white mb-4">Escalation Status History</h3>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-7 w-7 border-3 border-slate-800 border-t-rose-500 rounded-full animate-spin" />
              </div>
            ) : escalations.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500 font-semibold">
                No escalations raised.
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {escalations.map((esc) => (
                  <div key={esc.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">📁 Case: {esc.case?.caseNumber}</span>
                      <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        esc.status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' :
                        esc.status === 'ACKNOWLEDGED' ? 'bg-amber-950 text-amber-400 border border-amber-500/40' :
                        'bg-rose-950 text-rose-400 border border-rose-500/40'
                      }`}>
                        {esc.status}
                      </span>
                    </div>
                    <p className="text-[11px] font-extrabold text-[#E2C044]">Reason: {esc.reason}</p>
                    <p className="text-slate-300 text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      {esc.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

      </div>

    </div>
  );
}
```

---

### File: `src/app/(portals)/junior/calls/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers';
import { PhoneCall, AlertTriangle, CheckCircle2, User } from 'lucide-react';

export default function JuniorCallsPage() {
  const { toast } = useToast();

  const [cases, setCases] = useState<any[]>([]);
  const [callLogs, setCallLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [clientId, setClientId] = useState('');
  const [duration, setDuration] = useState('15');
  const [summary, setSummary] = useState('');
  const [actionItems, setActionItems] = useState('');
  const [escalate, setEscalate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/cases');
      if (res.ok) {
        const data = await res.json();
        setCases(data);
      }
    } catch {
      toast('Failed to load call logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    const targetCase = cases.find(c => c.id === caseId);
    if (targetCase && targetCase.clientId) {
      setClientId(targetCase.clientId);
    }
  };

  const handleSubmitCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !summary) {
      toast('Please select case and enter call discussion summary.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: selectedCaseId,
          clientId: clientId || 'client_default',
          duration,
          summary,
          actionItems: actionItems.split(',').map(a => a.trim()).filter(Boolean),
          escalate,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (escalate) {
          toast('Call logged & URGENT Escalation raised to Senior Counsel via Twilio SMS!', 'info');
        } else {
          toast('Client call log saved!', 'success');
        }
        setSummary('');
        setActionItems('');
        setEscalate(false);
        fetchData();
      } else {
        toast(data.error || 'Failed to log call.', 'error');
      }
    } catch {
      toast('Network error logging call.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      <div>
        <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
          <PhoneCall className="h-6 w-6 text-[#E2C044]" /> Client Consultation & Call Tracker
        </h1>
        <p className="text-xs text-slate-300">
          Record client phone calls, discussion outcomes, action items, and trigger automatic escalations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Call Form */}
        <div className="lg:col-span-4">
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-[#E2C044]" /> Log Client Discussion
              </CardTitle>
            </CardHeader>

            <form onSubmit={handleSubmitCall} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Select Case *</Label>
                <select
                  value={selectedCaseId}
                  onChange={(e) => handleSelectCase(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl font-bold"
                  required
                >
                  <option value="">Choose case...</option>
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>{c.caseNumber} - {c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Call Duration (Minutes) *</Label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Discussion Summary *</Label>
                <Textarea
                  placeholder="Summary of client instruction or hearing updates communicated..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl min-h-[90px]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Action Items (comma separated)</Label>
                <Input
                  placeholder="e.g. Draft rejoinder, Collect passport copy"
                  value={actionItems}
                  onChange={(e) => setActionItems(e.target.value)}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Escalate to Senior Counsel?
                  </p>
                  <p className="text-[10px] text-slate-400">Triggers SMS alert & Escalation log</p>
                </div>
                <input
                  type="checkbox"
                  checked={escalate}
                  onChange={(e) => setEscalate(e.target.checked)}
                  className="h-4 w-4 rounded accent-rose-500 cursor-pointer"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] font-extrabold py-2.5 rounded-xl text-xs shadow-lg"
              >
                {submitting ? 'Recording...' : 'Log Client Call'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Info Box */}
        <div className="lg:col-span-8">
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <h3 className="text-base font-bold font-heading text-white mb-2">Client Call Protocol Guidelines</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              All telephone consultations conducted by Junior Advocates must be recorded with exact durations to support accurate client billing calculations. If a client is uncooperative, requests an urgent strategy change, or provides unexpected evidence, toggle the <strong className="text-rose-400">Escalate to Senior Counsel</strong> switch to auto-notify the Admin via Twilio SMS.
            </p>

            <div className="p-4 rounded-xl bg-slate-950 border border-[#E2C044]/30 space-y-2 text-xs">
              <p className="font-bold text-[#E2C044]">✓ Active Case Linkage</p>
              <p className="text-slate-400">Selecting a case automatically maps client IDs and generates audit history accessible on senior advocate performance drawers.</p>
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
}
```

---

### File: `src/app/(portals)/junior/diary/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Gavel, Calendar as CalendarIcon, Clock, MapPin, AlertTriangle, Plus, CheckCircle2 } from 'lucide-react';

export default function JuniorDiaryPage() {
  const { toast } = useToast();

  const [cases, setCases] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [todaysHearings, setTodaysHearings] = useState<any[]>([]);
  const [hasConflict, setHasConflict] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [court, setCourt] = useState('High Court Bench 4');
  const [hallNumber, setHallNumber] = useState('Hall 102');
  const [outcome, setOutcome] = useState('ARGUMENTS');
  const [nextDate, setNextDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
              title: `Hearing: ${c.caseNumber}`,
              start: c.nextHearing,
              color: '#EF4444',
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

  const handleLogAppearance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !court || !outcome) {
      toast('Please select case, court, and outcome.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/appearances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: selectedCaseId,
          court,
          hallNumber,
          outcome,
          nextDate: nextDate || null,
          notes,
        }),
      });

      if (res.ok) {
        toast('Court appearance recorded & case synchronized!', 'success');
        setAppearanceOpen(false);
        setSelectedCaseId('');
        setNextDate('');
        setNotes('');
        fetchDiaryData();
      } else {
        toast('Failed to record appearance.', 'error');
      }
    } catch {
      toast('Network error recording appearance.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
            <Gavel className="h-6 w-6 text-[#E2C044]" /> Court Diary & Appearances
          </h1>
          <p className="text-xs text-slate-300">
            Personal calendar of assigned hearings, hall numbers, and hearing outcome logging
          </p>
        </div>

        <Button
          onClick={() => setAppearanceOpen(true)}
          className="bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5 self-start"
        >
          <Plus className="h-4 w-4" /> Log Court Appearance
        </Button>
      </div>

      {/* Morning Digest Panel */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#E2C044] flex items-center gap-2">
            <Gavel className="h-4 w-4" /> Today's Hearing Benches ({todaysHearings.length})
          </span>
          {hasConflict && (
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-rose-950 border border-rose-500/50 text-rose-400 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" /> Conflict Warning: Multiple Hearings Overlap
            </span>
          )}
        </div>

        {todaysHearings.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No assigned court hearings for today.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {todaysHearings.map((h, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-white">📁 Case {h.caseNumber} - {h.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">🏛️ {h.court}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedCaseId(h.id);
                    setCourt(h.court || 'High Court');
                    setAppearanceOpen(true);
                  }}
                  className="bg-slate-800 text-[#E2C044] text-[10px] font-bold py-1 px-2.5 rounded-lg"
                >
                  Log Outcome
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FullCalendar Component */}
      <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 border-4 border-slate-800 border-t-[#E2C044] rounded-full animate-spin" />
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
                height="auto"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* DIALOG MODAL: Log Court Appearance */}
      <Dialog open={appearanceOpen} onOpenChange={setAppearanceOpen}>
        <DialogContent className="bg-slate-900 text-slate-100 border border-slate-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-white">Log Court Appearance</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Record hearing outcome and auto-update next hearing date.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLogAppearance} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label className="font-bold text-slate-300">Select Case *</Label>
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl font-bold"
                required
              >
                <option value="">Choose case...</option>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>{c.caseNumber} - {c.title}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Court Name *</Label>
                <Input
                  value={court}
                  onChange={(e) => setCourt(e.target.value)}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Hall Number</Label>
                <Input
                  placeholder="e.g. Hall 102"
                  value={hallNumber}
                  onChange={(e) => setHallNumber(e.target.value)}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-slate-300">Outcome *</Label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl font-bold"
              >
                <option value="ARGUMENTS">ARGUMENTS (Arguments Heard)</option>
                <option value="ADJOURNED">ADJOURNED (Next Date Fixed)</option>
                <option value="ORDER">ORDER (Interim/Final Order Passed)</option>
                <option value="PART_HEARD">PART_HEARD (Part-Heard Bench)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-slate-300">Next Hearing Date (Optional)</Label>
              <Input
                type="datetime-local"
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
                className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-slate-300">Hearing Remarks / Notes</Label>
              <Input
                placeholder="Bench remarks, judge directives..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAppearanceOpen(false)}
                className="border-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] font-extrabold text-xs px-5"
              >
                {submitting ? 'Recording...' : 'Record Appearance'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
```

---

### File: `src/app/(portals)/junior/learning/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/providers';
import { GraduationCap, Award, BookOpen, CheckCircle2, ExternalLink } from 'lucide-react';

export default function JuniorLearningPage() {
  const { toast } = useToast();

  const [learningItems, setLearningItems] = useState<any[]>([]);
  const [skillTags, setSkillTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Summary submission state
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [summaryText, setSummaryText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [learnRes, tagsRes] = await Promise.all([
        fetch('/api/learning'),
        fetch('/api/skilltags'),
      ]);

      if (learnRes.ok) {
        const lData = await learnRes.json();
        if (lData.learningItems) setLearningItems(lData.learningItems);
      }

      if (tagsRes.ok) {
        const tData = await tagsRes.json();
        if (tData.tags) setSkillTags(tData.tags);
      }
    } catch {
      toast('Failed to load learning board.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitSummary = async (itemId: string) => {
    if (!summaryText || summaryText.length < 15) {
      toast('Please provide a min 3-line summary (at least 15 chars).', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/learning/${itemId}/summary`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: summaryText, status: 'READ' }),
      });

      if (res.ok) {
        toast('Learning summary submitted! Status updated to READ.', 'success');
        setActiveItemId(null);
        setSummaryText('');
        fetchData();
      } else {
        toast('Failed to submit summary.', 'error');
      }
    } catch {
      toast('Network error submitting summary.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      <div>
        <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-[#E2C044]" /> Junior Professional Learning & Skill Board
        </h1>
        <p className="text-xs text-slate-300">
          Review senior-assigned precedents, bare acts, procedural guides, and view earned skill badges
        </p>
      </div>

      {/* SKILL TAGS BADGES PANEL */}
      <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Award className="h-4 w-4 text-[#E2C044]" /> Earned Skill Badges (Senior Approved)
          </span>
          <span className="text-[10px] text-slate-400 font-bold">Read Only</span>
        </div>

        {skillTags.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No skill tags assigned yet. Complete tasks and drafts to earn badges from senior counsel.</p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {skillTags.map((tag) => (
              <span
                key={tag.id}
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#E2C044]/20 to-[#F59E0B]/20 border border-[#E2C044]/40 text-[#E2C044] font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-[#E2C044]/10"
              >
                🏆 {tag.tag}
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* ASSIGNED LEARNING ITEMS LIST */}
      <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
        <h3 className="text-base font-bold font-heading text-white mb-4">Assigned Precedents & Reading Items</h3>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-7 w-7 border-3 border-slate-800 border-t-[#E2C044] rounded-full animate-spin" />
          </div>
        ) : learningItems.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500 font-semibold">
            No learning items assigned yet.
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {learningItems.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-sm">{item.title}</span>
                  <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    item.status === 'REVIEWED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' :
                    item.status === 'READ' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' :
                    'bg-amber-950 text-amber-400 border border-amber-500/40'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-[#E2C044]/15 text-[#E2C044] px-2 py-0.5 rounded font-bold text-[10px] uppercase">
                    {item.type}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 break-all">
                  <p className="font-bold text-white mb-1">Content / URL:</p>
                  <a href={item.content} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline inline-flex items-center gap-1">
                    {item.content} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {item.summary ? (
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <p className="font-bold text-[#E2C044] mb-1">Submitted 3-Line Summary:</p>
                    <p className="text-slate-200">{item.summary}</p>
                  </div>
                ) : (
                  <div>
                    {activeItemId === item.id ? (
                      <div className="space-y-2 pt-2">
                        <Textarea
                          placeholder="Submit 3-line summary of principles learned..."
                          value={summaryText}
                          onChange={(e) => setSummaryText(e.target.value)}
                          className="border-slate-800 bg-slate-900 text-white text-xs rounded-xl min-h-[80px]"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSubmitSummary(item.id)}
                            disabled={submitting}
                            className="bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] font-extrabold text-xs px-4"
                          >
                            Submit Summary
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveItemId(null)}
                            className="border-slate-800 text-slate-300 text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => {
                          setActiveItemId(item.id);
                          setSummaryText('');
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-1.5 rounded-xl"
                      >
                        Submit Reading Summary
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
}
```

---

