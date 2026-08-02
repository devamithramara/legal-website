'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { FloatingWidgets, OfficeHoursBadge } from '@/components/floating-widgets';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Scale,
  BookOpen,
  Users,
  Briefcase,
  FileText,
  Star,
  Calculator,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Gavel,
  Clock,
  ChevronRight,
  Info,
  Building2,
  FileCheck,
  Zap,
  Filter,
  Calendar
} from 'lucide-react';

export default function Home() {
  // Practice Benches Data with Filters
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedPractice, setSelectedPractice] = useState<any | null>(null);

  const practiceAreas = [
    {
      id: 'criminal',
      category: 'criminal',
      title: 'Criminal Defense & Bail',
      icon: Shield,
      tag: 'High Priority',
      badgeColor: 'from-rose-500 to-amber-500',
      desc: 'Bail representation, trial defense, white-collar crimes, criminal appeals, and CBI/ED inquiries.',
      statutes: 'CrPC, IPC / Bharatiya Nagarik Suraksha Sanhita, Prevention of Corruption Act.',
      typicalTimeline: '1 - 3 Weeks for Emergency Bail'
    },
    {
      id: 'civil',
      category: 'civil',
      title: 'Civil & Property Disputes',
      icon: Scale,
      tag: 'High Precedent',
      badgeColor: 'from-amber-500 to-emerald-500',
      desc: 'Title deed verification, partition suits, recovery of possession, boundary audits & land acquisitions.',
      statutes: 'Transfer of Property Act, CPC, Specific Relief Act, RERA 2016.',
      typicalTimeline: '3 - 6 Months for Title Settlement'
    },
    {
      id: 'corporate',
      category: 'corporate',
      title: 'Corporate & Contract Advisory',
      icon: Briefcase,
      tag: 'Retainer Available',
      badgeColor: 'from-cyan-500 to-blue-600',
      desc: 'Incorporation, contract vetting, M&A due diligence, shareholder agreements & NCLT litigation.',
      statutes: 'Companies Act 2013, Insolvency and Bankruptcy Code (IBC), SEBI Regulations.',
      typicalTimeline: '24 - 48 Hours Contract Turnaround'
    },
    {
      id: 'family',
      category: 'family',
      title: 'Family Law & Estates',
      icon: Users,
      tag: 'Confidential',
      badgeColor: 'from-purple-500 to-[#E2C044]',
      desc: 'Mutual divorce, child custody, alimony, succession certificate, partition of ancestral property.',
      statutes: 'Hindu Marriage Act, Special Marriage Act, Indian Succession Act.',
      typicalTimeline: 'Mediated settlement options'
    },
    {
      id: 'labour',
      category: 'labour',
      title: 'Labour & Service Writs',
      icon: BookOpen,
      tag: 'Constitutional',
      badgeColor: 'from-emerald-500 to-teal-600',
      desc: 'Industrial disputes, termination writs, pension claims, employment agreements, CAT tribunals.',
      statutes: 'Industrial Disputes Act, Central Civil Services Rules, Article 226 Writs.',
      typicalTimeline: 'Fast-track Tribunal Filings'
    },
    {
      id: 'land',
      category: 'civil',
      title: 'RERA & Land Acquisition',
      icon: FileText,
      tag: 'Regulatory',
      badgeColor: 'from-[#E2C044] to-cyan-500',
      desc: 'Builder delay compensation, RERA authority complaints, government land acquisition challenge.',
      statutes: 'Real Estate (Regulation and Development) Act, RFCTLARR Act 2013.',
      typicalTimeline: 'RERA Appellate Hearings'
    },
  ];

  const filteredPractices = activeTab === 'all' 
    ? practiceAreas 
    : practiceAreas.filter(p => p.category === activeTab);

  // Interactive Fee Calculator State
  const [courtLevel, setCourtLevel] = useState<'district' | 'high' | 'supreme'>('high');
  const [caseType, setCaseType] = useState<'bail' | 'property' | 'corporate' | 'family'>('bail');
  const [urgency, setUrgency] = useState<'standard' | 'expedited' | 'emergency'>('standard');

  const calculateEstimate = () => {
    let base = 15000;
    if (caseType === 'property') base = 25000;
    if (caseType === 'corporate') base = 35000;
    if (caseType === 'family') base = 20000;

    let multiplier = 1;
    if (courtLevel === 'high') multiplier = 1.6;
    if (courtLevel === 'supreme') multiplier = 2.5;

    let urgencyFee = 0;
    if (urgency === 'expedited') urgencyFee = 5000;
    if (urgency === 'emergency') urgencyFee = 12000;

    const estimatedTotal = Math.round(base * multiplier + urgencyFee);
    return {
      fee: estimatedTotal,
      retainer: Math.round(estimatedTotal * 0.4),
      timeframe: urgency === 'emergency' ? 'Within 24 Hours' : urgency === 'expedited' ? '3 - 5 Working Days' : '7 - 10 Working Days'
    };
  };

  const estimate = calculateEstimate();

  // Testimonials State
  const [testimonialFilter, setTestimonialFilter] = useState<'all' | 'corporate' | 'civil'>('all');

  const testimonials = [
    {
      quote: "The legal team successfully defended our company in a complex trademark and NCLT dispute. Their research-backed approach saved months of court delay.",
      author: "Rajesh Shah",
      tag: "corporate",
      role: "Managing Director, Apex Tech Ltd.",
      rating: 5
    },
    {
      quote: "Highly professional. Guided our family through title deed verification and land partition smoothly with complete fee transparency.",
      author: "Pooja Sen",
      tag: "civil",
      role: "Civil Land Partition Case",
      rating: 5
    },
    {
      quote: "Secured immediate bail in a high-profile economic offense case within 48 hours. Absolute dedication and deep knowledge of CrPC.",
      author: "Vikram Malhotra",
      tag: "criminal",
      role: "High Court Appellate Defense",
      rating: 5
    }
  ];

  const filteredTestimonials = testimonialFilter === 'all'
    ? testimonials
    : testimonials.filter(t => t.tag === testimonialFilter);

  return (
    <div className="flex-1 flex flex-col min-h-screen mesh-bg text-slate-100 font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-[#E2C044]/15 blur-[120px] pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-cyan-500/15 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <OfficeHoursBadge />
              
              <h1 className="text-4xl sm:text-6xl font-black font-heading tracking-tight leading-none">
                Steadfast Defense.<br />
                <span className="gold-gradient-text">Strategic Victory.</span>
              </h1>
              
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                MLR ASSOCIATES specializes in high-stakes appellate trials, constitutional writs, property title audits, and corporate advisory before the High Court & Supreme Court Benches.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/book">
                  <Button className="bg-gradient-to-r from-[#E2C044] via-[#F3E5AB] to-[#B8860B] text-[#0B132B] font-extrabold px-8 py-4 text-sm rounded-xl shadow-xl shadow-[#E2C044]/20 hover:scale-105 transition-all duration-300 flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Book Consultation Slot
                  </Button>
                </Link>
                <a href="#estimator">
                  <Button variant="outline" className="border-slate-700 bg-slate-900/60 text-slate-200 hover:border-[#E2C044] hover:text-[#E2C044] px-6 py-4 text-sm rounded-xl backdrop-blur-md transition-all flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-[#E2C044]" /> Calculate Retainer Fee
                  </Button>
                </a>
              </div>

              {/* Quick Feature Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 40+ Yrs Legacy
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" /> High Court Benches
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-[#E2C044]" /> Supreme Precedents
                </div>
              </div>
            </div>

            {/* Right Interactive Hero Card */}
            <div className="lg:col-span-5">
              <div className="glass-panel rounded-3xl p-8 border border-[#E2C044]/30 shadow-2xl relative animate-float">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <Gavel className="h-6 w-6 text-[#E2C044]" />
                    <span className="font-heading font-extrabold text-lg text-white">Chambers Direct Desk</span>
                  </div>
                  <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 uppercase tracking-widest">
                    Available Today
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-[#E2C044] flex items-center justify-center font-bold">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-200">Next Available Slot</p>
                        <p className="text-slate-400 text-[11px]">Today @ 4:30 PM (Virtual / In-Person)</p>
                      </div>
                    </div>
                    <Link href="/book">
                      <ChevronRight className="h-5 w-5 text-[#E2C044] hover:translate-x-1 transition" />
                    </Link>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-200">Senior Advocates Desk</p>
                        <p className="text-slate-400 text-[11px]">3 Benches Active in Session</p>
                      </div>
                    </div>
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                        <FileCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-200">Express Title Audit</p>
                        <p className="text-slate-400 text-[11px]">Document Vetting & Verification</p>
                      </div>
                    </div>
                    <Link href="/upload" className="text-[11px] font-bold text-[#E2C044] hover:underline">
                      Upload
                    </Link>
                  </div>
                </div>

                <div className="mt-6 pt-4 text-center">
                  <Link href="/book">
                    <Button className="w-full bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] font-extrabold py-3 rounded-xl shadow-lg hover:brightness-110 transition">
                      Schedule Emergency Session
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Dynamic Interactive Stats */}
      <section className="py-12 border-y border-slate-800/80 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            
            <div className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-[#E2C044]/50 group">
              <p className="text-4xl font-extrabold font-heading gold-gradient-text group-hover:scale-110 transition duration-300">98.4%</p>
              <p className="text-xs uppercase tracking-wider font-bold text-slate-300 mt-2">Favorable Verdict Ratio</p>
              <p className="text-[10px] text-slate-400 mt-1">Across 1,200+ Cases</p>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-cyan-500/50 group">
              <p className="text-4xl font-extrabold font-heading cyan-gradient-text group-hover:scale-110 transition duration-300">40+</p>
              <p className="text-xs uppercase tracking-wider font-bold text-slate-300 mt-2">Years Active Advocacy</p>
              <p className="text-[10px] text-slate-400 mt-1">Established 1986</p>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-emerald-500/50 group">
              <p className="text-4xl font-extrabold font-heading emerald-gradient-text group-hover:scale-110 transition duration-300">1,200+</p>
              <p className="text-xs uppercase tracking-wider font-bold text-slate-300 mt-2">Satisfied Clients</p>
              <p className="text-[10px] text-slate-400 mt-1">Corporate & Individuals</p>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-purple-500/50 group">
              <p className="text-4xl font-extrabold font-heading text-purple-300 group-hover:scale-110 transition duration-300">18</p>
              <p className="text-xs uppercase tracking-wider font-bold text-slate-300 mt-2">Supreme Court Precedents</p>
              <p className="text-[10px] text-slate-400 mt-1">Reported Law Journals</p>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Practice Benches Explorer */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-[#E2C044]/40 text-xs font-bold text-[#E2C044]">
            <Sparkles className="h-3.5 w-3.5" /> Specialized Benches
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">Fields of Advocacy</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Select a practice bench to inspect key statutes, expected case timelines, and trial procedures.
          </p>

          {/* Interactive Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {[
              { id: 'all', label: 'All Benches' },
              { id: 'criminal', label: 'Criminal Defense' },
              { id: 'civil', label: 'Civil & Property' },
              { id: 'corporate', label: 'Corporate & M&A' },
              { id: 'family', label: 'Family & Estates' },
              { id: 'labour', label: 'Labour & Writs' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition duration-200 border ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] border-[#E2C044] shadow-lg shadow-[#E2C044]/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Practice Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPractices.map((area) => {
            const Icon = area.icon;
            return (
              <div
                key={area.id}
                className="glass-card rounded-2xl p-7 border border-slate-800 flex flex-col justify-between hover:border-[#E2C044]/60 transition duration-300 group cursor-pointer"
                onClick={() => setSelectedPractice(area)}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#E2C044]/20 to-slate-800 border border-[#E2C044]/30 text-[#E2C044] flex items-center justify-center group-hover:scale-110 transition duration-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full bg-gradient-to-r ${area.badgeColor} text-white shadow`}>
                      {area.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#E2C044] transition">
                    {area.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {area.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-[#E2C044]" /> {area.typicalTimeline}
                  </span>
                  <span className="text-[#E2C044] group-hover:translate-x-1 transition flex items-center gap-1">
                    Inspect Bench <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Practice Detail Modal */}
        {selectedPractice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="glass-panel max-w-lg w-full rounded-3xl p-8 border border-[#E2C044]/40 shadow-2xl relative space-y-6">
              <div className="flex items-start justify-between border-b border-slate-700/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#E2C044]/20 text-[#E2C044] flex items-center justify-center">
                    <selectedPractice.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedPractice.title}</h3>
                    <span className="text-xs text-[#E2C044] font-semibold">{selectedPractice.tag}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPractice(null)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <p className="font-bold text-slate-200 mb-1">Scope of Representation:</p>
                  <p className="text-slate-300 leading-relaxed">{selectedPractice.desc}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <p className="font-bold text-[#E2C044]">Governing Acts & Statutes:</p>
                  <p className="text-slate-300">{selectedPractice.statutes}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <p className="font-bold text-emerald-400">Typical Resolution Timeline:</p>
                  <p className="text-slate-300">{selectedPractice.typicalTimeline}</p>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <Link href="/book" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-[#E2C044] to-[#F59E0B] text-[#0B132B] font-extrabold py-3 rounded-xl">
                    Book Consultation For This Bench
                  </Button>
                </Link>
                <Button
                  onClick={() => setSelectedPractice(null)}
                  className="bg-slate-800 text-slate-200 hover:bg-slate-700 px-5 rounded-xl font-bold"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* NEW Interactive Legal Fee & Consultation Estimator */}
      <section id="estimator" className="py-24 border-t border-slate-800 bg-slate-900/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-xs font-bold text-cyan-400">
              <Calculator className="h-3.5 w-3.5" /> Instant Fee Transparency
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
              Interactive Consultation Fee Estimator
            </h2>
            <p className="text-sm text-slate-300">
              Select your legal bench, court jurisdiction, and urgency to view an instant estimate of counsel retainer and consultation fees.
            </p>
          </div>

          <div className="max-w-4xl mx-auto glass-panel rounded-3xl p-8 border border-slate-800 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Option 1: Case Bench */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#E2C044] uppercase tracking-wider block">
                  1. Matter Category
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'bail', label: 'Criminal Defense / Bail' },
                    { id: 'property', label: 'Civil / Property Audit' },
                    { id: 'corporate', label: 'Corporate & Contracts' },
                    { id: 'family', label: 'Family / Estate Settlement' },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setCaseType(item.id as any)}
                      className={`text-xs font-semibold p-3 rounded-xl text-left border transition ${
                        caseType === item.id
                          ? 'bg-[#E2C044]/20 border-[#E2C044] text-white font-bold'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 2: Court Jurisdiction */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                  2. Court Forum
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'district', label: 'District Court / Tribunal' },
                    { id: 'high', label: 'High Court Bench' },
                    { id: 'supreme', label: 'Supreme Court of India' },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setCourtLevel(item.id as any)}
                      className={`text-xs font-semibold p-3 rounded-xl text-left border transition ${
                        courtLevel === item.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 3: Urgency */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  3. Urgency Level
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'standard', label: 'Standard (7-10 Days)' },
                    { id: 'expedited', label: 'Expedited (3-5 Days)' },
                    { id: 'emergency', label: '24-Hour Emergency Bail' },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setUrgency(item.id as any)}
                      className={`text-xs font-semibold p-3 rounded-xl text-left border transition ${
                        urgency === item.id
                          ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Calculated Output Box */}
            <div className="mt-8 pt-8 border-t border-slate-800 bg-slate-950/80 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs text-slate-400 font-medium">Estimated Consultation & Retainer:</span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-4xl font-extrabold font-heading gold-gradient-text">
                    ₹{estimate.fee.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-400">
                    (Initial Retainer: ₹{estimate.retainer.toLocaleString('en-IN')})
                  </span>
                </div>
                <p className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5" /> Turnaround: {estimate.timeframe}
                </p>
              </div>

              <Link href="/book">
                <Button className="bg-gradient-to-r from-[#E2C044] via-[#F3E5AB] to-[#B8860B] text-[#0B132B] font-extrabold px-8 py-4 rounded-xl shadow-xl shadow-[#E2C044]/20 hover:scale-105 transition">
                  Lock Slot at Estimated Fee
                </Button>
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* Filterable Verified Testimonial Showcase */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950 border border-purple-500/40 text-xs font-bold text-purple-300">
            <Star className="h-3.5 w-3.5 fill-current text-[#E2C044]" /> Client Verification
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">Client Feedback & Precedents</h2>
          
          <div className="flex justify-center gap-2 pt-2">
            {[
              { id: 'all', label: 'All Reviews' },
              { id: 'corporate', label: 'Corporate' },
              { id: 'civil', label: 'Land & Civil' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setTestimonialFilter(f.id as any)}
                className={`text-xs font-bold px-4 py-1.5 rounded-lg border transition ${
                  testimonialFilter === f.id
                    ? 'bg-[#E2C044] text-[#0B132B] border-[#E2C044]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredTestimonials.map((t, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-[#E2C044] mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs italic text-slate-300 leading-relaxed mb-6">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#E2C044] to-[#B8860B] text-[#0B132B] font-extrabold flex items-center justify-center text-xs">
                  {t.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{t.author}</p>
                  <p className="text-[10px] text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Booking CTA Banner */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel rounded-3xl p-10 lg:p-16 border border-[#E2C044]/30 text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#E2C044]/10 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
              Ready to Secure Legal Counsel?
            </h2>
            <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Schedule a confidential evaluation with our senior advocates. Pick your practice area and check real-time calendar availability.
            </p>
            
            <div className="pt-2">
              <Link href="/book">
                <Button className="bg-gradient-to-r from-[#E2C044] via-[#F3E5AB] to-[#B8860B] text-[#0B132B] font-extrabold px-10 py-4 text-base rounded-2xl shadow-xl shadow-[#E2C044]/25 hover:scale-105 transition duration-300">
                  Book Immediate Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingWidgets />
    </div>
  );
}
