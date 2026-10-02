import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Droplet,
  Heart,
  Shield,
  Activity,
  CheckCircle2,
  Clock,
  Users,
  Award,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  PhoneCall,
  MapPin,
  Sparkles,
  HelpCircle
} from 'lucide-react';

const bloodTypes = [
  { group: 'O-', canGive: 'Everyone (Universal Red Cell)', canReceive: 'O- only', badge: 'Universal Donor' },
  { group: 'O+', canGive: 'O+, A+, B+, AB+', canReceive: 'O+, O-', badge: 'Most Demanded' },
  { group: 'A-', canGive: 'A-, A+, AB-, AB+', canReceive: 'A-, O-', badge: 'Rare' },
  { group: 'A+', canGive: 'A+, AB+', canReceive: 'A+, A-, O+, O-', badge: 'High Need' },
  { group: 'B-', canGive: 'B-, B+, AB-, AB+', canReceive: 'B-, O-', badge: 'Rare' },
  { group: 'B+', canGive: 'B+, AB+', canReceive: 'B+, B-, O+, O-', badge: 'Common' },
  { group: 'AB-', canGive: 'AB-, AB+', canReceive: 'AB-, A-, B-, O-', badge: 'Extremely Rare' },
  { group: 'AB+', canGive: 'AB+ only', canReceive: 'All Blood Types', badge: 'Universal Receiver' },
];

const faqs = [
  {
    q: 'How long does a typical blood donation take?',
    a: 'The entire visit takes around 30 to 45 minutes, but the actual whole blood draw takes only about 8 to 10 minutes. The rest of the time includes registration, a brief medical vitals screening, and post-donation refreshments.'
  },
  {
    q: 'Who is eligible to register as a donor on BloodConnect?',
    a: 'Generally, healthy individuals aged 18 to 65 years, weighing at least 50 kg (110 lbs), with a hemoglobin level of 12.5 g/dL or higher, can register. Actual physical donation eligibility is verified at the blood bank by licensed medical staff.'
  },
  {
    q: 'How often can I donate blood?',
    a: 'Healthy male donors can donate whole blood every 90 days (3 months), while female donors can donate every 120 days (4 months). Platelet donation can be performed more frequently.'
  },
  {
    q: 'Will donating blood make me weak?',
    a: 'No. The human body naturally restores blood volume (plasma) within 24 to 48 hours, and red blood cells are fully regenerated within a few weeks. Drinking plenty of fluids and resting briefly after donation prevents dizziness.'
  },
  {
    q: 'Is my personal contact information exposed publicly?',
    a: 'No. BloodConnect does not provide an open, unrestricted public database. Donor personal contact details are safely protected and accessible solely by verified healthcare administrators coordinating blood emergency dispatches.'
  }
];

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="space-y-20 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-red-50/40 to-slate-50 pt-12 pb-20 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-crimson-100 text-crimson-800 text-xs font-semibold tracking-wide border border-crimson-200">
                <Sparkles className="w-3.5 h-3.5 text-crimson-600" />
                <span>Lifesaving Healthcare Network</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Donate Blood. <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-crimson-600 via-rose-600 to-crimson-800">
                  Save Precious Lives.
                </span>
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                BloodConnect connects voluntary blood donors with verified medical centers and patients in urgent need. Register your willingness today and be the beacon of hope when an emergency strikes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-crimson-600 hover:bg-crimson-700 text-white font-semibold text-base shadow-lg shadow-crimson-600/30 hover:shadow-xl hover:shadow-crimson-600/40 transition-all hover:-translate-y-0.5"
                >
                  <Droplet className="w-5 h-5 fill-white" />
                  <span>Register as Donor</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-base border border-slate-300 shadow-sm transition-all"
                >
                  <span>Donor Login</span>
                </Link>
              </div>

              {/* Quick statistics row */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 max-w-lg mx-auto lg:mx-0">
                <div>
                  <p className="text-2xl font-bold text-slate-900">1 Unit</p>
                  <p className="text-xs text-slate-500 font-medium">Can save up to 3 lives</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">100%</p>
                  <p className="text-xs text-slate-500 font-medium">Voluntary donation</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">24 / 7</p>
                  <p className="text-xs text-slate-500 font-medium">Admin coordination</p>
                </div>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-crimson-600 to-rose-400 rounded-3xl blur-xl opacity-25"></div>
                <div className="relative bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-crimson-50 text-crimson-600 flex items-center justify-center font-bold text-lg border border-crimson-100">
                        O+
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">Arun Kumar</h4>
                        <p className="text-xs text-slate-500">Chennai • Verified Donor</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      Available
                    </span>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-1 text-slate-600">
                      <span>Total Donations:</span>
                      <span className="font-semibold text-slate-900">2 Recorded</span>
                    </div>
                    <div className="flex justify-between py-1 text-slate-600">
                      <span>Last Donation:</span>
                      <span className="font-semibold text-slate-900">15 September 2026</span>
                    </div>
                    <div className="flex justify-between py-1 text-slate-600">
                      <span>Registered Center:</span>
                      <span className="font-semibold text-slate-900">Chennai Blood Bank</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-xs text-rose-900 flex items-center gap-3">
                    <Activity className="w-6 h-6 text-crimson-600 shrink-0" />
                    <span>Emergency request notifications match your blood type instantly across hospitals.</span>
                  </div>

                  <Link
                    to="/register"
                    className="block text-center w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-colors"
                  >
                    Join BloodConnect Today
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Why Donate Blood? */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold tracking-wider text-crimson-600">Lifesaving Purpose</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Why Your Blood Donation Matters</h2>
          <p className="text-slate-600 mt-3 text-base">
            Blood cannot be manufactured in a laboratory; it can only come as a voluntary gift from compassionate human beings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-crimson-100 text-crimson-600 flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Save Up to 3 Lives</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              A single whole blood donation can be separated into red cells, platelets, and plasma, helping multiple patients recover from critical illnesses.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Free Mini Health Check</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every donation includes a check of your hemoglobin level, blood pressure, body temperature, and pulse rate by certified staff.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Cardiovascular Health</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Regular blood donation helps reduce oxidative stress and iron stores in the body, which can benefit cardiovascular vitality.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Community Solidarity</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Stand ready when hospitals face acute seasonal shortages during surgeries, road accidents, and maternity emergencies.
            </p>
          </div>
        </div>
      </section>

      {/* 3. How It Works */}
      <section id="how-it-works" className="bg-slate-100/70 py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase font-bold tracking-wider text-crimson-600">Simple Process</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">How BloodConnect Works</h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              A secure, structured pathway from donor registration to lifesaving hospital connections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/90 relative">
              <span className="w-8 h-8 rounded-full bg-crimson-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                1
              </span>
              <h4 className="font-bold text-slate-900 text-base mb-2">Register Online</h4>
              <p className="text-sm text-slate-600">
                Complete the donor registration form with your blood group, city, contact info, and availability.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/90 relative">
              <span className="w-8 h-8 rounded-full bg-crimson-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                2
              </span>
              <h4 className="font-bold text-slate-900 text-base mb-2">Admin Review</h4>
              <p className="text-sm text-slate-600">
                Healthcare administrators review your submission in the admin panel and approve your donor registration.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/90 relative">
              <span className="w-8 h-8 rounded-full bg-crimson-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                3
              </span>
              <h4 className="font-bold text-slate-900 text-base mb-2">Control Availability</h4>
              <p className="text-sm text-slate-600">
                Toggle your availability status between "Available" and "Not Available" with a single click anytime.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/90 relative">
              <span className="w-8 h-8 rounded-full bg-crimson-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                4
              </span>
              <h4 className="font-bold text-slate-900 text-base mb-2">Donate & Track</h4>
              <p className="text-sm text-slate-600">
                Donate at verified medical centers and view your updated history directly on your personalized dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Blood Groups Compatibility Matrix */}
      <section id="blood-groups" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold tracking-wider text-crimson-600">Compatibility Guide</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Blood Groups & Compatibility</h2>
          <p className="text-slate-600 mt-3 text-sm sm:text-base">
            Understand how different blood antigens interact and where your blood type is most critically needed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {bloodTypes.map((bt) => (
            <div
              key={bt.group}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-crimson-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-12 h-12 rounded-xl bg-crimson-50 text-crimson-700 font-extrabold text-xl flex items-center justify-center border border-crimson-100">
                    {bt.group}
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {bt.badge}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium uppercase text-[10px]">Can Donate Red Cells To:</span>
                    <span className="text-slate-800 font-semibold">{bt.canGive}</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-400 block font-medium uppercase text-[10px]">Can Receive Red Cells From:</span>
                    <span className="text-slate-800 font-semibold">{bt.canReceive}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link
                  to={`/register?blood_group=${encodeURIComponent(bt.group)}`}
                  className="text-xs font-semibold text-crimson-600 hover:text-crimson-700 flex items-center justify-between"
                >
                  <span>Register as {bt.group}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FAQs */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs uppercase font-bold tracking-wider text-crimson-600">Got Questions?</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Frequently Asked Questions</h2>
          <p className="text-slate-600 mt-2 text-sm">
            Everything you need to know about registering and donating blood safely.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-6 py-4 text-left font-semibold text-slate-800 flex justify-between items-center gap-4 hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm sm:text-base">{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-5 h-5 text-crimson-600 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 6. Emergency Contact & Call To Action */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-crimson-700 via-rose-700 to-crimson-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Save a Life in Your City?
            </h2>
            <p className="text-rose-100 text-sm sm:text-base mt-3 leading-relaxed">
              Voluntary blood donors are the heartbeat of modern trauma surgery, neonatal intensive care, and cancer therapeutics. Join BloodConnect today and make your community safer.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-crimson-700 font-bold text-sm shadow-md hover:bg-rose-50 transition-colors"
              >
                <Droplet className="w-4 h-4 fill-crimson-700" />
                <span>Register as a Blood Donor</span>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-crimson-900/60 hover:bg-crimson-900 text-white font-semibold text-sm border border-white/20 transition-colors"
              >
                <span>Existing Donor Login</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
