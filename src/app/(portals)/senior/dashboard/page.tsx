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
