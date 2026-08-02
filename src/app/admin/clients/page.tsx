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
  appointments: { id: string; date: string; status: string }[];
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

  useEffect(() => {
    fetchClients();
  }, []);

  const handleExportCSV = () => {
    if (clients.length === 0) return;
    
    // Construct CSV Header
    const headers = ['Client ID', 'Name', 'Email', 'Phone', 'Registered Date', 'Cases Count', 'Billing Total (INR)'];
    
    // Construct CSV Rows
    const rows = clients.map((c) => {
      const totalBilled = c.invoices.reduce((sum, inv) => sum + inv.amount, 0);
      return [
        c.id.split('-')[0].toUpperCase(),
        `"${c.name}"`,
        `"${c.email}"`,
        `"${c.phone || 'N/A'}"`,
        new Date(c.createdAt).toLocaleDateString(),
        c.clientCases.length,
        totalBilled,
      ];
    });

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
                    const totalUnpaid = client.invoices
                      .filter((i) => i.status !== 'PAID')
                      .reduce((sum, i) => sum + i.amount, 0);
                    return (
                      <tr 
                        key={client.id} 
                        onClick={() => setSelectedClient(client)}
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
                          {client.clientCases.length} Cases
                        </td>
                        <td className="px-6 py-4 font-bold text-[#0A1628]">
                          {totalUnpaid > 0 ? (
                            <span className="text-rose-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> ₹{totalUnpaid} Due
                            </span>
                          ) : (
                            <span className="text-emerald-600">Settle (Paid)</span>
                          )}
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

      {/* CLIENT DETAILS DRAWER (Native overlay matching premium sidebar design) */}
      {selectedClient && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-[#DCD6C5] shadow-2xl flex flex-col transition-transform duration-300 transform translate-x-0">
          {/* Drawer Header */}
          <div className="bg-[#0A1628] text-white p-5 flex items-center justify-between border-b border-[#C9A84C]/20">
            <div>
              <span className="text-[9px] text-gray-400 font-bold uppercase">Client ID: {selectedClient.id.split('-')[0].toUpperCase()}</span>
              <h3 className="font-heading font-bold text-base text-[#F5F0E8]">{selectedClient.name}</h3>
            </div>
            <button 
              onClick={() => setSelectedClient(null)}
              className="text-gray-400 hover:text-white transition focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
            {/* Contact Details Card */}
            <div className="space-y-1.5 p-3 rounded-lg border border-[#DCD6C5]/40 bg-gray-50/50">
              <h4 className="font-bold text-gray-500 uppercase text-[9px] tracking-wider mb-2">Workspace Contact</h4>
              <p className="font-semibold"><span className="text-gray-400 font-medium">Email: </span>{selectedClient.email}</p>
              <p className="font-semibold"><span className="text-gray-400 font-medium">Phone: </span>{selectedClient.phone || 'N/A'}</p>
            </div>

            {/* Client Cases */}
            <div className="space-y-3">
              <h4 className="font-bold text-[#0A1628] uppercase text-[10px] tracking-wider flex items-center gap-1.5 border-b border-[#DCD6C5]/30 pb-1.5">
                <Scale className="h-4 w-4 text-[#C9A84C]" /> Linked Case Folders ({selectedClient.clientCases.length})
              </h4>
              {selectedClient.clientCases.length === 0 ? (
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
                <IndianRupee className="h-4 w-4 text-[#C9A84C]" /> Invoice Ledger ({selectedClient.invoices.length})
              </h4>
              {selectedClient.invoices.length === 0 ? (
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

            {/* Consultation Appointments history */}
            <div className="space-y-3">
              <h4 className="font-bold text-[#0A1628] uppercase text-[10px] tracking-wider flex items-center gap-1.5 border-b border-[#DCD6C5]/30 pb-1.5">
                <Calendar className="h-4 w-4 text-[#C9A84C]" /> Consultation History ({selectedClient.appointments.length})
              </h4>
              {selectedClient.appointments.length === 0 ? (
                <p className="text-gray-400 italic text-[11px]">No consultation slots scheduled.</p>
              ) : (
                <div className="space-y-2">
                  {selectedClient.appointments.map((a) => (
                    <div key={a.id} className="p-2.5 border border-[#DCD6C5]/30 rounded bg-white flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[#0A1628]">{new Date(a.date).toLocaleDateString()}</p>
                        <p className="text-[9px] text-gray-500">Slot: {a.status}</p>
                      </div>
                      {getStatusBadge(a.status)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
