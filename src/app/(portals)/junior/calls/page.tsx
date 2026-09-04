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
