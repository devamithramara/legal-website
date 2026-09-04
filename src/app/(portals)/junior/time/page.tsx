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
