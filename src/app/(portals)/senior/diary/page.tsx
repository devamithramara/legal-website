'use client';

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/providers';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Gavel, Calendar as CalendarIcon, AlertTriangle, CheckSquare, Plus, Clock } from 'lucide-react';

export default function SeniorDiaryPage() {
  const { toast } = useToast();

  const [cases, setCases] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [todaysHearings, setTodaysHearings] = useState<any[]>([]);
  const [hasConflict, setHasConflict] = useState(false);
  const [loading, setLoading] = useState(true);

  // Pre-hearing checklist modal state
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [checklist, setChecklist] = useState({
    documentsReady: false,
    argumentsDrafted: false,
    clientBriefed: false,
    juniorBriefed: false,
    vakalatnama: false,
    feeCollected: false,
    completionPct: 0,
  });
  const [savingChecklist, setSavingChecklist] = useState(false);

  const fetchDiaryData = async () => {
    try {
      const res = await fetch('/api/cases');
      if (res.ok) {
        const casesData = await res.json();
        setCases(casesData.filter((c: any) => c.status !== 'CLOSED'));

        const eventsList: any[] = [];
        const todayStr = new Date().toISOString().slice(0, 10);
        const todayList: any[] = [];

        casesData.forEach((c: any) => {
          if (c.nextHearing) {
            eventsList.push({
              id: `hearing_${c.id}`,
              title: `Bench: ${c.caseNumber}`,
              start: c.nextHearing,
              color: '#0A1628',
              extendedProps: { court: c.court, client: c.client?.name },
            });

            if ((c.nextHearing as string).startsWith(todayStr)) {
              todayList.push(c);
            }
          }
        });

        setCalendarEvents(eventsList);
        setTodaysHearings(todayList);
        setHasConflict(todayList.length >= 2);
      }
    } catch {
      toast('Failed to load court diary.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiaryData();
  }, []);

  const openChecklistModal = async (cItem: any) => {
    setSelectedCase(cItem);
    setChecklistOpen(true);
    try {
      const res = await fetch(`/api/checklist/${cItem.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.checklist) {
          setChecklist({
            documentsReady: data.checklist.documentsReady || false,
            argumentsDrafted: data.checklist.argumentsDrafted || false,
            clientBriefed: data.checklist.clientBriefed || false,
            juniorBriefed: data.checklist.juniorBriefed || false,
            vakalatnama: data.checklist.vakalatnama || false,
            feeCollected: data.checklist.feeCollected || false,
            completionPct: data.checklist.completionPct || 0,
          });
        }
      }
    } catch {
      // Ignore
    }
  };

  const handleToggleChecklist = async (key: string, val: boolean) => {
    const updated = { ...checklist, [key]: val };
    setChecklist(updated);

    if (!selectedCase) return;
    setSavingChecklist(true);
    try {
      const res = await fetch(`/api/checklist/${selectedCase.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.checklist) {
          setChecklist(data.checklist);
          toast(`Checklist updated (${data.checklist.completionPct}%)`, 'success');
        }
      }
    } catch {
      toast('Failed to save checklist.', 'error');
    } finally {
      setSavingChecklist(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
          <Gavel className="h-6 w-6 text-[#C9A84C]" /> Senior Court Diary & Pre-Hearing Checklist
        </h1>
        <p className="text-xs text-slate-300">
          Supervise personal court schedule, detect bench conflict clashes, and verify 6-item hearing preparation checklists
        </p>
      </div>

      {/* Conflict Warning Banner */}
      {hasConflict && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-600/60 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-400 animate-pulse" />
            <div>
              <p className="font-extrabold">Court Bench Clash Warning!</p>
              <p className="text-[11px] text-rose-200">You have {todaysHearings.length} overlapping hearings scheduled today across different court halls.</p>
            </div>
          </div>
          <span className="font-bold px-3 py-1 bg-rose-800 rounded-lg">High Conflict</span>
        </div>
      )}

      {/* FullCalendar Component */}
      <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 border-4 border-slate-800 border-t-[#C9A84C] rounded-full animate-spin" />
            </div>
          ) : (
            <div className="fc-theme-custom text-xs">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek',
                }}
                events={calendarEvents}
                eventClick={(info: { event: { id: string; extendedProps: Record<string, any> } }) => {
                  const caseId = info.event.id.replace('hearing_', '');
                  const targetCase = cases.find(c => c.id === caseId);
                  if (targetCase) openChecklistModal(targetCase);
                }}
                height="auto"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* PRE-HEARING CHECKLIST MODAL */}
      <Dialog open={checklistOpen} onOpenChange={setChecklistOpen}>
        <DialogContent className="bg-slate-900 text-slate-100 border border-slate-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-white flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-[#C9A84C]" /> Pre-Hearing Checklist ({checklist.completionPct}%)
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              📁 Case: {selectedCase?.caseNumber} - {selectedCase?.title}
            </DialogDescription>
          </DialogHeader>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full transition-all duration-300 ${
                checklist.completionPct === 100 ? 'bg-emerald-400' : 'bg-[#C9A84C]'
              }`}
              style={{ width: `${checklist.completionPct}%` }}
            />
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <span className="font-bold text-white">1. Core Brief & Case Files Ready</span>
              <input
                type="checkbox"
                checked={checklist.documentsReady}
                onChange={(e) => handleToggleChecklist('documentsReady', e.target.checked)}
                className="h-4 w-4 rounded accent-[#C9A84C]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <span className="font-bold text-white">2. Written Arguments Drafted</span>
              <input
                type="checkbox"
                checked={checklist.argumentsDrafted}
                onChange={(e) => handleToggleChecklist('argumentsDrafted', e.target.checked)}
                className="h-4 w-4 rounded accent-[#C9A84C]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <span className="font-bold text-white">3. Client Pre-Hearing Briefed</span>
              <input
                type="checkbox"
                checked={checklist.clientBriefed}
                onChange={(e) => handleToggleChecklist('clientBriefed', e.target.checked)}
                className="h-4 w-4 rounded accent-[#C9A84C]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <span className="font-bold text-white">4. Junior Advocate Briefed</span>
              <input
                type="checkbox"
                checked={checklist.juniorBriefed}
                onChange={(e) => handleToggleChecklist('juniorBriefed', e.target.checked)}
                className="h-4 w-4 rounded accent-[#C9A84C]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <span className="font-bold text-white">5. Vakalatnama Filed on Record</span>
              <input
                type="checkbox"
                checked={checklist.vakalatnama}
                onChange={(e) => handleToggleChecklist('vakalatnama', e.target.checked)}
                className="h-4 w-4 rounded accent-[#C9A84C]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <span className="font-bold text-white">6. Senior Retainer Fee Settled</span>
              <input
                type="checkbox"
                checked={checklist.feeCollected}
                onChange={(e) => handleToggleChecklist('feeCollected', e.target.checked)}
                className="h-4 w-4 rounded accent-[#C9A84C]"
              />
            </label>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
