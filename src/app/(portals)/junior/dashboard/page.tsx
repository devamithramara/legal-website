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
