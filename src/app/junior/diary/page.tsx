'use client';

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Gavel, Calendar as CalendarIcon, Clock, MapPin, AlertTriangle, Plus, CheckCircle2 } from 'lucide-react';

export default function JuniorDiaryPage() {
  const { toast } = useToast();

  const [cases, setCases] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [todaysHearings, setTodaysHearings] = useState<any[]>([]);
  const [hasConflict, setHasConflict] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [court, setCourt] = useState('High Court Bench 4');
  const [hallNumber, setHallNumber] = useState('Hall 102');
  const [outcome, setOutcome] = useState('ARGUMENTS');
  const [nextDate, setNextDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
              title: `Hearing: ${c.caseNumber}`,
              start: c.nextHearing,
              color: '#EF4444',
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

  const handleLogAppearance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !court || !outcome) {
      toast('Please select case, court, and outcome.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/appearances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: selectedCaseId,
          court,
          hallNumber,
          outcome,
          nextDate: nextDate || null,
          notes,
        }),
      });

      if (res.ok) {
        toast('Court appearance recorded & case synchronized!', 'success');
        setAppearanceOpen(false);
        setSelectedCaseId('');
        setNextDate('');
        setNotes('');
        fetchDiaryData();
      } else {
        toast('Failed to record appearance.', 'error');
      }
    } catch {
      toast('Network error recording appearance.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
            <Gavel className="h-6 w-6 text-[#E2C044]" /> Court Diary & Appearances
          </h1>
          <p className="text-xs text-slate-300">
            Personal calendar of assigned hearings, hall numbers, and hearing outcome logging
          </p>
        </div>

        <Button
          onClick={() => setAppearanceOpen(true)}
          className="bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5 self-start"
        >
          <Plus className="h-4 w-4" /> Log Court Appearance
        </Button>
      </div>

      {/* Morning Digest Panel */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#E2C044] flex items-center gap-2">
            <Gavel className="h-4 w-4" /> Today's Hearing Benches ({todaysHearings.length})
          </span>
          {hasConflict && (
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-rose-950 border border-rose-500/50 text-rose-400 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" /> Conflict Warning: Multiple Hearings Overlap
            </span>
          )}
        </div>

        {todaysHearings.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No assigned court hearings for today.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {todaysHearings.map((h, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-white">📁 Case {h.caseNumber} - {h.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">🏛️ {h.court}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedCaseId(h.id);
                    setCourt(h.court || 'High Court');
                    setAppearanceOpen(true);
                  }}
                  className="bg-slate-800 text-[#E2C044] text-[10px] font-bold py-1 px-2.5 rounded-lg"
                >
                  Log Outcome
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FullCalendar Component */}
      <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 border-4 border-slate-800 border-t-[#E2C044] rounded-full animate-spin" />
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
                height="auto"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* DIALOG MODAL: Log Court Appearance */}
      <Dialog open={appearanceOpen} onOpenChange={setAppearanceOpen}>
        <DialogContent className="bg-slate-900 text-slate-100 border border-slate-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-white">Log Court Appearance</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Record hearing outcome and auto-update next hearing date.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLogAppearance} className="space-y-4 text-xs">
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Court Name *</Label>
                <Input
                  value={court}
                  onChange={(e) => setCourt(e.target.value)}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Hall Number</Label>
                <Input
                  placeholder="e.g. Hall 102"
                  value={hallNumber}
                  onChange={(e) => setHallNumber(e.target.value)}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-slate-300">Outcome *</Label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl font-bold"
              >
                <option value="ARGUMENTS">ARGUMENTS (Arguments Heard)</option>
                <option value="ADJOURNED">ADJOURNED (Next Date Fixed)</option>
                <option value="ORDER">ORDER (Interim/Final Order Passed)</option>
                <option value="PART_HEARD">PART_HEARD (Part-Heard Bench)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-slate-300">Next Hearing Date (Optional)</Label>
              <Input
                type="datetime-local"
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
                className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-slate-300">Hearing Remarks / Notes</Label>
              <Input
                placeholder="Bench remarks, judge directives..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAppearanceOpen(false)}
                className="border-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] font-extrabold text-xs px-5"
              >
                {submitting ? 'Recording...' : 'Record Appearance'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
