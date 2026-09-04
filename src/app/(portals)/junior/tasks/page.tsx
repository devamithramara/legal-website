'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/providers';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Play,
  Paperclip,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Shield,
  FileText,
  BookOpen,
  PhoneCall,
  Gavel,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

interface TaskItem {
  id: string;
  caseId: string;
  title: string;
  type: string;
  priority: string;
  status: string;
  deadline: string | null;
  notes: string | null;
  billableHours: number;
  case: { caseNumber: string; title: string };
  junior?: { name: string };
}

export default function JuniorTasksPage() {
  const { toast } = useToast();

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch {
      toast('Failed to load assigned tasks.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast(`Task moved to ${newStatus}`, 'success');
        fetchTasks();
      } else {
        toast('Failed to update task status.', 'error');
      }
    } catch {
      toast('Network error updating task.', 'error');
    }
  };

  const handleStartTimer = async (taskId: string) => {
    try {
      const res = await fetch('/api/timelogs/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, category: 'RESEARCH' }),
      });

      if (res.ok) {
        toast('Task timer started! Track active session in Time Tracker.', 'success');
        fetchTasks();
      } else {
        toast('Failed to start timer.', 'error');
      }
    } catch {
      toast('Network error starting timer.', 'error');
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.case?.caseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
    return matchesSearch && matchesPriority && matchesType;
  });

  const columns = [
    { id: 'ASSIGNED', title: 'ASSIGNED', color: 'border-[#E2C044]/40 bg-slate-900/60' },
    { id: 'IN_PROGRESS', title: 'IN PROGRESS', color: 'border-cyan-500/40 bg-slate-900/60' },
    { id: 'REVIEW', title: 'REVIEW', color: 'border-purple-500/40 bg-slate-900/60' },
    { id: 'DONE', title: 'DONE', color: 'border-emerald-500/40 bg-slate-900/60' },
  ];

  const getTypeIcon = (type: string) => {
    if (type === 'DRAFT') return FileText;
    if (type === 'RESEARCH') return BookOpen;
    if (type === 'COURT') return Gavel;
    if (type === 'CLIENT_CALL') return PhoneCall;
    return CheckSquare;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-[#E2C044]" /> Task Kanban Board
          </h1>
          <p className="text-xs text-slate-300">
            Manage assigned legal tasks, start timers, and move tasks through senior review
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-48">
            <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
            <Input
              placeholder="Search task..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs border-slate-800 bg-slate-900 text-white rounded-xl"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 font-bold cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">URGENT (Red)</option>
            <option value="NORMAL">NORMAL (Blue)</option>
            <option value="LOW">LOW (Gray)</option>
          </select>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter(t => (t.status || 'ASSIGNED') === col.id);

          return (
            <div key={col.id} className={`rounded-2xl p-4 border ${col.color} min-h-[500px] flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                  <span className="text-xs font-extrabold text-white tracking-wider flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#E2C044]"></span>
                    {col.title}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-[#E2C044]">
                    {colTasks.length}
                  </span>
                </div>

                {/* Task Cards */}
                <div className="space-y-4">
                  {colTasks.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl text-[11px] text-slate-500 font-semibold">
                      No tasks in {col.title}
                    </div>
                  ) : (
                    colTasks.map((t) => {
                      const TypeIcon = getTypeIcon(t.type);
                      const isUrgent = t.priority === 'URGENT';
                      const deadlineFormatted = t.deadline
                        ? new Date(t.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        : 'No deadline';

                      return (
                        <div
                          key={t.id}
                          className={`glass-card rounded-xl p-4 border transition hover:border-[#E2C044]/60 ${
                            isUrgent ? 'border-rose-500/50 bg-rose-950/20' : 'border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-[#E2C044] bg-[#E2C044]/15 px-2 py-0.5 rounded-md">
                              📁 {t.case?.caseNumber}
                            </span>
                            <span
                              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                                t.priority === 'URGENT'
                                  ? 'bg-rose-600 text-white'
                                  : t.priority === 'NORMAL'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-700 text-slate-300'
                              }`}
                            >
                              {t.priority}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                            <TypeIcon className="h-3.5 w-3.5 text-[#E2C044]" />
                            {t.title}
                          </h4>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-2.5 mt-2">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-[#E2C044]" /> {deadlineFormatted}
                            </span>
                            <span>{t.billableHours} hrs</span>
                          </div>

                          {/* Column Move Actions */}
                          <div className="mt-3 pt-2 flex items-center justify-between gap-1 text-[10px]">
                            {col.id !== 'ASSIGNED' && (
                              <button
                                onClick={() => handleUpdateStatus(t.id, col.id === 'DONE' ? 'REVIEW' : col.id === 'REVIEW' ? 'IN_PROGRESS' : 'ASSIGNED')}
                                className="text-slate-400 hover:text-white"
                              >
                                ← Prev
                              </button>
                            )}

                            <button
                              onClick={() => handleStartTimer(t.id)}
                              className="text-[#E2C044] font-bold hover:underline flex items-center gap-1"
                            >
                              <Play className="h-2.5 w-2.5 fill-current" /> Timer
                            </button>

                            {col.id !== 'DONE' && (
                              <button
                                onClick={() => handleUpdateStatus(t.id, col.id === 'ASSIGNED' ? 'IN_PROGRESS' : col.id === 'IN_PROGRESS' ? 'REVIEW' : 'DONE')}
                                className="text-cyan-400 font-bold hover:underline"
                              >
                                Next →
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
