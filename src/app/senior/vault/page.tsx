'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers';
import { BookMarked, Plus, Search, Copy, Tag, Filter } from 'lucide-react';

const LAW_AREAS = ['ALL', 'CRIMINAL', 'CIVIL', 'FAMILY', 'CORPORATE', 'PROPERTY'];
const TYPES = ['ALL', 'ARGUMENT', 'CITATION', 'CLAUSE', 'TEMPLATE'];

export default function SeniorVaultPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterArea, setFilterArea] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  const [form, setForm] = useState({
    title: '',
    type: 'ARGUMENT',
    content: '',
    lawArea: 'CRIMINAL',
    court: '',
    year: '',
    tags: '',
    isShared: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/vault');
      if (res.ok) {
        const d = await res.json();
        setItems(d.items || []);
      }
    } catch {
      toast('Failed to load precedent vault.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      toast('Title and content are required.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
          year: form.year ? parseInt(form.year) : null,
        }),
      });
      if (res.ok) {
        toast('Precedent saved to vault!', 'success');
        setForm({ title: '', type: 'ARGUMENT', content: '', lawArea: 'CRIMINAL', court: '', year: '', tags: '', isShared: false });
        setShowForm(false);
        fetchItems();
      } else {
        toast('Failed to save precedent.', 'error');
      }
    } catch {
      toast('Network error.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast('Copied to clipboard!', 'success');
  };

  const AREA_COLORS: Record<string, string> = {
    CRIMINAL: 'text-rose-400 bg-rose-950',
    CIVIL: 'text-blue-400 bg-blue-950',
    FAMILY: 'text-purple-400 bg-purple-950',
    CORPORATE: 'text-amber-400 bg-amber-950',
    PROPERTY: 'text-emerald-400 bg-emerald-950',
  };

  const filtered = items.filter(it => {
    const matchesSearch = !search || it.title.toLowerCase().includes(search.toLowerCase()) || it.content.toLowerCase().includes(search.toLowerCase());
    const matchesArea = filterArea === 'ALL' || it.lawArea === filterArea;
    const matchesType = filterType === 'ALL' || it.type === filterType;
    return matchesSearch && matchesArea && matchesType;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-[#C9A84C]" /> Senior Precedent Vault
          </h1>
          <p className="text-xs text-slate-300">Store and retrieve argument snippets, legal clauses, case citations, and templates</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-[#C9A84C] to-[#D4AF37] text-[#0A1628] font-extrabold text-xs px-5 py-2 rounded-xl flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Add Precedent
        </Button>
      </div>

      {/* Add Form */}
      {showForm && (
        <Card className="border border-[#C9A84C]/30 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6">
          <h3 className="text-sm font-bold font-heading text-white mb-5">New Precedent Entry</h3>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="font-bold text-[#F3E5AB]">Title *</Label>
                <Input placeholder="e.g. Bail Application — IPC 302 Grounds" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl" required />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-[#F3E5AB]">Entry Type</Label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full h-10 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl">
                  {TYPES.filter(t => t !== 'ALL').map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-[#F3E5AB]">Content / Argument Snippet *</Label>
              <Textarea placeholder="Paste argument, clause text, or citation here..." value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl min-h-[120px]" required />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Law Area</Label>
                <select value={form.lawArea} onChange={e => setForm(f => ({ ...f, lawArea: e.target.value }))} className="w-full h-9 px-2 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl">
                  {LAW_AREAS.filter(a => a !== 'ALL').map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Court</Label>
                <Input placeholder="e.g. Supreme Court" value={form.court} onChange={e => setForm(f => ({ ...f, court: e.target.value }))} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Year</Label>
                <Input placeholder="e.g. 2023" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl h-9" type="number" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Tags (comma-separated)</Label>
                <Input placeholder="bail, IPC 302" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl h-9" />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer text-xs">
              <input type="checkbox" checked={form.isShared} onChange={e => setForm(f => ({ ...f, isShared: e.target.checked }))} className="h-4 w-4 accent-[#C9A84C]" />
              <span className="font-bold text-white">Share with all firm members (visible to all juniors & seniors)</span>
            </label>

            <div className="flex gap-3">
              <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-[#C9A84C] to-[#D4AF37] text-[#0A1628] font-extrabold text-xs px-6 py-2 rounded-xl">
                {submitting ? 'Saving...' : 'Add to Vault'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-slate-800 text-slate-300 text-xs rounded-xl">Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search vault entries..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 border-slate-800 bg-slate-900 text-white text-xs rounded-xl h-9"
          />
        </div>
        <div className="flex gap-2 text-xs font-bold flex-wrap">
          {LAW_AREAS.map(area => (
            <button key={area} onClick={() => setFilterArea(area)} className={`px-3 py-1.5 rounded-lg transition ${filterArea === area ? 'bg-[#C9A84C] text-[#0A1628]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of vault items */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 border-4 border-slate-800 border-t-[#C9A84C] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm italic">No precedents match your filters.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(it => (
            <Card key={it.id} className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 text-xs hover:border-[#C9A84C]/40 transition group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="font-extrabold text-white text-sm leading-tight">{it.title}</p>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${AREA_COLORS[it.lawArea] || 'text-slate-400 bg-slate-800'}`}>{it.lawArea}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#C9A84C]/15 text-[#C9A84C]">{it.type}</span>
                    {it.court && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-300">{it.court} {it.year || ''}</span>}
                  </div>
                </div>
                <button onClick={() => handleCopy(it.content)} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-[#C9A84C] hover:bg-slate-700 transition opacity-0 group-hover:opacity-100">
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>

              <p className="text-slate-300 line-clamp-3 leading-relaxed border-l-2 border-[#C9A84C]/30 pl-3 italic">{it.content}</p>

              {it.tags?.length > 0 && (
                <div className="flex gap-1 flex-wrap mt-3">
                  {it.tags.map((tag: string) => (
                    <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-400">#{tag}</span>
                  ))}
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <Button onClick={() => handleCopy(it.content)} size="sm" className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] px-3 py-1 rounded-lg flex items-center gap-1 flex-1">
                  <Copy className="h-3 w-3" /> Copy to Clipboard
                </Button>
                {it.isShared && (
                  <span className="px-2 py-1 rounded-lg bg-emerald-900/60 text-emerald-400 font-bold text-[9px] flex items-center">Shared</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
