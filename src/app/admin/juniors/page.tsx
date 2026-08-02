'use client';

import React, { useState, useEffect } from 'react';
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
  X
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

  // Task allocation Modal State
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskJuniorId, setTaskJuniorId] = useState('');
  const [taskCaseId, setTaskCaseId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [submittingTask, setSubmittingTask] = useState(false);

  // Add Junior/Intern Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<'JUNIOR' | 'INTERN'>('JUNIOR');
  const [newDesignation, setNewDesignation] = useState('');
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

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

  // ── Task Allocation ────────────────────────────────────────────────────────

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
    } catch (err) {
      toast('Network error allocating task.', 'error');
    } finally {
      setSubmittingTask(false);
    }
  };

  // ── Add Junior / Intern ────────────────────────────────────────────────────

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
    } catch (err) {
      toast('Network error adding team member.', 'error');
    } finally {
      setSubmittingAdd(false);
    }
  };

  // ── Remove Junior / Intern ─────────────────────────────────────────────────

  const handleRemove = async () => {
    if (!removeTarget) return;

    setRemovingId(removeTarget.id);
    try {
      const res = await fetch(`/api/juniors?id=${removeTarget.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast(`${removeTarget.name} has been removed from the team.`, 'success');
        setRemoveTarget(null);
        fetchData();
      } else {
        toast(data.error || 'Failed to remove team member.', 'error');
      }
    } catch (err) {
      toast('Network error removing team member.', 'error');
    } finally {
      setRemovingId(null);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getLoadBadge = (count: number) => {
    if (count >= 3) {
      return <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-rose-100 bg-rose-50 text-rose-600">High Load</span>;
    }
    if (count >= 1) {
      return <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-blue-100 bg-blue-50 text-blue-600">Active</span>;
    }
    return <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 bg-emerald-50 text-emerald-600">Available</span>;
  };

  const getRoleBadge = (role: string) => {
    if (role === 'INTERN') {
      return (
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-violet-200 bg-violet-50 text-violet-600 flex items-center gap-1">
          <GraduationCap className="h-2.5 w-2.5" /> Intern
        </span>
      );
    }
    return (
      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-sky-200 bg-sky-50 text-sky-600 flex items-center gap-1">
        <Shield className="h-2.5 w-2.5" /> Junior
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-[#0A1628]">Team Members</h2>
          <p className="text-xs text-gray-500 font-medium">Manage junior advocates, interns, workloads, and task allocations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => { setAddModalOpen(true); setGeneratedPassword(null); }}
            variant="outline"
            className="border-[#DCD6C5] hover:border-[#0A1628] hover:bg-slate-50 text-xs font-semibold px-4 flex items-center gap-1.5 text-gray-700 bg-white"
          >
            <UserPlus className="h-4 w-4 text-[#C9A84C]" /> Add Member
          </Button>
          <Button 
            onClick={() => setTaskModalOpen(true)}
            className="bg-[#0A1628] hover:bg-[#0A1628]/95 text-white text-xs font-semibold px-4 flex items-center gap-1.5"
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
          {/* Team Members list */}
          <div className="lg:col-span-8">
            <Card className="border border-[#DCD6C5] bg-white shadow-sm overflow-hidden">
              <CardHeader className="border-b border-[#DCD6C5]/30">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#0A1628] flex items-center gap-2">
                  <UsersRound className="h-4.5 w-4.5 text-[#C9A84C]" /> Team Roster & Workload
                </CardTitle>
                <CardDescription className="text-[10px]">
                  {juniors.filter(j => j.role === 'JUNIOR').length} Junior{juniors.filter(j => j.role === 'JUNIOR').length !== 1 ? 's' : ''} · {juniors.filter(j => j.role === 'INTERN').length} Intern{juniors.filter(j => j.role === 'INTERN').length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {juniors.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <UserPlus className="h-10 w-10 text-[#C9A84C] mx-auto opacity-50" />
                    <p className="text-xs text-gray-400 font-semibold">No team members registered yet.</p>
                    <Button 
                      onClick={() => { setAddModalOpen(true); setGeneratedPassword(null); }}
                      variant="outline"
                      className="border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C]/5 text-xs font-bold"
                    >
                      <UserPlus className="h-3.5 w-3.5 mr-1" /> Add First Member
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#DCD6C5]/40 text-xs">
                      <thead className="bg-gray-50/70 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                        <tr>
                          <th className="px-6 py-3.5 text-left">Member</th>
                          <th className="px-6 py-3.5 text-left">Role</th>
                          <th className="px-6 py-3.5 text-left">Caseload</th>
                          <th className="px-6 py-3.5 text-left">Tasks</th>
                          <th className="px-6 py-3.5 text-left">Hours</th>
                          <th className="px-6 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DCD6C5]/30 bg-white">
                        {juniors.map((j) => (
                          <tr key={j.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-6 py-4">
                              <p className="font-bold text-[#0A1628]">{j.name}</p>
                              <p className="text-[10px] text-gray-400 font-medium">{j.email}</p>
                              {j.phone && <p className="text-[10px] text-gray-400 font-medium">{j.phone}</p>}
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                {getRoleBadge(j.role)}
                                <p className="text-[10px] text-gray-500 font-medium">{j.designation}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 space-y-1">
                              <p className="font-semibold text-gray-600">{j.caseloadCount} Active</p>
                              {getLoadBadge(j.caseloadCount)}
                            </td>
                            <td className="px-6 py-4 font-semibold text-gray-600">
                              <p>{j.pendingTasks} Pending</p>
                              <p className="text-[10px] text-gray-400 font-medium">({j.totalTasks} total)</p>
                            </td>
                            <td className="px-6 py-4 font-bold text-[#0A1628]">
                              {j.billableHours.toFixed(1)} hrs
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => setRemoveTarget(j)}
                                className="text-gray-400 hover:text-rose-600 transition p-1.5 rounded hover:bg-rose-50"
                                title={`Remove ${j.name}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
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

          {/* Task board timeline */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border border-[#DCD6C5] bg-white shadow-sm">
              <CardHeader className="border-b border-[#DCD6C5]/30">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#0A1628] flex items-center gap-2">
                  <Sliders className="h-4.5 w-4.5 text-[#C9A84C]" /> Active Allocation Feed
                </CardTitle>
                <CardDescription className="text-[10px]">Track newest allocated case assignments</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {tasks.length === 0 ? (
                  <p className="text-center py-6 text-xs text-gray-400 italic font-semibold">No active tasks.</p>
                ) : (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                    {tasks.map((task) => (
                      <div key={task.id} className="p-3 border border-[#DCD6C5]/20 rounded bg-[#F5F0E8]/30 text-[11px] space-y-2">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <p className="font-bold text-[#0A1628]">{task.title}</p>
                            <p className="text-[10px] text-gray-500 font-semibold">Advocate: {task.junior.name}</p>
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            task.status === 'DONE' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>{task.status}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-gray-500 border-t border-[#DCD6C5]/20 pt-2 font-medium">
                          <span>CNR: {task.case.caseNumber}</span>
                          <span>Logged: {task.billableHours} hrs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ─── ADD MEMBER DIALOG ──────────────────────────────────────────────── */}
      <Dialog open={addModalOpen} onOpenChange={(open) => { setAddModalOpen(open); if (!open) setGeneratedPassword(null); }}>
        <DialogContent className="bg-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-[#0A1628]">Add Team Member</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">Register a new junior advocate or intern to the firm.</DialogDescription>
          </DialogHeader>

          {generatedPassword ? (
            // Show credentials after successful creation
            <div className="space-y-4 py-2">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-emerald-700">Member Added Successfully!</p>
              </div>
              <div className="bg-[#F5F0E8] border border-[#DCD6C5] rounded-lg p-4 space-y-2">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Login Credentials</p>
                <div className="space-y-1 text-xs">
                  <p><span className="text-gray-500">Email:</span> <strong className="text-[#0A1628]">{newEmail || 'See above'}</strong></p>
                  <p><span className="text-gray-500">Temporary Password:</span> <strong className="text-[#0A1628] font-mono">{generatedPassword}</strong></p>
                </div>
                <p className="text-[10px] text-amber-600 font-semibold mt-2">
                  ⚠ Please share these credentials securely. The member should change their password after first login.
                </p>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => { setAddModalOpen(false); setGeneratedPassword(null); }}
                  className="bg-[#0A1628] text-white hover:bg-[#0A1628]/95 text-xs font-semibold w-full"
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleAddMember} className="space-y-4">
              {/* Role selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewRole('JUNIOR')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-xs font-bold transition duration-150 ${
                    newRole === 'JUNIOR'
                      ? 'bg-[#0A1628] text-white border-[#0A1628]'
                      : 'bg-white text-gray-600 border-[#DCD6C5] hover:border-[#0A1628]/50'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" /> Junior Advocate
                </button>
                <button
                  type="button"
                  onClick={() => setNewRole('INTERN')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-xs font-bold transition duration-150 ${
                    newRole === 'INTERN'
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white text-gray-600 border-[#DCD6C5] hover:border-violet-400'
                  }`}
                >
                  <GraduationCap className="h-3.5 w-3.5" /> Intern
                </button>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mName" className="text-xs font-bold text-gray-600">Full Name *</Label>
                <Input 
                  id="mName" 
                  placeholder="e.g. Priya Sharma" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  className="border-[#DCD6C5] text-xs bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mEmail" className="text-xs font-bold text-gray-600">Email Address *</Label>
                <Input 
                  id="mEmail" 
                  type="email"
                  placeholder="priya@mlrassociates.in" 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)} 
                  className="border-[#DCD6C5] text-xs bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="mPhone" className="text-xs font-bold text-gray-600">Phone</Label>
                  <Input 
                    id="mPhone" 
                    placeholder="+91 98765..." 
                    value={newPhone} 
                    onChange={(e) => setNewPhone(e.target.value)} 
                    className="border-[#DCD6C5] text-xs bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mDesig" className="text-xs font-bold text-gray-600">Designation</Label>
                  <Input 
                    id="mDesig" 
                    placeholder={newRole === 'INTERN' ? 'e.g. Law Intern' : 'e.g. Associate'} 
                    value={newDesignation} 
                    onChange={(e) => setNewDesignation(e.target.value)} 
                    className="border-[#DCD6C5] text-xs bg-white"
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 text-[10px] text-gray-500 font-medium">
                A login password will be auto-generated and displayed after creation. Share it securely with the new member.
              </div>

              <DialogFooter className="pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setAddModalOpen(false)}
                  className="border-[#DCD6C5] text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submittingAdd}
                  className="bg-[#0A1628] text-white hover:bg-[#0A1628]/95 text-xs font-semibold"
                >
                  {submittingAdd ? 'Adding...' : `Add ${newRole === 'INTERN' ? 'Intern' : 'Junior'}`}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── REMOVE CONFIRMATION DIALOG ─────────────────────────────────────── */}
      <Dialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <DialogContent className="bg-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-[#0A1628]">Remove Team Member</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {removeTarget && (
            <div className="space-y-4 py-2">
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 space-y-2 text-center">
                <Trash2 className="h-8 w-8 text-rose-500 mx-auto" />
                <p className="text-sm font-bold text-rose-700">
                  Remove {removeTarget.name}?
                </p>
                <p className="text-[11px] text-rose-600 font-medium">
                  {removeTarget.role === 'INTERN' ? 'Intern' : 'Junior Advocate'} · {removeTarget.email}
                </p>
              </div>

              {(removeTarget.caseloadCount > 0 || removeTarget.totalTasks > 0) && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-700 font-medium space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> Warning
                  </p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {removeTarget.caseloadCount > 0 && (
                      <li>{removeTarget.caseloadCount} case{removeTarget.caseloadCount > 1 ? 's' : ''} will be unassigned</li>
                    )}
                    {removeTarget.totalTasks > 0 && (
                      <li>{removeTarget.totalTasks} task{removeTarget.totalTasks > 1 ? 's' : ''} will be deleted</li>
                    )}
                  </ul>
                </div>
              )}

              <DialogFooter className="gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setRemoveTarget(null)}
                  className="border-[#DCD6C5] text-xs font-semibold flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleRemove}
                  disabled={removingId === removeTarget.id}
                  className="bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold flex-1 flex items-center justify-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  {removingId === removeTarget.id ? 'Removing...' : 'Remove'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── ALLOCATE TASK DIALOG ───────────────────────────────────────────── */}
      <Dialog open={taskModalOpen} onOpenChange={setTaskModalOpen}>
        <DialogContent className="bg-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-[#0A1628]">Allocate Counsel Task</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">Log a procedural task brief for junior representation.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tJunior" className="text-xs font-bold text-gray-600">Select Advocate</Label>
              <Select value={taskJuniorId} onValueChange={(val) => setTaskJuniorId(val || '')}>
                <SelectTrigger className="border-[#DCD6C5] text-xs bg-white">
                  <SelectValue placeholder="Junior Advocate / Intern" />
                </SelectTrigger>
                <SelectContent className="bg-white text-xs">
                  {juniors.map((j) => (
                    <SelectItem key={j.id} value={j.id} className="text-xs">
                      {j.name} <span className="text-gray-400 ml-1">({j.role === 'INTERN' ? 'Intern' : 'Junior'})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tCase" className="text-xs font-bold text-gray-600">Associated Court Case</Label>
              <Select value={taskCaseId} onValueChange={(val) => setTaskCaseId(val || '')}>
                <SelectTrigger className="border-[#DCD6C5] text-xs bg-white">
                  <SelectValue placeholder="Case Folder" />
                </SelectTrigger>
                <SelectContent className="bg-white text-xs">
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">{c.caseNumber} - {c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tTitle" className="text-xs font-bold text-gray-600">Task Title / Brief</Label>
              <Input 
                id="tTitle" 
                placeholder="e.g. Draft Written Statement" 
                value={taskTitle} 
                onChange={(e) => setTaskTitle(e.target.value)} 
                className="border-[#DCD6C5] text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tDeadline" className="text-xs font-bold text-gray-600">Deadline (Optional)</Label>
              <Input 
                id="tDeadline" 
                type="date" 
                value={taskDeadline} 
                onChange={(e) => setTaskDeadline(e.target.value)} 
                className="border-[#DCD6C5] text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setTaskModalOpen(false)}
                className="border-[#DCD6C5] text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submittingTask}
                className="bg-[#0A1628] text-white hover:bg-[#0A1628]/95 text-xs font-semibold"
              >
                {submittingTask ? 'Allocating...' : 'Allocate Task'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
