'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/providers';
import { Inbox, FileText, BookOpen, GraduationCap, Clock, CheckCircle2, RotateCcw, Download } from 'lucide-react';

export default function SeniorReviewQueuePage() {
  const { toast } = useToast();

  const [queue, setQueue] = useState<any>({
    drafts: [],
    researchLogs: [],
    learningItems: [],
    timeLogs: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'DRAFTS' | 'RESEARCH' | 'LEARNING' | 'TIMESHEETS'>('DRAFTS');

  // Review action modal / inline feedback state
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [reviewComments, setReviewComments] = useState('');

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/review/queue');
      if (res.ok) {
        const data = await res.json();
        if (data.queue) setQueue(data.queue);
      }
    } catch {
      toast('Failed to load review queue.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleReviewDraft = async (draftId: string, status: 'APPROVED' | 'REDO') => {
    try {
      const res = await fetch(`/api/drafts/${draftId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, comments: reviewComments }),
      });

      if (res.ok) {
        toast(`Draft marked as ${status}!`, 'success');
        setSelectedDraftId(null);
        setReviewComments('');
        fetchQueue();
      } else {
        toast('Failed to submit review.', 'error');
      }
    } catch {
      toast('Network error submitting review.', 'error');
    }
  };

  const handleApproveResearch = async (id: string, approved: boolean) => {
    try {
      const res = await fetch(`/api/research/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      });

      if (res.ok) {
        toast(`Research note ${approved ? 'APPROVED' : 'REJECTED'}!`, 'success');
        fetchQueue();
      }
    } catch {
      toast('Network error approving research.', 'error');
    }
  };

  const handleReviewLearning = async (id: string, status: 'REVIEWED' | 'REDO') => {
    try {
      const res = await fetch(`/api/learning/${id}/summary`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: 'Senior reviewed', status }),
      });

      if (res.ok) {
        toast(`Learning summary marked as ${status}!`, 'success');
        fetchQueue();
      }
    } catch {
      toast('Network error updating learning item.', 'error');
    }
  };

  const handleApproveTimeLog = async (id: string, approved: boolean) => {
    try {
      const res = await fetch('/api/timelogs/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logIds: [id], approved }),
      });

      if (res.ok) {
        toast(`Time log entry ${approved ? 'APPROVED' : 'REJECTED'}!`, 'success');
        fetchQueue();
      }
    } catch {
      toast('Network error approving time log.', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      <div>
        <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
          <Inbox className="h-6 w-6 text-[#C9A84C]" /> Unified Junior Review Queue
        </h1>
        <p className="text-xs text-slate-300">
          Review, comment, approve, or request REDO on all submissions across your junior advocate team
        </p>
      </div>

      {/* TABS HEADER */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('DRAFTS')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'DRAFTS'
              ? 'bg-[#C9A84C] text-[#0A1628] shadow-lg'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <FileText className="h-4 w-4" /> Legal Drafts ({queue.drafts?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('RESEARCH')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'RESEARCH'
              ? 'bg-[#C9A84C] text-[#0A1628] shadow-lg'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <BookOpen className="h-4 w-4" /> Research Notes ({queue.researchLogs?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('LEARNING')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'LEARNING'
              ? 'bg-[#C9A84C] text-[#0A1628] shadow-lg'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <GraduationCap className="h-4 w-4" /> Learning Summaries ({queue.learningItems?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('TIMESHEETS')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'TIMESHEETS'
              ? 'bg-[#C9A84C] text-[#0A1628] shadow-lg'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Clock className="h-4 w-4" /> Timesheet Logs ({queue.timeLogs?.length || 0})
        </button>
      </div>

      {/* TAB CONTENT */}
      <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 border-4 border-slate-800 border-t-[#C9A84C] rounded-full animate-spin" />
          </div>
        ) : (
          <div>
            {/* DRAFTS TAB */}
            {activeTab === 'DRAFTS' && (
              <div className="space-y-4 text-xs">
                {queue.drafts?.length === 0 ? (
                  <p className="text-slate-400 italic text-center py-10">No pending legal drafts awaiting review.</p>
                ) : (
                  queue.drafts?.map((d: any) => (
                    <div key={d.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="font-extrabold text-white text-sm">{d.title}</p>
                          <p className="text-[10px] text-slate-400">📁 Case: {d.case?.caseNumber} · Junior: {d.junior?.name}</p>
                        </div>
                        <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-[#C9A84C] font-bold hover:underline flex items-center gap-1">
                          <Download className="h-3.5 w-3.5" /> Download Draft PDF
                        </a>
                      </div>

                      {selectedDraftId === d.id ? (
                        <div className="space-y-3 pt-2">
                          <Textarea
                            placeholder="Add senior feedback notes for junior advocate..."
                            value={reviewComments}
                            onChange={(e) => setReviewComments(e.target.value)}
                            className="border-slate-800 bg-slate-900 text-white text-xs rounded-xl"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleReviewDraft(d.id, 'APPROVED')} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
                              Approve Draft
                            </Button>
                            <Button size="sm" onClick={() => handleReviewDraft(d.id, 'REDO')} className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs">
                              Request REDO
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setSelectedDraftId(null)} className="border-slate-800 text-slate-300 text-xs">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedDraftId(d.id);
                            setReviewComments('');
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4"
                        >
                          Review & Comment
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* RESEARCH TAB */}
            {activeTab === 'RESEARCH' && (
              <div className="space-y-4 text-xs">
                {queue.researchLogs?.length === 0 ? (
                  <p className="text-slate-400 italic text-center py-10">No research entries pending approval.</p>
                ) : (
                  queue.researchLogs?.map((r: any) => (
                    <div key={r.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-white">📁 Case: {r.case?.caseNumber} · Advocate: {r.junior?.name}</span>
                        <span className="bg-[#C9A84C]/15 text-[#C9A84C] px-2 py-0.5 rounded font-bold text-[10px]">{r.source}</span>
                      </div>
                      <p className="text-[#C9A84C] font-bold">Citations: {r.citations?.join(' | ') || 'N/A'}</p>
                      <p className="text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800">{r.summary}</p>
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" onClick={() => handleApproveResearch(r.id, true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
                          Approve Note
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* LEARNING TAB */}
            {activeTab === 'LEARNING' && (
              <div className="space-y-4 text-xs">
                {queue.learningItems?.length === 0 ? (
                  <p className="text-slate-400 italic text-center py-10">No learning summaries submitted for review.</p>
                ) : (
                  queue.learningItems?.map((l: any) => (
                    <div key={l.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-white">{l.title}</span>
                        <span className="text-slate-400 text-[10px]">Submitted by: {l.junior?.name}</span>
                      </div>
                      <p className="text-slate-200 bg-slate-900 p-3 rounded-lg border border-slate-800">{l.summary}</p>
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" onClick={() => handleReviewLearning(l.id, 'REVIEWED')} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
                          Mark Understood
                        </Button>
                        <Button size="sm" onClick={() => handleReviewLearning(l.id, 'REDO')} className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs">
                          Request REDO
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TIMESHEETS TAB */}
            {activeTab === 'TIMESHEETS' && (
              <div className="space-y-4 text-xs">
                {queue.timeLogs?.length === 0 ? (
                  <p className="text-slate-400 italic text-center py-10">No pending time log entries for approval.</p>
                ) : (
                  queue.timeLogs?.map((t: any) => (
                    <div key={t.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">{t.junior?.name} → {t.task?.title}</p>
                        <p className="text-[10px] text-slate-400">Category: {t.category} · Duration: {t.duration || 0} hrs</p>
                      </div>
                      <Button size="sm" onClick={() => handleApproveTimeLog(t.id, true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
                        Approve Log
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </Card>

    </div>
  );
}
