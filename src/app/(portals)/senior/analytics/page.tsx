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
