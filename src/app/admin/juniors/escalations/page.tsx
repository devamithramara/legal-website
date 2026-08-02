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
