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
import { CheckCircle2, ArrowRight, Download, CalendarDays } from 'lucide-react';

/** Convert a local Date object to YYYY-MM-DD without timezone shift */
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

  // 2-step: 1 = Schedule, 2 = Confirmed
  const [step, setStep] = useState(1);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [slots, setSlots] = useState<{ slot: string; capacityLeft: number; isAvailable: boolean }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [appointment, setAppointment] = useState<any>(null);

  // Fetch available slots whenever date changes — uses local date string to avoid UTC shift
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
      // Use local date string (YYYY-MM-DD) stored at midnight local to avoid UTC day-shift
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
    <div className="flex-1 flex flex-col min-h-screen bg-[#F5F0E8] text-[#0A1628]">
      <Navbar />

      <main className="flex-1 py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Step Indicator */}
        <div className="mb-10 max-w-sm mx-auto">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase">
            <span className={step >= 1 ? 'text-[#0A1628] font-bold' : ''}>1. Schedule</span>
            <span className={step >= 2 ? 'text-[#0A1628] font-bold' : ''}>2. Confirmed</span>
          </div>
          <div className="relative w-full h-1 bg-[#DCD6C5] rounded mt-2">
            <div
              className="absolute left-0 top-0 h-full bg-[#C9A84C] rounded transition-all duration-500"
              style={{ width: `${(step - 1) * 100}%` }}
            />
          </div>
        </div>

        {/* ── STEP 1: Date & Time ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold font-heading text-[#0A1628] flex items-center justify-center gap-2">
                <CalendarDays className="h-6 w-6 text-[#C9A84C]" /> Book Your Consultation
              </h2>
              <p className="text-xs text-gray-500 mt-1">Select an available date and time slot at MLR Associates Chambers</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Calendar */}
              <div className="md:col-span-5 flex justify-center bg-white p-4 rounded-xl border border-[#DCD6C5] shadow-sm">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={disabledDays}
                  className="rounded-md border-0"
                />
              </div>

              {/* Slots */}
              <div className="md:col-span-7 space-y-4">
                <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  {selectedDate
                    ? `Available Slots — ${selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}`
                    : 'Available Time Slots'}
                </Label>

                {!selectedDate ? (
                  <div className="text-center py-12 bg-white border border-dashed border-[#DCD6C5] rounded-xl text-xs text-gray-400 font-semibold">
                    ← Select a date on the calendar to see available slots
                  </div>
                ) : loadingSlots ? (
                  <div className="flex justify-center items-center py-14">
                    <div className="h-7 w-7 border-[3px] border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin" />
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-10 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-semibold">
                    Chambers are closed on this date. Please pick another day.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {slots.map((s, idx) => (
                      <button
                        key={idx}
                        disabled={!s.isAvailable}
                        onClick={() => setSelectedSlot(s.slot)}
                        className={`p-3 rounded-lg text-xs font-semibold border transition duration-200 flex flex-col items-center gap-1.5 ${
                          !s.isAvailable
                            ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'
                            : selectedSlot === s.slot
                              ? 'bg-[#0A1628] text-white border-[#C9A84C] shadow-md'
                              : 'bg-white border-[#DCD6C5] text-[#0A1628] hover:border-[#C9A84C] hover:shadow-sm'
                        }`}
                      >
                        <span>{s.slot}</span>
                        {s.isAvailable && s.capacityLeft <= 2 && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            selectedSlot === s.slot ? 'bg-[#C9A84C] text-[#0A1628]' : 'bg-rose-100 text-rose-600'
                          }`}>
                            Only {s.capacityLeft} left
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {selectedSlot && (
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="notes" className="text-xs font-bold text-gray-600">
                      Brief Case Description <span className="font-normal text-gray-400">(Optional)</span>
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Describe your legal matter briefly so our counsel can prepare..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="border-[#DCD6C5] focus:border-[#C9A84C] text-xs min-h-[80px]"
                    />
                  </div>
                )}

                {selectedDate && selectedSlot && (
                  <div className="bg-[#0A1628]/5 border border-[#C9A84C]/30 rounded-lg p-3 text-xs space-y-1">
                    <p className="font-bold text-[#0A1628]">Booking Summary</p>
                    <p className="text-gray-600">
                      📅 {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-gray-600">🕐 {selectedSlot}</p>
                    <p className="text-gray-600">📍 MLR Associates Chambers</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end border-t border-[#DCD6C5]/30 pt-6 mt-4">
              <Button
                onClick={handleBookAppointment}
                disabled={submitting || !selectedSlot || !selectedDate}
                className="bg-[#0A1628] text-[#F5F0E8] hover:bg-[#0A1628]/90 text-sm font-semibold px-6 py-2.5 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-[#C9A84C] rounded-full animate-spin" />
                    Confirming…
                  </>
                ) : (
                  <>Confirm Appointment <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Confirmation ── */}
        {step === 2 && appointment && (
          <div className="max-w-md mx-auto space-y-6">
            <Card className="border border-emerald-200 shadow-lg bg-white overflow-hidden">
              <div className="bg-emerald-600 p-8 text-white text-center">
                <CheckCircle2 className="h-14 w-14 mx-auto mb-3 text-emerald-100" />
                <h3 className="text-2xl font-bold font-heading">Appointment Confirmed!</h3>
                <p className="text-xs text-emerald-200 mt-1">
                  Reference: <span className="font-bold">{appointment.id.split('-')[0].toUpperCase()}</span>
                </p>
              </div>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500">Date</span>
                    <span className="font-bold text-[#0A1628]">
                      {selectedDate?.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500">Time Slot</span>
                    <span className="font-bold text-[#0A1628]">{selectedSlot}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500">Chambers</span>
                    <span className="font-bold text-[#0A1628]">MLR Associates</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500">Status</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Confirmed</span>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-600 leading-relaxed">
                  <strong>Next Steps:</strong> Our team will reach out to confirm your appointment. Please carry relevant documents to the consultation.
                </div>
              </CardContent>
              <CardFooter className="border-t border-[#DCD6C5]/30 pt-4 flex flex-col gap-3">
                <Button
                  onClick={downloadICS}
                  className="w-full bg-[#C9A84C] text-[#0A1628] hover:bg-[#C9A84C]/90 font-semibold text-xs py-2.5 flex items-center justify-center gap-2"
                >
                  <Download className="h-3.5 w-3.5" /> Add to Calendar (.ics)
                </Button>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-[#0A1628] text-white hover:bg-[#0A1628]/90 text-xs font-semibold py-2.5"
                >
                  Go to My Dashboard <ArrowRight className="h-3.5 w-3.5 ml-1" />
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
