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

    </div>
  );
}
