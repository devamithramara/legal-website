'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers';
import { FileText, Upload, Download, CheckCircle2, AlertCircle, Copy, BookOpen } from 'lucide-react';

export default function JuniorDraftsPage() {
  const { toast } = useToast();

  const [cases, setCases] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('PETITION');
  const [fileUrl, setFileUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [casesRes, draftsRes, templatesRes] = await Promise.all([
        fetch('/api/cases'),
        fetch('/api/drafts'),
        fetch('/api/templates'),
      ]);

      if (casesRes.ok) setCases(await casesRes.json());
      if (draftsRes.ok) {
        const dData = await draftsRes.json();
        if (dData.drafts) setDrafts(dData.drafts);
      }
      if (templatesRes.ok) {
        const tData = await templatesRes.json();
        if (tData.templates) setTemplates(tData.templates);
      }
    } catch {
      toast('Failed to load drafts pipeline.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setFileUrl(data.url);
        toast('Document uploaded to Cloudinary!', 'success');
      } else {
        toast('File upload failed.', 'error');
      }
    } catch {
      toast('Network error uploading file.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !title || !fileUrl) {
      toast('Please fill all required fields and upload document.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: selectedCaseId, title, type, fileUrl }),
      });

      if (res.ok) {
        toast('Draft submitted for Senior Counsel review!', 'success');
        setTitle('');
        setFileUrl('');
        fetchData();
      } else {
        toast('Failed to submit draft.', 'error');
      }
    } catch {
      toast('Network error submitting draft.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
          <FileText className="h-6 w-6 text-[#E2C044]" /> Legal Draft Pipeline & Template Library
        </h1>
        <p className="text-xs text-slate-300">
          Upload legal petitions, affidavits, and written statements for senior review & access court templates
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Draft Submission Form */}
        <div className="lg:col-span-4">
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="h-4 w-4 text-[#E2C044]" /> Submit New Draft
              </CardTitle>
            </CardHeader>

            <form onSubmit={handleSubmitDraft} className="space-y-4 text-xs">
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
                <Label className="font-bold text-slate-300">Draft Type *</Label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl font-bold"
                >
                  <option value="PETITION">PETITION</option>
                  <option value="AFFIDAVIT">AFFIDAVIT</option>
                  <option value="NOTICE">LEGAL NOTICE</option>
                  <option value="WRITTEN_STATEMENT">WRITTEN STATEMENT</option>
                  <option value="VAKALATNAMA">VAKALATNAMA</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Draft Title *</Label>
                <Input
                  placeholder="e.g. Interim Stay Application under Sec 151"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Upload Draft File (Cloudinary) *</Label>
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl cursor-pointer"
                  disabled={uploading}
                />
                {uploading && <p className="text-[10px] text-[#E2C044] animate-pulse">Uploading file to Cloudinary...</p>}
                {fileUrl && <p className="text-[10px] text-emerald-400 font-bold">✓ File attached ready for submission</p>}
              </div>

              <Button
                type="submit"
                disabled={submitting || !fileUrl}
                className="w-full bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] font-extrabold py-2.5 rounded-xl text-xs shadow-lg"
              >
                {submitting ? 'Submitting...' : 'Submit Draft for Review'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Draft Pipeline Table & Template Sidebar */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Pipeline Table */}
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <h3 className="text-base font-bold font-heading text-white mb-4">Submitted Drafts Pipeline</h3>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-7 w-7 border-3 border-slate-800 border-t-[#E2C044] rounded-full animate-spin" />
              </div>
            ) : drafts.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500 font-semibold">
                No legal drafts submitted yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Title & Case</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Ver</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Senior Comments</th>
                      <th className="py-2.5 px-3 text-right">File</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {drafts.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3">
                          <p className="font-extrabold text-white">{d.title}</p>
                          <p className="text-[10px] text-slate-400">Case: {d.case?.caseNumber}</p>
                        </td>
                        <td className="py-3 px-3 text-[#E2C044] font-bold text-[10px]">{d.type}</td>
                        <td className="py-3 px-3 font-bold text-slate-300">v{d.version}</td>
                        <td className="py-3 px-3">
                          <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            d.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' :
                            d.status === 'REDO' ? 'bg-amber-950 text-amber-400 border border-amber-500/40' :
                            'bg-purple-950 text-purple-300 border border-purple-500/40'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300 italic text-[11px]">
                          {d.comments || 'No senior notes yet'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-[#E2C044] font-bold hover:underline inline-flex items-center gap-1 text-[11px]">
                            <Download className="h-3 w-3" /> Get
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Template Library Sidebar */}
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#E2C044]" /> Court Template Library
              </h3>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-slate-800 text-slate-300">Read & Download Only</span>
            </div>

            {templates.length === 0 ? (
              <div className="text-xs text-slate-400 italic">Standard court templates (Bail Application, Vakalatnama, Stay Petition) available upon upload by Admin.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {templates.map(t => (
                  <div key={t.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{t.title}</p>
                      <p className="text-[10px] text-[#E2C044] font-bold">{t.type}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setType(t.type);
                        setTitle(`${t.title} - Draft`);
                        toast(`Pre-filled draft form with template: ${t.title}`, 'info');
                      }}
                      className="bg-slate-800 text-slate-200 text-[10px] font-bold px-2.5 py-1"
                    >
                      Use Base
                    </Button>
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
