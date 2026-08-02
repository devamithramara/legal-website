'use client';

import React from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { FloatingWidgets, OfficeHoursBadge } from '@/components/floating-widgets';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Phone, Mail, MapPin, ExternalLink, HelpCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F5F0E8] text-[#0A1628]">
      <Navbar />

      <main className="flex-1 py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="space-y-3 mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-[#0A1628]">Our Chambers & Location</h1>
          <div className="h-1 w-12 bg-[#C9A84C] mx-auto rounded" />
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Visit our chambers or contact our administrators to discuss your litigation schedule.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border border-[#DCD6C5] shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-heading text-[#0A1628]">Office Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-[#DCD6C5]/50">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Current Timing</span>
                  <OfficeHoursBadge />
                </div>
                
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span className="font-semibold">Monday - Friday</span>
                    <span>10:00 AM - 06:00 PM IST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Saturday</span>
                    <span>10:00 AM - 04:00 PM IST</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span className="font-semibold">Sunday & Court Holidays</span>
                    <span>Closed</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#DCD6C5] shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-heading text-[#0A1628]">Direct Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <a
                  href="tel:+919444019923"
                  className="flex items-center gap-4 p-3 rounded-lg border border-[#DCD6C5]/40 hover:border-[#C9A84C] bg-gray-50 hover:bg-[#C9A84C]/5 transition duration-200 group"
                >
                  <div className="h-9 w-9 rounded-full bg-[#0A1628]/5 flex items-center justify-center text-[#0A1628] group-hover:bg-[#0A1628] group-hover:text-[#C9A84C] transition duration-200">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Call Administrative Clerk</p>
                    <p className="text-sm font-bold text-[#0A1628]">+91 94440 19923</p>
                  </div>
                </a>

                <a
                  href="mailto:contact@mlrassociates.in"
                  className="flex items-center gap-4 p-3 rounded-lg border border-[#DCD6C5]/40 hover:border-[#C9A84C] bg-gray-50 hover:bg-[#C9A84C]/5 transition duration-200 group"
                >
                  <div className="h-9 w-9 rounded-full bg-[#0A1628]/5 flex items-center justify-center text-[#0A1628] group-hover:bg-[#0A1628] group-hover:text-[#C9A84C] transition duration-200">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Send Consultation Brief</p>
                    <p className="text-sm font-bold text-[#0A1628]">contact@mlrassociates.in</p>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-3 rounded-lg border border-[#DCD6C5]/40 bg-gray-50">
                  <div className="h-9 w-9 rounded-full bg-[#0A1628]/5 flex items-center justify-center text-[#0A1628] mt-0.5">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Chambers Location</p>
                    <p className="text-xs font-bold text-[#0A1628] leading-relaxed">
                      130, Nungambakkam High Rd, next to Ispahani Center,
                      Thousand Lights West, Chennai, Tamil Nadu 600006
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Google Map */}
          <div className="lg:col-span-7 h-full min-h-[400px]">
            <Card className="border border-[#DCD6C5] shadow-sm overflow-hidden h-full flex flex-col bg-white">
              <div className="p-4 border-b border-[#DCD6C5] flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-sm text-[#0A1628]">Interactive Route Map</h3>
                  <p className="text-[10px] text-gray-500">Chambers situated near the High Court</p>
                </div>
                <a
                  href="https://maps.app.goo.gl/aSKwyw94GxnJEyJo9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#C9A84C] hover:underline flex items-center gap-1"
                >
                  Open in Maps <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="flex-1 min-h-[350px] bg-gray-100 relative">
                {/* Embedded Map pointing to Ispahani Center, Nungambakkam, Chennai */}
                <iframe
                  title="MLR Associates Chambers Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.6463393997684!2d80.24300827480867!3d13.062283187264217!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5266124ef1b0c9%3A0xdbf2c9c5e0ff5e6!2sIspahani%20Center!5e0!3m2!1sen!2sin!4v1718610000000!5m2!1sen!2sin"
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingWidgets />
    </div>
  );
}
