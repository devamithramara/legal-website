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
