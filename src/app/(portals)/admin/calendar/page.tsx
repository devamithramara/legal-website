'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/providers';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, MapPin, Clock, Plus } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  color: string;
  allDay?: boolean;
  extendedProps?: any;
}

export default function AdminCalendar() {
  const { toast } = useToast();
  
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Hearing Dialog state
  const [addHearingOpen, setAddHearingOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [hearingTitle, setHearingTitle] = useState('Procedural Hearing');
  const [hearingDate, setHearingDate] = useState('');
  const [hearingNotes, setHearingNotes] = useState('');
  
  const [cases, setCases] = useState<{ id: string; caseNumber: string; title: string }[]>([]);
  const [submittingHearing, setSubmittingHearing] = useState(false);

  const fetchCalendarEvents = async () => {
    try {
      const [casesRes, apptsRes, tasksRes] = await Promise.all([
        fetch('/api/cases'),
        fetch('/api/appointments'),
        fetch('/api/tasks'),
      ]);

      const calendarEvents: CalendarEvent[] = [];

      // 1. Cases (Hearings: RED)
      if (casesRes.ok) {
        const casesData = await casesRes.json();
        setCases(casesData.filter((c: any) => c.status !== 'CLOSED'));
        
        casesData.forEach((c: any) => {
          if (c.nextHearing) {
            calendarEvents.push({
              id: `hearing_${c.id}`,
              title: `Hearing: ${c.caseNumber}`,
              start: c.nextHearing,
              color: '#EF4444', // Red
              allDay: false,
              extendedProps: {
                type: 'Hearing',
                court: c.court,
                client: c.client?.name,
              },
            });
          }
          
          // Map other events
          if (c.events && c.events.length > 0) {
            c.events.forEach((ev: any) => {
              if (ev.title.toLowerCase().includes('hearing')) {
                calendarEvents.push({
                  id: `history_hearing_${ev.id}`,
                  title: `Court: ${ev.title}`,
                  start: ev.eventDate,
                  color: '#94A3B8', // Slate gray for past hearings
                  allDay: false,
                  extendedProps: {
                    type: 'Past Hearing',
                    notes: ev.notes,
                  },
                });
              }
            });
          }
        });
      }

      // 2. Appointments (Consultations: BLUE)
      if (apptsRes.ok) {
        const apptsData = await apptsRes.json();
        apptsData.forEach((a: any) => {
          if (a.status === 'CONFIRMED') {
            // Extract date part directly from stored string to avoid UTC→local day-shift
            // a.date is stored as "YYYY-MM-DDT00:00:00.000Z" — take the first 10 chars
            const datePart = (a.date as string).slice(0, 10);

            // Parse the time slot (e.g. "10:00 AM") into 24h format for calendar
            const parseSlotTo24h = (slot: string): string => {
              try {
                const [time, period] = slot.split(' ');
                let [hours, minutes] = time.split(':').map(Number);
                if (period === 'PM' && hours !== 12) hours += 12;
                if (period === 'AM' && hours === 12) hours = 0;
                return `${String(hours).padStart(2, '0')}:${String(minutes || 0).padStart(2, '0')}:00`;
              } catch {
                return '10:00:00';
              }
            };

            const timeStr = a.timeSlot ? parseSlotTo24h(a.timeSlot) : '10:00:00';

            calendarEvents.push({
              id: `appt_${a.id}`,
              title: `Consult: ${a.client?.name || 'Client'} (${a.timeSlot || ''})`,
              start: `${datePart}T${timeStr}`,
              color: '#3B82F6', // Blue
              extendedProps: {
                type: 'Consultation',
                timeSlot: a.timeSlot,
                notes: a.notes,
              },
            });
          }
        });
      }

      // 3. Tasks (Deadlines: AMBER)
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        tasksData.forEach((t: any) => {
          if (t.deadline && t.status !== 'DONE') {
            calendarEvents.push({
              id: `task_${t.id}`,
              title: `Deadline: ${t.title}`,
              start: t.deadline,
              color: '#F59E0B', // Amber
              allDay: true,
              extendedProps: {
                type: 'Task Deadline',
                assignedTo: t.junior?.name,
              },
            });
          }
        });
      }

      setEvents(calendarEvents);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  const handleDateClick = (arg: any) => {
    // autofill date string in date-picker input
    setHearingDate(arg.dateStr + 'T10:00');
    setAddHearingOpen(true);
  };

  const handleAddHearing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !hearingTitle || !hearingDate) {
      toast('Please select case, title, and hearing date.', 'error');
      return;
    }

    setSubmittingHearing(true);
    try {
      const res = await fetch(`/api/cases/${selectedCaseId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Court Hearing: ${hearingTitle}`,
          eventDate: hearingDate,
          notes: hearingNotes,
        }),
      });

      if (res.ok) {
        toast('Hearing added and case file synchronized.', 'success');
        setAddHearingOpen(false);
        setSelectedCaseId('');
        setHearingTitle('Procedural Hearing');
        setHearingNotes('');
        fetchCalendarEvents();
      } else {
        toast('Failed to record hearing event.', 'error');
      }
    } catch (err) {
      toast('Network error saving hearing.', 'error');
    } finally {
      setSubmittingHearing(false);
    }
  };

  const handleEventClick = (info: any) => {
    const props = info.event.extendedProps;
    let desc = `${info.event.title}\nDate: ${new Date(info.event.start).toLocaleString()}`;
    if (props.type === 'Hearing') {
      desc += `\nCourt: ${props.court}\nClient: ${props.client}`;
    } else if (props.type === 'Consultation') {
      desc += `\nSlot: ${props.timeSlot}\nRemarks: ${props.notes || 'None'}`;
    } else if (props.type === 'Task Deadline') {
      desc += `\nAssigned: ${props.assignedTo}`;
    }
    alert(desc);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-[#0A1628]">Firm Calendar</h2>
          <p className="text-xs text-gray-500 font-medium">Verify hearings, scheduled consultation slots, and active procedural deadlines</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/cause-list">
            <Button variant="outline" className="border-[#DCD6C5] text-[#0A1628] hover:border-[#C9A84C] text-xs font-semibold px-4 flex items-center gap-1.5 bg-white">
              <CalendarIcon className="h-4 w-4 text-[#C9A84C]" /> Cause List Manager
            </Button>
          </Link>
          <Button 
            onClick={() => setAddHearingOpen(true)}
            className="bg-[#0A1628] hover:bg-[#0A1628]/95 text-white text-xs font-semibold px-4 flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Add Hearing Date
          </Button>
        </div>
      </div>

      {/* Calendar Legends Info */}
      <div className="flex flex-wrap items-center gap-6 bg-white p-3.5 rounded-lg border border-[#DCD6C5] shadow-sm text-xs font-semibold">
        <span className="text-gray-500 uppercase tracking-wider text-[10px]">Legends:</span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#EF4444]" /> Hearings (Red)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#3B82F6]" /> Consultations (Blue)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#F59E0B]" /> Procedural Deadlines (Amber)
        </span>
      </div>

      {/* Calendar Card block */}
      <Card className="border border-[#DCD6C5] bg-white shadow-sm p-4 sm:p-6">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="h-8 w-8 border-4 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="fc-theme-custom text-xs">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                events={events}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                editable={false}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                height="auto"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* DIALOG MODAL: Add Hearing */}
      <Dialog open={addHearingOpen} onOpenChange={setAddHearingOpen}>
        <DialogContent className="bg-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-[#0A1628]">Add Court Hearing</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">Record a court hearing and sync it to the case timeline.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddHearing} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="hCase" className="text-xs font-bold text-gray-600">Select Case File</Label>
              <Select value={selectedCaseId} onValueChange={(val) => setSelectedCaseId(val || '')}>
                <SelectTrigger className="border-slate-300 text-xs bg-white text-[#0A1628] font-bold shadow-sm">
                  <SelectValue placeholder="Case Folder" className="text-slate-500 font-medium" />
                </SelectTrigger>
                <SelectContent className="bg-white text-xs text-[#0A1628]">
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs text-[#0A1628] font-semibold">{c.caseNumber} - {c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="hTitle" className="text-xs font-bold text-gray-700">Hearing Brief Title</Label>
              <Input 
                id="hTitle" 
                placeholder="e.g. Interim Bail Argument" 
                value={hearingTitle} 
                onChange={(e) => setHearingTitle(e.target.value)} 
                className="border-slate-300 text-xs bg-white text-[#0A1628] font-bold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="hDate" className="text-xs font-bold text-gray-700">Hearing Date & Time</Label>
              <Input 
                id="hDate" 
                type="datetime-local" 
                value={hearingDate} 
                onChange={(e) => setHearingDate(e.target.value)} 
                className="border-slate-300 text-xs bg-white text-[#0A1628] font-bold"
                style={{ colorScheme: 'light' }}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="hNotes" className="text-xs font-bold text-gray-700">Courtroom Remarks (Optional)</Label>
              <Input 
                id="hNotes" 
                placeholder="Room number, judge bench details..." 
                value={hearingNotes} 
                onChange={(e) => setHearingNotes(e.target.value)} 
                className="border-slate-300 text-xs bg-white text-[#0A1628] font-bold"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setAddHearingOpen(false)}
                className="border-[#DCD6C5] text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submittingHearing}
                className="bg-[#0A1628] text-white hover:bg-[#0A1628]/95 text-xs font-semibold"
              >
                {submittingHearing ? 'Adding...' : 'Add Hearing'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
