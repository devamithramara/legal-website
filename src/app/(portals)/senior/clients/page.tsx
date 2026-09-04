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
