'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/providers';
import { 
  Users, 
  Scale, 
  IndianRupee, 
  Calendar, 
  Plus, 
  Ban, 
  Clock, 
  ArrowRight,
  TrendingUp,
  FileCheck,
  CalendarDays
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface ActivityItem {
  id: string;
  type: 'appointment' | 'case_event' | 'invoice';
  title: string;
  detail: string;
  date: string;
}

export default function AdminOverview() {
  const { toast } = useToast();
  
  // Dashboard Metrics
  const [metrics, setMetrics] = useState({
    totalClients: 0,
    activeCases: 0,
    monthlyRevenue: 0,
    appointmentsToday: 0,
  });
  
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Dropdown list data for forms
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [juniors, setJuniors] = useState<{ id: string; name: string }[]>([]);

  // Modals Open State
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [caseModalOpen, setCaseModalOpen] = useState(false);
  const [blockDateModalOpen, setBlockDateModalOpen] = useState(false);

  // New Client Form State
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [submittingClient, setSubmittingClient] = useState(false);

  // New Case Form State
  const [caseClientId, setCaseClientId] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [caseTitle, setCaseTitle] = useState('');
  const [caseType, setCaseType] = useState('Criminal');
  const [caseCourt, setCaseCourt] = useState('');
  const [caseNextHearing, setCaseNextHearing] = useState('');
  const [caseAssignedTo, setCaseAssignedTo] = useState('');
  const [submittingCase, setSubmittingCase] = useState(false);

  // Block Date Form State
  const [blockDate, setBlockDate] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [submittingBlock, setSubmittingBlock] = useState(false);

  // Book Appointment for Client state
  const [apptModalOpen, setApptModalOpen] = useState(false);
  const [apptClientId, setApptClientId] = useState('');
  const [apptDate, setApptDate] = useState('');
  const [apptTimeSlot, setApptTimeSlot] = useState('');
  const [apptCaseType, setApptCaseType] = useState('Criminal');
  const [apptNotes, setApptNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState<{slot: string; capacityLeft: number; isAvailable: boolean}[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submittingAppt, setSubmittingAppt] = useState(false);

  const fetchSlotsForDate = async (dateStr: string) => {
    if (!dateStr) return;
    setLoadingSlots(true);
    setApptTimeSlot('');
    try {
      const res = await fetch(`/api/appointments/slots?date=${dateStr}`);
      const data = await res.json();
      setAvailableSlots(data.slots || []);
    } catch {
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookForClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apptClientId || !apptDate || !apptTimeSlot) {
      toast('Please select a client, date, and time slot.', 'error');
      return;
    }
    setSubmittingAppt(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: apptClientId,
          date: new Date(apptDate).toISOString(),
          timeSlot: apptTimeSlot,
          caseType: apptCaseType,
          feePaid: 0,
          notes: apptNotes,
          status: 'CONFIRMED',
          paymentId: 'ADMIN_BOOKED',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast('Appointment booked for client successfully!', 'success');
        setApptModalOpen(false);
        setApptClientId('');
        setApptDate('');
        setApptTimeSlot('');
        setApptNotes('');
        setAvailableSlots([]);
        fetchDashboardData();
      } else {
        toast(data.error || 'Failed to book appointment.', 'error');
      }
    } catch {
      toast('Network error. Please try again.', 'error');
    } finally {
      setSubmittingAppt(false);
    }
  };


  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) throw new Error('Failed to load dashboard');
      const data = await res.json();

      setClients(data.clients || []);
      setJuniors(data.juniors || []);
      setMetrics({
        totalClients: data.metrics.totalClients,
        activeCases: data.metrics.activeCases,
        monthlyRevenue: data.metrics.monthlyRevenue,
        appointmentsToday: data.metrics.appointmentsToday,
      });
      setActivities(data.activities || []);
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail) {
      toast('Please enter name and email.', 'error');
      return;
    }

    setSubmittingClient(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: clientName, email: clientEmail, phone: clientPhone }),
      });

      const data = await res.json();
      if (res.ok) {
        toast('Client created successfully! Default password is "client123".', 'success');
        setClientModalOpen(false);
        setClientName('');
        setClientEmail('');
        setClientPhone('');
        fetchDashboardData();
      } else {
        toast(data.error || 'Failed to create client.', 'error');
      }
    } catch (err) {
      toast('Network error creating client.', 'error');
    } finally {
      setSubmittingClient(false);
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseClientId || !caseNumber || !caseTitle || !caseCourt) {
      toast('Please fill in client, case number, title, and court.', 'error');
      return;
    }

    setSubmittingCase(true);
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: caseClientId,
          caseNumber,
          title: caseTitle,
          type: caseType,
          court: caseCourt,
          nextHearing: caseNextHearing || null,
          assignedTo: caseAssignedTo || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast('Case registered successfully!', 'success');
        setCaseModalOpen(false);
        setCaseClientId('');
        setCaseNumber('');
        setCaseTitle('');
        setCaseCourt('');
        setCaseNextHearing('');
        setCaseAssignedTo('');
        fetchDashboardData();
      } else {
        toast(data.error || 'Failed to register case.', 'error');
      }
    } catch (err) {
      toast('Network error registering case.', 'error');
    } finally {
      setSubmittingCase(false);
    }
  };

  const handleBlockDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDate || !blockReason) {
      toast('Please specify date and reason.', 'error');
      return;
    }

    setSubmittingBlock(true);
    // Block date is logged in the console and toast (simulated block)
    setTimeout(() => {
      toast(`Chambers blocked for ${new Date(blockDate).toLocaleDateString()}: ${blockReason}`, 'success');
      setBlockDateModalOpen(false);
      setBlockDate('');
      setBlockReason('');
      setSubmittingBlock(false);
    }, 800);
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading text-[#0A1628]">Overview</h2>
          <p className="text-xs text-gray-500">Firm metrics and active logs</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="h-8 w-8 border-4 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Metrics cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border border-[#DCD6C5] bg-white shadow-sm flex items-center p-6 gap-4">
              <div className="h-10 w-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading text-[#0A1628]">{metrics.totalClients}</p>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Total Clients</p>
              </div>
            </Card>

            <Card className="border border-[#DCD6C5] bg-white shadow-sm flex items-center p-6 gap-4">
              <div className="h-10 w-10 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading text-[#0A1628]">{metrics.activeCases}</p>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Active Cases</p>
              </div>
            </Card>

            <Card className="border border-[#DCD6C5] bg-white shadow-sm flex items-center p-6 gap-4">
              <div className="h-10 w-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600">
                <IndianRupee className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading text-[#0A1628]">₹{metrics.monthlyRevenue}</p>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Revenue (Total)</p>
              </div>
            </Card>

            <Card className="border border-[#DCD6C5] bg-white shadow-sm flex items-center p-6 gap-4">
              <div className="h-10 w-10 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading text-[#0A1628]">{metrics.appointmentsToday}</p>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Consultations Today</p>
              </div>
            </Card>
          </div>

          {/* Quick Actions Panel */}
          <Card className="border border-[#DCD6C5] bg-white shadow-sm">
            <CardHeader className="pb-3 border-b border-[#DCD6C5]/30">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#0A1628]">Quick Actions Console</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-wrap gap-4">
              <Button 
                onClick={() => setClientModalOpen(true)}
                className="bg-[#0A1628] text-white hover:bg-[#0A1628]/90 text-xs font-semibold px-4 flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> New Client
              </Button>
              <Button 
                onClick={() => setCaseModalOpen(true)}
                className="bg-[#C9A84C] text-[#0A1628] hover:bg-[#C9A84C]/90 text-xs font-semibold px-4 flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> New Case
              </Button>
              <Button
                onClick={() => setApptModalOpen(true)}
                className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold px-4 flex items-center gap-1.5"
              >
                <CalendarDays className="h-4 w-4" /> Book for Client
              </Button>
              <Button 
                onClick={() => setBlockDateModalOpen(true)}
                variant="outline"
                className="border-[#DCD6C5] hover:border-[#0A1628] hover:bg-[#0A1628]/5 text-xs font-semibold px-4 flex items-center gap-1.5 text-gray-700"
              >
                <Ban className="h-4 w-4 text-rose-500" /> Block Date
              </Button>
            </CardContent>
          </Card>

          {/* Unified Activity Feed & Summary cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activities Feed */}
            <div className="lg:col-span-2">
              <Card className="border border-[#DCD6C5] bg-white shadow-sm">
                <CardHeader className="border-b border-[#DCD6C5]/30">
                  <CardTitle className="text-base font-heading text-[#0A1628] flex items-center gap-2">
                    <Clock className="h-4.5 w-4.5 text-[#C9A84C]" /> Recent Chambers Activity
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500">Live operational events tracked across benches</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {activities.length === 0 ? (
                    <div className="text-center py-12 text-xs text-gray-400 font-semibold">
                      No recent activities recorded.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activities.map((act) => (
                        <div key={act.id} className="flex items-start gap-4 p-3 rounded border border-[#DCD6C5]/20 bg-gray-50/50">
                          <div className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            act.type === 'appointment'
                              ? 'bg-blue-100 text-blue-700'
                              : act.type === 'case_event'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {act.type === 'appointment' ? 'A' : act.type === 'case_event' ? 'C' : 'I'}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-[#0A1628]">{act.title}</h4>
                              <span className="text-[9px] text-gray-400 font-medium">
                                {new Date(act.date).toLocaleDateString()} {new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-600">{act.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick stats side panel */}
            <div className="space-y-6">
              <Card className="border border-[#DCD6C5] bg-white shadow-sm">
                <CardHeader className="border-b border-[#DCD6C5]/30">
                  <CardTitle className="text-base font-heading text-[#0A1628] flex items-center gap-2">
                    <TrendingUp className="h-4.5 w-4.5 text-[#C9A84C]" /> Performance Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4 text-xs font-medium text-gray-600">
                  <div className="flex justify-between items-center pb-2 border-b border-[#DCD6C5]/20">
                    <span>Average Billable rate</span>
                    <strong className="text-[#0A1628]">₹8,500/hr</strong>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-[#DCD6C5]/20">
                    <span>Active Juniors on payroll</span>
                    <strong className="text-[#0A1628]">{juniors.length} advocates</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>BCI Regulations compliance</span>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <FileCheck className="h-3 w-3" /> Certified
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* MODAL: Add Client */}
      <Dialog open={clientModalOpen} onOpenChange={setClientModalOpen}>
        <DialogContent className="bg-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-[#0A1628]">Add New Client</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">Register a client credentials user. Default login password is "client123".</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateClient} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cName" className="text-xs font-bold text-gray-600">Full Name</Label>
              <Input 
                id="cName" 
                placeholder="Client Name" 
                value={clientName} 
                onChange={(e) => setClientName(e.target.value)} 
                className="border-[#DCD6C5] text-xs"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cEmail" className="text-xs font-bold text-gray-600">Email Address</Label>
              <Input 
                id="cEmail" 
                type="email" 
                placeholder="email@domain.com" 
                value={clientEmail} 
                onChange={(e) => setClientEmail(e.target.value)} 
                className="border-[#DCD6C5] text-xs"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cPhone" className="text-xs font-bold text-gray-600">Phone (Optional)</Label>
              <Input 
                id="cPhone" 
                placeholder="+91 XXXXX XXXXX" 
                value={clientPhone} 
                onChange={(e) => setClientPhone(e.target.value)} 
                className="border-[#DCD6C5] text-xs"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setClientModalOpen(false)}
                className="border-[#DCD6C5] text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submittingClient}
                className="bg-[#0A1628] text-white hover:bg-[#0A1628]/95 text-xs font-semibold"
              >
                {submittingClient ? 'Registering...' : 'Register Client'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: Add Case */}
      <Dialog open={caseModalOpen} onOpenChange={setCaseModalOpen}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-[#0A1628]">Register Case File</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">Record a court litigation folder linked to a client.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCase} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="caseClient" className="text-xs font-bold text-gray-600">Select Client</Label>
                <Select value={caseClientId} onValueChange={(val) => setCaseClientId(val || '')}>
                  <SelectTrigger className="border-[#DCD6C5] text-xs bg-white">
                    <SelectValue placeholder="Client" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-xs">
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cNumber" className="text-xs font-bold text-gray-600">Case/CNR Number</Label>
                <Input 
                  id="cNumber" 
                  placeholder="CNR-2026-XXXX" 
                  value={caseNumber} 
                  onChange={(e) => setCaseNumber(e.target.value)} 
                  className="border-[#DCD6C5] text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cTitle" className="text-xs font-bold text-gray-600">Case Title</Label>
              <Input 
                id="cTitle" 
                placeholder="State of MH vs. Defendant" 
                value={caseTitle} 
                onChange={(e) => setCaseTitle(e.target.value)} 
                className="border-[#DCD6C5] text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cType" className="text-xs font-bold text-gray-600">Specialty</Label>
                <Select value={caseType} onValueChange={(val) => setCaseType(val || '')}>
                  <SelectTrigger className="border-[#DCD6C5] text-xs bg-white">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-xs">
                    <SelectItem value="Criminal" className="text-xs">Criminal Defense</SelectItem>
                    <SelectItem value="Civil" className="text-xs">Civil Litigation</SelectItem>
                    <SelectItem value="Corporate" className="text-xs">Corporate Advisory</SelectItem>
                    <SelectItem value="Family" className="text-xs">Family Law</SelectItem>
                    <SelectItem value="Property" className="text-xs">Property Title</SelectItem>
                    <SelectItem value="Labour" className="text-xs">Labour Disputes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cCourt" className="text-xs font-bold text-gray-600">Court Bench</Label>
                <Input 
                  id="cCourt" 
                  placeholder="High Court, Room 10" 
                  value={caseCourt} 
                  onChange={(e) => setCaseCourt(e.target.value)} 
                  className="border-[#DCD6C5] text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cHearing" className="text-xs font-bold text-gray-600">Initial/Next Hearing</Label>
                <Input 
                  id="cHearing" 
                  type="date" 
                  value={caseNextHearing} 
                  onChange={(e) => setCaseNextHearing(e.target.value)} 
                  className="border-[#DCD6C5] text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cJunior" className="text-xs font-bold text-gray-600">Assign Junior Counsel</Label>
                <Select value={caseAssignedTo} onValueChange={(val) => setCaseAssignedTo(val || '')}>
                  <SelectTrigger className="border-[#DCD6C5] text-xs bg-white">
                    <SelectValue placeholder="Junior Advocate" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-xs">
                    <SelectItem value="none" className="text-xs">Unassigned (None)</SelectItem>
                    {juniors.map((j) => (
                      <SelectItem key={j.id} value={j.id} className="text-xs">{j.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCaseModalOpen(false)}
                className="border-[#DCD6C5] text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submittingCase}
                className="bg-[#0A1628] text-white hover:bg-[#0A1628]/95 text-xs font-semibold"
              >
                {submittingCase ? 'Registering...' : 'Register Case'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: Block Date */}
      <Dialog open={blockDateModalOpen} onOpenChange={setBlockDateModalOpen}>
        <DialogContent className="bg-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-[#0A1628]">Block Chambers Calendar</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">Block a specific date from the consultation booking calendar.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBlockDate} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="bDate" className="text-xs font-bold text-gray-600">Date to Block</Label>
              <Input 
                id="bDate" 
                type="date" 
                value={blockDate} 
                onChange={(e) => setBlockDate(e.target.value)} 
                className="border-[#DCD6C5] text-xs"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bReason" className="text-xs font-bold text-gray-600">Reason</Label>
              <Input 
                id="bReason" 
                placeholder="e.g., Bar Council Meeting, Sick Leave" 
                value={blockReason} 
                onChange={(e) => setBlockReason(e.target.value)} 
                className="border-[#DCD6C5] text-xs"
                required
              />
            </div>
            <DialogFooter className="pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setBlockDateModalOpen(false)}
                className="border-[#DCD6C5] text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submittingBlock}
                className="bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold"
              >
                {submittingBlock ? 'Blocking...' : 'Block Date'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── BOOK APPOINTMENT FOR CLIENT DIALOG ── */}
      <Dialog open={apptModalOpen} onOpenChange={setApptModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white border border-[#DCD6C5]">
          <DialogHeader>
            <DialogTitle className="font-heading text-[#0A1628] flex items-center gap-2">
              <CalendarDays className="h-4.5 w-4.5 text-emerald-600" /> Book Appointment for Client
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Select a client, date and available time slot. The appointment will be confirmed immediately.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBookForClient} className="space-y-5 pt-2">
            {/* Client Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-600">Client *</Label>
              <Select value={apptClientId} onValueChange={(v) => setApptClientId(v || '')}>
                <SelectTrigger className="border-[#DCD6C5] text-xs bg-white">
                  <SelectValue placeholder="Select client…" />
                </SelectTrigger>
                <SelectContent className="bg-white text-xs">
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Case Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-600">Case Type</Label>
              <Select value={apptCaseType} onValueChange={(v) => setApptCaseType(v || 'Criminal')}>
                <SelectTrigger className="border-[#DCD6C5] text-xs bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white text-xs">
                  <SelectItem value="Criminal" className="text-xs">Criminal Defense</SelectItem>
                  <SelectItem value="Civil" className="text-xs">Civil &amp; Property</SelectItem>
                  <SelectItem value="Corporate" className="text-xs">Corporate Law</SelectItem>
                  <SelectItem value="Family" className="text-xs">Family &amp; Divorce</SelectItem>
                  <SelectItem value="Property" className="text-xs">Property Land</SelectItem>
                  <SelectItem value="Labour" className="text-xs">Labour &amp; Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Picker */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-600">Date *</Label>
              <Input
                type="date"
                value={apptDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setApptDate(e.target.value);
                  fetchSlotsForDate(e.target.value);
                }}
                className="border-[#DCD6C5] text-xs"
              />
            </div>

            {/* Time Slot */}
            {apptDate && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600">Time Slot *</Label>
                {loadingSlots ? (
                  <div className="flex items-center gap-2 py-3">
                    <div className="h-4 w-4 border-2 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin" />
                    <span className="text-xs text-gray-400">Loading slots…</span>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-xs text-rose-500 font-semibold">No slots available for this date. Try another day.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        disabled={!s.isAvailable}
                        onClick={() => setApptTimeSlot(s.slot)}
                        className={`p-2 rounded text-[11px] font-semibold border transition ${
                          !s.isAvailable
                            ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'
                            : apptTimeSlot === s.slot
                              ? 'bg-[#0A1628] text-white border-[#C9A84C]'
                              : 'bg-white border-[#DCD6C5] text-[#0A1628] hover:border-[#C9A84C]'
                        }`}
                      >
                        {s.slot}
                        {s.isAvailable && s.capacityLeft <= 2 && (
                          <span className="block text-[8px] font-bold text-rose-500">Only {s.capacityLeft} left</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-600">Notes (Optional)</Label>
              <Input
                type="text"
                placeholder="Brief case note or instruction…"
                value={apptNotes}
                onChange={(e) => setApptNotes(e.target.value)}
                className="border-[#DCD6C5] text-xs"
              />
            </div>

            <DialogFooter className="pt-2 flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setApptModalOpen(false)}
                className="border-[#DCD6C5] text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingAppt || !apptClientId || !apptDate || !apptTimeSlot}
                className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold"
              >
                {submittingAppt ? 'Booking…' : 'Confirm Booking'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
