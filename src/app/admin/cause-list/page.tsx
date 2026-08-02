'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/providers';
import {
  Gavel,
  Calendar,
  Building2,
  FileText,
  Send,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Zap,
  BellRing
} from 'lucide-react';

interface CaseItem {
  id: string;
  caseNumber: string;
  title: string;
  type: string;
  court: string;
  status: string;
  nextHearing: string | null;
  client: { name: string; phone: string | null };
}

export default function CauseListPage() {
  const { toast } = useToast();

  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [nextHearingDate, setNextHearingDate] = useState('');
  const [courtName, setCourtName] = useState('High Court Bench 4');
  const [hearingNotes, setHearingNotes] = useState('Arguments');
  const [sendSms, setSendSms] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // eCourts Check state
  const [checkingEcourts, setCheckingEcourts] = useState(false);
  const [ecourtsResult, setEcourtsResult] = useState<any | null>(null);

  // Daily Reminder state
  const [sendingDigest, setSendingDigest] = useState(false);

  const fetchCases = async () => {
    try {
      const res = await fetch('/api/cases');
      if (res.ok) {
        const data = await res.json();
        setCases(data);
      }
    } catch {
      toast('Failed to load active cases.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  // When selected case changes, pre-fill court
  useEffect(() => {
    if (selectedCaseId) {
      const found = cases.find(c => c.id === selectedCaseId);
      if (found && found.court) {
        setCourtName(found.court);
      }
    }
  }, [selectedCaseId, cases]);

  const handleUpdateCauseList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !nextHearingDate) {
      toast('Please select a case and next hearing date.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/cause-list/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: selectedCaseId,
          nextHearing: nextHearingDate,
          court: courtName,
          notes: hearingNotes,
          sendSms,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast('Cause list updated! FullCalendar and Timeline synchronized.', 'success');
        setSelectedCaseId('');
        setNextHearingDate('');
        setHearingNotes('Arguments');
        fetchCases();
      } else {
        toast(data.error || 'Failed to update cause list.', 'error');
      }
    } catch {
      toast('Network error updating cause list.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRunEcourtsCheck = async () => {
    setCheckingEcourts(true);
    setEcourtsResult(null);
    try {
      const res = await fetch('/api/cause-list/ecourts-check', { method: 'POST' });
      const data = await res.json();
      setEcourtsResult(data);
      if (data.success) {
        toast(data.message, 'success');
        fetchCases();
      } else {
        toast(data.error || 'eCourts check failed.', 'error');
      }
    } catch {
      toast('eCourts automated check offline. Manual verification required.', 'error');
    } finally {
      setCheckingEcourts(false);
    }
  };

  const handleTriggerDailyDigest = async () => {
    setSendingDigest(true);
    try {
      const res = await fetch('/api/cause-list/daily-reminder', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        toast(`7:30 AM Daily Digest Triggered! (${data.todaysHearingsCount} hearings today)`, 'success');
      } else {
        toast('Failed to trigger daily digest.', 'error');
      }
    } catch {
      toast('Network error triggering daily digest.', 'error');
    } finally {
      setSendingDigest(false);
    }
  };

  const activeCases = cases.filter(c => c.status !== 'CLOSED');
  const filteredCases = activeCases.filter(c =>
    c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.court.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[#0A1628] flex items-center gap-2">
            <Gavel className="h-6 w-6 text-[#C9A84C]" /> Cause List & Hearing Manager
          </h1>
          <p className="text-xs text-gray-600 font-medium">
            Update hearing dates, sync FullCalendar & timeline, and trigger 24h prior Twilio client notifications
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleTriggerDailyDigest}
            disabled={sendingDigest}
            className="border-[#DCD6C5] text-xs font-semibold flex items-center gap-1.5 bg-white text-[#0A1628] hover:border-[#C9A84C]"
          >
            <BellRing className="h-4 w-4 text-amber-500" />
            {sendingDigest ? 'Sending Digest...' : '7:30 AM Digest Test'}
          </Button>

          <Button
            type="button"
            onClick={handleRunEcourtsCheck}
            disabled={checkingEcourts}
            className="bg-[#0A1628] hover:bg-[#0A1628]/95 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
          >
            <RefreshCw className={`h-4 w-4 text-[#C9A84C] ${checkingEcourts ? 'animate-spin' : ''}`} />
            {checkingEcourts ? 'Scanning eCourts...' : 'eCourts Auto Check'}
          </Button>
        </div>
      </div>

      {/* eCourts Alert Box if result present */}
      {ecourtsResult && (
        <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-[#C9A84C]/40 space-y-2 animate-in fade-in duration-300 text-xs">
          <div className="flex items-center justify-between font-bold text-[#C9A84C]">
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#C9A84C]" /> eCourts Cause List Verification Result
            </span>
            <span className="text-[10px] text-gray-400">
              Checked {ecourtsResult.checkedCount} active cases
            </span>
          </div>
          <p className="text-slate-300">{ecourtsResult.message}</p>

          {ecourtsResult.matches && ecourtsResult.matches.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">
              <p className="font-bold text-emerald-400">Flagged Cases for Manual Confirmation:</p>
              {ecourtsResult.matches.map((m: any, i: number) => (
                <div key={i} className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800 text-[11px]">
                  <span>📁 Case {m.caseNumber} ({m.detectedCourt})</span>
                  <span className="text-amber-400 font-semibold">{m.statusFlag}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MAIN LAYOUT: Form (Left) + Cause List Table (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cause List Update Form */}
        <div className="lg:col-span-5">
          <Card className="border border-[#DCD6C5] bg-white shadow-md rounded-xl overflow-hidden">
            <CardHeader className="bg-[#0A1628] text-white p-5">
              <CardTitle className="text-base font-heading font-bold text-[#F5F0E8] flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#C9A84C]" /> Record Cause List Entry
              </CardTitle>
              <CardDescription className="text-xs text-gray-300">
                Submitting updates Case.nextHearing, writes timeline CaseEvent, and schedules 24h prior SMS.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleUpdateCauseList}>
              <CardContent className="p-6 space-y-4 text-xs">
                
                {/* 1. Case Dropdown */}
                <div className="space-y-1.5">
                  <Label htmlFor="caseSelect" className="font-bold text-[#0A1628]">
                    Select Active Case Folder *
                  </Label>
                  <Select value={selectedCaseId} onValueChange={(val) => setSelectedCaseId(val || '')}>
                    <SelectTrigger className="border-slate-300 text-xs bg-white text-[#0A1628] font-bold shadow-sm h-10">
                      <SelectValue placeholder="Choose case number..." className="text-slate-500 font-medium" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-xs text-[#0A1628] border-slate-300 shadow-xl">
                      {activeCases.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="text-xs text-[#0A1628] font-semibold hover:bg-amber-50">
                          {c.caseNumber} - {c.title} ({c.client?.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. Next Hearing Date & Time */}
                <div className="space-y-1.5">
                  <Label htmlFor="hDate" className="font-bold text-[#0A1628]">
                    Next Hearing Date & Time *
                  </Label>
                  <Input
                    id="hDate"
                    type="datetime-local"
                    value={nextHearingDate}
                    onChange={(e) => setNextHearingDate(e.target.value)}
                    className="border-slate-300 text-xs bg-white text-[#0A1628] font-bold h-10 shadow-sm placeholder:text-slate-400"
                    style={{ colorScheme: 'light' }}
                    required
                  />
                </div>

                {/* 3. Court Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="court" className="font-bold text-[#0A1628]">
                    Court Name / Bench *
                  </Label>
                  <Input
                    id="court"
                    placeholder="e.g. High Court Bench 4, District Court Room 102"
                    value={courtName}
                    onChange={(e) => setCourtName(e.target.value)}
                    className="border-slate-300 text-xs bg-white text-[#0A1628] font-bold h-10 shadow-sm placeholder:text-slate-400"
                    required
                  />
                </div>

                {/* 4. Hearing Notes / Stage */}
                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="font-bold text-[#0A1628]">
                    Hearing Stage / Notes
                  </Label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {['Arguments', 'Bail Hearing', 'Adjourned', 'Judgment Reserved', 'Cross Examination', 'Framing Charges'].map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setHearingNotes(preset)}
                        className={`py-1.5 px-2 rounded text-[10px] font-bold border transition ${
                          hearingNotes === preset
                            ? 'bg-[#0A1628] text-[#C9A84C] border-[#C9A84C]'
                            : 'bg-slate-100 border-slate-300 text-[#0A1628] hover:bg-slate-200'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <Input
                    id="notes"
                    placeholder="Or type custom remarks..."
                    value={hearingNotes}
                    onChange={(e) => setHearingNotes(e.target.value)}
                    className="border-slate-300 text-xs bg-white text-[#0A1628] font-bold h-10 shadow-sm placeholder:text-slate-400"
                  />
                </div>

                {/* 5. SMS Toggle */}
                <div className="p-3 bg-amber-50/80 border border-amber-300 rounded-lg flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-bold text-[#0A1628] text-xs">Twilio Client SMS</p>
                    <p className="text-[10px] text-gray-700 font-medium">Dispatches 24h prior hearing reminder to client phone</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={sendSms}
                    onChange={(e) => setSendSms(e.target.checked)}
                    className="h-4 w-4 text-[#0A1628] focus:ring-[#C9A84C] rounded"
                  />
                </div>

              </CardContent>

              <CardFooter className="bg-gray-50 p-4 border-t border-[#DCD6C5]/40 flex justify-end">
                <Button
                  type="submit"
                  disabled={submitting || !selectedCaseId || !nextHearingDate}
                  className="bg-[#0A1628] text-[#F5F0E8] hover:bg-[#0A1628]/90 font-bold text-xs px-6 py-2.5 flex items-center gap-2 shadow-md"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-[#C9A84C] rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5 text-[#C9A84C]" /> Update Cause List
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Cause List Upcoming Table */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border border-[#DCD6C5] bg-white shadow-md rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold font-heading text-[#0A1628]">Upcoming Cause List</h3>
                <p className="text-xs text-gray-600 font-medium">Active hearings scheduled for court appearance</p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-500" />
                <Input
                  placeholder="Search case, court, or client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 text-xs border-slate-300 bg-white text-[#0A1628] font-semibold placeholder:text-slate-400"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="h-7 w-7 border-3 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin" />
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-300 rounded-xl text-xs text-slate-500 font-semibold">
                No active cause list entries found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Case Number</th>
                      <th className="py-2.5 px-3">Client</th>
                      <th className="py-2.5 px-3">Court / Bench</th>
                      <th className="py-2.5 px-3">Next Hearing Date</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCases.map((c) => {
                      const hearingFormatted = c.nextHearing
                        ? new Date(c.nextHearing).toLocaleString('en-IN', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Not Scheduled';

                      return (
                        <tr key={c.id} className="hover:bg-amber-50/50 transition">
                          <td className="py-3 px-3">
                            <span className="font-bold text-[#0A1628]">{c.caseNumber}</span>
                            <p className="text-[10px] text-slate-600 truncate max-w-[140px]">{c.title}</p>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-[#0A1628]">{c.client?.name}</span>
                            <p className="text-[10px] text-slate-500">{c.client?.phone || 'No phone'}</p>
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-800">
                            {c.court || 'High Court'}
                          </td>
                          <td className="py-3 px-3 font-bold">
                            {c.nextHearing ? (
                              <span className="inline-flex items-center gap-1 text-rose-700 font-extrabold">
                                <Clock className="h-3 w-3 text-rose-600" /> {hearingFormatted}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium">Pending Date</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedCaseId(c.id);
                                setCourtName(c.court || 'High Court Bench');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="border-slate-300 text-[10px] py-1 px-2.5 text-[#0A1628] hover:border-[#C9A84C] font-bold bg-white"
                            >
                              Update Date
                            </Button>
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
