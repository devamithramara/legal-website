'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/providers';
import { Briefcase, CheckCircle2, Clock, Calendar, AlertCircle, LogOut, ArrowRight, UserCheck, FolderOpen, FileText, Paperclip, Eye, Upload, ShieldCheck } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  deadline: string | null;
  billableHours: number;
  caseId: string;
  case: {
    caseNumber: string;
    title: string;
  };
}

interface Case {
  id: string;
  caseNumber: string;
  title: string;
  type: string;
  court: string;
  status: string;
  nextHearing: string | null;
  client: {
    name: string;
    phone: string;
  };
}

export default function JuniorDashboard() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [cases, setCases] = useState<Case[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States for logging hours
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [billableInput, setBillableInput] = useState('');
  const [updatingTask, setUpdatingTask] = useState(false);

  const fetchJuniorData = async () => {
    try {
      const [casesRes, tasksRes, docsRes] = await Promise.all([
        fetch('/api/cases'),
        fetch('/api/tasks'),
        fetch('/api/documents'),
      ]);

      if (casesRes.ok) setCases(await casesRes.json());
      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (docsRes.ok) setDocuments(await docsRes.json());
    } catch (err) {
      console.error('Error fetching junior dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchJuniorData();
    }
  }, [session]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast('Task status updated!', 'success');
        // Update local state
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: newStatus as any } : t))
        );
      } else {
        toast('Failed to update task status.', 'error');
      }
    } catch (err) {
      toast('Network error updating task.', 'error');
    }
  };

  const handleLogHoursSubmit = async (taskId: string) => {
    if (!billableInput || isNaN(parseFloat(billableInput))) {
      toast('Please enter a valid number for billable hours.', 'error');
      return;
    }

    setUpdatingTask(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billableHours: parseFloat(billableInput) }),
      });

      if (res.ok) {
        toast('Billable hours updated successfully!', 'success');
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, billableHours: parseFloat(billableInput) } : t))
        );
        setEditingTaskId(null);
        setBillableInput('');
      } else {
        toast('Failed to update billable hours.', 'error');
      }
    } catch (err) {
      toast('Error contact task servers.', 'error');
    } finally {
      setUpdatingTask(false);
    }
  };

  // Check if a task is overdue
  const isTaskOverdue = (task: Task) => {
    if (!task.deadline || task.status === 'DONE') return false;
    const deadlineDate = new Date(task.deadline);
    const today = new Date();
    // Reset hours to compare dates
    today.setHours(0, 0, 0, 0);
    return deadlineDate < today;
  };

  // Calculations
  const totalBillable = tasks.reduce((sum, t) => sum + t.billableHours, 0);
  const pendingTasksCount = tasks.filter((t) => t.status !== 'DONE').length;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F5F0E8] text-[#0A1628]">
      {/* Dashboard Top Header */}
      <header className="bg-[#0A1628] text-white py-6 border-b border-[#C9A84C]/25 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold font-heading">Advocate Workspace</h1>
            <p className="text-xs text-gray-400">Welcome, {session?.user?.name} | Junior Counsel Portal</p>
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
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="h-8 w-8 border-4 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Caseload and Hours Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border border-[#DCD6C5] bg-white shadow-sm flex items-center p-6 gap-4">
                <div className="h-10 w-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-heading text-[#0A1628]">{cases.length}</p>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Assigned Cases</p>
                </div>
              </Card>

              <Card className="border border-[#DCD6C5] bg-white shadow-sm flex items-center p-6 gap-4">
                <div className="h-10 w-10 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-heading text-[#0A1628]">{pendingTasksCount}</p>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Active Tasks</p>
                </div>
              </Card>

              <Card className="border border-[#DCD6C5] bg-white shadow-sm flex items-center p-6 gap-4">
                <div className="h-10 w-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-heading text-[#0A1628]">{totalBillable.toFixed(1)} hrs</p>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Total logged billable</p>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Task Board Column */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border border-[#DCD6C5] bg-white shadow-sm">
                  <CardHeader className="border-b border-[#DCD6C5]/30">
                    <CardTitle className="text-base font-heading text-[#0A1628]">Task Management Board</CardTitle>
                    <CardDescription className="text-xs text-gray-500">Update task status and report billable hours.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {tasks.length === 0 ? (
                      <div className="text-center py-10 text-xs text-gray-400 font-semibold">
                        No tasks assigned to your desk.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {tasks.map((task) => {
                          const overdue = isTaskOverdue(task);
                          return (
                            <div 
                              key={task.id} 
                              className={`p-4 rounded-lg border bg-white space-y-3 shadow-sm transition duration-200 ${
                                overdue 
                                  ? 'border-rose-300 bg-rose-50/20' 
                                  : 'border-[#DCD6C5]/40 hover:border-[#C9A84C]/50'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1 flex-1">
                                  <span className="text-[9px] text-gray-500 font-bold uppercase">Case: {task.case.caseNumber}</span>
                                  <h4 className="text-xs font-bold text-[#0A1628]">{task.title}</h4>
                                  <p className="text-[10px] text-gray-400 font-medium">Brief: {task.case.title}</p>
                                </div>
                                <div className="w-32 flex-shrink-0">
                                  <Select 
                                    value={task.status} 
                                    onValueChange={(val) => handleStatusChange(task.id, val || '')}
                                  >
                                    <SelectTrigger className="border-[#DCD6C5] text-[10px] h-8 bg-white font-semibold">
                                      <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                      <SelectItem value="TODO" className="text-xs">TODO</SelectItem>
                                      <SelectItem value="IN_PROGRESS" className="text-xs">IN PROGRESS</SelectItem>
                                      <SelectItem value="DONE" className="text-xs">DONE</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#DCD6C5]/30 pt-3 text-[10px]">
                                <div className="flex items-center gap-3 text-gray-500 font-medium">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3 text-gray-400" /> 
                                    Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'None'}
                                  </span>
                                  {overdue && (
                                    <span className="flex items-center gap-1 text-rose-600 font-bold bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">
                                      <AlertCircle className="h-3 w-3" /> OVERDUE
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  {editingTaskId === task.id ? (
                                    <div className="flex items-center gap-1.5">
                                      <Input
                                        type="number"
                                        step="0.5"
                                        placeholder="Hours"
                                        value={billableInput}
                                        onChange={(e) => setBillableInput(e.target.value)}
                                        className="h-7 w-20 text-[10px] border-[#DCD6C5]"
                                      />
                                      <Button
                                        onClick={() => handleLogHoursSubmit(task.id)}
                                        disabled={updatingTask}
                                        className="h-7 px-2.5 bg-[#0A1628] text-white text-[9px] font-bold"
                                      >
                                        Save
                                      </Button>
                                      <Button
                                        onClick={() => setEditingTaskId(null)}
                                        variant="outline"
                                        className="h-7 px-2 bg-white text-[9px] border-[#DCD6C5] font-bold text-gray-600"
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-500 font-medium">Logged: <strong className="text-[#0A1628]">{task.billableHours} hrs</strong></span>
                                      <button
                                        onClick={() => {
                                          setEditingTaskId(task.id);
                                          setBillableInput(String(task.billableHours));
                                        }}
                                        className="text-[#C9A84C] hover:underline font-bold"
                                      >
                                        Edit Hours
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Case Caseload Drawer Panel */}
              <div className="space-y-6">
                <Card className="border border-[#DCD6C5] bg-white shadow-sm">
                  <CardHeader className="border-b border-[#DCD6C5]/30">
                    <CardTitle className="text-base font-heading text-[#0A1628]">Assigned Caseload</CardTitle>
                    <CardDescription className="text-xs text-gray-500">Active hearings you are representing.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {cases.length === 0 ? (
                      <div className="text-center py-8 text-xs text-gray-400 font-semibold">
                        No cases assigned.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cases.map((c) => (
                          <div key={c.id} className="p-3 border border-[#DCD6C5]/30 rounded-lg space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[9px] text-gray-500 font-bold uppercase">{c.caseNumber}</span>
                                <h4 className="text-xs font-bold text-[#0A1628]">{c.title}</h4>
                              </div>
                              <span className="text-[9px] font-bold bg-[#0A1628]/5 text-[#0A1628] px-2 py-0.5 rounded-full border border-[#0A1628]/10">{c.type}</span>
                            </div>
                            
                            <div className="text-[10px] text-gray-600 space-y-1 border-t border-[#DCD6C5]/20 pt-2 font-medium">
                              <p><span className="text-gray-400">Court:</span> {c.court}</p>
                              <p><span className="text-gray-400">Hearing:</span> <strong className="text-rose-600">{c.nextHearing ? new Date(c.nextHearing).toLocaleDateString() : 'None'}</strong></p>
                              <p><span className="text-gray-400">Client:</span> {c.client.name} ({c.client.phone})</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
              {/* ── CASE FILES SECTION ── */}
              <div>
                <h3 className="text-base font-bold font-heading text-[#0A1628] mb-4 flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-[#C9A84C]" /> Case Files Vault
                </h3>
                <Card className="border border-[#DCD6C5] bg-white shadow-sm">
                  <CardHeader className="border-b border-[#DCD6C5]/30 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-heading text-[#0A1628]">Documents &amp; Evidence</CardTitle>
                        <CardDescription className="text-[11px] text-gray-500">
                          Files linked to your assigned cases
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                        <ShieldCheck className="h-3.5 w-3.5" /> Encrypted
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {documents.length === 0 ? (
                      <div className="text-center py-10">
                        <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-400 font-semibold">No files found for your cases.</p>
                        <p className="text-[10px] text-gray-300 mt-1">Admin will upload case documents here.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {documents.map((doc: any) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-[#DCD6C5]/50 hover:border-[#C9A84C]/40 bg-gray-50/50 transition"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="h-8 w-8 rounded-lg bg-[#0A1628]/5 flex items-center justify-center flex-shrink-0">
                                <FileText className="h-4 w-4 text-[#0A1628]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-[#0A1628] truncate">{doc.name}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                                    {doc.type}
                                  </span>
                                  {doc.case && (
                                    <span className="text-[9px] text-gray-500">📁 {doc.case.caseNumber}</span>
                                  )}
                                  <span className="text-[9px] text-gray-400">
                                    {new Date(doc.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-8 w-8 flex items-center justify-center rounded border border-[#DCD6C5] hover:border-[#C9A84C] text-[#0A1628] hover:text-[#C9A84C] transition flex-shrink-0 ml-2"
                              title="View file"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </main>
    </div>
  );
}
