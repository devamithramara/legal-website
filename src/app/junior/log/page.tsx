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
