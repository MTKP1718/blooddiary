import React from 'react';
import { Droplet, Phone, ShieldCheck, Heart, MapPin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Medical Emergency Helpline Banner */}
      <div className="bg-crimson-700 text-white py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Phone className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-crimson-100">National Blood Helpline & Emergency</p>
              <p className="text-lg font-bold">Toll Free: 1800-11-9988 | Emergency: 108 / 102</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs bg-black/20 px-3.5 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>24/7 Verified Blood Center Network Support</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-crimson-600 flex items-center justify-center">
                <Droplet className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Blood<span className="text-crimson-500">Connect</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Bridging compassionate voluntary blood donors with verified medical centers and patients across communities. Every drop counts.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-crimson-500 fill-crimson-500 inline" />
              <span>for lifesaving healthcare</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/register" className="hover:text-white transition-colors">Register as Donor</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">Donor Login</Link>
              </li>
              <li>
                <a href="/#blood-groups" className="hover:text-white transition-colors">Blood Groups Matrix</a>
              </li>
              <li>
                <a href="/#faq" className="hover:text-white transition-colors">Eligibility FAQ</a>
              </li>
              <li>
                <a href="http://localhost:5174" target="_blank" rel="noopener noreferrer" className="text-crimson-400 hover:text-crimson-300 transition-colors">
                  Admin Portal ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Blood Compatibility Guide */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Universal Donors</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p><span className="text-white font-semibold">O Negative (O-)</span>: Universal red blood cell donor for all patients.</p>
              <p><span className="text-white font-semibold">AB Positive (AB+)</span>: Universal plasma receiver; can receive any blood type.</p>
              <p><span className="text-white font-semibold">Interval</span>: Minimum 90 days for males and 120 days for females between full blood donations.</p>
            </div>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">BloodConnect Helpdesk</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-crimson-400 shrink-0 mt-0.5" />
                <span>Central Healthcare Complex, Chennai, Tamil Nadu 600001</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-crimson-400 shrink-0" />
                <span>support@bloodconnect.org</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-crimson-400 shrink-0" />
                <span>+91 44 2855 0000</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Medical Guidance Disclaimer */}
        <div className="mt-10 pt-8 border-t border-slate-800 text-xs text-slate-400 leading-relaxed bg-slate-800/40 p-4 rounded-xl">
          <p className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Medical Disclaimer & Professional Guidelines:
          </p>
          <p>
            BloodConnect does not provide automated medical eligibility determinations. Final eligibility for blood donation is determined at the time of donation through vital checks (hemoglobin, blood pressure, pulse, medical history) performed by qualified medical professionals and licensed blood bank physicians. If you feel unwell or have questions regarding medical suitability, please consult a healthcare professional.
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} BloodConnect Medical Information System. All rights reserved.</p>
          <p>Strictly Confidential Donor Information Safeguards Enabled</p>
        </div>
      </div>
    </footer>
  );
}
