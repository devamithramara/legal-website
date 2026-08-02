import Link from 'next/link';
import { Shield, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0A1628] border-t border-[#C9A84C]/20 text-[#F5F0E8] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Firm Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-[#C9A84C]" />
              <span className="font-heading font-bold text-lg tracking-wider">MLR ASSOCIATES</span>
            </div>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              MLR Associates is a premier litigation and corporate advocacy firm. We deliver strategic counsel, trial defense, and dispute resolution with absolute integrity and diligence.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C9A84C]">Firm Desk</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/book" className="hover:text-[#C9A84C] transition">Book Appointment</Link></li>
              <li><Link href="/upload" className="hover:text-[#C9A84C] transition">Document Vault</Link></li>
              <li><Link href="/testimonials" className="hover:text-[#C9A84C] transition">Verified Testimonials</Link></li>
              <li><Link href="/privacy" className="hover:text-[#C9A84C] transition">Privacy & DPDP Policy</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C9A84C]">Chambers</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#C9A84C]" />
                <span>130, Nungambakkam High Rd, Thousand Lights, Chennai, TN 600006</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-[#C9A84C]" />
                <span>+91 94440 19923</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-[#C9A84C]" />
                <span>contact@mlrassociates.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#F5F0E8]/10 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} MLR Associates. All Rights Reserved.</p>
          <p className="text-[10px] leading-relaxed max-w-md text-center md:text-right">
            Disclosures: Compliance with Bar Council of India regulations (solicitation is not permitted) and data storage safeguards under the Digital Personal Data Protection (DPDP) Act 2023.
          </p>
        </div>
      </div>
    </footer>
  );
}
