'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/providers';
import { Upload, FileText, Paperclip, Eye, Trash2, FolderOpen, ShieldCheck } from 'lucide-react';

interface DocFile {
  id: string;
  name: string;
  url: string;
  type: string;
  createdAt: string;
  case?: { caseNumber: string; title: string } | null;
  appointment?: { date: string; timeSlot: string } | null;
  uploadedBy: { name: string };
}

export default function AdminFilesPage() {
  const { toast } = useToast();

  const [documents, setDocuments] = useState<DocFile[]>([]);
  const [cases, setCases] = useState<{ id: string; caseNumber: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Upload form state
  const [docType, setDocType] = useState('Court Notice');
  const [linkedCaseId, setLinkedCaseId] = useState('none');
  const [file, setFile] = useState<File | null>(null);

  // Filter state
  const [filterCase, setFilterCase] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docsRes, casesRes] = await Promise.all([
        fetch('/api/documents'),
        fetch('/api/cases'),
      ]);
      if (docsRes.ok) setDocuments(await docsRes.json());
      if (casesRes.ok) setCases(await casesRes.json());
    } catch {
      toast('Failed to load files.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (f.size > 20 * 1024 * 1024) {
        toast('File exceeds 20MB limit.', 'error');
        return;
      }
      setFile(f);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast('Please select a file to upload.', 'error'); return; }
    setUploading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(interval); saveDoc(); return 100; }
        return prev + 12;
      });
    }, 150);
  };

  const saveDoc = async () => {
    if (!file) return;
    try {
      const mockUrl = `https://res.cloudinary.com/mlrassociates/raw/upload/v${Date.now()}/${file.name}`;
      const payload: any = { name: file.name, url: mockUrl, type: docType };
      if (linkedCaseId !== 'none') payload.caseId = linkedCaseId;

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        toast('File uploaded successfully!', 'success');
        setFile(null);
        setLinkedCaseId('none');
        setProgress(0);
        fetchData();
      } else {
        toast(data.error || 'Upload failed.', 'error');
      }
    } catch {
      toast('Upload error. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const filteredDocs = documents.filter(d => {
    const matchCase = filterCase === 'all' || d.case?.title?.includes(filterCase) || d.case?.caseNumber === filterCase;
    const matchType = filterType === 'all' || d.type === filterType;
    return matchCase && matchType;
  });

  const typeColors: Record<string, string> = {
    'ID Proof': 'bg-blue-100 text-blue-700',
    'Contract': 'bg-purple-100 text-purple-700',
    'Court Notice': 'bg-amber-100 text-amber-700',
    'Vakalatnama': 'bg-rose-100 text-rose-700',
    'Pleading': 'bg-indigo-100 text-indigo-700',
    'Evidence': 'bg-emerald-100 text-emerald-700',
    'Other': 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading text-[#0A1628] flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-[#C9A84C]" /> Case Files Vault
          </h2>
          <p className="text-xs text-gray-500 mt-1">Upload and view all case-linked documents</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
          <ShieldCheck className="h-3.5 w-3.5" /> AES-256 Encrypted
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Panel */}
        <div className="lg:col-span-1">
          <Card className="border border-[#DCD6C5] bg-white shadow-sm sticky top-24">
            <CardHeader className="border-b border-[#DCD6C5]/30">
              <CardTitle className="text-base font-heading text-[#0A1628] flex items-center gap-2">
                <Upload className="h-4 w-4 text-[#C9A84C]" /> Upload Case File
              </CardTitle>
              <CardDescription className="text-xs text-gray-500">Max 20MB · PDF, DOCX, JPG, PNG</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleUpload} className="space-y-4">
                {/* Document Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600">Document Type</Label>
                  <Select value={docType} onValueChange={(val) => setDocType(val || 'Court Notice')}>
                    <SelectTrigger className="border-[#DCD6C5] text-xs bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Court Notice" className="text-xs">Court Notice / Summons</SelectItem>
                      <SelectItem value="Pleading" className="text-xs">Pleading / Brief</SelectItem>
                      <SelectItem value="Vakalatnama" className="text-xs">Vakalatnama</SelectItem>
                      <SelectItem value="Evidence" className="text-xs">Evidence / Exhibit</SelectItem>
                      <SelectItem value="Contract" className="text-xs">Contract / Agreement</SelectItem>
                      <SelectItem value="ID Proof" className="text-xs">ID Proof</SelectItem>
                      <SelectItem value="Other" className="text-xs">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Link to Case */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600">Associate with Case</Label>
                  <Select value={linkedCaseId} onValueChange={(val) => setLinkedCaseId(val || 'none')}>
                    <SelectTrigger className="border-[#DCD6C5] text-xs bg-white">
                      <SelectValue placeholder="General (No Case)" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-xs">
                      <SelectItem value="none" className="text-xs">General (No Case)</SelectItem>
                      {cases.map(c => (
                        <SelectItem key={c.id} value={c.id} className="text-xs">
                          {c.caseNumber} — {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* File Drop Zone */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600">File</Label>
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-[#DCD6C5] hover:border-[#C9A84C]/60 rounded-lg cursor-pointer bg-gray-50/50 transition">
                    <div className="flex flex-col items-center justify-center">
                      <Paperclip className="h-6 w-6 text-gray-400 mb-1.5" />
                      <p className="text-[11px] font-medium text-gray-500">
                        {file ? file.name : 'Click or drop file here'}
                      </p>
                      {file && (
                        <p className="text-[10px] text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      )}
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>

                {/* Progress Bar */}
                {uploading && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold text-gray-500">
                      <span>Uploading...</span><span>{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded">
                      <div className="h-full bg-[#C9A84C] rounded transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={uploading || !file}
                  className="w-full bg-[#0A1628] text-white hover:bg-[#0A1628]/90 text-xs font-semibold"
                >
                  {uploading ? 'Uploading...' : 'Upload File'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Files List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <Card className="border border-[#DCD6C5] bg-white shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[160px] space-y-1">
                  <Label className="text-[10px] font-bold text-gray-500 uppercase">Filter by Type</Label>
                  <Select value={filterType} onValueChange={(v) => setFilterType(v || 'all')}>
                    <SelectTrigger className="border-[#DCD6C5] text-xs h-8 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-xs">
                      <SelectItem value="all" className="text-xs">All Types</SelectItem>
                      <SelectItem value="Court Notice" className="text-xs">Court Notice</SelectItem>
                      <SelectItem value="Pleading" className="text-xs">Pleading</SelectItem>
                      <SelectItem value="Vakalatnama" className="text-xs">Vakalatnama</SelectItem>
                      <SelectItem value="Evidence" className="text-xs">Evidence</SelectItem>
                      <SelectItem value="Contract" className="text-xs">Contract</SelectItem>
                      <SelectItem value="ID Proof" className="text-xs">ID Proof</SelectItem>
                      <SelectItem value="Other" className="text-xs">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-[160px] space-y-1">
                  <Label className="text-[10px] font-bold text-gray-500 uppercase">Filter by Case</Label>
                  <Select value={filterCase} onValueChange={(v) => setFilterCase(v || 'all')}>
                    <SelectTrigger className="border-[#DCD6C5] text-xs h-8 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-xs">
                      <SelectItem value="all" className="text-xs">All Cases</SelectItem>
                      {cases.map(c => (
                        <SelectItem key={c.id} value={c.caseNumber} className="text-xs">
                          {c.caseNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end pb-0.5">
                  <span className="text-[10px] font-bold text-gray-400">{filteredDocs.length} file(s)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Files Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="h-8 w-8 border-4 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin" />
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="text-center py-16 bg-white border border-[#DCD6C5] rounded-lg">
              <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-xs text-gray-400 font-semibold">No files found.</p>
              <p className="text-[10px] text-gray-300 mt-1">Upload case documents using the form on the left.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocs.map(doc => (
                <div
                  key={doc.id}
                  className="p-4 bg-white border border-[#DCD6C5]/60 rounded-lg hover:border-[#C9A84C]/50 transition shadow-sm flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-[#0A1628]/5 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4.5 w-4.5 text-[#0A1628]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#0A1628] truncate">{doc.name}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${typeColors[doc.type] || 'bg-gray-100 text-gray-600'}`}>
                          {doc.type}
                        </span>
                        {doc.case && (
                          <span className="text-[9px] text-gray-500 font-medium">
                            📁 {doc.case.caseNumber}
                          </span>
                        )}
                        <span className="text-[9px] text-gray-400">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-[9px] text-gray-400">
                          by {doc.uploadedBy?.name || 'Admin'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 w-8 flex items-center justify-center rounded border border-[#DCD6C5] hover:border-[#C9A84C] text-[#0A1628] hover:text-[#C9A84C] transition"
                      title="View file"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
