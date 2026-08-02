'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers';
import {
  FileEdit, Plus, Save, FileText, Mic, MicOff,
  Bold, Italic, UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, List, ListOrdered,
  TableIcon, Highlighter, Send, Download
} from 'lucide-react';

export default function SeniorDraftsPage() {
  const { toast } = useToast();

  const [cases, setCases] = useState<any[]>([]);
  const [juniors, setJuniors] = useState<any[]>([]);
  const [draftsList, setDraftsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<any | null>(null);

  const [draftTitle, setDraftTitle] = useState('');
  const [draftCaseId, setDraftCaseId] = useState('');
  const [draftType, setDraftType] = useState('PETITION');
  const [draftStatus, setDraftStatus] = useState('DRAFTING');
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isDictating, setIsDictating] = useState(false);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: true }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[400px] focus:outline-none text-slate-100 text-sm leading-relaxed p-4',
      },
    },
    onUpdate: () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        handleAutoSave();
      }, 30000);
    },
  });

  const fetchData = async () => {
    try {
      const [casesRes, juniorsRes, draftsRes] = await Promise.all([
        fetch('/api/cases'),
        fetch('/api/juniors'),
        fetch('/api/senior-drafts'),
      ]);
      if (casesRes.ok) setCases(await casesRes.json());
      if (juniorsRes.ok) {
        const d = await juniorsRes.json();
        setJuniors(d.juniors || d || []);
      }
      if (draftsRes.ok) {
        const d = await draftsRes.json();
        setDraftsList(d.drafts || []);
      }
    } catch {
      toast('Failed to load drafts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  const handleAutoSave = useCallback(async () => {
    if (!draftTitle || !draftCaseId || !editor) return;
    setAutoSaving(true);
    try {
      const content = JSON.stringify(editor.getJSON());
      const method = selectedDraft ? 'PATCH' : 'POST';
      const url = selectedDraft ? `/api/senior-drafts/${selectedDraft.id}` : '/api/senior-drafts';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: draftCaseId, title: draftTitle, type: draftType, content }),
      });
      if (res.ok) {
        const data = await res.json();
        if (!selectedDraft && data.draft) setSelectedDraft(data.draft);
        setLastSaved(new Date().toLocaleTimeString('en-IN'));
        fetchData();
      }
    } catch {}
    setAutoSaving(false);
  }, [draftTitle, draftCaseId, draftType, editor, selectedDraft]);

  const startNewDraft = () => {
    setSelectedDraft(null);
    setDraftTitle('');
    setDraftCaseId(cases[0]?.id || '');
    setDraftType('PETITION');
    setDraftStatus('DRAFTING');
    editor?.commands.clearContent();
    setShowEditor(true);
    setLastSaved(null);
  };

  const openDraft = (d: any) => {
    setSelectedDraft(d);
    setDraftTitle(d.title);
    setDraftCaseId(d.caseId);
    setDraftType(d.type);
    setDraftStatus(d.status);
    try {
      const content = JSON.parse(d.content);
      editor?.commands.setContent(content);
    } catch {
      editor?.commands.setContent(d.content || '');
    }
    setShowEditor(true);
    setLastSaved(null);
  };

  const handleSpeechDictation = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast('Speech recognition is not supported in this browser.', 'error');
      return;
    }

    if (isDictating && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsDictating(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      editor?.commands.insertContent(transcript + ' ');
    };

    recognition.onerror = () => {
      setIsDictating(false);
      toast('Speech recognition error.', 'error');
    };

    recognition.onend = () => setIsDictating(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsDictating(true);
    toast('Dictation started. Speak now...', 'success');
  };

  const handleSendToJunior = async (juniorId: string) => {
    if (!selectedDraft?.id) {
      toast('Please save draft first.', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/senior-drafts/${selectedDraft.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ juniorId }),
      });
      if (res.ok) {
        toast('Draft sent to junior as FILING task!', 'success');
        fetchData();
      } else {
        toast('Failed to send draft to junior.', 'error');
      }
    } catch {
      toast('Network error.', 'error');
    }
  };

  const TYPE_OPTIONS = ['PETITION', 'AFFIDAVIT', 'NOTICE', 'ARGUMENT', 'OTHER'];

  return (
    <div className="space-y-6 max-w-full mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
            <FileEdit className="h-6 w-6 text-[#C9A84C]" /> Senior Drafting Desk
          </h1>
          <p className="text-xs text-slate-300">Rich-text legal drafting with Web Speech dictation and junior dispatch</p>
        </div>
        <Button onClick={startNewDraft} className="bg-gradient-to-r from-[#C9A84C] to-[#D4AF37] text-[#0A1628] font-extrabold text-xs px-5 py-2 rounded-xl flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> New Draft
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Drafts Sidebar */}
        <div className="lg:col-span-3 space-y-3">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#C9A84C] px-1">Draft Archive</p>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {loading ? (
              <div className="text-center py-8 text-xs text-slate-400">Loading...</div>
            ) : draftsList.length === 0 ? (
              <p className="text-xs text-slate-400 italic px-1">No drafts yet. Click + New Draft to begin.</p>
            ) : (
              draftsList.map((d) => (
                <div
                  key={d.id}
                  onClick={() => openDraft(d)}
                  className={`p-3 rounded-xl border cursor-pointer transition text-xs ${
                    selectedDraft?.id === d.id
                      ? 'bg-[#C9A84C]/20 border-[#C9A84C] text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <p className="font-extrabold truncate">{d.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{d.type} · {d.case?.caseNumber}</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block ${
                    d.status === 'FILED' ? 'bg-emerald-900 text-emerald-300' :
                    d.status === 'SENT_TO_JUNIOR' ? 'bg-amber-900 text-amber-300' :
                    'bg-slate-800 text-slate-300'
                  }`}>{d.status}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tiptap Editor */}
        <div className="lg:col-span-9">
          {showEditor ? (
            <div className="border border-[#C9A84C]/30 bg-slate-900/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
              {/* Draft Meta */}
              <div className="p-4 border-b border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="space-y-1">
                    <Label className="font-bold text-[#F3E5AB] text-[10px]">DOCUMENT TITLE</Label>
                    <Input
                      placeholder="e.g. Bail Application - State vs Kumar"
                      value={draftTitle}
                      onChange={e => setDraftTitle(e.target.value)}
                      className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="font-bold text-[#F3E5AB] text-[10px]">CASE</Label>
                    <select
                      value={draftCaseId}
                      onChange={e => setDraftCaseId(e.target.value)}
                      className="w-full h-9 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl"
                    >
                      <option value="">Select Case...</option>
                      {cases.map(c => <option key={c.id} value={c.id}>{c.caseNumber}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="font-bold text-[#F3E5AB] text-[10px]">DOCUMENT TYPE</Label>
                    <select
                      value={draftType}
                      onChange={e => setDraftType(e.target.value)}
                      className="w-full h-9 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl"
                    >
                      {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div className="px-4 py-2 border-b border-slate-800 flex flex-wrap gap-1 items-center">
                <button onClick={() => editor?.chain().focus().toggleBold().run()} className={`p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition ${editor?.isActive('bold') ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : ''}`}><Bold className="h-3.5 w-3.5" /></button>
                <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={`p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition ${editor?.isActive('italic') ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : ''}`}><Italic className="h-3.5 w-3.5" /></button>
                <button onClick={() => editor?.chain().focus().toggleUnderline().run()} className={`p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition ${editor?.isActive('underline') ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : ''}`}><UnderlineIcon className="h-3.5 w-3.5" /></button>
                <button onClick={() => editor?.chain().focus().toggleStrike().run()} className={`p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition ${editor?.isActive('strike') ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : ''}`}><Strikethrough className="h-3.5 w-3.5" /></button>
                <button onClick={() => editor?.chain().focus().toggleHighlight().run()} className={`p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition ${editor?.isActive('highlight') ? 'bg-amber-500/20 text-amber-400' : ''}`}><Highlighter className="h-3.5 w-3.5" /></button>

                <div className="w-px h-5 bg-slate-700 mx-1" />
                <button onClick={() => editor?.chain().focus().setTextAlign('left').run()} className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"><AlignLeft className="h-3.5 w-3.5" /></button>
                <button onClick={() => editor?.chain().focus().setTextAlign('center').run()} className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"><AlignCenter className="h-3.5 w-3.5" /></button>
                <button onClick={() => editor?.chain().focus().setTextAlign('right').run()} className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"><AlignRight className="h-3.5 w-3.5" /></button>

                <div className="w-px h-5 bg-slate-700 mx-1" />
                <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition ${editor?.isActive('bulletList') ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : ''}`}><List className="h-3.5 w-3.5" /></button>
                <button onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={`p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition ${editor?.isActive('orderedList') ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : ''}`}><ListOrdered className="h-3.5 w-3.5" /></button>
                <button onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3 }).run()} className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"><TableIcon className="h-3.5 w-3.5" /></button>

                <div className="w-px h-5 bg-slate-700 mx-1" />
                <button
                  onClick={handleSpeechDictation}
                  className={`p-1.5 rounded-lg transition flex items-center gap-1 text-[10px] font-bold ${isDictating ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-slate-300 hover:text-white'}`}
                >
                  {isDictating ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                  {isDictating ? 'Stop Dictation' : 'Dictate'}
                </button>

                <div className="ml-auto flex items-center gap-2">
                  {lastSaved && <span className="text-[10px] text-emerald-400 font-bold">✓ Saved {lastSaved}</span>}
                  <Button onClick={handleAutoSave} disabled={autoSaving} size="sm" className="bg-[#C9A84C] text-[#0A1628] font-bold text-[10px] px-3 py-1 rounded-lg flex items-center gap-1">
                    <Save className="h-3.5 w-3.5" /> {autoSaving ? 'Saving...' : 'Save Draft'}
                  </Button>
                </div>
              </div>

              {/* Editor Area */}
              <div className="bg-slate-950 min-h-[420px]">
                <EditorContent editor={editor} />
              </div>

              {/* Footer Actions */}
              <div className="px-4 py-3 border-t border-slate-800 flex flex-wrap gap-2 items-center justify-between">
                <div className="flex gap-2">
                  <select
                    className="h-8 px-2.5 bg-slate-950 border border-slate-800 text-white text-[10px] rounded-lg"
                    onChange={e => { if (e.target.value) handleSendToJunior(e.target.value); }}
                    defaultValue=""
                  >
                    <option value="">Send to Junior →</option>
                    {juniors.map((j: any) => (
                      <option key={j.id} value={j.id}>{j.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 text-[10px] font-bold">
                  <span className="text-slate-400 self-center">Export:</span>
                  <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 text-[10px] h-7 px-3 rounded-lg">PDF</Button>
                  <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 text-[10px] h-7 px-3 rounded-lg">DOCX</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 text-slate-400 text-sm gap-3">
              <FileEdit className="h-12 w-12 text-slate-600" />
              <p className="font-bold">Select a draft from the left sidebar or create a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
