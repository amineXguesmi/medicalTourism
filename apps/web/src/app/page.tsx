'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Shield, Search, FileText, Brain, CheckCircle, ArrowRight,
  Star, Lock, Globe, TrendingDown, Clock, Users, ChevronRight, Zap, HeartPulse
} from 'lucide-react'

const STATS = [
  { value: '40+', label: 'Countries covered', icon: Globe },
  { value: '2,400+', label: 'Verified clinics', icon: CheckCircle },
  { value: '68%', label: 'Average savings vs home', icon: TrendingDown },
  { value: '<30s', label: 'AI summary speed', icon: Zap },
]

const FEATURES = [
  {
    icon: Search,
    color: 'bg-blue-50 text-blue-600',
    title: 'Compare clinics side by side',
    desc: 'Filter by country, price, specialty, and accreditation. See the real total cost — procedure, flight, hotel, transfers — in one number.',
  },
  {
    icon: Brain,
    color: 'bg-teal-50 text-teal-600',
    title: 'AI medical document summary',
    desc: 'Upload your 20-page medical history. Get a 1-page structured summary with allergies, diagnoses, medications, and alerts — in seconds.',
  },
  {
    icon: Lock,
    color: 'bg-emerald-50 text-emerald-600',
    title: 'Secure document sharing',
    desc: 'Share documents with clinics under explicit consent only. Full audit log. GDPR Article 9 compliant. Your data never trains AI models.',
  },
  {
    icon: HeartPulse,
    color: 'bg-violet-50 text-violet-600',
    title: 'Post-operative follow-up',
    desc: 'Medication reminders, recovery journal, and consent-gated clinic monitoring. Your care continues long after you return home.',
  },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Search & compare', desc: 'Enter your procedure. Compare verified clinics by price, country, and quality — with total travel cost estimated.' },
  { step: '02', title: 'Upload your records', desc: 'Upload your medical documents. Our AI creates a clean 1-2 page summary with source citations in under 30 seconds.' },
  { step: '03', title: 'Request quotes', desc: 'Send your AI summary (with your consent) to up to 4 clinics. Your contact details stay masked until booking.' },
  { step: '04', title: 'Book & travel securely', desc: 'Accept a quote, pay the secure deposit, and go. Post-op follow-up happens inside the platform.' },
]

const TESTIMONIALS = [
  {
    quote: "I saved €9,200 on my knee replacement in Prague compared to the UK private cost. The AI summary meant the clinic had everything they needed before I even arrived.",
    name: 'James W.',
    location: 'London, UK',
    procedure: 'Knee replacement · Czech Republic',
    rating: 5,
  },
  {
    quote: "As a clinic, we receive complete, structured patient files instead of WhatsApp photos. The platform has reduced our pre-assessment time by 60%.",
    name: 'Dr. María Santos',
    location: 'Barcelona, Spain',
    procedure: 'Partner Clinic',
    rating: 5,
  },
  {
    quote: "Finally, a platform that takes GDPR seriously for health data. We knew exactly who accessed our documents, when, and why.",
    name: 'Sophie L.',
    location: 'Paris, France',
    procedure: 'Rhinoplasty · Spain',
    rating: 5,
  },
]

const PROCEDURES = [
  { name: 'Dental Implants', savings: 'Save up to 70%', flag: '🦷', from: '€800', countries: 'Poland · Hungary · Turkey' },
  { name: 'Cataract Surgery', savings: 'Save up to 60%', flag: '👁️', from: '€900', countries: 'Czech Republic · Spain' },
  { name: 'Rhinoplasty', savings: 'Save up to 55%', flag: '✨', from: '€2,400', countries: 'Turkey · Spain · France' },
  { name: 'Knee Replacement', savings: 'Save up to 65%', flag: '🦴', from: '€5,800', countries: 'Czech Republic · Poland' },
  { name: 'Hair Transplant', savings: 'Save up to 75%', flag: '💇', from: '€1,200', countries: 'Turkey · Portugal' },
  { name: 'IVF Treatment', savings: 'Save up to 50%', flag: '❤️', from: '€2,900', countries: 'Spain · Czech Republic' },
]

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0f4c75]">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-300 text-sm font-medium px-4 py-2 rounded-full mb-8">
                <Zap className="w-4 h-4" />
                Powered by AI · GDPR Compliant · EU/UK Regulated
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                Your healthcare.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">
                  Better quality.
                </span>
                <br />
                Lower cost.
              </h1>

              <p className="text-lg text-slate-300 leading-relaxed mb-10 max-w-xl">
                Compare verified clinics across Europe with AI-powered medical document summaries.
                Save up to 70% on procedures. Your data stays yours.
              </p>

              {/* Search bar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8 max-w-xl">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Dental implant, knee replacement…"
                    className="w-full pl-11 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:bg-white/15 transition-all"
                    onKeyDown={(e) => e.key === 'Enter' && (window.location.href = `/search?q=${searchQuery}`)}
                  />
                </div>
                <Link href={`/search${searchQuery ? `?q=${searchQuery}` : ''}`} className="btn-teal whitespace-nowrap px-8 py-4">
                  Search Clinics <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-3">
                {['GDPR Article 9', 'EU AI Act', 'ISO 27001 Ready', 'No data sold'].map((badge) => (
                  <span key={badge} className="inline-flex items-center gap-1.5 text-xs text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                    <CheckCircle className="w-3 h-3 text-teal-400" /> {badge}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Right - demo card */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="hidden lg:block">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 shadow-2xl">
                {/* AI Summary preview */}
                <div className="bg-white rounded-2xl p-5 mb-4 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                        <Brain className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">AI Medical Summary</p>
                        <p className="text-xs text-slate-400">Generated from 18 pages · 28s</p>
                      </div>
                    </div>
                    <span className="badge-verified"><CheckCircle className="w-3 h-3" /> Verified</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Allergies', value: 'Penicillin (severe)', color: 'bg-red-50 text-red-700 border-red-200' },
                      { label: 'Condition', value: 'Bilateral cataract · Grade 3', color: 'bg-amber-50 text-amber-700 border-amber-200' },
                      { label: 'Current Meds', value: 'Atorvastatin 20mg · Metoprolol', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                      { label: 'Last Labs', value: 'HbA1c 5.8% · Cholesterol normal', color: 'bg-green-50 text-green-700 border-green-200' },
                    ].map((item) => (
                      <div key={item.label} className={`flex items-start gap-3 p-2.5 rounded-lg border text-xs ${item.color}`}>
                        <span className="font-bold w-20 shrink-0">{item.label}</span>
                        <span>{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Source: patient_records_2026.pdf · pages 3, 7, 12
                  </p>
                </div>

                {/* Comparison preview */}
                <div className="space-y-2">
                  {[
                    { clinic: 'BarcelonaCare', country: '🇪🇸', price: '€1,240', total: '€1,890', rating: 4.9, badge: 'Best Value' },
                    { clinic: 'Prague Eye Clinic', country: '🇨🇿', price: '€980', total: '€1,740', rating: 4.8, badge: 'Cheapest' },
                    { clinic: 'Paris Elective', country: '🇫🇷', price: '€1,850', total: '€2,150', rating: 5.0, badge: 'Top Rated' },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{c.country}</span>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{c.clinic}</p>
                          <p className="text-xs text-slate-500">Total est. {c.total}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#1e3a5f]">{c.price}</p>
                        <span className="text-xs text-teal-600 font-semibold">{c.badge}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-extrabold text-white mb-1">{s.value}</p>
                <p className="text-sm text-slate-400">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PROCEDURES STRIP */}
      <section className="bg-slate-50 border-y border-slate-100 py-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-400 font-medium mb-8 uppercase tracking-widest">Popular Procedures</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {PROCEDURES.map((p) => (
              <Link key={p.name} href={`/search?q=${p.name.toLowerCase().replace(' ', '-')}`}
                className="group bg-white rounded-2xl p-4 border border-slate-100 hover:border-teal-300 hover:shadow-md transition-all text-center">
                <span className="text-3xl mb-2 block">{p.flag}</span>
                <p className="text-sm font-semibold text-slate-900 mb-1">{p.name}</p>
                <p className="text-xs text-teal-600 font-bold mb-1">from {p.from}</p>
                <p className="text-xs text-emerald-600 font-medium">{p.savings}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.5 }}
            className="text-center mb-16">
            <p className="text-teal-600 font-semibold text-sm uppercase tracking-widest mb-3">Why MedTour AI</p>
            <h2 className="section-title mb-4">Everything you need for safe medical travel</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Built compliance-first. GDPR Article 9 for health data. EU AI Act aware. Your medical records are never sold or used to train models.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card p-6 group hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center mb-5`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <p className="text-teal-600 font-semibold text-sm uppercase tracking-widest mb-3">Simple Process</p>
            <h2 className="section-title mb-4">From search to surgery in 4 steps</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div key={step.step} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}
                className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-teal-200 to-transparent z-0 -translate-x-4" />
                )}
                <div className="card p-6 relative z-10">
                  <div className="text-5xl font-black text-slate-100 mb-3">{step.step}</div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/search" className="btn-primary text-base px-10 py-4">
              Start comparing clinics <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* AI HIGHLIGHT SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <p className="text-teal-600 font-semibold text-sm uppercase tracking-widest mb-4">AI Document Intelligence</p>
              <h2 className="section-title mb-6">
                20 pages of medical history.<br />
                <span className="gradient-text">1 perfect summary.</span>
              </h2>
              <p className="text-slate-500 leading-relaxed mb-8">
                Patients upload their medical documents. Our AI extracts and structures allergies, diagnoses, medications, lab results, and medical history — with citations back to the source page. Clinics get a complete, structured file instead of a chaotic PDF stack.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  'Allergies and critical alerts highlighted first',
                  'Source citations — every finding links to its document page',
                  'AI limitations clearly shown — always reviewed by professionals',
                  'Patient edits before sharing — you stay in control',
                  'Multilingual: EN, FR, AR, ES, DE, IT',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                    <CheckCircle className="w-5 h-5 text-teal-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/patient/documents" className="btn-teal">
                Try AI Summary <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="relative">
                <div className="card p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                        <Brain className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">AI Medical Summary</p>
                        <p className="text-xs text-slate-400">patient_medical_file_2026.pdf · 18 pages · Generated 28s</p>
                      </div>
                    </div>
                    <span className="badge-gdpr"><Lock className="w-3 h-3" /> GDPR</span>
                  </div>

                  <div className="space-y-3 mb-5">
                    <SummaryRow color="red" label="🚨 Allergies" value="Penicillin (anaphylaxis risk) · Aspirin (mild)" />
                    <SummaryRow color="amber" label="📋 Condition" value="Bilateral cataracts Grade 3 · Hypertension Stage 1" />
                    <SummaryRow color="blue" label="💊 Medications" value="Atorvastatin 20mg · Metoprolol 50mg · Amlodipine" />
                    <SummaryRow color="green" label="🧪 Last Labs" value="HbA1c 5.8% (normal) · eGFR 74 · Cholesterol 4.2" />
                    <SummaryRow color="purple" label="🔬 Procedures" value="Appendectomy 2018 · Right knee arthroscopy 2022" />
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                    <p className="text-xs text-amber-700 font-semibold">⚠️ AI Disclaimer</p>
                    <p className="text-xs text-amber-600 mt-1">This summary is generated by AI and must be reviewed by a qualified healthcare professional before any clinical decision.</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-teal-500" /> Not stored after session</span>
                    <span>Sources: p.3, p.7, p.11, p.14</span>
                  </div>
                </div>

                {/* Upload indicator */}
                <div className="absolute -top-4 -right-4 bg-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce">
                  ✓ Ready in 28s
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-gradient-to-br from-[#0f172a] to-[#1e3a5f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <p className="text-teal-400 font-semibold text-sm uppercase tracking-widest mb-3">Trusted by patients & clinics</p>
            <h2 className="text-3xl font-bold text-white mb-4">Real stories. Real savings.</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-5">"{t.quote}"</p>
                <div className="border-t border-white/10 pt-4">
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-slate-400 text-xs">{t.location}</p>
                  <p className="text-teal-400 text-xs font-medium mt-1">{t.procedure}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-teal-500 to-cyan-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-4xl font-extrabold text-white mb-4">Ready to compare your options?</h2>
            <p className="text-teal-50 text-lg mb-10">
              Join thousands of patients who found better care at a fraction of the cost. Free to use. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="inline-flex items-center gap-2 bg-white text-teal-700 font-bold px-10 py-4 rounded-xl hover:bg-teal-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Create Free Account <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/search" className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white font-bold px-10 py-4 rounded-xl hover:bg-white/20 transition-all">
                Browse Clinics
              </Link>
            </div>
            <p className="text-teal-100 text-sm mt-6 flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" /> GDPR compliant · Data never sold · EU/UK regulated
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

function SummaryRow({ color, label, value }: { color: string; label: string; value: string }) {
  const colors: Record<string, string> = {
    red: 'bg-red-50 border-red-200 text-red-800',
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    purple: 'bg-violet-50 border-violet-200 text-violet-800',
  }
  return (
    <div className={`flex gap-3 p-2.5 rounded-lg border text-xs ${colors[color]}`}>
      <span className="font-bold shrink-0">{label}</span>
      <span>{value}</span>
    </div>
  )
}
