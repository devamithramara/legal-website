'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers';
import { BookOpen, CheckCircle2, Search, Plus, Shield } from 'lucide-react';

export default function JuniorResearchPage() {
  const { toast } = useToast();

  const [cases, setCases] = useState<any[]>([]);
  const [researchLogs, setResearchLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [sections, setSections] = useState('');
  const [citations, setCitations] = useState('');
  const [source, setSource] = useState('SCC');
  const [summary, setSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [casesRes, researchRes] = await Promise.all([
        fetch('/api/cases'),
        fetch('/api/research'),
      ]);

      if (casesRes.ok) setCases(await casesRes.json());
      if (researchRes.ok) {
        const data = await researchRes.json();
        if (data.researchLogs) setResearchLogs(data.researchLogs);
      }
    } catch {
      toast('Failed to load research repository.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !summary || summary.length < 10) {
      toast('Please select case and provide a detailed research summary (min 10 chars).', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: selectedCaseId,
          sections: sections.split(',').map(s => s.trim()).filter(Boolean),
          citations: citations.split(',').map(c => c.trim()).filter(Boolean),
          source,
          summary,
        }),
      });

      if (res.ok) {
        toast('Research log submitted for senior review!', 'success');
        setSections('');
        setCitations('');
        setSummary('');
        fetchData();
      } else {
        toast('Failed to submit research log.', 'error');
      }
    } catch {
      toast('Network error submitting research.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      <div>
        <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-[#E2C044]" /> Legal Case Law & Statute Research Repo
        </h1>
        <p className="text-xs text-slate-300">
          Document statutory provisions, SCC/Manupatra citations, and ratio decidendi for assigned cases
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* New Research Form */}
        <div className="lg:col-span-4">
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#E2C044]" /> Log New Case Law Research
              </CardTitle>
            </CardHeader>

            <form onSubmit={handleSubmitResearch} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Select Case *</Label>
                <select
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl font-bold"
                  required
                >
                  <option value="">Choose case...</option>
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>{c.caseNumber} - {c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Source Legal Database *</Label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl font-bold"
                >
                  <option value="SCC">SCC ONLINE</option>
                  <option value="MANUPATRA">MANUPATRA</option>
                  <option value="INDIANKANOON">INDIANKANOON</option>
                  <option value="BARE_ACT">BARE ACT STATUTE</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Statutory Sections (comma separated)</Label>
                <Input
                  placeholder="e.g. Sec 438 CrPC, Sec 420 IPC"
                  value={sections}
                  onChange={(e) => setSections(e.target.value)}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Citations (comma separated)</Label>
                <Input
                  placeholder="e.g. (2021) 4 SCC 121, AIR 2019 SC 332"
                  value={citations}
                  onChange={(e) => setCitations(e.target.value)}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Ratio & Precedent Summary *</Label>
                <Textarea
                  placeholder="Summarize key holdings, factual matrices, and relevance to case strategy..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl min-h-[100px]"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] font-extrabold py-2.5 rounded-xl text-xs shadow-lg"
              >
                {submitting ? 'Submitting...' : 'Submit Research Note'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Research History Table */}
        <div className="lg:col-span-8">
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <h3 className="text-base font-bold font-heading text-white mb-4">Case Law Research Repository</h3>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-7 w-7 border-3 border-slate-800 border-t-[#E2C044] rounded-full animate-spin" />
              </div>
            ) : researchLogs.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500 font-semibold">
                No research entries logged yet.
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {researchLogs.map((r) => (
                  <div key={r.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">📁 Case: {r.case?.caseNumber} - {r.case?.title}</span>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                        r.approved ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                      }`}>
                        {r.approved ? 'APPROVED' : 'PENDING REVIEW'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="bg-[#E2C044]/15 text-[#E2C044] px-2 py-0.5 rounded font-bold">{r.source}</span>
                      {r.sections && r.sections.length > 0 && (
                        <span className="text-cyan-300 font-semibold">Sections: {r.sections.join(', ')}</span>
                      )}
                    </div>

                    {r.citations && r.citations.length > 0 && (
                      <p className="text-[11px] font-bold text-[#E2C044]">📜 Citations: {r.citations.join(' | ')}</p>
                    )}

                    <p className="text-slate-300 text-xs leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                      {r.summary}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

      </div>

    </div>
  );
}
