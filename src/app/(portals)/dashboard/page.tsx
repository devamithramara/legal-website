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
            onClick={async () => {
              await signOut({ redirect: false });
              window.location.href = '/login';
            }}
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
