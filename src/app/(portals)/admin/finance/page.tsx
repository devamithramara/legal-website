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
