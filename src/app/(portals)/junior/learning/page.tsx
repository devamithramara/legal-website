'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/providers';
import { GraduationCap, Award, BookOpen, CheckCircle2, ExternalLink } from 'lucide-react';

export default function JuniorLearningPage() {
  const { toast } = useToast();

  const [learningItems, setLearningItems] = useState<any[]>([]);
  const [skillTags, setSkillTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Summary submission state
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [summaryText, setSummaryText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [learnRes, tagsRes] = await Promise.all([
        fetch('/api/learning'),
        fetch('/api/skilltags'),
      ]);

      if (learnRes.ok) {
        const lData = await learnRes.json();
        if (lData.learningItems) setLearningItems(lData.learningItems);
      }

      if (tagsRes.ok) {
        const tData = await tagsRes.json();
        if (tData.tags) setSkillTags(tData.tags);
      }
    } catch {
      toast('Failed to load learning board.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitSummary = async (itemId: string) => {
    if (!summaryText || summaryText.length < 15) {
      toast('Please provide a min 3-line summary (at least 15 chars).', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/learning/${itemId}/summary`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: summaryText, status: 'READ' }),
      });

      if (res.ok) {
        toast('Learning summary submitted! Status updated to READ.', 'success');
        setActiveItemId(null);
        setSummaryText('');
        fetchData();
      } else {
        toast('Failed to submit summary.', 'error');
      }
    } catch {
      toast('Network error submitting summary.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      <div>
        <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-[#E2C044]" /> Junior Professional Learning & Skill Board
        </h1>
        <p className="text-xs text-slate-300">
          Review senior-assigned precedents, bare acts, procedural guides, and view earned skill badges
        </p>
      </div>

      {/* SKILL TAGS BADGES PANEL */}
      <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Award className="h-4 w-4 text-[#E2C044]" /> Earned Skill Badges (Senior Approved)
          </span>
          <span className="text-[10px] text-slate-400 font-bold">Read Only</span>
        </div>

        {skillTags.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No skill tags assigned yet. Complete tasks and drafts to earn badges from senior counsel.</p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {skillTags.map((tag) => (
              <span
                key={tag.id}
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#E2C044]/20 to-[#F59E0B]/20 border border-[#E2C044]/40 text-[#E2C044] font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-[#E2C044]/10"
              >
                🏆 {tag.tag}
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* ASSIGNED LEARNING ITEMS LIST */}
      <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
        <h3 className="text-base font-bold font-heading text-white mb-4">Assigned Precedents & Reading Items</h3>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-7 w-7 border-3 border-slate-800 border-t-[#E2C044] rounded-full animate-spin" />
          </div>
        ) : learningItems.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500 font-semibold">
            No learning items assigned yet.
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {learningItems.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-sm">{item.title}</span>
                  <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    item.status === 'REVIEWED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' :
                    item.status === 'READ' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' :
                    'bg-amber-950 text-amber-400 border border-amber-500/40'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-[#E2C044]/15 text-[#E2C044] px-2 py-0.5 rounded font-bold text-[10px] uppercase">
                    {item.type}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 break-all">
                  <p className="font-bold text-white mb-1">Content / URL:</p>
                  <a href={item.content} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline inline-flex items-center gap-1">
                    {item.content} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {item.summary ? (
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <p className="font-bold text-[#E2C044] mb-1">Submitted 3-Line Summary:</p>
                    <p className="text-slate-200">{item.summary}</p>
                  </div>
                ) : (
                  <div>
                    {activeItemId === item.id ? (
                      <div className="space-y-2 pt-2">
                        <Textarea
                          placeholder="Submit 3-line summary of principles learned..."
                          value={summaryText}
                          onChange={(e) => setSummaryText(e.target.value)}
                          className="border-slate-800 bg-slate-900 text-white text-xs rounded-xl min-h-[80px]"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSubmitSummary(item.id)}
                            disabled={submitting}
                            className="bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] font-extrabold text-xs px-4"
                          >
                            Submit Summary
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveItemId(null)}
                            className="border-slate-800 text-slate-300 text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => {
                          setActiveItemId(item.id);
                          setSummaryText('');
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-1.5 rounded-xl"
                      >
                        Submit Reading Summary
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
}
