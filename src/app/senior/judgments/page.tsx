'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers';
import { FileCheck, Plus, ExternalLink, Download, Tag, Upload } from 'lucide-react';

const LAW_AREAS = ['CRIMINAL', 'CIVIL', 'FAMILY', 'CORPORATE', 'PROPERTY'];

export default function SeniorJudgmentsPage() {
  const { toast } = useToast();
  const [judgments, setJudgments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '', court: '', year: '', lawArea: 'CRIMINAL',
    fileUrl: '', highlights: '', tags: '', isShared: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchJudgments = async () => {
    try {
      const res = await fetch('/api/judgments');
      if (res.ok) {
        const d = await res.json();
        setJudgments(d.judgments || []);
      }
    } catch {
      toast('Failed to load judgment library.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJudgments(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.court || !form.year || !form.fileUrl) {
      toast('Title, court, year, and PDF URL are required.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/judgments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          year: parseInt(form.year),
          highlights: form.highlights.split(',').map(h => h.trim()).filter(Boolean),
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        toast('Judgment added to library!', 'success');
        setForm({ title: '', court: '', year: '', lawArea: 'CRIMINAL', fileUrl: '', highlights: '', tags: '', isShared: false });
        setShowForm(false);
        fetchJudgments();
      } else {
        toast('Failed to save judgment.', 'error');
      }
    } catch {
      toast('Network error.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const AREA_COLORS: Record<string, string> = {
    CRIMINAL: 'text-rose-400 bg-rose-950 border-rose-800',
    CIVIL: 'text-blue-400 bg-blue-950 border-blue-800',
    FAMILY: 'text-purple-400 bg-purple-950 border-purple-800',
    CORPORATE: 'text-amber-400 bg-amber-950 border-amber-800',
    PROPERTY: 'text-emerald-400 bg-emerald-950 border-emerald-800',
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-[#C9A84C]" /> Senior Judgment Library
          </h1>
          <p className="text-xs text-slate-300">Upload, annotate, and share landmark court judgments with your team</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-[#C9A84C] to-[#D4AF37] text-[#0A1628] font-extrabold text-xs px-5 py-2 rounded-xl flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Add Judgment
        </Button>
      </div>

      {/* Add Judgment Form */}
      {showForm && (
        <Card className="border border-[#C9A84C]/30 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6">
          <h3 className="text-sm font-bold font-heading text-white mb-5">Upload Judgment PDF</h3>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="font-bold text-[#F3E5AB]">Judgment Title *</Label>
                <Input placeholder="e.g. Arnesh Kumar v. State of Bihar (2014)" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl" required />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-[#F3E5AB]">Court *</Label>
                <Input placeholder="e.g. Supreme Court of India" value={form.court} onChange={e => setForm(f => ({ ...f, court: e.target.value }))} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="font-bold text-[#F3E5AB]">Year *</Label>
                  <Input placeholder="2014" type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl" required />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-bold text-[#F3E5AB]">Law Area</Label>
                  <select value={form.lawArea} onChange={e => setForm(f => ({ ...f, lawArea: e.target.value }))} className="w-full h-10 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl">
                    {LAW_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-[#F3E5AB]">Cloudinary PDF URL *</Label>
              <Input placeholder="https://res.cloudinary.com/...judgment.pdf" value={form.fileUrl} onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Key Paragraph Highlights (comma-separated)</Label>
                <Input placeholder="e.g. Para 15, Para 22, Para 31" value={form.highlights} onChange={e => setForm(f => ({ ...f, highlights: e.target.value }))} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Tags (comma-separated)</Label>
                <Input placeholder="bail, arrest, Section 41A CrPC" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl" />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer text-xs">
              <input type="checkbox" checked={form.isShared} onChange={e => setForm(f => ({ ...f, isShared: e.target.checked }))} className="h-4 w-4 accent-[#C9A84C]" />
              <span className="font-bold text-white">Share with all firm members</span>
            </label>

            <div className="flex gap-3">
              <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-[#C9A84C] to-[#D4AF37] text-[#0A1628] font-extrabold text-xs px-6 py-2 rounded-xl">
                {submitting ? 'Uploading...' : 'Add to Library'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-slate-800 text-slate-300 text-xs rounded-xl">Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* PDF Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="w-full max-w-4xl h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="h-12 bg-slate-900 flex items-center justify-between px-4">
              <span className="text-xs font-bold text-white">Judgment Preview</span>
              <button onClick={() => setPreviewUrl(null)} className="text-slate-400 hover:text-white text-xs font-bold">✕ Close</button>
            </div>
            <iframe src={previewUrl} className="w-full h-[calc(100%-3rem)]" title="Judgment PDF" />
          </div>
        </div>
      )}

      {/* Judgment Cards */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 border-4 border-slate-800 border-t-[#C9A84C] rounded-full animate-spin" /></div>
      ) : judgments.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm italic">No judgments in library yet. Upload your first judgment above.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {judgments.map(j => (
            <Card key={j.id} className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 text-xs hover:border-[#C9A84C]/40 transition">
              <div className="mb-3">
                <p className="font-extrabold text-white text-sm leading-snug">{j.title}</p>
                <p className="text-slate-400 text-[10px] mt-1">{j.court} · {j.year}</p>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${AREA_COLORS[j.lawArea] || 'text-slate-400 bg-slate-800 border-slate-700'}`}>{j.lawArea}</span>
                  {j.isShared && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-900/60 text-emerald-400 border border-emerald-800">Shared</span>}
                </div>
              </div>

              {j.highlights?.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold text-[#C9A84C] mb-1">Key Paragraphs:</p>
                  <div className="flex gap-1 flex-wrap">
                    {j.highlights.map((h: string) => (
                      <span key={h} className="px-1.5 py-0.5 rounded bg-[#C9A84C]/10 text-[#C9A84C] text-[9px] font-bold">{h}</span>
                    ))}
                  </div>
                </div>
              )}

              {j.tags?.length > 0 && (
                <div className="flex gap-1 flex-wrap mb-3">
                  {j.tags.map((tag: string) => (
                    <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-400">#{tag}</span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button size="sm" onClick={() => setPreviewUrl(j.fileUrl)} className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] px-3 py-1 rounded-lg flex items-center gap-1 flex-1">
                  <ExternalLink className="h-3 w-3" /> Preview PDF
                </Button>
                <a href={j.fileUrl} download target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 font-bold text-[10px] px-2 py-1 rounded-lg">
                    <Download className="h-3 w-3" />
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
