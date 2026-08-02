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
