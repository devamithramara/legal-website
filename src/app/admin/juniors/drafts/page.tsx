'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/providers';
import { FileText, Download, CheckCircle2, RotateCcw, MessageSquare } from 'lucide-react';

export default function AdminDraftsReviewPage() {
  const { toast } = useToast();

  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Inline Comment Review State
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState('APPROVED');
  const [reviewComments, setReviewComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDrafts = async () => {
    try {
      const res = await fetch('/api/drafts');
      if (res.ok) {
        const data = await res.json();
        if (data.drafts) setDrafts(data.drafts);
      }
    } catch {
      toast('Failed to load submitted drafts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleReviewDraft = async (draftId: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/drafts/${draftId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: reviewStatus, comments: reviewComments }),
      });

      if (res.ok) {
        toast(`Draft review saved! Status set to ${reviewStatus}`, 'success');
        setSelectedDraftId(null);
        setReviewComments('');
        fetchDrafts();
      } else {
        toast('Failed to submit review.', 'error');
      }
    } catch {
      toast('Network error submitting review.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-2xl font-bold font-heading text-[#0A1628]">Senior Counsel Draft Review Desk</h2>
        <p className="text-xs text-slate-500 font-medium">Review petitions, affidavits, and vakalatnamas submitted by junior advocates</p>
      </div>

      <Card className="border border-[#DCD6C5] bg-white shadow-sm p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-7 w-7 border-3 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin" />
          </div>
        ) : drafts.length === 0 ? (
          <div className="text-center py-10 text-xs text-gray-400 font-semibold italic">
            No drafts submitted for senior review.
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {drafts.map((d) => (
              <div key={d.id} className="p-4 rounded-xl border border-[#DCD6C5] bg-slate-50/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-extrabold text-[#0A1628] text-sm">{d.title}</span>
                    <span className="text-[10px] text-gray-500 font-bold ml-2">📁 Case {d.case?.caseNumber} · Junior: {d.junior?.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#C9A84C] bg-[#C9A84C]/15 px-2 py-0.5 rounded">
                      v{d.version} ({d.type})
                    </span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      d.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                      d.status === 'REDO' ? 'bg-amber-100 text-amber-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {d.status}
                    </span>
                    <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-sky-600 font-bold hover:underline flex items-center gap-1 text-[11px]">
                      <Download className="h-3.5 w-3.5" /> Download
                    </a>
                  </div>
                </div>

                {d.comments && (
                  <div className="p-3 rounded-lg bg-white border border-[#DCD6C5]/60 text-gray-700">
                    <p className="font-bold text-[#0A1628] text-[10px] uppercase">Senior Comments:</p>
                    <p className="text-xs">{d.comments}</p>
                  </div>
                )}

                {selectedDraftId === d.id ? (
                  <div className="p-3 rounded-lg bg-white border border-[#0A1628]/30 space-y-3">
                    <div className="flex items-center gap-4">
                      <Label className="font-bold text-gray-700">Review Outcome:</Label>
                      <label className="flex items-center gap-1 font-bold text-emerald-700 cursor-pointer">
                        <input type="radio" name="st" value="APPROVED" checked={reviewStatus === 'APPROVED'} onChange={() => setReviewStatus('APPROVED')} /> Approve
                      </label>
                      <label className="flex items-center gap-1 font-bold text-amber-700 cursor-pointer">
                        <input type="radio" name="st" value="REDO" checked={reviewStatus === 'REDO'} onChange={() => setReviewStatus('REDO')} /> Request REDO
                      </label>
                    </div>

                    <Textarea
                      placeholder="Add inline senior feedback comments for junior advocate..."
                      value={reviewComments}
                      onChange={(e) => setReviewComments(e.target.value)}
                      className="text-xs border-[#DCD6C5]"
                    />

                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => setSelectedDraftId(null)} className="text-xs">
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => handleReviewDraft(d.id)} disabled={submitting} className="bg-[#0A1628] text-white text-xs font-bold">
                        Save Review
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedDraftId(d.id);
                      setReviewStatus('APPROVED');
                      setReviewComments(d.comments || '');
                    }}
                    className="border-[#DCD6C5] text-xs font-bold"
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1 text-[#C9A84C]" /> Add Senior Review / Comments
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
}
