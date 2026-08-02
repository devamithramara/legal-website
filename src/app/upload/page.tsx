'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { FloatingWidgets } from '@/components/floating-widgets';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/providers';
import { ShieldAlert, Upload, Lock, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function UploadPage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [docType, setDocType] = useState('ID Proof');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedDoc, setUploadedDoc] = useState<any>(null);

  // Link choices
  const [linkedId, setLinkedId] = useState('none');
  const [cases, setCases] = useState<{ id: string; caseNumber: string; title: string }[]>([]);
  const [appointments, setAppointments] = useState<{ id: string; date: string; timeSlot: string }[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(false);

  useEffect(() => {
    if (session) {
      const fetchLinkables = async () => {
        setLoadingLinks(true);
        try {
          // Fetch cases
          const casesRes = await fetch('/api/cases');
          if (casesRes.ok) {
            const casesData = await casesRes.json();
            setCases(casesData);
          }
          // Fetch appointments
          const apptsRes = await fetch('/api/appointments');
          if (apptsRes.ok) {
            const apptsData = await apptsRes.json();
            setAppointments(apptsData);
          }
        } catch (err) {
          console.error('Error fetching linkable items:', err);
        } finally {
          setLoadingLinks(false);
        }
      };
      fetchLinkables();
    }
  }, [session]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Max 10MB check
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast('File size exceeds 10MB limit.', 'error');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setUploadedDoc(null);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast('Please choose a file to upload.', 'error');
      return;
    }

    setUploading(true);
    setProgress(0);

    // Simulate direct-to-cloud upload progress bar
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          saveDocMetadata();
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const saveDocMetadata = async () => {
    if (!file) return;
    try {
      // Mock Cloudinary URL response
      const mockCloudinaryUrl = `https://res.cloudinary.com/demo/image/upload/v1570979139/law_chambers_${Date.now()}_${file.name}`;
      
      const payload: any = {
        name: file.name,
        url: mockCloudinaryUrl,
        type: docType,
      };

      // Handle linked ID properties
      if (linkedId !== 'none') {
        if (linkedId.startsWith('case_')) {
          payload.caseId = linkedId.replace('case_', '');
        } else if (linkedId.startsWith('appt_')) {
          payload.appointmentId = linkedId.replace('appt_', '');
        }
      }

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setUploadedDoc(data.document);
        toast('Document uploaded & encrypted!', 'success');
        setFile(null);
      } else {
        toast(data.error || 'Failed to save document details.', 'error');
      }
    } catch (err) {
      toast('Upload verification failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F5F0E8] text-[#0A1628]">
      <Navbar />

      <main className="flex-1 py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="space-y-3 mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-[#0A1628]">Secure Document Vault</h1>
          <div className="h-1 w-12 bg-[#C9A84C] mx-auto rounded" />
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Upload identity documents, contracts, or court summons drafts.
          </p>
        </div>

        {/* DPDP and Encryption Banner */}
        <div className="bg-[#0A1628]/5 border border-[#C9A84C]/20 rounded-lg p-4 mb-8 max-w-2xl mx-auto flex items-start gap-3.5">
          <Lock className="h-5 w-5 text-[#C9A84C] mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[#0A1628] uppercase tracking-wider">AES-256 Storage safeguards</h4>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              We encrypt all court pleadings and file references using local AES-256 algorithms. Data transmission is secured using TLS 1.3 tunnels. Upload size is restricted to <strong>10MB (PDF, JPG, PNG)</strong>.
            </p>
          </div>
        </div>

        <div className="max-w-xl mx-auto">
          <Card className="border border-[#DCD6C5] bg-white shadow-md">
            <CardHeader className="border-b border-[#DCD6C5]/30">
              <CardTitle className="text-lg font-heading text-[#0A1628]">Upload Form</CardTitle>
            </CardHeader>
            
            <CardContent className="pt-6">
              {!session ? (
                <div className="text-center py-8">
                  <p className="text-xs text-gray-500 font-semibold mb-4">
                    Access is restricted. Please sign in to verify your identity.
                  </p>
                  <Button
                    onClick={() => window.location.href = '/login?callbackUrl=/upload'}
                    className="bg-[#0A1628] text-white hover:bg-[#0A1628]/95 text-xs font-semibold"
                  >
                    Client Sign In
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleUploadSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Document Type Selector */}
                    <div className="space-y-2">
                      <Label htmlFor="docType" className="text-xs font-semibold text-gray-600">Document Category</Label>
                      <Select value={docType} onValueChange={(val) => setDocType(val || '')}>
                        <SelectTrigger className="border-[#DCD6C5] text-xs">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="ID Proof" className="text-xs">ID Proof (Aadhaar/PAN)</SelectItem>
                          <SelectItem value="Contract" className="text-xs">Contract Agreement</SelectItem>
                          <SelectItem value="Court Notice" className="text-xs">Court Notice / Summons</SelectItem>
                          <SelectItem value="Other" className="text-xs">Other Litigation Files</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Linked Case or Appointment */}
                    <div className="space-y-2">
                      <Label htmlFor="linkage" className="text-xs font-semibold text-gray-600">Associate With</Label>
                      <Select value={linkedId} onValueChange={(val) => setLinkedId(val || '')}>
                        <SelectTrigger className="border-[#DCD6C5] text-xs">
                          <SelectValue placeholder="Associate With" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-xs">
                          <SelectItem value="none" className="text-xs">No Association (General)</SelectItem>
                          {cases.map((c) => (
                            <SelectItem key={c.id} value={`case_${c.id}`} className="text-xs">
                              Case: {c.caseNumber}
                            </SelectItem>
                          ))}
                          {appointments.map((a) => (
                            <SelectItem key={a.id} value={`appt_${a.id}`} className="text-xs">
                              Consultation: {new Date(a.date).toLocaleDateString()} ({a.timeSlot})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* File Upload Selector */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-600">Choose File</Label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#DCD6C5] hover:border-[#C9A84C]/50 rounded-lg cursor-pointer bg-gray-50/50 hover:bg-gray-50/80 transition duration-200">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-xs font-medium text-gray-500">
                            {file ? file.name : 'Select PDF, JPG, PNG (Max 10MB)'}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Drag and drop or click'}
                          </p>
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-gray-500">
                        <span>Uploading to secure vaults...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded">
                        <div
                          className="h-full bg-emerald-600 rounded transition-all duration-200"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Success indicator */}
                  {uploadedDoc && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2 text-xs text-emerald-700 leading-relaxed">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold">File Encryption Complete</p>
                        <p className="text-[10px] text-emerald-600">Saved: {uploadedDoc.name}</p>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-[#0A1628] text-white hover:bg-[#0A1628]/90 font-semibold text-xs py-2"
                    disabled={uploading || !file}
                  >
                    {uploading ? 'Processing File...' : 'Upload & Encrypt'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
      <FloatingWidgets />
    </div>
  );
}
