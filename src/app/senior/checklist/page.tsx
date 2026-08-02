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
