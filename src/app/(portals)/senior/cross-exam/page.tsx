'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers';
import { Scale, Plus, AlertTriangle, GripVertical, ChevronDown, ChevronRight, Printer } from 'lucide-react';

export default function SeniorCrossExamPage() {
  const { toast } = useToast();
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [builders, setBuilders] = useState<any[]>([]);
  const [selectedBuilder, setSelectedBuilder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Witness form
  const [witnessName, setWitnessName] = useState('');
  const [witnessRole, setWitnessRole] = useState('PW1');

  // Question form
  const [qTheme, setQTheme] = useState('GENERAL');
  const [qText, setQText] = useState('');
  const [qExpectedAnswer, setQExpectedAnswer] = useState('');
  const [qFollowUp, setQFollowUp] = useState('');
  const [qIsTrap, setQIsTrap] = useState(false);

  const [collapsedThemes, setCollapsedThemes] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    try {
      const [casesRes, buildersRes] = await Promise.all([
        fetch('/api/cases'),
        fetch('/api/cross-exam'),
      ]);
      if (casesRes.ok) {
        const d = await casesRes.json();
        setCases(d);
        if (d.length > 0 && !selectedCaseId) setSelectedCaseId(d[0].id);
      }
      if (buildersRes.ok) {
        const d = await buildersRes.json();
        setBuilders(d.builders || []);
      }
    } catch {
      toast('Failed to load cross-exam data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const fetchBuilderForCase = async (caseId: string) => {
    try {
      const res = await fetch(`/api/cross-exam?caseId=${caseId}`);
      if (res.ok) {
        const d = await res.json();
        setBuilders(d.builders || []);
        setSelectedBuilder(null);
      }
    } catch {}
  };

  const handleAddWitness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!witnessName || !selectedCaseId) return;
    try {
      const res = await fetch('/api/cross-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: selectedCaseId, witnessName, witnessRole }),
      });
      if (res.ok) {
        toast(`Witness ${witnessName} (${witnessRole}) added!`, 'success');
        setWitnessName('');
        fetchBuilderForCase(selectedCaseId);
      }
    } catch {
      toast('Failed to add witness.', 'error');
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuilder || !qText) return;
    try {
      const res = await fetch(`/api/cross-exam/${selectedBuilder.id}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: qTheme,
          question: qText,
          expectedAnswer: qExpectedAnswer,
          followUp: qFollowUp,
          isTrap: qIsTrap,
        }),
      });
      if (res.ok) {
        toast('Question added!', 'success');
        setQText('');
        setQExpectedAnswer('');
        setQFollowUp('');
        setQIsTrap(false);
        fetchBuilderForCase(selectedCaseId);
        // Refresh selected builder
        const updated = await (await fetch(`/api/cross-exam?caseId=${selectedCaseId}`)).json();
        const found = updated.builders?.find((b: any) => b.id === selectedBuilder.id);
        if (found) setSelectedBuilder(found);
      }
    } catch {
      toast('Failed to add question.', 'error');
    }
  };

  const toggleTheme = (theme: string) => {
    setCollapsedThemes(prev => {
      const next = new Set(prev);
      if (next.has(theme)) next.delete(theme);
      else next.add(theme);
      return next;
    });
  };

  const groupByTheme = (questions: any[]) => {
    const groups: Record<string, any[]> = {};
    questions.forEach(q => {
      if (!groups[q.theme]) groups[q.theme] = [];
      groups[q.theme].push(q);
    });
    return groups;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
          <Scale className="h-6 w-6 text-[#C9A84C]" /> Cross-Examination Builder
        </h1>
        <p className="text-xs text-slate-300">Build structured cross-examination question banks by witness, grouped by theme, with trap question highlighting</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Case & Witness Selection */}
        <div className="lg:col-span-4 space-y-5">
          {/* Case Selector */}
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 text-xs">
            <Label className="font-bold text-[#F3E5AB] mb-2 block">Select Case</Label>
            <select
              value={selectedCaseId}
              onChange={e => {
                setSelectedCaseId(e.target.value);
                fetchBuilderForCase(e.target.value);
              }}
              className="w-full h-10 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl"
            >
              {cases.map(c => <option key={c.id} value={c.id}>{c.caseNumber} — {c.title}</option>)}
            </select>
          </Card>

          {/* Add Witness Form */}
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 text-xs">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#C9A84C]" /> Add Witness
            </h3>
            <form onSubmit={handleAddWitness} className="space-y-3">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Witness Name *</Label>
                <Input placeholder="e.g. Ramesh Kumar" value={witnessName} onChange={e => setWitnessName(e.target.value)} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl" required />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Witness Role</Label>
                <select value={witnessRole} onChange={e => setWitnessRole(e.target.value)} className="w-full h-9 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl">
                  {['PW1', 'PW2', 'DW1', 'DW2', 'Expert', 'Complainant', 'IO'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <Button type="submit" className="w-full bg-[#C9A84C] text-[#0A1628] font-bold text-xs rounded-xl">Add Witness</Button>
            </form>
          </Card>

          {/* Witness List */}
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 text-xs">
            <h3 className="font-bold text-white mb-3">Witnesses for this Case</h3>
            {builders.length === 0 ? (
              <p className="text-slate-400 italic">No witnesses added yet.</p>
            ) : (
              <div className="space-y-2">
                {builders.map(b => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBuilder(b)}
                    className={`p-3 rounded-xl border cursor-pointer transition ${selectedBuilder?.id === b.id ? 'bg-[#C9A84C]/20 border-[#C9A84C] text-white' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600'}`}
                  >
                    <p className="font-extrabold">{b.witnessName}</p>
                    <p className="text-[10px] text-slate-400">{b.witnessRole} · {b.questions?.length || 0} questions</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Panel: Question Builder */}
        <div className="lg:col-span-8 space-y-5">
          {!selectedBuilder ? (
            <div className="flex flex-col items-center justify-center h-64 rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 text-slate-400 text-sm gap-3">
              <Scale className="h-10 w-10 text-slate-600" />
              <p>Select a witness from the left panel to build cross-examination questions</p>
            </div>
          ) : (
            <>
              {/* Add Question Form */}
              <Card className="border border-[#C9A84C]/30 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white text-sm">
                    Build Questions: <span className="text-[#C9A84C]">{selectedBuilder.witnessName}</span> ({selectedBuilder.witnessRole})
                  </h3>
                  <Button size="sm" onClick={() => window.print()} variant="outline" className="border-slate-700 text-slate-300 text-[10px] flex items-center gap-1">
                    <Printer className="h-3.5 w-3.5" /> Print Court Sheet
                  </Button>
                </div>

                <form onSubmit={handleAddQuestion} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="font-bold text-[#F3E5AB]">Theme / Category</Label>
                      <Input placeholder="e.g. Credibility, Identity, Scene" value={qTheme} onChange={e => setQTheme(e.target.value)} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl" />
                    </div>
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={qIsTrap} onChange={e => setQIsTrap(e.target.checked)} className="h-4 w-4 accent-rose-500" />
                        <span className="font-bold text-rose-400">Mark as Trap Question 🪤</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-bold text-[#F3E5AB]">Question *</Label>
                    <Input placeholder="e.g. You stated you saw the accused at 10 PM. Is that correct?" value={qText} onChange={e => setQText(e.target.value)} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl" required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="font-bold text-slate-300">Expected Answer</Label>
                      <Input placeholder="e.g. Yes, I saw him at the gate" value={qExpectedAnswer} onChange={e => setQExpectedAnswer(e.target.value)} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-bold text-slate-300">Follow-up Question</Label>
                      <Input placeholder="e.g. But you also said the lights were off?" value={qFollowUp} onChange={e => setQFollowUp(e.target.value)} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl" />
                    </div>
                  </div>

                  <Button type="submit" className="bg-gradient-to-r from-[#C9A84C] to-[#D4AF37] text-[#0A1628] font-extrabold text-xs px-5 py-2 rounded-xl">
                    Add Question
                  </Button>
                </form>
              </Card>

              {/* Question List Grouped by Theme */}
              {selectedBuilder.questions?.length > 0 && (
                <div className="space-y-3">
                  {Object.entries(groupByTheme(selectedBuilder.questions)).map(([theme, qs]) => (
                    <Card key={theme} className="border border-slate-800 bg-slate-900/80 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => toggleTheme(theme)}
                        className="w-full flex items-center justify-between p-4 text-xs font-bold text-left hover:bg-slate-800/50 transition"
                      >
                        <span className="text-[#C9A84C] font-extrabold uppercase tracking-wider">{theme} ({(qs as any[]).length})</span>
                        {collapsedThemes.has(theme) ? <ChevronRight className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                      </button>

                      {!collapsedThemes.has(theme) && (
                        <CardContent className="px-4 pb-4 space-y-2">
                          {(qs as any[]).map((q, i) => (
                            <div key={q.id} className={`p-3.5 rounded-xl border text-xs ${q.isTrap ? 'border-rose-800 bg-rose-950/40 border-l-4 border-l-rose-500' : 'border-slate-800 bg-slate-950'}`}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="font-bold text-white">Q{i + 1}: {q.question}</p>
                                  {q.expectedAnswer && <p className="text-slate-400 mt-1 italic">Expected: {q.expectedAnswer}</p>}
                                  {q.followUp && <p className="text-cyan-400 mt-1">Follow-up: {q.followUp}</p>}
                                </div>
                                {q.isTrap && (
                                  <span className="px-2 py-0.5 rounded-full bg-rose-900 text-rose-300 font-bold text-[9px] whitespace-nowrap">🪤 TRAP</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
