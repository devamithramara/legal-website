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
        // Refresh details
        const refreshedCasesRes = await fetch('/api/cases');
        const refreshedCases = await refreshedCasesRes.json();
        setCases(refreshedCases);
        
        const updated = refreshedCases.find((c: any) => c.id === selectedCase.id);
        if (updated) setSelectedCase(updated);
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
        body: JSON.stringify({
          title: eventTitle,
          eventDate,
          notes: eventNotes,
        }),
      });

      if (res.ok) {
        toast('Case history event logged!', 'success');
        setEventTitle('');
        setEventDate('');
        setEventNotes('');
        
        // Refresh
        const refreshedCasesRes = await fetch('/api/cases');
        const refreshedCases = await refreshedCasesRes.json();
        setCases(refreshedCases);
        
        const updated = refreshedCases.find((c: any) => c.id === selectedCase.id);
        if (updated) setSelectedCase(updated);
      } else {
        toast('Failed to log event.', 'error');
      }
    } catch (err) {
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
        
        // Refresh
        const refreshedCasesRes = await fetch('/api/cases');
        const refreshedCases = await refreshedCasesRes.json();
        setCases(refreshedCases);
        
        const updated = refreshedCases.find((c: any) => c.id === selectedCase.id);
        if (updated) setSelectedCase(updated);
      } else {
        toast('Failed to allocate task.', 'error');
      }
    } catch (err) {
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
                      onClick={() => setSelectedCase(c)}
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
        <Dialog open={!!selectedCase} onOpenChange={(open) => !open && setSelectedCase(null)}>
          <DialogContent className="bg-white max-w-3xl max-h-[85vh] overflow-y-auto text-xs">
            <DialogHeader className="border-b border-[#DCD6C5]/30 pb-4">
              <div className="flex justify-between items-start pr-6">
                <div>
                  <span className="text-[9px] text-gray-500 font-bold uppercase">CNR: {selectedCase.caseNumber}</span>
                  <DialogTitle className="font-heading text-lg font-bold text-[#0A1628] leading-snug">{selectedCase.title}</DialogTitle>
                  <p className="text-[10px] text-gray-500 font-medium">Client: {selectedCase.client.name} ({selectedCase.client.email})</p>
                </div>
                {getStatusBadge(selectedCase.status)}
              </div>
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
