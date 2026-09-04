'use client';

import React from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { FloatingWidgets } from '@/components/floating-widgets';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Shield, Lock, Trash2, Eye } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F5F0E8] text-[#0A1628]">
      <Navbar />

      <main className="flex-1 py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-3 mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-[#0A1628]">Privacy Policy & DPDP Compliance</h1>
          <div className="h-1 w-12 bg-[#C9A84C] mx-auto rounded" />
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
            In Accordance with the Digital Personal Data Protection (DPDP) Act, 2023 (India)
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="border border-[#DCD6C5] shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-heading text-[#0A1628] flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#C9A84C]" /> 1. Data Collection Notice
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-600 space-y-2 leading-relaxed">
              <p>
                MLR Associates (collectively "we", "us", "our") acts as a <strong>Data Fiduciary</strong> under the DPDP Act 2023. We collect personal identifiers including names, email addresses, phone numbers, billing/payment info, and court litigation documents.
              </p>
              <p>
                <strong>Purpose of Processing:</strong> Data is collected solely to process consultation scheduling, legal defense preparation, billing, and communication. We do not sell or lease user information.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-[#DCD6C5] shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-heading text-[#0A1628] flex items-center gap-2">
                <Lock className="h-5 w-5 text-[#C9A84C]" /> 2. Security & Storage Policies (AES-256)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-600 space-y-2 leading-relaxed">
              <p>
                All uploaded litigation drafts, identity proofs, and pleadings are uploaded securely through SSL encryption and stored in our Cloudinary document vaults.
              </p>
              <p>
                <strong>Security Guardrails:</strong> Sensitive user files are mapped with restricted role access. Direct database columns housing file references are encrypted using AES-256 standards, preventing unauthorized breach or enumeration.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-[#DCD6C5] shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-heading text-[#0A1628] flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-[#C9A84C]" /> 3. Data Principal Rights (Correction & Erasure)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-600 space-y-2 leading-relaxed">
              <p>
                Under Section 6 of the DPDP Act 2023, you retain rights as a <strong>Data Principal</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Right to Access:</strong> View all appointments, cases, and documents on your Client Desk dashboard.</li>
                <li><strong>Right to Correction:</strong> Request updates to inaccurate phone numbers or credentials.</li>
                <li><strong>Right to Erasure / Withdrawal:</strong> Request archiving of your client account or file deletion for closed litigation.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-[#DCD6C5] shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-heading text-[#0A1628] flex items-center gap-2">
                <Eye className="h-5 w-5 text-[#C9A84C]" /> 4. Consent Manager & Grievance Redressal
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-600 space-y-2 leading-relaxed">
              <p>
                You may contact our designated <strong>Consent & Grievance Officer</strong> for dispute resolution, breach report, or erasure requests:
              </p>
              <div className="mt-3 p-3 bg-[#F5F0E8]/50 border border-[#DCD6C5]/50 rounded text-xs space-y-1">
                <p><strong>Officer:</strong> Advocate Aditi Verma</p>
                <p><strong>Email:</strong> compliance@mlrassociates.in</p>
                <p><strong>Chambers:</strong> 130, Nungambakkam High Rd, next to Ispahani Center, Thousand Lights, Chennai, TN - 600006</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
      <FloatingWidgets />
    </div>
  );
}
