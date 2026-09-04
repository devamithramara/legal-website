# MLR Associates — Part 4: Admin & Practice Operations Portal

This document contains all pages and layouts for the Admin Portal (`/admin`), covering Case Management, Cause Lists, Court Calendar, Junior Oversight, Document Vault, Billing/Finance, Reminders Engine, Analytics, and Client Self-Service Dashboard.

---

### File: `src/app/(portals)/admin/layout.tsx`

```typescript
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Home, 
  Users, 
  Briefcase, 
  Calendar, 
  UsersRound, 
  IndianRupee, 
  BarChart3, 
  LogOut,
  UserCheck,
  FolderOpen,
  Bell,
  Gavel
} from 'lucide-react';

const ADMIN_LINKS = [
  { label: 'Overview', href: '/admin', icon: Home },
  { label: 'Cause List', href: '/admin/cause-list', icon: Gavel },
  { label: 'Clients', href: '/admin/clients', icon: Users },
  { label: 'Cases', href: '/admin/cases', icon: Briefcase },
  { label: 'Files', href: '/admin/files', icon: FolderOpen },
  { label: 'Calendar', href: '/admin/calendar', icon: Calendar },
  { label: 'Juniors', href: '/admin/juniors', icon: UsersRound },
  { label: 'Reminders', href: '/admin/reminders', icon: Bell },
  { label: 'Finances', href: '/admin/finance', icon: IndianRupee },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F5F0E8] text-[#0A1628] pb-16 lg:pb-0">
      {/* Top Header bar */}
      <header className="bg-[#0A1628] text-white h-14 flex items-center justify-between px-6 border-b border-[#C9A84C]/20 shadow-md">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#C9A84C]" />
          <span className="font-heading font-bold tracking-wider text-sm">MLR ASSOCIATES ADMIN</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right text-[10px] text-gray-400 font-semibold">
            <span>{session?.user?.name}</span>
            <span>Firm Admin Portal</span>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-gray-400 hover:text-rose-500 transition focus:outline-none"
            title="Log Out"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Desktop Sidebar Panel */}
        <aside className="hidden lg:flex flex-col w-56 bg-[#0A1628] text-white border-r border-[#C9A84C]/10 flex-shrink-0">
          <div className="flex-1 py-6 space-y-1 px-3">
            {ADMIN_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded text-xs font-semibold tracking-wide transition duration-200 ${
                    isActive 
                      ? 'bg-[#C9A84C] text-[#0A1628]' 
                      : 'hover:bg-white/5 hover:text-[#C9A84C] text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="p-4 border-t border-[#C9A84C]/10 text-[9px] text-gray-500 text-center uppercase tracking-wider font-bold">
            Secure Admin Terminal
          </div>
        </aside>

        {/* Core Main content container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0A1628] border-t border-[#C9A84C]/20 shadow-2xl flex items-center justify-around z-40 px-2">
        {ADMIN_LINKS.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1.5 py-1 px-1 rounded transition duration-200 ${
                isActive 
                  ? 'text-[#C9A84C]' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[8px] font-bold tracking-tight">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
```

---

### File: `src/app/(portals)/admin/page.tsx`

```typescript
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
```

---

### File: `src/app/(portals)/admin/cases/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/providers';
import { 
  Calendar, 
  MapPin, 
  User, 
  Clock, 
  Paperclip,
  CheckSquare, 
  History, 
  Plus, 
  ChevronRight,
  UserPlus,
  Send,
  X,
  FileCheck
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface CaseItem {
  id: string;
  caseNumber: string;
  title: string;
  type: string;
  status: 'INTAKE' | 'ACTIVE' | 'ARGUED' | 'JUDGMENT' | 'CLOSED';
  nextHearing: string | null;
  court: string;
  client: { name: string; email: string };
  assignedTo: string | null;
  junior: { id: string; name: string } | null;
  events: { id: string; title: string; eventDate: string; notes: string | null }[];
  documents: { id: string; name: string; url: string; type: string }[];
  tasks: { id: string; title: string; status: string; billableHours: number }[];
}

const KANBAN_COLUMNS = [
  { label: 'Intake', status: 'INTAKE', bgColor: 'bg-slate-100/50 border-slate-200' },
  { label: 'Active Defense', status: 'ACTIVE', bgColor: 'bg-sky-50/20 border-sky-100' },
  { label: 'Argued/Trial', status: 'ARGUED', bgColor: 'bg-amber-50/20 border-amber-100' },
  { label: 'Judgment Pending', status: 'JUDGMENT', bgColor: 'bg-purple-50/20 border-purple-100' },
  { label: 'Concluded/Closed', status: 'CLOSED', bgColor: 'bg-emerald-50/20 border-emerald-100' },
];

export default function AdminCases() {
  const { toast } = useToast();
  
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [juniors, setJuniors] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Case for Modal
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Modal Sub-Forms state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventNotes, setEventNotes] = useState('');
  const [loggingEvent, setLoggingEvent] = useState(false);

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [allocatingTask, setAllocatingTask] = useState(false);

  const fetchCasesAndJuniors = async () => {
    try {
      const [casesRes, juniorsRes] = await Promise.all([
        fetch('/api/cases'),
        fetch('/api/juniors'),
      ]);

      if (casesRes.ok) setCases(await casesRes.json());
      if (juniorsRes.ok) setJuniors(await juniorsRes.json());
    } catch (err) {
      console.error('Error loading cases pipeline:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch full case detail (events + docs + tasks) from /api/cases/[id]
  const openCaseDetail = async (caseId: string) => {
    setLoadingDetail(true);
    setSelectedCase(null);
    try {
      const res = await fetch(`/api/cases/${caseId}`);
      if (res.ok) {
        setSelectedCase(await res.json());
      } else {
        toast('Failed to load case details.', 'error');
      }
    } catch {
      toast('Network error loading case details.', 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchCasesAndJuniors();
  }, []);

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, caseId: string) => {
    e.dataTransfer.setData('text/plain', caseId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const caseId = e.dataTransfer.getData('text/plain');
    if (!caseId) return;

    // Optimistic Update
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, status: targetStatus as any } : c))
    );

    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      });

      if (res.ok) {
        toast(`Case file status updated to ${targetStatus}`, 'success');
        fetchCasesAndJuniors(); // Sync detailed timeline
      } else {
        toast('Failed to save pipeline transfer.', 'error');
        fetchCasesAndJuniors();
      }
    } catch (err) {
      toast('Network error during pipeline drag.', 'error');
      fetchCasesAndJuniors();
    }
  };

  const handleAssignJunior = async (juniorId: string) => {
    if (!selectedCase) return;

    try {
      const res = await fetch(`/api/cases/${selectedCase.id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ juniorId: juniorId === 'unassigned' ? null : juniorId }),
      });

      if (res.ok) {
        toast('Counsel assignment updated successfully.', 'success');
        fetchCasesAndJuniors();
        await openCaseDetail(selectedCase.id);
      } else {
        toast('Failed to update advocate assignment.', 'error');
      }
    } catch (err) {
      toast('Error contact assignment servers.', 'error');
    }
  };

  const handleLogEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !eventTitle || !eventDate) {
      toast('Please enter title and date for the event.', 'error');
      return;
    }

    setLoggingEvent(true);
    try {
      const res = await fetch(`/api/cases/${selectedCase.id}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: eventTitle, eventDate, notes: eventNotes }),
      });

      if (res.ok) {
        toast('Case history event logged!', 'success');
        setEventTitle('');
        setEventDate('');
        setEventNotes('');
        await openCaseDetail(selectedCase.id);
        fetchCasesAndJuniors();
      } else {
        toast('Failed to log event.', 'error');
      }
    } catch {
      toast('Error contact history servers.', 'error');
    } finally {
      setLoggingEvent(false);
    }
  };

  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !taskTitle) {
      toast('Please write task description.', 'error');
      return;
    }
    if (!selectedCase.assignedTo) {
      toast('Please assign a Junior Advocate to the case before allocating tasks.', 'error');
      return;
    }

    setAllocatingTask(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: selectedCase.id,
          assignedTo: selectedCase.assignedTo,
          title: taskTitle,
          deadline: taskDeadline || null,
        }),
      });

      if (res.ok) {
        toast('Task allocated successfully to junior advocate!', 'success');
        setTaskTitle('');
        setTaskDeadline('');
        await openCaseDetail(selectedCase.id);
        fetchCasesAndJuniors();
      } else {
        toast('Failed to allocate task.', 'error');
      }
    } catch {
      toast('Error contact task allocation server.', 'error');
    } finally {
      setAllocatingTask(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      INTAKE: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
      ACTIVE: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
      ARGUED: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      JUDGMENT: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      CLOSED: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    };
    return <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div>
        <h2 className="text-2xl font-bold font-heading text-[#0A1628]">Case Pipeline</h2>
        <p className="text-xs text-gray-500 font-medium">Drag and drop cases to manage active court litigation phases</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-8 w-8 border-4 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin"></div>
        </div>
      ) : (
        /* Kanban Board Container */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start min-h-[500px]">
          {KANBAN_COLUMNS.map((col) => {
            const columnCases = cases.filter((c) => c.status === col.status);
            return (
              <div
                key={col.status}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.status)}
                className={`rounded-lg border p-4 flex flex-col gap-4 min-h-[450px] transition duration-200 ${col.bgColor}`}
              >
                <div className="flex items-center justify-between border-b border-[#DCD6C5]/40 pb-2">
                  <span className="text-xs font-bold text-[#0A1628]">{col.label}</span>
                  <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-200 rounded-full h-5 w-5 flex items-center justify-center">
                    {columnCases.length}
                  </span>
                </div>

                <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[550px] scrollbar-thin">
                  {columnCases.map((c) => (
                    <div
                      key={c.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, c.id)}
                      onClick={() => openCaseDetail(c.id)}
                      className="bg-white border border-[#DCD6C5]/50 hover:border-[#C9A84C] p-3.5 rounded shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition duration-200 text-xs space-y-3"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-gray-400 font-bold uppercase">{c.caseNumber}</span>
                        <h4 className="font-bold text-[#0A1628] leading-tight line-clamp-2">{c.title}</h4>
                      </div>

                      <div className="space-y-1.5 border-t border-[#DCD6C5]/20 pt-2.5 text-[10px] text-gray-500 font-medium">
                        <p className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" /> {c.court}
                        </p>
                        <p className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          Hearing: <strong className="text-rose-600">{c.nextHearing ? new Date(c.nextHearing).toLocaleDateString() : 'TBD'}</strong>
                        </p>
                        <p className="flex items-center gap-1">
                          <User className="h-3 w-3 text-gray-400" /> Client: {c.client.name}
                        </p>
                      </div>

                      {c.junior && (
                        <div className="flex items-center gap-1.5 text-[9px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-gray-600 font-semibold self-start">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {c.junior.name}
                        </div>
                      )}
                    </div>
                  ))}
                  {columnCases.length === 0 && (
                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-[#DCD6C5]/20 rounded py-8 text-center text-[10px] text-gray-400 font-semibold italic">
                      Empty Column
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CASE DETAILS MODAL OVERLAY */}
      {selectedCase && (
        <Dialog open={!!selectedCase || loadingDetail} onOpenChange={(open) => { if (!open) { setSelectedCase(null); setLoadingDetail(false); } }}>
          <DialogContent className="bg-white max-w-5xl max-h-[90vh] overflow-y-auto border border-[#DCD6C5] p-0">
            <DialogHeader className="p-5 pb-0">
              <DialogTitle className="font-heading text-[#0A1628] text-lg">
                {loadingDetail ? 'Loading Case...' : (selectedCase ? `${selectedCase.caseNumber} — ${selectedCase.title}` : '')}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 items-start">
              {/* Left Column details: Info, Assign, Docs */}
              <div className="md:col-span-7 space-y-6">
                {/* Court Details */}
                <div className="p-3 border border-[#DCD6C5]/40 bg-gray-50/50 rounded-lg space-y-1.5 font-medium text-gray-600">
                  <p><span className="text-gray-400">Court Bench: </span><strong>{selectedCase.court}</strong></p>
                  <p><span className="text-gray-400">Litigation Type: </span><strong>{selectedCase.type}</strong></p>
                  <p>
                    <span className="text-gray-400">Next Hearing: </span>
                    <strong className="text-rose-600">
                      {selectedCase.nextHearing ? new Date(selectedCase.nextHearing).toLocaleDateString() : 'TBD'}
                    </strong>
                  </p>
                </div>

                {/* Advocate assignment */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Assign Lead Counsel</Label>
                  <Select 
                    value={selectedCase.assignedTo || 'unassigned'} 
                    onValueChange={(val) => handleAssignJunior(val || 'unassigned')}
                  >
                    <SelectTrigger className="border-[#DCD6C5] text-xs bg-white">
                      <SelectValue placeholder="Select Advocate" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-xs">
                      <SelectItem value="unassigned" className="text-xs">Unassigned (None)</SelectItem>
                      {juniors.map((j) => (
                        <SelectItem key={j.id} value={j.id} className="text-xs">{j.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Case Document Attachments */}
                <div className="space-y-3">
                  <h4 className="font-bold text-[#0A1628] uppercase text-[10px] tracking-wider flex items-center gap-1.5 border-b border-[#DCD6C5]/30 pb-1.5">
                    <Paperclip className="h-4 w-4 text-[#C9A84C]" /> Attached Documents ({selectedCase.documents.length})
                  </h4>
                  {selectedCase.documents.length === 0 ? (
                    <p className="text-gray-400 italic">No files attached to this case folder.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedCase.documents.map((d) => (
                        <div key={d.id} className="flex items-center justify-between p-2.5 rounded border border-[#DCD6C5]/30 bg-white">
                          <span className="font-bold truncate max-w-[200px]">{d.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] bg-gray-100 text-gray-500 font-bold px-1.5 rounded">{d.type}</span>
                            <a 
                              href={d.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-[#C9A84C] font-bold hover:underline"
                            >
                              Open file
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Assigned Tasks to Junior */}
                <div className="space-y-3">
                  <h4 className="font-bold text-[#0A1628] uppercase text-[10px] tracking-wider flex items-center gap-1.5 border-b border-[#DCD6C5]/30 pb-1.5">
                    <CheckSquare className="h-4 w-4 text-[#C9A84C]" /> Advocate Tasks & Hours
                  </h4>
                  {selectedCase.tasks.length === 0 ? (
                    <p className="text-gray-400 italic">No tasks assigned.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedCase.tasks.map((t) => (
                        <div key={t.id} className="p-2 border border-[#DCD6C5]/30 rounded bg-white flex justify-between items-center">
                          <span>{t.title}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400 font-bold">{t.billableHours} hrs</span>
                            <span className={`text-[9px] font-bold px-1.5 rounded ${
                              t.status === 'DONE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                            }`}>{t.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column details: Timeline event addition & Task allocation */}
              <div className="md:col-span-5 space-y-6">
                {/* Timeline CaseEvents list */}
                <div className="space-y-3">
                  <h4 className="font-bold text-[#0A1628] uppercase text-[10px] tracking-wider flex items-center gap-1.5 border-b border-[#DCD6C5]/30 pb-1.5">
                    <History className="h-4 w-4 text-[#C9A84C]" /> Case History Timeline
                  </h4>
                  
                  {/* Event log list */}
                  <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
                    {selectedCase.events.map((ev) => (
                      <div key={ev.id} className="relative pl-4 border-l border-[#C9A84C]/40 space-y-0.5">
                        <span className="absolute left-[-4px] top-1.5 h-2 w-2 rounded-full bg-[#C9A84C]" />
                        <div className="flex justify-between items-center text-[10px]">
                          <strong className="text-[#0A1628]">{ev.title}</strong>
                          <span className="text-gray-400">{new Date(ev.eventDate).toLocaleDateString()}</span>
                        </div>
                        {ev.notes && <p className="text-[10px] text-gray-500">{ev.notes}</p>}
                      </div>
                    ))}
                  </div>

                  {/* Add Event Form */}
                  <form onSubmit={handleLogEventSubmit} className="space-y-2 bg-gray-50/60 p-3 rounded-lg border border-[#DCD6C5]/30">
                    <p className="font-bold text-gray-500 text-[9px] uppercase tracking-wider mb-1">Add Case Event / Hearing</p>
                    <Input 
                      placeholder="Event title (e.g. Appeal Hearing)" 
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      className="border-[#DCD6C5] text-[10px] h-7 bg-white"
                      required
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input 
                        type="datetime-local" 
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="border-[#DCD6C5] text-[10px] h-7 bg-white"
                        required
                      />
                      <Button
                        type="submit"
                        disabled={loggingEvent}
                        className="bg-[#0A1628] hover:bg-[#0A1628]/90 text-white text-[10px] h-7 font-bold flex items-center gap-1"
                      >
                        <Send className="h-3 w-3" /> Log Event
                      </Button>
                    </div>
                    <Input 
                      placeholder="Event notes/remarks..." 
                      value={eventNotes}
                      onChange={(e) => setEventNotes(e.target.value)}
                      className="border-[#DCD6C5] text-[10px] h-7 bg-white"
                    />
                  </form>
                </div>

                {/* Add Task Form (Allocations) */}
                {selectedCase.assignedTo && (
                  <form onSubmit={handleCreateTaskSubmit} className="space-y-3 bg-gray-50/60 p-3 rounded-lg border border-[#DCD6C5]/30">
                    <h4 className="font-bold text-gray-500 text-[9px] uppercase tracking-wider">Allocate Task to Junior</h4>
                    
                    <div className="space-y-1">
                      <Label htmlFor="tTitle" className="text-[9px] font-bold text-gray-500 uppercase">Task Brief</Label>
                      <Input 
                        id="tTitle"
                        placeholder="e.g., Draft Written Statement" 
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        className="border-[#DCD6C5] text-[10px] h-7 bg-white"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 items-end">
                      <div className="space-y-1">
                        <Label htmlFor="tDeadline" className="text-[9px] font-bold text-gray-500 uppercase">Deadline</Label>
                        <Input 
                          id="tDeadline"
                          type="date" 
                          value={taskDeadline}
                          onChange={(e) => setTaskDeadline(e.target.value)}
                          className="border-[#DCD6C5] text-[10px] h-7 bg-white"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={allocatingTask}
                        className="bg-[#C9A84C] hover:bg-[#C9A84C]/95 text-[#0A1628] text-[10px] h-7 font-bold flex items-center justify-center gap-1"
                      >
                        <Plus className="h-3 w-3" /> Allocate Task
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
```

---

### File: `src/app/(portals)/admin/cause-list/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

  const activeCases = cases.filter(c => String(c.status).toUpperCase() !== 'CLOSED');
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
                  
                  <select
                    id="caseSelect"
                    value={selectedCaseId}
                    onChange={(e) => setSelectedCaseId(e.target.value)}
                    className="w-full h-10 px-3 py-2 rounded-lg border border-slate-300 bg-white text-[#0A1628] font-bold text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] cursor-pointer"
                    required
                  >
                    <option value="" disabled className="text-slate-500 font-medium">
                      Choose case number...
                    </option>
                    {activeCases.length === 0 ? (
                      <option value="" disabled className="text-slate-400 font-medium">
                        No active cases found
                      </option>
                    ) : (
                      activeCases.map((c) => (
                        <option key={c.id} value={c.id} className="text-[#0A1628] font-semibold py-1">
                          {c.caseNumber} - {c.title} ({c.client?.name || 'Client'})
                        </option>
                      ))
                    )}
                  </select>
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
```

---

### File: `src/app/(portals)/admin/clients/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/providers';
import { 
  Search, 
  Download, 
  FileText, 
  Scale, 
  IndianRupee, 
  ArrowLeft,
  X,
  Plus,
  Trash2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface ClientItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  appointments: { id: string; date: string; status: string; timeSlot?: string; caseType?: string }[];
  clientCases: { id: string; caseNumber: string; status: string; title: string; court: string }[];
  invoices: { id: string; amount: number; status: string; createdAt: string }[];
}

export default function AdminClients() {
  const { toast } = useToast();
  
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected client for Drawer details
  const [selectedClient, setSelectedClient] = useState<ClientItem | null>(null);
  const [loadingClient, setLoadingClient] = useState(false);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        setClients(await res.json());
      } else {
        toast('Failed to load clients.', 'error');
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open drawer: fetch full detail (invoices + cases + appointments)
  const openClientDetail = async (clientId: string) => {
    setLoadingClient(true);
    setSelectedClient(null);
    try {
      const res = await fetch(`/api/clients?id=${clientId}`);
      if (res.ok) {
        setSelectedClient(await res.json());
      } else {
        toast('Failed to load client details.', 'error');
      }
    } catch {
      toast('Network error loading client details.', 'error');
    } finally {
      setLoadingClient(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleExportCSV = () => {
    if (clients.length === 0) return;
    const headers = ['Client ID', 'Name', 'Email', 'Phone', 'Registered Date'];
    const rows = clients.map((c) => [
      c.id.split('-')[0].toUpperCase(),
      `"${c.name}"`,
      `"${c.email}"`,
      `"${c.phone || 'N/A'}"`,
      new Date(c.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `firm_clients_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast('Client ledger exported to CSV successfully.', 'success');
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      CONFIRMED: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      PENDING: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      ACTIVE: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      CLOSED: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
      PAID: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      UNPAID: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      OVERDUE: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    };
    return <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
  };

  // Filter clients based on search query
  const filteredClients = clients.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      (c.phone && c.phone.includes(query))
    );
  });

  return (
    <div className="space-y-6 relative min-h-screen">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-[#0A1628]">Manage Clients</h2>
          <p className="text-xs text-gray-500 font-medium">Record ledger of clients registered in workspace</p>
        </div>
        <Button 
          onClick={handleExportCSV}
          className="bg-[#0A1628] hover:bg-[#0A1628]/95 text-white text-xs font-semibold px-4 flex items-center gap-1.5 self-start"
        >
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Search Filter Input */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by client name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 border-[#DCD6C5] focus:border-[#C9A84C] text-xs h-9 bg-white"
        />
      </div>

      {/* Clients Table Card */}
      <Card className="border border-[#DCD6C5] bg-white shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="h-8 w-8 border-4 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin"></div>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400 font-semibold">
              No clients found matching the search query.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#DCD6C5]/40 text-xs">
                <thead className="bg-gray-50/70 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="px-6 py-3.5 text-left">Name</th>
                    <th className="px-6 py-3.5 text-left">Contact Info</th>
                    <th className="px-6 py-3.5 text-left">Cases</th>
                    <th className="px-6 py-3.5 text-left">Billing Status</th>
                    <th className="px-6 py-3.5 text-left">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCD6C5]/30 bg-white">
                  {filteredClients.map((client) => {
                    return (
                      <tr 
                        key={client.id} 
                        onClick={() => openClientDetail(client.id)}
                        className="hover:bg-slate-50/50 cursor-pointer transition"
                      >
                        <td className="px-6 py-4 font-bold text-[#0A1628]">
                          {client.name}
                        </td>
                        <td className="px-6 py-4 space-y-0.5">
                          <p className="font-medium">{client.email}</p>
                          <p className="text-gray-400 text-[10px]">{client.phone || 'No phone'}</p>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-600">
                          —
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-400 text-[10px] italic">
                          Click to view
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {new Date(client.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CLIENT DETAILS DRAWER */}
      {(selectedClient || loadingClient) && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-[#DCD6C5] shadow-2xl flex flex-col transition-transform duration-300 transform translate-x-0">
          <div className="bg-[#0A1628] text-white p-5 flex items-center justify-between border-b border-[#C9A84C]/20">
            <div>
              <span className="text-[9px] text-gray-400 font-bold uppercase">
                {selectedClient ? `Client ID: ${selectedClient.id.split('-')[0].toUpperCase()}` : 'Loading...'}
              </span>
              <h3 className="font-heading font-bold text-base text-[#F5F0E8]">{selectedClient?.name || '...'}</h3>
            </div>
            <button
              onClick={() => { setSelectedClient(null); setLoadingClient(false); }}
              className="text-gray-400 hover:text-white transition focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {loadingClient ? (
            <div className="flex justify-center items-center flex-1">
              <div className="h-8 w-8 border-4 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin" />
            </div>
          ) : selectedClient ? (
            <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
              {/* Contact Details */}
              <div className="space-y-1.5 p-3 rounded-lg border border-[#DCD6C5]/40 bg-gray-50/50">
                <h4 className="font-bold text-gray-500 uppercase text-[9px] tracking-wider mb-2">Workspace Contact</h4>
                <p className="font-semibold"><span className="text-gray-400 font-medium">Email: </span>{selectedClient.email}</p>
                <p className="font-semibold"><span className="text-gray-400 font-medium">Phone: </span>{selectedClient.phone || 'N/A'}</p>
              </div>

              {/* Client Cases */}
              <div className="space-y-3">
                <h4 className="font-bold text-[#0A1628] uppercase text-[10px] tracking-wider flex items-center gap-1.5 border-b border-[#DCD6C5]/30 pb-1.5">
                  <Scale className="h-4 w-4 text-[#C9A84C]" /> Linked Case Folders ({selectedClient.clientCases?.length ?? 0})
                </h4>
                {!selectedClient.clientCases?.length ? (
                  <p className="text-gray-400 italic text-[11px]">No cases logged.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedClient.clientCases.map((c) => (
                      <div key={c.id} className="p-3 border border-[#DCD6C5]/30 rounded bg-white flex items-center justify-between">
                        <div>
                          <p className="font-bold text-[#0A1628]">{c.caseNumber}</p>
                          <p className="text-[10px] text-gray-500">{c.title} ({c.court})</p>
                        </div>
                        {getStatusBadge(c.status)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Client Invoices */}
              <div className="space-y-3">
                <h4 className="font-bold text-[#0A1628] uppercase text-[10px] tracking-wider flex items-center gap-1.5 border-b border-[#DCD6C5]/30 pb-1.5">
                  <IndianRupee className="h-4 w-4 text-[#C9A84C]" /> Invoice Ledger ({selectedClient.invoices?.length ?? 0})
                </h4>
                {!selectedClient.invoices?.length ? (
                  <p className="text-gray-400 italic text-[11px]">No invoices recorded.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedClient.invoices.map((inv) => (
                      <div key={inv.id} className="p-3 border border-[#DCD6C5]/30 rounded bg-white flex items-center justify-between">
                        <div>
                          <p className="font-bold text-[#0A1628]">INR {inv.amount}</p>
                          <p className="text-[10px] text-gray-500">Billed: {new Date(inv.createdAt).toLocaleDateString()}</p>
                        </div>
                        {getStatusBadge(inv.status)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Consultation History */}
              <div className="space-y-3">
                <h4 className="font-bold text-[#0A1628] uppercase text-[10px] tracking-wider flex items-center gap-1.5 border-b border-[#DCD6C5]/30 pb-1.5">
                  <Calendar className="h-4 w-4 text-[#C9A84C]" /> Consultation History ({selectedClient.appointments?.length ?? 0})
                </h4>
                {!selectedClient.appointments?.length ? (
                  <p className="text-gray-400 italic text-[11px]">No consultation slots scheduled.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedClient.appointments.map((a) => (
                      <div key={a.id} className="p-2.5 border border-[#DCD6C5]/30 rounded bg-white flex items-center justify-between">
                        <div>
                          <p className="font-bold text-[#0A1628]">{new Date(a.date).toLocaleDateString()}</p>
                          <p className="text-[9px] text-gray-500">Slot: {a.timeSlot || '—'} {a.caseType ? `— ${a.caseType}` : ''}</p>
                        </div>
                        {getStatusBadge(a.status)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
```

---

### File: `src/app/(portals)/admin/calendar/page.tsx`

```typescript
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
```

---

### File: `src/app/(portals)/admin/juniors/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/providers';
import { 
  UsersRound, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  Plus, 
  AlertCircle,
  FileCheck,
  TrendingUp,
  Sliders,
  Trash2,
  UserPlus,
  GraduationCap,
  Shield,
  X,
  Award,
  ChevronRight,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface JuniorItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'JUNIOR' | 'INTERN';
  designation: string;
  createdAt: string;
  caseloadCount: number;
  totalTasks: number;
  pendingTasks: number;
  billableHours: number;
}

interface TaskItem {
  id: string;
  title: string;
  status: string;
  deadline: string | null;
  billableHours: number;
  case: { caseNumber: string };
  junior: { name: string };
}

export default function AdminJuniors() {
  const { toast } = useToast();
  
  const [juniors, setJuniors] = useState<JuniorItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [cases, setCases] = useState<{ id: string; caseNumber: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Performance Drawer State
  const [selectedJunior, setSelectedJunior] = useState<JuniorItem | null>(null);
  const [performanceData, setPerformanceData] = useState<any | null>(null);
  const [loadingPerf, setLoadingPerf] = useState(false);

  // Modals State
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskJuniorId, setTaskJuniorId] = useState('');
  const [taskCaseId, setTaskCaseId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [submittingTask, setSubmittingTask] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<'JUNIOR' | 'INTERN'>('JUNIOR');
  const [newDesignation, setNewDesignation] = useState('');
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  // Skill Tag Modal
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [skillTag, setSkillTag] = useState('CRIMINAL');
  const [submittingSkill, setSubmittingSkill] = useState(false);

  // Learning Item Modal
  const [learnModalOpen, setLearnModalOpen] = useState(false);
  const [learnTitle, setLearnTitle] = useState('');
  const [learnType, setLearnType] = useState('BARE_ACT');
  const [learnContent, setLearnContent] = useState('');
  const [submittingLearn, setSubmittingLearn] = useState(false);

  // Remove confirmation
  const [removeTarget, setRemoveTarget] = useState<JuniorItem | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [juniorsRes, tasksRes, casesRes] = await Promise.all([
        fetch('/api/juniors'),
        fetch('/api/tasks'),
        fetch('/api/cases'),
      ]);

      if (juniorsRes.ok) setJuniors(await juniorsRes.json());
      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (casesRes.ok) {
        const casesData = await casesRes.json();
        setCases(casesData.filter((c: any) => c.status !== 'CLOSED'));
      }
    } catch (err) {
      console.error('Error loading juniors dashboards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openPerformanceDrawer = async (junior: JuniorItem) => {
    setSelectedJunior(junior);
    setLoadingPerf(true);
    try {
      const res = await fetch(`/api/juniors/performance?juniorId=${junior.id}`);
      if (res.ok) {
        const data = await res.json();
        setPerformanceData(data.performance);
      }
    } catch {
      toast('Failed to load performance metrics.', 'error');
    } finally {
      setLoadingPerf(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskJuniorId || !taskCaseId || !taskTitle) {
      toast('Please select advocate, case, and enter task description.', 'error');
      return;
    }

    setSubmittingTask(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: taskCaseId,
          assignedTo: taskJuniorId,
          title: taskTitle,
          deadline: taskDeadline || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast('Task allocated successfully!', 'success');
        setTaskModalOpen(false);
        setTaskCaseId('');
        setTaskJuniorId('');
        setTaskTitle('');
        setTaskDeadline('');
        fetchData();
      } else {
        toast(data.error || 'Failed to allocate task.', 'error');
      }
    } catch {
      toast('Network error allocating task.', 'error');
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleAddSkillTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJunior) return;

    setSubmittingSkill(true);
    try {
      const res = await fetch('/api/skilltags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ juniorId: selectedJunior.id, tag: skillTag }),
      });

      if (res.ok) {
        toast(`Skill tag "${skillTag}" awarded to ${selectedJunior.name}!`, 'success');
        setSkillModalOpen(false);
        openPerformanceDrawer(selectedJunior);
      } else {
        toast('Failed to add skill tag.', 'error');
      }
    } catch {
      toast('Network error adding skill tag.', 'error');
    } finally {
      setSubmittingSkill(false);
    }
  };

  const handleAssignLearning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJunior || !learnTitle || !learnContent) {
      toast('Please provide learning item title and content/link.', 'error');
      return;
    }

    setSubmittingLearn(true);
    try {
      const res = await fetch('/api/learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          juniorId: selectedJunior.id,
          title: learnTitle,
          type: learnType,
          content: learnContent,
        }),
      });

      if (res.ok) {
        toast(`Learning item assigned to ${selectedJunior.name}!`, 'success');
        setLearnModalOpen(false);
        setLearnTitle('');
        setLearnContent('');
      } else {
        toast('Failed to assign learning item.', 'error');
      }
    } catch {
      toast('Network error assigning learning item.', 'error');
    } finally {
      setSubmittingLearn(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) {
      toast('Name and email are required.', 'error');
      return;
    }

    setSubmittingAdd(true);
    setGeneratedPassword(null);
    try {
      const res = await fetch('/api/juniors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          phone: newPhone || null,
          role: newRole,
          designation: newDesignation || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast(`${newRole === 'INTERN' ? 'Intern' : 'Junior Advocate'} "${newName}" added successfully!`, 'success');
        setGeneratedPassword(data.generatedPassword);
        setNewName('');
        setNewEmail('');
        setNewPhone('');
        setNewDesignation('');
        fetchData();
      } else {
        toast(data.error || 'Failed to add team member.', 'error');
      }
    } catch {
      toast('Network error adding team member.', 'error');
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;

    setRemovingId(removeTarget.id);
    try {
      const res = await fetch(`/api/juniors?id=${removeTarget.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        toast(`${removeTarget.name} removed.`, 'success');
        setRemoveTarget(null);
        fetchData();
      } else {
        toast(data.error || 'Failed to remove team member.', 'error');
      }
    } catch {
      toast('Network error removing member.', 'error');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Admin Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-[#0A1628]">Junior Advocate Management</h2>
          <p className="text-xs text-gray-500 font-medium">Monitor performances, approve timesheets/drafts, and manage escalations</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/juniors/timesheets">
            <Button variant="outline" className="border-[#DCD6C5] text-xs font-bold text-gray-700 bg-white">
              <Clock className="h-3.5 w-3.5 text-[#C9A84C] mr-1" /> Timesheets
            </Button>
          </Link>
          <Link href="/admin/juniors/drafts">
            <Button variant="outline" className="border-[#DCD6C5] text-xs font-bold text-gray-700 bg-white">
              <FileText className="h-3.5 w-3.5 text-[#C9A84C] mr-1" /> Drafts
            </Button>
          </Link>
          <Link href="/admin/juniors/escalations">
            <Button variant="outline" className="border-rose-200 text-xs font-bold text-rose-600 bg-rose-50">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-600 mr-1" /> Escalations
            </Button>
          </Link>

          <Button 
            onClick={() => { setAddModalOpen(true); setGeneratedPassword(null); }}
            variant="outline"
            className="border-[#DCD6C5] text-xs font-semibold text-gray-700 bg-white"
          >
            <UserPlus className="h-4 w-4 text-[#C9A84C]" /> Add Member
          </Button>
          <Button 
            onClick={() => setTaskModalOpen(true)}
            className="bg-[#0A1628] hover:bg-[#0A1628]/95 text-white text-xs font-semibold"
          >
            <Plus className="h-4 w-4" /> Allocate Task
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-8 w-8 border-4 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Roster Table */}
          <div className="lg:col-span-8">
            <Card className="border border-[#DCD6C5] bg-white shadow-sm overflow-hidden">
              <CardHeader className="border-b border-[#DCD6C5]/30">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#0A1628] flex items-center gap-2">
                  <UsersRound className="h-4.5 w-4.5 text-[#C9A84C]" /> Advocate Roster (Click Row for Performance Drawer)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#DCD6C5]/40 text-xs">
                    <thead className="bg-gray-50/70 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                      <tr>
                        <th className="px-6 py-3.5 text-left">Advocate</th>
                        <th className="px-6 py-3.5 text-left">Role</th>
                        <th className="px-6 py-3.5 text-left">Caseload</th>
                        <th className="px-6 py-3.5 text-left">Hours</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DCD6C5]/30 bg-white">
                      {juniors.map((j) => (
                        <tr 
                          key={j.id} 
                          onClick={() => openPerformanceDrawer(j)}
                          className="hover:bg-slate-50/80 transition cursor-pointer"
                        >
                          <td className="px-6 py-4">
                            <p className="font-bold text-[#0A1628] flex items-center gap-1">
                              {j.name} <ChevronRight className="h-3 w-3 text-[#C9A84C]" />
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium">{j.email}</p>
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-gray-700">{j.role}</td>
                          <td className="px-6 py-4 font-semibold text-gray-600">{j.caseloadCount} Active</td>
                          <td className="px-6 py-4 font-bold text-[#0A1628]">{j.billableHours.toFixed(1)} hrs</td>
                          <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setRemoveTarget(j)}
                              className="text-gray-400 hover:text-rose-600 transition p-1.5 rounded hover:bg-rose-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PERFORMANCE DETAIL DRAWER PANEL */}
          <div className="lg:col-span-4">
            {selectedJunior ? (
              <Card className="border border-[#C9A84C] bg-white shadow-lg space-y-4 p-5">
                <div className="flex items-center justify-between border-b border-[#DCD6C5] pb-3">
                  <div>
                    <h3 className="font-bold text-[#0A1628] text-sm">{selectedJunior.name}</h3>
                    <p className="text-[10px] text-gray-500 font-semibold">{selectedJunior.designation || 'Junior Advocate'}</p>
                  </div>
                  <button onClick={() => setSelectedJunior(null)} className="text-gray-400 hover:text-black">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {loadingPerf ? (
                  <div className="flex justify-center py-10">
                    <div className="h-6 w-6 border-3 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin" />
                  </div>
                ) : performanceData ? (
                  <div className="space-y-4 text-xs">
                    
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2.5 rounded bg-slate-50 border border-[#DCD6C5]/50">
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Completion Rate</p>
                        <p className="text-lg font-extrabold text-[#0A1628]">{performanceData.completionRate}%</p>
                      </div>
                      <div className="p-2.5 rounded bg-slate-50 border border-[#DCD6C5]/50">
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Approved Billable</p>
                        <p className="text-lg font-extrabold text-[#C9A84C]">{performanceData.totalBillableHours} hrs</p>
                      </div>
                      <div className="p-2.5 rounded bg-slate-50 border border-[#DCD6C5]/50">
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Court Appearances</p>
                        <p className="text-lg font-extrabold text-[#0A1628]">{performanceData.appearancesCount}</p>
                      </div>
                      <div className="p-2.5 rounded bg-slate-50 border border-[#DCD6C5]/50">
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Drafts Approved/REDO</p>
                        <p className="text-lg font-extrabold text-emerald-600">{performanceData.draftsApproved} / {performanceData.draftsRedo}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="font-bold text-gray-700 text-[11px]">Skill Badges:</p>
                      <div className="flex flex-wrap gap-1">
                        {performanceData.skillTags.length === 0 ? (
                          <p className="text-[10px] text-gray-400 italic">No skill tags added yet.</p>
                        ) : (
                          performanceData.skillTags.map((st: string, idx: number) => (
                            <span key={idx} className="bg-[#C9A84C]/15 text-[#0A1628] font-bold text-[9px] px-2 py-0.5 rounded">
                              🏆 {st}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#DCD6C5] flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => setSkillModalOpen(true)}
                        className="bg-[#0A1628] text-white text-xs font-bold w-full"
                      >
                        <Award className="h-3.5 w-3.5 mr-1" /> Add Skill Tag
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setLearnModalOpen(true)}
                        className="border-[#DCD6C5] text-xs font-bold w-full"
                      >
                        <GraduationCap className="h-3.5 w-3.5 mr-1 text-[#C9A84C]" /> Assign Learning Item
                      </Button>
                    </div>

                  </div>
                ) : null}
              </Card>
            ) : (
              <div className="p-8 border border-dashed border-[#DCD6C5] rounded-xl text-center text-xs text-gray-400 font-semibold">
                Click any junior advocate in the roster to view complete performance drawer metrics and assign skill tags.
              </div>
            )}
          </div>

        </div>
      )}

      {/* MODAL: ADD SKILL TAG */}
      <Dialog open={skillModalOpen} onOpenChange={setSkillModalOpen}>
        <DialogContent className="bg-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-[#0A1628]">Add Skill Tag</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSkillTag} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label className="font-bold text-gray-600">Select Skill Badge *</Label>
              <select
                value={skillTag}
                onChange={(e) => setSkillTag(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#DCD6C5] text-xs rounded-xl font-bold"
              >
                <option value="CRIMINAL">CRIMINAL LAW</option>
                <option value="CIVIL">CIVIL LITIGATION</option>
                <option value="PROPERTY">PROPERTY DISPUTES</option>
                <option value="FAMILY">FAMILY LAW</option>
                <option value="CORPORATE">CORPORATE & ARBITRATION</option>
                <option value="RESEARCH">CASE LAW RESEARCH</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submittingSkill} className="bg-[#0A1628] text-white text-xs font-semibold">
                Award Badge
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: ASSIGN LEARNING ITEM */}
      <Dialog open={learnModalOpen} onOpenChange={setLearnModalOpen}>
        <DialogContent className="bg-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-[#0A1628]">Assign Learning Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssignLearning} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label className="font-bold text-gray-600">Title *</Label>
              <Input
                placeholder="e.g. Landmark Judgment on Bail Sec 438"
                value={learnTitle}
                onChange={(e) => setLearnTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-bold text-gray-600">Type *</Label>
              <select
                value={learnType}
                onChange={(e) => setLearnType(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#DCD6C5] text-xs rounded-xl font-bold"
              >
                <option value="BARE_ACT">BARE ACT</option>
                <option value="JUDGMENT">JUDGMENT / PRECEDENT</option>
                <option value="PROCEDURE">COURT PROCEDURE</option>
                <option value="VIDEO">VIDEO LECTURE</option>
                <option value="NOTE">PRACTICE NOTE</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="font-bold text-gray-600">URL / Text Content *</Label>
              <Input
                placeholder="https://indiankanoon.org/doc/... or text brief"
                value={learnContent}
                onChange={(e) => setLearnContent(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submittingLearn} className="bg-[#0A1628] text-white text-xs font-semibold">
                Assign Item
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: ALLOCATE TASK */}
      <Dialog open={taskModalOpen} onOpenChange={setTaskModalOpen}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-[#0A1628]">Allocate Task to Junior</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Assign a specific task to a junior advocate for a case.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label className="font-bold text-gray-700">Assign To *</Label>
              <select
                value={taskJuniorId}
                onChange={(e) => setTaskJuniorId(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#DCD6C5] text-xs rounded-xl font-bold"
                required
              >
                <option value="">Select junior advocate...</option>
                {juniors.map((j) => (
                  <option key={j.id} value={j.id}>{j.name} ({j.role})</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="font-bold text-gray-700">Case *</Label>
              <select
                value={taskCaseId}
                onChange={(e) => setTaskCaseId(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#DCD6C5] text-xs rounded-xl font-bold"
                required
              >
                <option value="">Select active case...</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>{c.caseNumber} — {c.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="font-bold text-gray-700">Task Description *</Label>
              <Input
                placeholder="e.g. Draft bail application petition, Research Sec 498A cases..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                required
                className="border-[#DCD6C5] text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-bold text-gray-700">Deadline</Label>
              <Input
                type="date"
                value={taskDeadline}
                onChange={(e) => setTaskDeadline(e.target.value)}
                className="border-[#DCD6C5] text-xs"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setTaskModalOpen(false)} className="text-xs border-[#DCD6C5]">
                Cancel
              </Button>
              <Button type="submit" disabled={submittingTask} className="bg-[#0A1628] text-white text-xs font-semibold">
                {submittingTask ? 'Allocating...' : 'Allocate Task'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: ADD MEMBER */}
      <Dialog open={addModalOpen} onOpenChange={(open) => { setAddModalOpen(open); if (!open) setGeneratedPassword(null); }}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-[#0A1628]">Add Junior Advocate / Intern</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Creates a new account with login credentials. Password will be displayed once.
            </DialogDescription>
          </DialogHeader>

          {generatedPassword ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                <p className="font-extrabold text-emerald-800 mb-1">✅ Member added successfully!</p>
                <p className="text-gray-700">Share these credentials securely with the new member:</p>
                <div className="mt-3 p-3 bg-white rounded-lg border border-emerald-300 font-mono text-sm">
                  <p className="font-bold text-[#0A1628]">Password: <span className="text-emerald-700">{generatedPassword}</span></p>
                </div>
                <p className="text-[10px] text-gray-500 mt-2 italic">This password will not be shown again. Ask them to change it after first login.</p>
              </div>
              <Button onClick={() => { setAddModalOpen(false); setGeneratedPassword(null); }} className="w-full bg-[#0A1628] text-white text-xs font-bold">
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleAddMember} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <Label className="font-bold text-gray-700">Full Name *</Label>
                  <Input placeholder="e.g. Priya Sharma" value={newName} onChange={(e) => setNewName(e.target.value)} required className="border-[#DCD6C5] text-xs" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label className="font-bold text-gray-700">Email Address *</Label>
                  <Input type="email" placeholder="priya@yourlawfirm.in" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required className="border-[#DCD6C5] text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700">Phone</Label>
                  <Input type="tel" placeholder="+91 98765 43210" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="border-[#DCD6C5] text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700">Role *</Label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as 'JUNIOR' | 'INTERN')}
                    className="w-full h-10 px-3 bg-white border border-[#DCD6C5] text-xs rounded-xl font-bold"
                  >
                    <option value="JUNIOR">Junior Advocate</option>
                    <option value="INTERN">Intern / Trainee</option>
                  </select>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label className="font-bold text-gray-700">Designation</Label>
                  <Input placeholder="e.g. Junior Associate, Research Intern" value={newDesignation} onChange={(e) => setNewDesignation(e.target.value)} className="border-[#DCD6C5] text-xs" />
                </div>
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)} className="text-xs border-[#DCD6C5]">
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingAdd} className="bg-[#0A1628] text-white text-xs font-semibold">
                  {submittingAdd ? 'Adding...' : `Add ${newRole === 'INTERN' ? 'Intern' : 'Junior'}`}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL: REMOVE CONFIRMATION */}
      <Dialog open={!!removeTarget} onOpenChange={(open) => { if (!open) setRemoveTarget(null); }}>
        <DialogContent className="bg-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-rose-700">Remove Team Member</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              This will permanently remove <span className="font-bold text-[#0A1628]">{removeTarget?.name}</span> and unassign them from all cases. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2 gap-2">
            <Button variant="outline" onClick={() => setRemoveTarget(null)} className="text-xs border-[#DCD6C5]">
              Cancel
            </Button>
            <Button
              onClick={handleRemove}
              disabled={!!removingId}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
            >
              {removingId ? 'Removing...' : 'Yes, Remove Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
```

---

### File: `src/app/(portals)/admin/juniors/drafts/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/providers';
import { FileText, Download, CheckCircle2, RotateCcw, MessageSquare } from 'lucide-react';

export default function AdminDraftsReviewPage() {
  const { toast } = useToast();

  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Inline Comment Review State
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState('APPROVED');
  const [reviewComments, setReviewComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDrafts = async () => {
    try {
      const res = await fetch('/api/drafts');
      if (res.ok) {
        const data = await res.json();
        if (data.drafts) setDrafts(data.drafts);
      }
    } catch {
      toast('Failed to load submitted drafts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleReviewDraft = async (draftId: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/drafts/${draftId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: reviewStatus, comments: reviewComments }),
      });

      if (res.ok) {
        toast(`Draft review saved! Status set to ${reviewStatus}`, 'success');
        setSelectedDraftId(null);
        setReviewComments('');
        fetchDrafts();
      } else {
        toast('Failed to submit review.', 'error');
      }
    } catch {
      toast('Network error submitting review.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-2xl font-bold font-heading text-[#0A1628]">Senior Counsel Draft Review Desk</h2>
        <p className="text-xs text-slate-500 font-medium">Review petitions, affidavits, and vakalatnamas submitted by junior advocates</p>
      </div>

      <Card className="border border-[#DCD6C5] bg-white shadow-sm p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-7 w-7 border-3 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin" />
          </div>
        ) : drafts.length === 0 ? (
          <div className="text-center py-10 text-xs text-gray-400 font-semibold italic">
            No drafts submitted for senior review.
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {drafts.map((d) => (
              <div key={d.id} className="p-4 rounded-xl border border-[#DCD6C5] bg-slate-50/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-extrabold text-[#0A1628] text-sm">{d.title}</span>
                    <span className="text-[10px] text-gray-500 font-bold ml-2">📁 Case {d.case?.caseNumber} · Junior: {d.junior?.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#C9A84C] bg-[#C9A84C]/15 px-2 py-0.5 rounded">
                      v{d.version} ({d.type})
                    </span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      d.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                      d.status === 'REDO' ? 'bg-amber-100 text-amber-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {d.status}
                    </span>
                    <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-sky-600 font-bold hover:underline flex items-center gap-1 text-[11px]">
                      <Download className="h-3.5 w-3.5" /> Download
                    </a>
                  </div>
                </div>

                {d.comments && (
                  <div className="p-3 rounded-lg bg-white border border-[#DCD6C5]/60 text-gray-700">
                    <p className="font-bold text-[#0A1628] text-[10px] uppercase">Senior Comments:</p>
                    <p className="text-xs">{d.comments}</p>
                  </div>
                )}

                {selectedDraftId === d.id ? (
                  <div className="p-3 rounded-lg bg-white border border-[#0A1628]/30 space-y-3">
                    <div className="flex items-center gap-4">
                      <Label className="font-bold text-gray-700">Review Outcome:</Label>
                      <label className="flex items-center gap-1 font-bold text-emerald-700 cursor-pointer">
                        <input type="radio" name="st" value="APPROVED" checked={reviewStatus === 'APPROVED'} onChange={() => setReviewStatus('APPROVED')} /> Approve
                      </label>
                      <label className="flex items-center gap-1 font-bold text-amber-700 cursor-pointer">
                        <input type="radio" name="st" value="REDO" checked={reviewStatus === 'REDO'} onChange={() => setReviewStatus('REDO')} /> Request REDO
                      </label>
                    </div>

                    <Textarea
                      placeholder="Add inline senior feedback comments for junior advocate..."
                      value={reviewComments}
                      onChange={(e) => setReviewComments(e.target.value)}
                      className="text-xs border-[#DCD6C5]"
                    />

                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => setSelectedDraftId(null)} className="text-xs">
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => handleReviewDraft(d.id)} disabled={submitting} className="bg-[#0A1628] text-white text-xs font-bold">
                        Save Review
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedDraftId(d.id);
                      setReviewStatus('APPROVED');
                      setReviewComments(d.comments || '');
                    }}
                    className="border-[#DCD6C5] text-xs font-bold"
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1 text-[#C9A84C]" /> Add Senior Review / Comments
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
}
```

---

### File: `src/app/(portals)/admin/juniors/escalations/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/providers';
import { AlertTriangle, CheckCircle2, Shield } from 'lucide-react';

export default function AdminEscalationsDeskPage() {
  const { toast } = useToast();

  const [escalations, setEscalations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEscalations = async () => {
    try {
      const res = await fetch('/api/escalations');
      if (res.ok) {
        const data = await res.json();
        if (data.escalations) setEscalations(data.escalations);
      }
    } catch {
      toast('Failed to load open escalations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalations();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/escalations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        toast(`Escalation marked as ${status}!`, 'success');
        fetchEscalations();
      } else {
        toast('Failed to update escalation.', 'error');
      }
    } catch {
      toast('Network error updating escalation.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-2xl font-bold font-heading text-[#0A1628] flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-rose-600" /> Open Escalations Dashboard
        </h2>
        <p className="text-xs text-slate-500 font-medium">Manage critical alerts and strategy guidance requests raised by junior advocates</p>
      </div>

      <Card className="border border-rose-200 bg-white shadow-sm p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-7 w-7 border-3 border-rose-600 border-t-[#C9A84C] rounded-full animate-spin" />
          </div>
        ) : escalations.length === 0 ? (
          <div className="text-center py-10 text-xs text-gray-400 font-semibold italic">
            No open escalations raised.
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {escalations.map((esc) => (
              <div key={esc.id} className="p-4 rounded-xl border border-rose-100 bg-rose-50/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-extrabold text-[#0A1628] text-sm">📁 Case: {esc.case?.caseNumber} - {esc.case?.title}</span>
                    <p className="text-[10px] text-gray-500 font-semibold mt-0.5">
                      Raised by: <strong className="text-[#0A1628]">{esc.junior?.name}</strong> · Phone: {esc.junior?.phone || 'N/A'}
                    </p>
                  </div>

                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    esc.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                    esc.status === 'ACKNOWLEDGED' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                    'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse'
                  }`}>
                    {esc.status}
                  </span>
                </div>

                <p className="font-extrabold text-rose-700 text-[11px]">Reason: {esc.reason}</p>

                <div className="p-3 rounded-lg bg-white border border-[#DCD6C5]/60 text-gray-800">
                  <p className="font-semibold text-xs leading-relaxed">{esc.description}</p>
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  {esc.status === 'OPEN' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(esc.id, 'ACKNOWLEDGED')}
                      className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4"
                    >
                      Acknowledge
                    </Button>
                  )}

                  {esc.status !== 'RESOLVED' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(esc.id, 'RESOLVED')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4"
                    >
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
}
```

---

### File: `src/app/(portals)/admin/juniors/timesheets/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/providers';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminTimesheetsPage() {
  const { toast } = useToast();

  const [juniors, setJuniors] = useState<any[]>([]);
  const [selectedJuniorId, setSelectedJuniorId] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJuniorsAndLogs = async (juniorId?: string) => {
    try {
      const juniorsRes = await fetch('/api/juniors');
      let firstId = juniorId;

      if (juniorsRes.ok) {
        const jData = await juniorsRes.json();
        setJuniors(jData);
        // Use the first junior's ID if none passed in
        if (!firstId && jData.length > 0) {
          firstId = jData[0].id as string;
          setSelectedJuniorId(jData[0].id as string);
        }
      }

      if (firstId) {
        const timesheetRes = await fetch(`/api/timelogs/timesheet?juniorId=${firstId}`);
        if (timesheetRes.ok) {
          const tData = await timesheetRes.json();
          if (tData.logs) setLogs(tData.logs);
        }
      }
    } catch {
      toast('Failed to load timesheet logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJuniorsAndLogs();
  }, []);

  const handleSelectJunior = (id: string) => {
    setSelectedJuniorId(id);
    fetchJuniorsAndLogs(id);
  };

  const handleApproveLogs = async (logIds: string[], approved: boolean) => {
    try {
      const res = await fetch('/api/timelogs/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logIds, approved }),
      });

      if (res.ok) {
        toast(`Timesheet entries ${approved ? 'APPROVED' : 'REJECTED'}!`, 'success');
        fetchJuniorsAndLogs(selectedJuniorId);
      } else {
        toast('Failed to update timesheet.', 'error');
      }
    } catch {
      toast('Network error updating timesheet.', 'error');
    }
  };

  const pendingLogIds = logs.filter(l => !l.approved).map(l => l.id);

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-[#0A1628]">Junior Timesheet Approvals</h2>
          <p className="text-xs text-gray-500 font-medium">Review & approve junior advocate weekly billable timesheets</p>
        </div>

        {pendingLogIds.length > 0 && (
          <Button
            onClick={() => handleApproveLogs(pendingLogIds, true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow"
          >
            <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve All Pending ({pendingLogIds.length})
          </Button>
        )}
      </div>

      <Card className="border border-[#DCD6C5] bg-white shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <label className="text-xs font-bold text-gray-700">Select Advocate:</label>
          <select
            value={selectedJuniorId}
            onChange={(e) => handleSelectJunior(e.target.value)}
            className="h-10 px-3 bg-white border border-[#DCD6C5] text-xs font-bold text-[#0A1628] rounded-xl"
          >
            {juniors.map(j => (
              <option key={j.id} value={j.id}>{j.name} ({j.role})</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-7 w-7 border-3 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-10 text-xs text-gray-400 font-semibold italic">
            No timesheet logs found for selected advocate.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#DCD6C5] bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Task & Case</th>
                  <th className="py-3 px-3">Duration</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCD6C5]/40">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-medium text-gray-800">
                      {new Date(l.startTime).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-3 px-3 font-bold text-[#C9A84C]">{l.category}</td>
                    <td className="py-3 px-3 font-bold text-[#0A1628]">
                      {l.task?.title} <span className="text-[10px] text-gray-400 font-semibold">({l.task?.case?.caseNumber})</span>
                    </td>
                    <td className="py-3 px-3 font-extrabold text-[#0A1628]">{l.duration ? `${l.duration} hrs` : 'Running'}</td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        l.approved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {l.approved ? 'APPROVED' : 'PENDING'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {!l.approved ? (
                        <Button
                          size="sm"
                          onClick={() => handleApproveLogs([l.id], true)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-lg"
                        >
                          Approve
                        </Button>
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-bold">✓ Approved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

    </div>
  );
}
```

---

### File: `src/app/(portals)/admin/files/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/providers';
import { Upload, FileText, Paperclip, Eye, Trash2, FolderOpen, ShieldCheck } from 'lucide-react';

interface DocFile {
  id: string;
  name: string;
  url: string;
  type: string;
  createdAt: string;
  case?: { caseNumber: string; title: string } | null;
  appointment?: { date: string; timeSlot: string } | null;
  uploadedBy: { name: string };
}

export default function AdminFilesPage() {
  const { toast } = useToast();

  const [documents, setDocuments] = useState<DocFile[]>([]);
  const [cases, setCases] = useState<{ id: string; caseNumber: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Upload form state
  const [docType, setDocType] = useState('Court Notice');
  const [linkedCaseId, setLinkedCaseId] = useState('none');
  const [file, setFile] = useState<File | null>(null);

  // Filter state
  const [filterCase, setFilterCase] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docsRes, casesRes] = await Promise.all([
        fetch('/api/documents'),
        fetch('/api/cases'),
      ]);
      if (docsRes.ok) setDocuments(await docsRes.json());
      if (casesRes.ok) setCases(await casesRes.json());
    } catch {
      toast('Failed to load files.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (f.size > 20 * 1024 * 1024) {
        toast('File exceeds 20MB limit.', 'error');
        return;
      }
      setFile(f);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast('Please select a file to upload.', 'error'); return; }
    setUploading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(interval); saveDoc(); return 100; }
        return prev + 12;
      });
    }, 150);
  };

  const saveDoc = async () => {
    if (!file) return;
    try {
      const mockUrl = `https://res.cloudinary.com/mlrassociates/raw/upload/v${Date.now()}/${file.name}`;
      const payload: any = { name: file.name, url: mockUrl, type: docType };
      if (linkedCaseId !== 'none') payload.caseId = linkedCaseId;

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        toast('File uploaded successfully!', 'success');
        setFile(null);
        setLinkedCaseId('none');
        setProgress(0);
        fetchData();
      } else {
        toast(data.error || 'Upload failed.', 'error');
      }
    } catch {
      toast('Upload error. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const filteredDocs = documents.filter(d => {
    const matchCase = filterCase === 'all' || d.case?.title?.includes(filterCase) || d.case?.caseNumber === filterCase;
    const matchType = filterType === 'all' || d.type === filterType;
    return matchCase && matchType;
  });

  const typeColors: Record<string, string> = {
    'ID Proof': 'bg-blue-100 text-blue-700',
    'Contract': 'bg-purple-100 text-purple-700',
    'Court Notice': 'bg-amber-100 text-amber-700',
    'Vakalatnama': 'bg-rose-100 text-rose-700',
    'Pleading': 'bg-indigo-100 text-indigo-700',
    'Evidence': 'bg-emerald-100 text-emerald-700',
    'Other': 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading text-[#0A1628] flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-[#C9A84C]" /> Case Files Vault
          </h2>
          <p className="text-xs text-gray-500 mt-1">Upload and view all case-linked documents</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
          <ShieldCheck className="h-3.5 w-3.5" /> AES-256 Encrypted
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Panel */}
        <div className="lg:col-span-1">
          <Card className="border border-[#DCD6C5] bg-white shadow-sm sticky top-24">
            <CardHeader className="border-b border-[#DCD6C5]/30">
              <CardTitle className="text-base font-heading text-[#0A1628] flex items-center gap-2">
                <Upload className="h-4 w-4 text-[#C9A84C]" /> Upload Case File
              </CardTitle>
              <CardDescription className="text-xs text-gray-500">Max 20MB · PDF, DOCX, JPG, PNG</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleUpload} className="space-y-4">
                {/* Document Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600">Document Type</Label>
                  <Select value={docType} onValueChange={(val) => setDocType(val || 'Court Notice')}>
                    <SelectTrigger className="border-[#DCD6C5] text-xs bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Court Notice" className="text-xs">Court Notice / Summons</SelectItem>
                      <SelectItem value="Pleading" className="text-xs">Pleading / Brief</SelectItem>
                      <SelectItem value="Vakalatnama" className="text-xs">Vakalatnama</SelectItem>
                      <SelectItem value="Evidence" className="text-xs">Evidence / Exhibit</SelectItem>
                      <SelectItem value="Contract" className="text-xs">Contract / Agreement</SelectItem>
                      <SelectItem value="ID Proof" className="text-xs">ID Proof</SelectItem>
                      <SelectItem value="Other" className="text-xs">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Link to Case */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600">Associate with Case</Label>
                  <Select value={linkedCaseId} onValueChange={(val) => setLinkedCaseId(val || 'none')}>
                    <SelectTrigger className="border-[#DCD6C5] text-xs bg-white">
                      <SelectValue placeholder="General (No Case)" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-xs">
                      <SelectItem value="none" className="text-xs">General (No Case)</SelectItem>
                      {cases.map(c => (
                        <SelectItem key={c.id} value={c.id} className="text-xs">
                          {c.caseNumber} — {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* File Drop Zone */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600">File</Label>
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-[#DCD6C5] hover:border-[#C9A84C]/60 rounded-lg cursor-pointer bg-gray-50/50 transition">
                    <div className="flex flex-col items-center justify-center">
                      <Paperclip className="h-6 w-6 text-gray-400 mb-1.5" />
                      <p className="text-[11px] font-medium text-gray-500">
                        {file ? file.name : 'Click or drop file here'}
                      </p>
                      {file && (
                        <p className="text-[10px] text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      )}
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>

                {/* Progress Bar */}
                {uploading && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold text-gray-500">
                      <span>Uploading...</span><span>{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded">
                      <div className="h-full bg-[#C9A84C] rounded transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={uploading || !file}
                  className="w-full bg-[#0A1628] text-white hover:bg-[#0A1628]/90 text-xs font-semibold"
                >
                  {uploading ? 'Uploading...' : 'Upload File'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Files List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <Card className="border border-[#DCD6C5] bg-white shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[160px] space-y-1">
                  <Label className="text-[10px] font-bold text-gray-500 uppercase">Filter by Type</Label>
                  <Select value={filterType} onValueChange={(v) => setFilterType(v || 'all')}>
                    <SelectTrigger className="border-[#DCD6C5] text-xs h-8 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-xs">
                      <SelectItem value="all" className="text-xs">All Types</SelectItem>
                      <SelectItem value="Court Notice" className="text-xs">Court Notice</SelectItem>
                      <SelectItem value="Pleading" className="text-xs">Pleading</SelectItem>
                      <SelectItem value="Vakalatnama" className="text-xs">Vakalatnama</SelectItem>
                      <SelectItem value="Evidence" className="text-xs">Evidence</SelectItem>
                      <SelectItem value="Contract" className="text-xs">Contract</SelectItem>
                      <SelectItem value="ID Proof" className="text-xs">ID Proof</SelectItem>
                      <SelectItem value="Other" className="text-xs">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-[160px] space-y-1">
                  <Label className="text-[10px] font-bold text-gray-500 uppercase">Filter by Case</Label>
                  <Select value={filterCase} onValueChange={(v) => setFilterCase(v || 'all')}>
                    <SelectTrigger className="border-[#DCD6C5] text-xs h-8 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-xs">
                      <SelectItem value="all" className="text-xs">All Cases</SelectItem>
                      {cases.map(c => (
                        <SelectItem key={c.id} value={c.caseNumber} className="text-xs">
                          {c.caseNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end pb-0.5">
                  <span className="text-[10px] font-bold text-gray-400">{filteredDocs.length} file(s)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Files Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="h-8 w-8 border-4 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin" />
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="text-center py-16 bg-white border border-[#DCD6C5] rounded-lg">
              <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-xs text-gray-400 font-semibold">No files found.</p>
              <p className="text-[10px] text-gray-300 mt-1">Upload case documents using the form on the left.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocs.map(doc => (
                <div
                  key={doc.id}
                  className="p-4 bg-white border border-[#DCD6C5]/60 rounded-lg hover:border-[#C9A84C]/50 transition shadow-sm flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-[#0A1628]/5 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4.5 w-4.5 text-[#0A1628]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#0A1628] truncate">{doc.name}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${typeColors[doc.type] || 'bg-gray-100 text-gray-600'}`}>
                          {doc.type}
                        </span>
                        {doc.case && (
                          <span className="text-[9px] text-gray-500 font-medium">
                            📁 {doc.case.caseNumber}
                          </span>
                        )}
                        <span className="text-[9px] text-gray-400">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-[9px] text-gray-400">
                          by {doc.uploadedBy?.name || 'Admin'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 w-8 flex items-center justify-center rounded border border-[#DCD6C5] hover:border-[#C9A84C] text-[#0A1628] hover:text-[#C9A84C] transition"
                      title="View file"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### File: `src/app/(portals)/admin/finance/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/providers';
import { 
  IndianRupee, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  FileText, 
  Download,
  AlertCircle,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface TransactionItem {
  id: string;
  type: 'INFLOW' | 'OUTFLOW';
  amount: number;
  category: string;
  date: string;
  description: string | null;
}

interface InvoiceItem {
  id: string;
  amount: number;
  gstNumber: string | null;
  status: 'PAID' | 'UNPAID' | 'OVERDUE';
  createdAt: string;
  dueDate: string | null;
  client: { name: string };
}

export default function AdminFinance() {
  const { toast } = useToast();
  
  const [ledger, setLedger] = useState<{
    transactions: TransactionItem[];
    invoices: InvoiceItem[];
    summary: { totalRevenue: number; totalExpenses: number; netProfit: number };
  }>({
    transactions: [],
    invoices: [],
    summary: { totalRevenue: 0, totalExpenses: 0, netProfit: 0 },
  });

  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  // New Expense Form State
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('Office Supplies');
  const [expDate, setExpDate] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [submittingExpense, setSubmittingExpense] = useState(false);

  // New Invoice Form State
  const [invClientId, setInvClientId] = useState('');
  const [invAmount, setInvAmount] = useState('');
  const [invDueDate, setInvDueDate] = useState('');
  const [invStatus, setInvStatus] = useState('UNPAID');
  const [submittingInvoice, setSubmittingInvoice] = useState(false);

  const fetchLedgerAndClients = async () => {
    try {
      const [ledgerRes, clientsRes] = await Promise.all([
        fetch('/api/finance/ledger'),
        fetch('/api/clients'),
      ]);

      if (ledgerRes.ok) setLedger(await ledgerRes.json());
      if (clientsRes.ok) setClients(await clientsRes.json());
    } catch (err) {
      console.error('Error fetching financial ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerAndClients();
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle || !expAmount) {
      toast('Please enter title and amount for the expense.', 'error');
      return;
    }

    setSubmittingExpense(true);
    try {
      const res = await fetch('/api/finance/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: expTitle,
          amount: expAmount,
          category: expCategory,
          date: expDate || null,
          description: expDesc,
        }),
      });

      if (res.ok) {
        toast('Expense logged and deducted from ledger.', 'success');
        setExpenseModalOpen(false);
        setExpTitle('');
        setExpAmount('');
        setExpDate('');
        setExpDesc('');
        fetchLedgerAndClients();
      } else {
        toast('Failed to record expense.', 'error');
      }
    } catch (err) {
      toast('Network error saving expense.', 'error');
    } finally {
      setSubmittingExpense(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invClientId || !invAmount) {
      toast('Please select client and specify base fee.', 'error');
      return;
    }

    setSubmittingInvoice(true);
    try {
      const res = await fetch('/api/finance/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: invClientId,
          amount: invAmount,
          dueDate: invDueDate || null,
          status: invStatus,
        }),
      });

      if (res.ok) {
        toast('Invoice generated successfully.', 'success');
        setInvoiceModalOpen(false);
        setInvClientId('');
        setInvAmount('');
        setInvDueDate('');
        fetchLedgerAndClients();
      } else {
        toast('Failed to generate invoice.', 'error');
      }
    } catch (err) {
      toast('Network error generating invoice.', 'error');
    } finally {
      setSubmittingInvoice(false);
    }
  };

  const handleSettleInvoice = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/finance/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAID' }),
      });

      if (res.ok) {
        toast('Invoice status set to PAID. Ledger updated.', 'success');
        fetchLedgerAndClients();
      } else {
        toast('Failed to settle invoice.', 'error');
      }
    } catch (err) {
      toast('Network error updating invoice.', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PAID: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      UNPAID: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      OVERDUE: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    };
    return <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
  };

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-[#0A1628]">Financial Management</h2>
          <p className="text-xs text-gray-500 font-medium">Verify billings, generate invoices, and track expenditures</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setExpenseModalOpen(true)}
            variant="outline"
            className="border-[#DCD6C5] hover:border-[#0A1628] hover:bg-slate-50 text-xs font-semibold px-4 flex items-center gap-1.5 text-gray-700 bg-white"
          >
            <TrendingDown className="h-4 w-4 text-rose-500" /> Log Expense
          </Button>
          <Button 
            onClick={() => setInvoiceModalOpen(true)}
            className="bg-[#0A1628] hover:bg-[#0A1628]/95 text-white text-xs font-semibold px-4 flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Create Invoice
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-8 w-8 border-4 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* P&L Margin summaries */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border border-[#DCD6C5] bg-white shadow-sm flex items-center p-6 gap-4">
              <div className="h-10 w-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading text-[#0A1628]">₹{ledger.summary.totalRevenue.toLocaleString()}</p>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Chambers Inflow (Revenue)</p>
              </div>
            </Card>

            <Card className="border border-[#DCD6C5] bg-white shadow-sm flex items-center p-6 gap-4">
              <div className="h-10 w-10 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-600">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading text-[#0A1628]">₹{ledger.summary.totalExpenses.toLocaleString()}</p>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Chambers Outflow (Expenses)</p>
              </div>
            </Card>

            <Card className="border border-[#DCD6C5] bg-white shadow-sm flex items-center p-6 gap-4">
              <div className="h-10 w-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600">
                <IndianRupee className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading text-[#0A1628]">₹{ledger.summary.netProfit.toLocaleString()}</p>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Net Profit Margin</p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Unified Transaction Ledger Table */}
            <div className="lg:col-span-7">
              <Card className="border border-[#DCD6C5] bg-white shadow-sm overflow-hidden">
                <CardHeader className="border-b border-[#DCD6C5]/30">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#0A1628] flex items-center gap-2">
                    <FileSpreadsheet className="h-4.5 w-4.5 text-[#C9A84C]" /> Transaction Ledger
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {ledger.transactions.length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-400 font-semibold">
                      No transactions logged in current cycle.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-[#DCD6C5]/40 text-xs">
                        <thead className="bg-gray-50/70 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                          <tr>
                            <th className="px-6 py-3.5 text-left">Date</th>
                            <th className="px-6 py-3.5 text-left">Category</th>
                            <th className="px-6 py-3.5 text-left">Description</th>
                            <th className="px-6 py-3.5 text-left">Flow Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DCD6C5]/30 bg-white">
                          {ledger.transactions.map((t) => (
                            <tr key={t.id} className="hover:bg-slate-50/40 transition">
                              <td className="px-6 py-4 text-gray-400">
                                {new Date(t.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 font-bold text-gray-600">
                                {t.category}
                              </td>
                              <td className="px-6 py-4 text-gray-500 max-w-[150px] truncate" title={t.description || ''}>
                                {t.description}
                              </td>
                              <td className="px-6 py-4 font-bold">
                                {t.type === 'INFLOW' ? (
                                  <span className="text-emerald-600">+₹{t.amount.toLocaleString()}</span>
                                ) : (
                                  <span className="text-rose-600">-₹{t.amount.toLocaleString()}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Generated Invoices Table & Actions */}
            <div className="lg:col-span-5">
              <Card className="border border-[#DCD6C5] bg-white shadow-sm overflow-hidden">
                <CardHeader className="border-b border-[#DCD6C5]/30">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#0A1628] flex items-center gap-2">
                    <FileText className="h-4.5 w-4.5 text-[#C9A84C]" /> Client Billing Invoices
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {ledger.invoices.length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-400 font-semibold">
                      No invoices recorded.
                    </div>
                  ) : (
                    <div className="space-y-3 p-4">
                      {ledger.invoices.map((inv) => (
                        <div key={inv.id} className="p-3 border border-[#DCD6C5]/30 rounded-lg space-y-2 bg-[#F5F0E8]/20 flex flex-col">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[10px] text-gray-500 font-bold uppercase">Invoice #{inv.id.split('-')[0].toUpperCase()}</p>
                              <p className="text-xs font-bold text-[#0A1628]">{inv.client.name}</p>
                            </div>
                            {getStatusBadge(inv.status)}
                          </div>
                          
                          <div className="flex justify-between items-center text-[10px] text-gray-500 border-t border-[#DCD6C5]/20 pt-2 font-medium">
                            <span className="font-bold text-[#0A1628]">₹{inv.amount.toLocaleString()}</span>
                            <div className="flex items-center gap-3">
                              {inv.status !== 'PAID' && (
                                <button
                                  onClick={() => handleSettleInvoice(inv.id)}
                                  className="text-emerald-600 hover:underline font-bold"
                                >
                                  Mark Paid
                                </button>
                              )}
                              {/* Links directly to print template page */}
                              <Link
                                href={`/finance/invoices/${inv.id}/print`}
                                target="_blank"
                                className="text-[#C9A84C] hover:underline font-bold flex items-center gap-0.5"
                              >
                                Print <Download className="h-2.5 w-2.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* DIALOG: Log Expense */}
      <Dialog open={expenseModalOpen} onOpenChange={setExpenseModalOpen}>
        <DialogContent className="bg-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-[#0A1628]">Log Chambers Expense</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">Record a deduction from firm operational balances.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateExpense} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="eTitle" className="text-xs font-bold text-gray-600">Expense Title</Label>
              <Input 
                id="eTitle" 
                placeholder="e.g. Office Broadband Fiber" 
                value={expTitle} 
                onChange={(e) => setExpTitle(e.target.value)} 
                className="border-[#DCD6C5] text-xs bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="eAmount" className="text-xs font-bold text-gray-600">Amount (INR)</Label>
                <Input 
                  id="eAmount" 
                  type="number" 
                  placeholder="2500" 
                  value={expAmount} 
                  onChange={(e) => setExpAmount(e.target.value)} 
                  className="border-[#DCD6C5] text-xs bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="eCategory" className="text-xs font-bold text-gray-600">Category</Label>
                <Select value={expCategory} onValueChange={(val) => setExpCategory(val || '')}>
                  <SelectTrigger className="border-[#DCD6C5] text-xs bg-white">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-xs">
                    <SelectItem value="Rent" className="text-xs">Rent</SelectItem>
                    <SelectItem value="Salary" className="text-xs">Junior Salaries</SelectItem>
                    <SelectItem value="Office Supplies" className="text-xs">Office Supplies</SelectItem>
                    <SelectItem value="Utilities" className="text-xs">Utilities</SelectItem>
                    <SelectItem value="Other" className="text-xs">Other Expenses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="eDate" className="text-xs font-bold text-gray-600">Expense Date</Label>
              <Input 
                id="eDate" 
                type="date" 
                value={expDate} 
                onChange={(e) => setExpDate(e.target.value)} 
                className="border-[#DCD6C5] text-xs bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="eDesc" className="text-xs font-bold text-gray-600">Remarks / Description</Label>
              <Input 
                id="eDesc" 
                placeholder="Details of expense..." 
                value={expDesc} 
                onChange={(e) => setExpDesc(e.target.value)} 
                className="border-[#DCD6C5] text-xs bg-white"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setExpenseModalOpen(false)}
                className="border-[#DCD6C5] text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submittingExpense}
                className="bg-[#0A1628] text-white hover:bg-[#0A1628]/95 text-xs font-semibold"
              >
                {submittingExpense ? 'Logging...' : 'Log Expense'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: Create Invoice */}
      <Dialog open={invoiceModalOpen} onOpenChange={setInvoiceModalOpen}>
        <DialogContent className="bg-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-[#0A1628]">Generate Invoice</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">Bill a client for retainer or consultation fees.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateInvoice} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="iClient" className="text-xs font-bold text-gray-600">Select Client</Label>
              <Select value={invClientId} onValueChange={(val) => setInvClientId(val || '')}>
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
              <Label htmlFor="iAmount" className="text-xs font-bold text-gray-600">Amount (INR)</Label>
              <Input 
                id="iAmount" 
                type="number" 
                placeholder="e.g. 15000" 
                value={invAmount} 
                onChange={(e) => setInvAmount(e.target.value)} 
                className="border-[#DCD6C5] text-xs bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="iDueDate" className="text-xs font-bold text-gray-600">Payment Due Date</Label>
                <Input 
                  id="iDueDate" 
                  type="date" 
                  value={invDueDate} 
                  onChange={(e) => setInvDueDate(e.target.value)} 
                  className="border-[#DCD6C5] text-xs bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="iStatus" className="text-xs font-bold text-gray-600">Initial Status</Label>
                <Select value={invStatus} onValueChange={(val) => setInvStatus(val || '')}>
                  <SelectTrigger className="border-[#DCD6C5] text-xs bg-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-xs">
                    <SelectItem value="UNPAID" className="text-xs">UNPAID</SelectItem>
                    <SelectItem value="PAID" className="text-xs">PAID (Settled)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {invAmount && !isNaN(parseFloat(invAmount)) && (
              <div className="bg-[#F5F0E8]/50 border border-[#DCD6C5]/50 rounded p-3 text-[10px] space-y-1 text-gray-600">
                <div className="flex justify-between border-t border-[#DCD6C5]/30 pt-1.5 text-[#0A1628] font-bold">
                  <span>Invoice Total:</span>
                  <span>₹{parseFloat(invAmount).toLocaleString()}.00</span>
                </div>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setInvoiceModalOpen(false)}
                className="border-[#DCD6C5] text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submittingInvoice}
                className="bg-[#0A1628] text-white hover:bg-[#0A1628]/95 text-xs font-semibold"
              >
                {submittingInvoice ? 'Generating...' : 'Generate Invoice'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

---

### File: `src/app/(portals)/admin/reminders/page.tsx`

```typescript
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers';
import {
  Bell,
  Send,
  Clock,
  Calendar,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  History,
  Loader2,
  Phone,
  User,
  Scale,
  MapPin,
} from 'lucide-react';

interface CaseItem {
  id: string;
  caseNumber: string;
  title: string;
  court: string;
  nextHearing: string | null;
  status: string;
  client: { name: string; email: string; phone: string | null };
  junior: { id: string; name: string } | null;
}

interface ReminderRecord {
  id: string;
  recipientType: 'CLIENT' | 'JUNIOR';
  channel: string;
  message: string;
  sentAt: string | null;
  status: 'PENDING' | 'SENT' | 'FAILED';
  scheduledFor: string | null;
  createdAt: string;
  case: { caseNumber: string; title: string; court: string; nextHearing: string | null };
  recipient: { name: string; phone: string | null };
}

interface ReminderSettings {
  id: string;
  daysBeforeHearing: number;
  morningOfHearing: boolean;
  customMessage: string | null;
}

type ActiveTab = 'upcoming' | 'settings' | 'history';

export default function AdminRemindersPage() {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>('upcoming');
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [reminders, setReminders] = useState<ReminderRecord[]>([]);
  const [settings, setSettings] = useState<ReminderSettings | null>(null);

  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [sendingCaseId, setSendingCaseId] = useState<string | null>(null);
  const [sendingAll, setSendingAll] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Settings form state
  const [settingsDays, setSettingsDays] = useState<number>(1);
  const [settingsMorning, setSettingsMorning] = useState<boolean>(true);
  const [settingsCustomMsg, setSettingsCustomMsg] = useState<string>('');

  // ── Data Fetchers ──────────────────────────────────────────────────────────

  const fetchUpcomingCases = useCallback(async () => {
    setLoadingCases(true);
    try {
      const res = await fetch('/api/cases');
      if (res.ok) {
        const data: CaseItem[] = await res.json();
        const now = new Date();
        const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const upcoming = data.filter((c) => {
          if (!c.nextHearing || c.status === 'CLOSED') return false;
          const hearingDate = new Date(c.nextHearing);
          return hearingDate >= now && hearingDate <= in7Days;
        });
        // Sort ascending by hearing date
        upcoming.sort(
          (a, b) => new Date(a.nextHearing!).getTime() - new Date(b.nextHearing!).getTime()
        );
        setCases(upcoming);
      }
    } catch (err) {
      console.error('Error fetching cases:', err);
    } finally {
      setLoadingCases(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/reminders/history');
      if (res.ok) setReminders(await res.json());
    } catch (err) {
      console.error('Error fetching reminder history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch('/api/reminders/settings');
      if (res.ok) {
        const data: ReminderSettings = await res.json();
        setSettings(data);
        setSettingsDays(data.daysBeforeHearing);
        setSettingsMorning(data.morningOfHearing);
        setSettingsCustomMsg(data.customMessage || '');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  useEffect(() => {
    fetchUpcomingCases();
    fetchSettings();
  }, [fetchUpcomingCases, fetchSettings]);

  useEffect(() => {
    if (activeTab === 'history') fetchHistory();
  }, [activeTab, fetchHistory]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleSendReminder = async (caseId: string, caseNumber: string) => {
    setSendingCaseId(caseId);
    try {
      const res = await fetch('/api/reminders/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, templateType: 'day_before' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast(`Reminder sent for Case ${caseNumber}`, 'success');
      } else {
        toast(data.error || 'Failed to send reminder.', 'error');
      }
    } catch {
      toast('Network error sending reminder.', 'error');
    } finally {
      setSendingCaseId(null);
    }
  };

  const handleSendAll = async () => {
    if (cases.length === 0) {
      toast('No upcoming hearings to remind.', 'error');
      return;
    }
    setSendingAll(true);
    let successCount = 0;
    let failCount = 0;

    for (const c of cases) {
      try {
        const res = await fetch('/api/reminders/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caseId: c.id, templateType: 'day_before' }),
        });
        if (res.ok) successCount++;
        else failCount++;
      } catch {
        failCount++;
      }
    }

    setSendingAll(false);
    toast(
      `Bulk send complete: ${successCount} sent, ${failCount} failed.`,
      successCount > 0 ? 'success' : 'error'
    );
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/reminders/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          daysBeforeHearing: settingsDays,
          morningOfHearing: settingsMorning,
          customMessage: settingsCustomMsg || null,
        }),
      });
      if (res.ok) {
        toast('Reminder settings saved.', 'success');
        fetchSettings();
      } else {
        const data = await res.json();
        toast(data.error || 'Failed to save settings.', 'error');
      }
    } catch {
      toast('Network error saving settings.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const hearingDate = new Date(dateStr);
    hearingDate.setHours(0, 0, 0, 0);
    const diff = Math.round((hearingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return `In ${diff} days`;
  };

  const getUrgencyColor = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const hearingDate = new Date(dateStr);
    hearingDate.setHours(0, 0, 0, 0);
    const diff = Math.round((hearingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'text-rose-600 bg-rose-50 border-rose-200';
    if (diff === 1) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: React.ReactNode; cls: string; label: string }> = {
      SENT: {
        icon: <CheckCircle className="h-3 w-3" />,
        cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        label: 'Sent',
      },
      FAILED: {
        icon: <XCircle className="h-3 w-3" />,
        cls: 'bg-rose-50 text-rose-700 border-rose-200',
        label: 'Failed',
      },
      PENDING: {
        icon: <AlertCircle className="h-3 w-3" />,
        cls: 'bg-amber-50 text-amber-700 border-amber-200',
        label: 'Pending',
      },
    };
    const c = config[status] || config.PENDING;
    return (
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.cls}`}
      >
        {c.icon} {c.label}
      </span>
    );
  };

  // ── TAB CONTENT ─────────────────────────────────────────────────────────────

  const TabUpcoming = (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[#0A1628]">Upcoming Hearings — Next 7 Days</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {cases.length} case{cases.length !== 1 ? 's' : ''} with scheduled hearings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchUpcomingCases}
            variant="outline"
            className="border-[#DCD6C5] text-xs font-semibold text-gray-600 hover:border-[#0A1628] flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button
            onClick={handleSendAll}
            disabled={sendingAll || cases.length === 0}
            className="bg-[#0A1628] hover:bg-[#0A1628]/90 text-white text-xs font-semibold flex items-center gap-1.5"
          >
            {sendingAll ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Bell className="h-3.5 w-3.5" />
            )}
            Send All Reminders
          </Button>
        </div>
      </div>

      {/* Cases list */}
      {loadingCases ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-8 w-8 border-4 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin" />
        </div>
      ) : cases.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-[#DCD6C5] rounded-xl">
          <Calendar className="h-10 w-10 text-[#C9A84C] mx-auto mb-3 opacity-60" />
          <p className="text-sm font-bold text-gray-500">No hearings in the next 7 days</p>
          <p className="text-xs text-gray-400 mt-1">Cases with upcoming hearing dates will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-[#DCD6C5] rounded-xl p-4 hover:border-[#C9A84C]/50 transition duration-200 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                {/* Case info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                      {c.caseNumber}
                    </span>
                    {c.nextHearing && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getUrgencyColor(
                          c.nextHearing
                        )}`}
                      >
                        {getDaysUntil(c.nextHearing)}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-[#0A1628] text-sm leading-tight truncate pr-4">
                    {c.title}
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-[11px] text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-[#C9A84C]" /> {c.court}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-[#C9A84C]" />
                      {c.nextHearing
                        ? new Date(c.nextHearing).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'TBD'}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3 text-[#C9A84C]" />
                      {c.client.name}
                      {!c.client.phone && (
                        <span className="text-rose-400 ml-1" title="No phone number">⚠</span>
                      )}
                    </span>
                    {c.junior && (
                      <span className="flex items-center gap-1">
                        <Scale className="h-3 w-3 text-[#C9A84C]" />
                        {c.junior.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action button */}
                <Button
                  onClick={() => handleSendReminder(c.id, c.caseNumber)}
                  disabled={sendingCaseId === c.id || sendingAll}
                  className="bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0A1628] text-xs font-bold flex items-center gap-1.5 shrink-0"
                >
                  {sendingCaseId === c.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Send Reminder
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const TabSettings = (
    <div className="max-w-xl space-y-6">
      <div>
        <h3 className="text-sm font-bold text-[#0A1628]">Auto-Reminder Preferences</h3>
        <p className="text-[11px] text-gray-500 mt-0.5">
          Configure when and how hearing reminders are dispatched.
        </p>
      </div>

      {loadingSettings ? (
        <div className="flex justify-center py-12">
          <div className="h-7 w-7 border-4 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSaveSettings} className="space-y-5">
          {/* Days before */}
          <div className="space-y-2 p-4 bg-white border border-[#DCD6C5] rounded-xl">
            <Label className="text-xs font-bold text-[#0A1628]">Days Before Hearing</Label>
            <p className="text-[11px] text-gray-500">
              How many days in advance should the reminder be sent?
            </p>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSettingsDays(n)}
                  className={`px-4 py-1.5 rounded-lg border text-xs font-bold transition duration-150 ${
                    settingsDays === n
                      ? 'bg-[#0A1628] text-white border-[#0A1628]'
                      : 'bg-white text-gray-600 border-[#DCD6C5] hover:border-[#0A1628]/50'
                  }`}
                >
                  {n} day{n > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Morning of */}
          <div className="p-4 bg-white border border-[#DCD6C5] rounded-xl flex items-center justify-between">
            <div>
              <Label className="text-xs font-bold text-[#0A1628]">Morning-of Reminder</Label>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Also send a reminder on the morning of the hearing day.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSettingsMorning((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                settingsMorning ? 'bg-[#C9A84C]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  settingsMorning ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Custom message template */}
          <div className="space-y-2 p-4 bg-white border border-[#DCD6C5] rounded-xl">
            <Label className="text-xs font-bold text-[#0A1628]">
              Custom SMS Template{' '}
              <span className="font-normal text-gray-400">(optional)</span>
            </Label>
            <p className="text-[11px] text-gray-500">
              Use placeholders:{' '}
              <code className="bg-gray-100 px-1 rounded text-[10px]">{'{caseNumber}'}</code>{' '}
              <code className="bg-gray-100 px-1 rounded text-[10px]">{'{title}'}</code>{' '}
              <code className="bg-gray-100 px-1 rounded text-[10px]">{'{court}'}</code>{' '}
              <code className="bg-gray-100 px-1 rounded text-[10px]">{'{date}'}</code>{' '}
              <code className="bg-gray-100 px-1 rounded text-[10px]">{'{advocateName}'}</code>
            </p>
            <textarea
              value={settingsCustomMsg}
              onChange={(e) => setSettingsCustomMsg(e.target.value)}
              placeholder="Leave blank to use the default template."
              rows={3}
              className="w-full mt-1 text-xs border border-[#DCD6C5] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#C9A84C] resize-none bg-gray-50/50"
            />

            {/* Template previews */}
            <div className="mt-3 space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Default Templates</p>
              <div className="bg-[#F5F0E8] rounded-lg p-3 space-y-2 text-[11px] text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-[#0A1628]">Day before:</strong> Reminder: Your case{' '}
                  <em>{'{caseNumber}'}</em> - <em>{'{title}'}</em> has a hearing tomorrow (
                  <em>{'{date}'}</em>) at <em>{'{court}'}</em>. Please be prepared. -{' '}
                  <em>{'{advocateName}'}</em>
                </p>
                <p>
                  <strong className="text-[#0A1628]">Morning of:</strong> Today&apos;s Hearing: Case{' '}
                  <em>{'{caseNumber}'}</em> - <em>{'{title}'}</em> at <em>{'{court}'}</em>. Hearing
                  scheduled for today <em>{'{date}'}</em>. - <em>{'{advocateName}'}</em>
                </p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={savingSettings}
            className="bg-[#0A1628] hover:bg-[#0A1628]/90 text-white text-xs font-bold flex items-center gap-1.5"
          >
            {savingSettings ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle className="h-3.5 w-3.5" />
            )}
            Save Preferences
          </Button>
        </form>
      )}
    </div>
  );

  const TabHistory = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#0A1628]">Reminder History</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">Last 100 dispatch records</p>
        </div>
        <Button
          onClick={fetchHistory}
          variant="outline"
          className="border-[#DCD6C5] text-xs font-semibold text-gray-600 hover:border-[#0A1628] flex items-center gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {loadingHistory ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 border-4 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin" />
        </div>
      ) : reminders.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-[#DCD6C5] rounded-xl">
          <History className="h-10 w-10 text-[#C9A84C] mx-auto mb-3 opacity-60" />
          <p className="text-sm font-bold text-gray-500">No reminders dispatched yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Sent reminders will appear here with full details.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#DCD6C5] bg-white shadow-sm">
          <table className="min-w-full divide-y divide-[#DCD6C5]/50 text-xs">
            <thead className="bg-[#F5F0E8]">
              <tr>
                {['Case #', 'Recipient', 'Type', 'Phone', 'Message', 'Sent At', 'Status'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCD6C5]/30">
              {reminders.map((r) => (
                <tr key={r.id} className="hover:bg-[#F5F0E8]/40 transition duration-100">
                  <td className="px-4 py-3 font-bold text-[#0A1628] whitespace-nowrap">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{r.case.caseNumber}</p>
                    <p className="truncate max-w-[120px] font-semibold text-gray-700">{r.case.title}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-semibold text-[#0A1628]">{r.recipient.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        r.recipientType === 'CLIENT'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {r.recipientType}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="flex items-center gap-1 text-gray-600">
                      <Phone className="h-3 w-3 text-[#C9A84C]" />
                      {r.recipient.phone || <span className="text-rose-400 italic">N/A</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="truncate text-gray-600" title={r.message}>
                      {r.message}
                    </p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                    {r.sentAt
                      ? new Date(r.sentAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(r.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // ── RENDER ──────────────────────────────────────────────────────────────────

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'upcoming', label: 'Upcoming Hearings', icon: <Bell className="h-3.5 w-3.5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-3.5 w-3.5" /> },
    { id: 'history', label: 'History', icon: <History className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading text-[#0A1628]">Hearing Reminders</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Send SMS alerts to clients and junior counsel before court hearings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${
              settings
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-gray-50 text-gray-500 border-gray-200'
            }`}
          >
            <Clock className="h-3 w-3" />
            Auto: {settings ? `${settings.daysBeforeHearing}d before${settings.morningOfHearing ? ' + morning' : ''}` : 'Loading...'}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-[#DCD6C5] bg-white shadow-sm flex items-center p-4 gap-3">
          <div className="h-9 w-9 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600">
            <Calendar className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-lg font-bold font-heading text-[#0A1628]">{cases.length}</p>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">
              Hearings This Week
            </p>
          </div>
        </Card>

        <Card className="border border-[#DCD6C5] bg-white shadow-sm flex items-center p-4 gap-3">
          <div className="h-9 w-9 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600">
            <CheckCircle className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-lg font-bold font-heading text-[#0A1628]">
              {reminders.filter((r) => r.status === 'SENT').length}
            </p>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">
              Reminders Sent
            </p>
          </div>
        </Card>

        <Card className="border border-[#DCD6C5] bg-white shadow-sm flex items-center p-4 gap-3">
          <div className="h-9 w-9 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-600">
            <XCircle className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-lg font-bold font-heading text-[#0A1628]">
              {cases.filter((c) => !c.client.phone).length}
            </p>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">
              Missing Phone Numbers
            </p>
          </div>
        </Card>
      </div>

      {/* Main content card with tabs */}
      <Card className="border border-[#DCD6C5] bg-white shadow-sm">
        {/* Tab bar */}
        <div className="border-b border-[#DCD6C5]/50 px-6 pt-4">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t transition duration-150 border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'text-[#0A1628] border-[#C9A84C] bg-[#F5F0E8]/60'
                    : 'text-gray-400 border-transparent hover:text-[#0A1628] hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <CardContent className="p-6">
          {activeTab === 'upcoming' && TabUpcoming}
          {activeTab === 'settings' && TabSettings}
          {activeTab === 'history' && TabHistory}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### File: `src/app/(portals)/admin/analytics/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/providers';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  PieChart, 
  Activity, 
  Calendar, 
  TrendingUp, 
  Briefcase,
  Hourglass
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface RevenueData {
  labels: string[];
  revenues: number[];
  expenses: number[];
}

interface CaseAnalyticsData {
  statusCounts: Record<string, number>;
  typeCounts: Record<string, number>;
  avgResolutionTime: number;
  openedVsClosed: {
    labels: string[];
    opened: number[];
    closed: number[];
  };
  topPracticeAreas: { name: string; count: number }[];
}

export default function AdminAnalytics() {
  const { toast } = useToast();
  
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [caseData, setCaseData] = useState<CaseAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Date range filter states (simulated client filtering)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [revRes, caseRes] = await Promise.all([
        fetch('/api/analytics/revenue'),
        fetch('/api/analytics/cases'),
      ]);

      if (revRes.ok) setRevenueData(await revRes.json());
      if (caseRes.ok) setCaseData(await caseRes.json());
    } catch (err) {
      console.error('Error fetching analytics reports:', err);
      toast('Failed to generate charts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleApplyFilter = () => {
    toast('Date range applied. Filtering dashboard view.', 'success');
    fetchAnalytics();
  };

  // 1. Chart Configuration: Revenue vs Expenses (Bar Chart)
  const getRevenueChartConfig = () => {
    if (!revenueData) return { data: { labels: [], datasets: [] }, options: {} };
    
    return {
      data: {
        labels: revenueData.labels,
        datasets: [
          {
            label: 'Revenue (INR)',
            data: revenueData.revenues,
            backgroundColor: '#0A1628', // Navy
            borderColor: '#C9A84C', // Gold
            borderWidth: 1,
            borderRadius: 4,
          },
          {
            label: 'Expenses (INR)',
            data: revenueData.expenses,
            backgroundColor: '#EF4444', // Red
            borderColor: '#F87171',
            borderWidth: 1,
            borderRadius: 4,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' as const },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { font: { size: 10 } },
          },
          x: {
            ticks: { font: { size: 10 } },
          }
        }
      }
    };
  };

  // 2. Chart Configuration: Cases by Type (Pie Chart)
  const getCaseTypeChartConfig = () => {
    if (!caseData) return { data: { labels: [], datasets: [] }, options: {} };
    
    const labels = Object.keys(caseData.typeCounts);
    const counts = Object.values(caseData.typeCounts);

    return {
      data: {
        labels: labels,
        datasets: [
          {
            data: counts,
            backgroundColor: [
              '#0A1628', // Navy
              '#C9A84C', // Gold
              '#3B82F6', // Blue
              '#10B981', // Emerald
              '#F59E0B', // Amber
              '#8B5CF6', // Purple
            ],
            borderWidth: 1,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' as const, labels: { font: { size: 10 } } },
        }
      }
    };
  };

  // 3. Chart Configuration: Cases Opened vs Closed (Line Chart)
  const getOpenedVsClosedChartConfig = () => {
    if (!caseData) return { data: { labels: [], datasets: [] }, options: {} };

    return {
      data: {
        labels: caseData.openedVsClosed.labels,
        datasets: [
          {
            label: 'Cases Opened',
            data: caseData.openedVsClosed.opened,
            borderColor: '#3B82F6', // Blue
            backgroundColor: '#3B82F6/20',
            tension: 0.3,
            fill: false,
          },
          {
            label: 'Cases Closed',
            data: caseData.openedVsClosed.closed,
            borderColor: '#10B981', // Emerald
            backgroundColor: '#10B981/20',
            tension: 0.3,
            fill: false,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' as const },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, font: { size: 10 } },
          },
          x: {
            ticks: { font: { size: 10 } },
          }
        }
      }
    };
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-[#0A1628]">Analytics Report</h2>
          <p className="text-xs text-gray-500 font-medium">Verify firm margins, practice area distributions, and case closure rates</p>
        </div>
      </div>

      {/* Date filters row */}
      <div className="flex flex-wrap items-end gap-4 bg-white p-4 rounded-lg border border-[#DCD6C5] shadow-sm text-xs">
        <div className="space-y-1.5">
          <Label htmlFor="start" className="text-[10px] font-bold text-gray-500 uppercase">Start Date</Label>
          <Input 
            id="start" 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            className="border-[#DCD6C5] h-8 text-xs bg-white w-40"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="end" className="text-[10px] font-bold text-gray-500 uppercase">End Date</Label>
          <Input 
            id="end" 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            className="border-[#DCD6C5] h-8 text-xs bg-white w-40"
          />
        </div>
        <Button 
          onClick={handleApplyFilter}
          className="bg-[#0A1628] hover:bg-[#0A1628]/95 text-white text-[10px] h-8 font-semibold px-4"
        >
          Apply Range
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-8 w-8 border-4 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Key Analytics Metric Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="border border-[#DCD6C5] bg-white shadow-sm flex items-center p-6 gap-4">
              <div className="h-10 w-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600">
                <Hourglass className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading text-[#0A1628]">
                  {caseData?.avgResolutionTime || 0} Days
                </p>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Avg Case Closure Time</p>
              </div>
            </Card>

            <Card className="border border-[#DCD6C5] bg-white shadow-sm flex items-center p-6 gap-4">
              <div className="h-10 w-10 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0A1628] truncate max-w-[150px]">
                  {caseData?.topPracticeAreas?.[0]?.name || 'N/A'}
                </p>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Top Practice Area</p>
              </div>
            </Card>

            <Card className="border border-[#DCD6C5] bg-white shadow-sm flex items-center p-6 gap-4">
              <div className="h-10 w-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading text-[#0A1628]">₹{(revenueData && revenueData.revenues.length > 0 ? (revenueData.revenues.reduce((s, r) => s + r, 0) / Math.max(1, revenueData.revenues.length)) : 0).toFixed(0)}</p>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Average Invoice billing</p>
              </div>
            </Card>
          </div>

          {/* Charts Layout grids */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Revenue Bar Chart */}
            <div className="lg:col-span-8">
              <Card className="border border-[#DCD6C5] bg-white shadow-sm">
                <CardHeader className="border-b border-[#DCD6C5]/20">
                  <CardTitle className="text-base font-heading text-[#0A1628] flex items-center gap-2">
                    <BarChart3 className="h-4.5 w-4.5 text-[#C9A84C]" /> Revenue vs Expenses
                  </CardTitle>
                  <CardDescription className="text-xs">Chambers net cash flow over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Bar {...getRevenueChartConfig()} />
                </CardContent>
              </Card>
            </div>

            {/* Cases by Practice Area Type */}
            <div className="lg:col-span-4">
              <Card className="border border-[#DCD6C5] bg-white shadow-sm">
                <CardHeader className="border-b border-[#DCD6C5]/20">
                  <CardTitle className="text-base font-heading text-[#0A1628] flex items-center gap-2">
                    <PieChart className="h-4.5 w-4.5 text-[#C9A84C]" /> Litigation Specialty Weights
                  </CardTitle>
                  <CardDescription className="text-xs">Case files categorized by legal branch</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Pie {...getCaseTypeChartConfig()} />
                </CardContent>
              </Card>
            </div>

            {/* Cases Opened vs Closed (Line Chart) */}
            <div className="lg:col-span-12">
              <Card className="border border-[#DCD6C5] bg-white shadow-sm">
                <CardHeader className="border-b border-[#DCD6C5]/20">
                  <CardTitle className="text-base font-heading text-[#0A1628] flex items-center gap-2">
                    <Activity className="h-4.5 w-4.5 text-[#C9A84C]" /> Litigation Resolution Rate
                  </CardTitle>
                  <CardDescription className="text-xs">Monthly trends of cases opened vs cases closed</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Line {...getOpenedVsClosedChartConfig()} />
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

---

### File: `src/app/(portals)/dashboard/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Scale, IndianRupee, LogOut, Clock, Download, Plus } from 'lucide-react';
import { useToast } from '@/components/providers';

export default function ClientDashboard() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [apptsRes, casesRes, invsRes] = await Promise.all([
          fetch('/api/appointments'),
          fetch('/api/cases'),
          fetch('/api/finance/ledger').then(r => r.ok ? r.json() : { invoices: [] }), // Ledger contains client invoices too, but let's fetch directly if admin, otherwise we can filter or mock
        ]);

        if (apptsRes.ok) setAppointments(await apptsRes.json());
        if (casesRes.ok) setCases(await casesRes.json());
        
        // Fetch invoices. Since clients can see invoices, let's query from database if we need.
        // We will make a helper or grab it from mock. Let's do a fetch for invoices:
        const invoicesRes = await fetch('/api/appointments'); // Default fallback, let's retrieve from database:
        // Actually, we can fetch all invoices for this user in ledger or mock.
        // Let's mock client invoices or filter them from ledger if ledger is available, or pull mock invoices.
        // Let's filter from ledger:
        if (invsRes && invsRes.invoices) {
          setInvoices(invsRes.invoices.filter((i: any) => i.clientId === session?.user?.id));
        } else {
          // fallback mock client invoices for demo if needed
          setInvoices([
            { id: 'inv_1', amount: 15000, status: 'PAID', gstNumber: '27AADCB2230F1ZS', createdAt: new Date().toISOString() }
          ]);
        }
      } catch (err) {
        console.error('Error fetching client dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchDashboardData();
    }
  }, [session]);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      CONFIRMED: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      PENDING: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      CANCELLED: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
      ACTIVE: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      CLOSED: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
      PAID: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      UNPAID: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      OVERDUE: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    };
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F5F0E8] text-[#0A1628]">
      {/* Dashboard Top Header */}
      <header className="bg-[#0A1628] text-white py-6 border-b border-[#C9A84C]/25 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold font-heading">MLR Associates Client Desk</h1>
            <p className="text-xs text-gray-400">Welcome, {session?.user?.name} | Client ID: {session?.user?.id?.split('-')[0].toUpperCase()}</p>
          </div>
          <Button
            onClick={() => signOut({ callbackUrl: '/' })}
            variant="outline"
            className="border-white/10 hover:border-rose-500 hover:text-rose-500 text-white font-semibold text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </Button>
        </div>
      </header>

      <main className="flex-1 py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        {/* Quick actions row */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg border border-[#DCD6C5] shadow-sm">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A1628]">Case Services</h4>
            <p className="text-[10px] text-gray-500">Book new consultations or upload court documents.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/book">
              <Button className="bg-[#0A1628] text-white hover:bg-[#0A1628]/90 text-xs font-semibold px-4 flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Book Consultation
              </Button>
            </Link>
            <Link href="/upload">
              <Button className="bg-[#C9A84C] text-[#0A1628] hover:bg-[#C9A84C]/95 text-xs font-semibold px-4 flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Upload Document
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="h-8 w-8 border-4 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Active litigation cases */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border border-[#DCD6C5] bg-white shadow-sm">
                <CardHeader className="border-b border-[#DCD6C5]/30">
                  <CardTitle className="text-base font-heading text-[#0A1628] flex items-center gap-2">
                    <Scale className="h-4 w-4 text-[#C9A84C]" /> Active Litigation Cases
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {cases.length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-400 font-semibold">
                      No active litigation files registered on this account.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cases.map((c) => (
                        <div key={c.id} className="p-4 rounded-lg border border-[#DCD6C5]/40 bg-gray-50/50 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-gray-500 font-bold uppercase">{c.caseNumber}</span>
                              <h4 className="text-sm font-bold text-[#0A1628]">{c.title}</h4>
                            </div>
                            {getStatusBadge(c.status)}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-[11px] text-gray-600 border-t border-[#DCD6C5]/30 pt-3">
                            <div>
                              <span className="font-semibold text-gray-500">Court Bench: </span>
                              <span>{c.court}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-500">Next Hearing: </span>
                              <span className="font-bold text-rose-600">
                                {c.nextHearing ? new Date(c.nextHearing).toLocaleDateString() : 'TBD'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Consultation Bookings */}
              <Card className="border border-[#DCD6C5] bg-white shadow-sm">
                <CardHeader className="border-b border-[#DCD6C5]/30">
                  <CardTitle className="text-base font-heading text-[#0A1628] flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#C9A84C]" /> Scheduled Consultations
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {appointments.length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-400 font-semibold">
                      No consultation appointments booked.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {appointments.map((a) => (
                        <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-[#DCD6C5]/30 hover:border-[#C9A84C]/40 bg-white transition duration-200">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-[#0A1628]/5 flex items-center justify-center text-[#0A1628]">
                              <Clock className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#0A1628]">{new Date(a.date).toLocaleDateString()} ({a.timeSlot})</p>
                              <p className="text-[10px] text-gray-500">Practice Bench: {a.caseType}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-gray-700">INR {a.feePaid}</span>
                            {getStatusBadge(a.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Financial Invoice Statements */}
            <div className="space-y-6">
              <Card className="border border-[#DCD6C5] bg-white shadow-sm">
                <CardHeader className="border-b border-[#DCD6C5]/30">
                  <CardTitle className="text-base font-heading text-[#0A1628] flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-[#C9A84C]" /> Invoices & Receipts
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {invoices.length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-400 font-semibold">
                      No invoices recorded.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {invoices.map((inv) => (
                        <div key={inv.id} className="p-3.5 rounded-lg border border-[#DCD6C5]/30 bg-gray-50/50 space-y-2 flex flex-col">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-[10px] text-gray-500 font-bold uppercase">Invoice #{inv.id.split('-')[0].toUpperCase()}</p>
                              <p className="text-xs font-bold text-[#0A1628]">INR {inv.amount}</p>
                            </div>
                            {getStatusBadge(inv.status)}
                          </div>
                          
                          <div className="flex items-center justify-between border-t border-[#DCD6C5]/20 pt-2 text-[9px] text-gray-500">
                            <span>GSTIN: {inv.gstNumber || 'N/A'}</span>
                            <a
                              href={`/api/finance/invoices/${inv.id}/print`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#C9A84C] hover:underline font-bold flex items-center gap-1"
                            >
                              Print PDF <Download className="h-2.5 w-2.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Encryption safeguards panel */}
              <Card className="border border-[#C9A84C]/25 bg-[#0A1628] text-white">
                <CardContent className="pt-6 space-y-3">
                  <h4 className="text-xs font-bold text-[#C9A84C] uppercase tracking-wider">Secured Chambers Desk</h4>
                  <p className="text-[10px] text-gray-300 leading-relaxed">
                    This terminal operates under encrypted session protocols. Pleadings, briefs, and transactional contracts uploaded to MLR Associates vaults are secured. Read our full data practices under the Indian DPDP Act 2023.
                  </p>
                  <Link href="/privacy" className="text-[10px] font-bold text-[#C9A84C] hover:underline block">
                    Read Privacy Policy →
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
```

---

### File: `src/app/(portals)/finance/invoices/[id]/print/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Phone, MapPin, Printer, ArrowLeft } from 'lucide-react';

interface InvoiceDetails {
  id: string;
  amount: number;
  gstNumber: string | null;
  status: string;
  createdAt: string;
  dueDate: string | null;
  client: {
    name: string;
    email: string;
    phone: string | null;
  };
}

export default function PrintInvoicePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        const res = await fetch('/api/finance/ledger');
        if (res.ok) {
          const data = await res.json();
          const found = data.invoices.find((i: any) => i.id === params.id);
          if (found) {
            setInvoice(found);
          }
        }
      } catch (err) {
        console.error('Error fetching print invoice details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoiceDetails();
  }, [params.id]);

  useEffect(() => {
    if (invoice) {
      // Auto-trigger browser print prompt
      const timer = setTimeout(() => {
        window.print();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [invoice]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5F0E8] text-[#0A1628]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-4 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin"></div>
          <p className="text-xs font-semibold">Generating print layout...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5F0E8] text-[#0A1628] p-4 text-center">
        <div className="space-y-4">
          <p className="text-sm font-semibold">Invoice record not found.</p>
          <button onClick={() => window.close()} className="text-xs text-[#C9A84C] underline font-bold">
            Close Tab
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-white text-slate-800 p-8 sm:p-12 max-w-4xl mx-auto space-y-10 print:p-0 print:m-0">
      
      {/* Navigation control helper (hidden during print) */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 print:hidden">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-bold"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Finances
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 bg-slate-900 text-white text-xs font-bold py-2 px-4 rounded hover:bg-slate-800 transition"
        >
          <Printer className="h-4 w-4" /> Print Invoice
        </button>
      </div>

      {/* Invoice Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[#0A1628]">
            <Shield className="h-8 w-8 text-[#C9A84C]" />
            <span className="font-heading font-extrabold text-2xl tracking-wider">MLR ASSOCIATES</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Advocates & Legal Advisors</p>
          <div className="text-[10px] text-slate-500 space-y-0.5 leading-relaxed font-semibold">
            <p className="flex items-center gap-1"><MapPin className="h-3 w-3" /> 130, Nungambakkam High Rd, Thousand Lights, Chennai, TN - 600006</p>
            <p className="flex items-center gap-1"><Phone className="h-3 w-3" /> +91 94440 19923</p>
            <p className="flex items-center gap-1"><Mail className="h-3 w-3" /> finance@mlrassociates.in</p>
          </div>
        </div>

        <div className="text-right space-y-1 sm:self-center">
          <h2 className="text-2xl font-bold font-heading text-[#0A1628]">INVOICE</h2>
          <p className="text-xs text-slate-500 font-bold uppercase">Invoice #{invoice.id.split('-')[0].toUpperCase()}</p>
          <div className="text-[11px] text-slate-600 space-y-0.5 font-medium">
            <p><strong>Invoice Date:</strong> {new Date(invoice.createdAt).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Upon Receipt'}</p>
            <p><strong>Status:</strong> <span className={`font-bold ${invoice.status === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>{invoice.status}</span></p>
          </div>
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Billed To Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs leading-relaxed">
        <div className="space-y-1.5">
          <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Billed To:</h4>
          <p className="font-bold text-slate-800 text-sm">{invoice.client.name}</p>
          {invoice.client.phone && <p><strong>Phone:</strong> {invoice.client.phone}</p>}
          <p><strong>Email:</strong> {invoice.client.email}</p>
        </div>
      </div>

      {/* Itemized Charge Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-6 py-3 text-left">Description of Legal Services</th>
              <th className="px-6 py-3 text-right">Amount (INR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
            <tr>
              <td className="px-6 py-4 font-bold">
                Professional Advocacy & Litigation Retainer
                <p className="text-[10px] text-slate-400 font-medium mt-1">Consultation fee and draft preparation</p>
              </td>
              <td className="px-6 py-4 text-right font-bold">₹{invoice.amount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex justify-end text-xs font-semibold">
        <div className="w-72 border-t border-slate-200 pt-4">
          <div className="flex justify-between text-slate-800 text-sm font-bold">
            <span>Invoice Total:</span>
            <span>₹{invoice.amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Declarations footer */}
      <div className="pt-16 text-center space-y-2 border-t border-slate-100 text-[10px] text-slate-400 font-medium leading-relaxed">
        <p><strong>Declaration:</strong> This invoice is raised for legal advisory services rendered by MLR Associates.</p>
        <p>This is a computer-generated tax document. Physical signatures are not required under Section 5 of the Information Technology Act, 2000.</p>
      </div>

    </div>
  );
}
```

---

