'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { FloatingWidgets } from '@/components/floating-widgets';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/components/providers';
import { CheckCircle2, ArrowRight, Download, CalendarDays, Sparkles, Clock, ShieldCheck } from 'lucide-react';

function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function BookPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [slots, setSlots] = useState<{ slot: string; capacityLeft: number; isAvailable: boolean }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [appointment, setAppointment] = useState<any>(null);

  useEffect(() => {
    if (!selectedDate) return;
    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSelectedSlot('');
      try {
        const dateStr = toLocalDateStr(selectedDate);
        const res = await fetch(`/api/appointments/slots?date=${dateStr}`);
        const data = await res.json();
        if (data.slots) {
          setSlots(data.slots);
        } else {
          toast(data.message || 'Chambers are closed on this date.', 'info');
          setSlots([]);
        }
      } catch {
        toast('Failed to load slots.', 'error');
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDate]);

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedSlot) {
      toast('Please select a date and an available time slot.', 'error');
      return;
    }
    if (!session) {
      toast('Please sign in to continue with booking.', 'info');
      router.push('/login?callbackUrl=/book');
      return;
    }

    setSubmitting(true);
    try {
      const localDateStr = toLocalDateStr(selectedDate);

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: session.user.id,
          date: `${localDateStr}T00:00:00.000Z`,
          timeSlot: selectedSlot,
          caseType: 'General',
          feePaid: 0,
          notes,
          status: 'CONFIRMED',
          paymentId: 'DIRECT_BOOKING',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAppointment({ ...data.appointment, localDate: localDateStr });
        setStep(2);
        toast('Appointment confirmed!', 'success');
      } else {
        toast(data.error || 'Booking failed. Please try again.', 'error');
      }
    } catch {
      toast('Network error. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadICS = () => {
    if (!appointment) return;
    const dateStr = appointment.localDate.replace(/-/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MLR Associates//Calendar//EN',
      'BEGIN:VEVENT',
      `UID:${appointment.id}@mlrassociates.in`,
      `DTSTAMP:${dateStr}T000000Z`,
      `DTSTART;VALUE=DATE:${dateStr}`,
      `SUMMARY:Consultation at MLR Associates`,
      `DESCRIPTION:Slot: ${selectedSlot}. ${notes || ''}`,
      'LOCATION:MLR Associates Chambers',
      'DURATION:PT1H',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `consultation_${appointment.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const disabledDays = (date: Date) => {
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 5);
    return date.getDay() === 0 || date < today || date > maxDate;
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen mesh-bg text-slate-100 font-sans">
      <Navbar />

      <main className="flex-1 py-14 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Header Title */}
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E2C044]/15 border border-[#E2C044]/30 text-xs font-bold text-[#E2C044]">
            <Sparkles className="h-3.5 w-3.5" /> Fast-Track Booking Desk
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
            Schedule Counsel Consultation
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Pick a date to view live available slots at MLR ASSOCIATES Chambers.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-10 max-w-sm mx-auto">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span className={step >= 1 ? 'text-[#E2C044]' : ''}>1. Schedule Slot</span>
            <span className={step >= 2 ? 'text-[#E2C044]' : ''}>2. Confirmed</span>
          </div>
          <div className="relative w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#E2C044] to-[#F59E0B] transition-all duration-500"
              style={{ width: `${(step - 1) * 100}%` }}
            />
          </div>
        </div>

        {/* ── STEP 1: Date & Time ── */}
        {step === 1 && (
          <div className="glass-panel rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Calendar Container */}
              <div className="md:col-span-5 flex flex-col items-center bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-inner">
                <p className="text-xs font-bold text-[#E2C044] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" /> Pick Hearing Date
                </p>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={disabledDays}
                  className="rounded-xl border-0 text-white"
                />
              </div>

              {/* Slots Container */}
              <div className="md:col-span-7 space-y-5">
                <Label className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                  {selectedDate
                    ? `Available Slots — ${selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}`
                    : '2. Select Chamber Slot'}
                </Label>

                {!selectedDate ? (
                  <div className="text-center py-14 bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl text-xs text-slate-400 font-semibold">
                    ← Select a date on the calendar to inspect live available slots
                  </div>
                ) : loadingSlots ? (
                  <div className="flex justify-center items-center py-14">
                    <div className="h-8 w-8 border-4 border-slate-800 border-t-[#E2C044] rounded-full animate-spin" />
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-10 bg-rose-950/60 border border-rose-800/80 rounded-2xl text-xs text-rose-300 font-semibold">
                    Chambers are closed on this date. Please select another day.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {slots.map((s, idx) => (
                      <button
                        key={idx}
                        disabled={!s.isAvailable}
                        onClick={() => setSelectedSlot(s.slot)}
                        className={`p-3.5 rounded-xl text-xs font-bold border transition duration-200 flex flex-col items-center gap-1.5 ${
                          !s.isAvailable
                            ? 'bg-slate-900/40 text-slate-600 border-slate-900 cursor-not-allowed'
                            : selectedSlot === s.slot
                              ? 'bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] border-[#E2C044] shadow-lg shadow-[#E2C044]/25'
                              : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-[#E2C044]'
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {s.slot}
                        </span>
                        {s.isAvailable && s.capacityLeft <= 2 && (
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                            selectedSlot === s.slot ? 'bg-[#0B132B] text-[#E2C044]' : 'bg-rose-950 border border-rose-500/40 text-rose-400'
                          }`}>
                            Only {s.capacityLeft} left
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {selectedSlot && (
                  <div className="space-y-2 pt-2 animate-in fade-in duration-200">
                    <Label htmlFor="notes" className="text-xs font-bold text-slate-300">
                      Brief Case / Legal Summary <span className="font-normal text-slate-500">(Optional)</span>
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Briefly state your matter (e.g. Land Partition, High Court Bail Appeal, Contract Audit)..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="border-slate-800 bg-slate-950/80 focus:border-[#E2C044] text-slate-200 text-xs min-h-[90px] rounded-xl"
                    />
                  </div>
                )}

                {selectedDate && selectedSlot && (
                  <div className="bg-[#E2C044]/10 border border-[#E2C044]/30 rounded-xl p-4 text-xs space-y-1.5">
                    <p className="font-bold gold-gradient-text flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-[#E2C044]" /> Appointment Reservation Summary
                    </p>
                    <p className="text-slate-300">
                      📅 {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-slate-300">🕐 {selectedSlot}</p>
                    <p className="text-slate-300">📍 MLR ASSOCIATES Chambers</p>
                  </div>
                )}
              </div>

            </div>

            <div className="flex justify-end border-t border-slate-800 pt-6">
              <Button
                onClick={handleBookAppointment}
                disabled={submitting || !selectedSlot || !selectedDate}
                className="bg-gradient-to-r from-[#E2C044] via-[#F3E5AB] to-[#B8860B] text-[#0B132B] hover:brightness-110 text-sm font-extrabold px-8 py-3.5 rounded-xl shadow-xl shadow-[#E2C044]/20 flex items-center gap-2 transition duration-200"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-[#0B132B] border-t-white rounded-full animate-spin" />
                    Confirming Reservation…
                  </>
                ) : (
                  <>Lock Appointment Slot <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Confirmation ── */}
        {step === 2 && appointment && (
          <div className="max-w-md mx-auto space-y-6">
            <Card className="border border-emerald-500/40 shadow-2xl bg-slate-900/90 text-slate-100 rounded-3xl overflow-hidden backdrop-blur-xl">
              <div className="bg-gradient-to-br from-emerald-600 to-teal-800 p-8 text-white text-center">
                <CheckCircle2 className="h-16 w-16 mx-auto mb-3 text-emerald-200 animate-bounce" />
                <h3 className="text-2xl font-extrabold font-heading">Consultation Confirmed!</h3>
                <p className="text-xs text-emerald-200 mt-1">
                  Chamber Ref: <span className="font-bold">{appointment.id.split('-')[0].toUpperCase()}</span>
                </p>
              </div>

              <CardContent className="pt-6 space-y-4">
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-400">Date</span>
                    <span className="font-bold text-white">
                      {selectedDate?.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-400">Time Slot</span>
                    <span className="font-bold text-white">{selectedSlot}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-400">Chambers</span>
                    <span className="font-bold text-white">MLR ASSOCIATES</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400">Status</span>
                    <span className="font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full">
                      Confirmed
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-[#E2C044]">Next Steps:</strong> Our advocates registry will review your brief notes. Please bring any relevant document copies to your session.
                </div>
              </CardContent>

              <CardFooter className="border-t border-slate-800 pt-4 flex flex-col gap-3">
                <Button
                  onClick={downloadICS}
                  className="w-full bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" /> Download iCal (.ics) Calendar File
                </Button>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs py-3 rounded-xl hover:bg-slate-700"
                >
                  Go to Client Portal <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </main>

      <Footer />
      <FloatingWidgets />
    </div>
  );
}
