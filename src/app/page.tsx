'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { FloatingWidgets, OfficeHoursBadge } from '@/components/floating-widgets';
import { Button } from '@/components/ui/button';
import { Shield, Scale, BookOpen, Users, Briefcase, FileText, CheckCircle2, Star } from 'lucide-react';

export default function Home() {
  const practiceAreas = [
    { title: 'Criminal Defense', icon: Shield, desc: 'Bail representation, trials, appellate defense, white-collar crimes.' },
    { title: 'Civil & Property', icon: Scale, desc: 'Title verification, partition suits, recovery, easement actions.' },
    { title: 'Corporate Law', icon: Briefcase, desc: 'Incorporation, contract audits, mergers, regulatory compliance.' },
    { title: 'Family Law', icon: Users, desc: 'Divorce, custody, maintenance, partition of ancestral estates.' },
    { title: 'Labour & Service', icon: BookOpen, desc: 'Employment agreements, industrial disputes, service writs.' },
    { title: 'Property & Land', icon: FileText, desc: 'RERA disputes, acquisition compensation, land tenure audits.' },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F5F0E8] text-[#0A1628]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-[#0A1628] text-[#F5F0E8] py-20 lg:py-28 overflow-hidden">
        {/* Decorative Blur BG */}
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#C9A84C]/10 blur-[130px]" />
        <div className="absolute bottom-[-20%] left-[-15%] w-[45%] h-[45%] rounded-full bg-white/5 blur-[120px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <OfficeHoursBadge />
            <h1 className="text-4xl sm:text-6xl font-extrabold font-heading tracking-tight leading-tight">
              Rigorous Counsel.<br />
              <span className="text-[#C9A84C]">Strategic Victory.</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-300 max-w-xl leading-relaxed">
              We stand as advocates of justice. MLR ASSOCIATES law firm specializes in complex trials, transactional advisory, and steadfast defense across appellate courts.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/book">
                <Button className="bg-[#C9A84C] text-[#0A1628] hover:bg-[#C9A84C]/95 font-semibold px-6 py-3 text-sm rounded shadow-lg transition duration-200">
                  Book Consultation
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="border-[#F5F0E8]/35 text-[#F5F0E8] hover:border-[#C9A84C] hover:text-[#C9A84C] px-6 py-3 text-sm rounded transition duration-200">
                  Chambers Location
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="bg-white py-12 border-b border-[#DCD6C5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold font-heading text-[#0A1628]">98%</p>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">Case Resolution Rate</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold font-heading text-[#0A1628]">40+</p>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">Years Active Advocacy</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold font-heading text-[#0A1628]">1,200+</p>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">Satisfied Clients</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold font-heading text-[#0A1628]">18</p>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">Supreme Court Precedents</p>
            </div>
          </div>
        </div>
      </section>

      {/* Practice Areas */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-[#0A1628]">Fields of Advocacy</h2>
          <div className="h-1 w-12 bg-[#C9A84C] mx-auto rounded" />
          <p className="text-sm text-gray-600 leading-relaxed">
            Our counsels are structured in specialized benches to deliver precise, research-backed representation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {practiceAreas.map((area, index) => {
            const Icon = area.icon;
            return (
              <div 
                key={index} 
                className="bg-white border border-[#DCD6C5] rounded p-6 shadow-sm hover:shadow-md hover:border-[#C9A84C]/50 transition duration-300 group"
              >
                <div className="h-10 w-10 bg-[#0A1628]/5 group-hover:bg-[#0A1628] rounded flex items-center justify-center text-[#0A1628] group-hover:text-[#C9A84C] transition duration-300 mb-5">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-[#0A1628] mb-2">{area.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{area.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonial Highlights */}
      <section className="bg-white py-20 border-t border-b border-[#DCD6C5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-[#0A1628]">Client Testimonials</h2>
            <div className="h-1 w-12 bg-[#C9A84C] mx-auto rounded" />
            <p className="text-sm text-gray-600">Verified feedback from court proceedings and consultation agreements.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-[#F5F0E8]/40 border border-[#DCD6C5]/60 rounded p-6 relative">
              <div className="flex items-center gap-1 text-[#C9A84C] mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-xs italic text-gray-700 leading-relaxed mb-4">
                "The legal team successfully defended our company in a complex trademark dispute. Their clarity on RERA and company audits was outstanding."
              </p>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-[#0A1628]/10 flex items-center justify-center font-bold text-[#0A1628] text-xs">RS</div>
                <div>
                  <p className="text-xs font-bold text-[#0A1628]">Rajesh Shah</p>
                  <p className="text-[10px] text-gray-500 font-medium">Corporate Retainer Case</p>
                </div>
              </div>
            </div>

            <div className="bg-[#F5F0E8]/40 border border-[#DCD6C5]/60 rounded p-6 relative">
              <div className="flex items-center gap-1 text-[#C9A84C] mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-xs italic text-gray-700 leading-relaxed mb-4">
                "Highly professional. Guided us through the title deed verification and land division process smoothly. Absolute transparency about court fees."
              </p>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-[#0A1628]/10 flex items-center justify-center font-bold text-[#0A1628] text-xs">PS</div>
                <div>
                  <p className="text-xs font-bold text-[#0A1628]">Pooja Sen</p>
                  <p className="text-[10px] text-gray-500 font-medium">Civil Land Partition Case</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-10">
            <Link href="/testimonials" className="text-xs font-bold text-[#0A1628] hover:text-[#C9A84C] border-b border-[#0A1628] hover:border-[#C9A84C] transition pb-1">
              Read All Verified Reviews
            </Link>
          </div>
        </div>
      </section>

      {/* Booking CTA Banner */}
      <section className="bg-[#0A1628] text-[#F5F0E8] py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold font-heading">Need Legal Representation?</h2>
          <p className="text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
            Schedule a confidential evaluation with our senior counsels. Choose a practice area and check real-time calendar slot availability.
          </p>
          <div>
            <Link href="/book">
              <Button className="bg-[#C9A84C] text-[#0A1628] hover:bg-[#C9A84C]/95 font-semibold px-8 py-3 rounded text-sm shadow-lg transition duration-200">
                Book Calendar Slot Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingWidgets />
    </div>
  );
}
