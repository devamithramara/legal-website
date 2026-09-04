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
