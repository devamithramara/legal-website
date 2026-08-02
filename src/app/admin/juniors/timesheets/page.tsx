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
      if (juniorsRes.ok) {
        const jData = await juniorsRes.json();
        setJuniors(jData);
      }

      const targetId = juniorId || (juniors.length > 0 ? juniors[0].id : '');
      if (targetId) {
        const timesheetRes = await fetch(`/api/timelogs/timesheet?juniorId=${targetId}`);
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
