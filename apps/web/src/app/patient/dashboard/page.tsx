'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  FileText, Search, GitCompare, Brain, MessageSquare,
  CheckCircle, Clock, AlertCircle, ChevronRight,
  MapPin, Star, TrendingDown, Shield, ArrowRight, Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

const MOCK_QUOTES = [
  {
    id: 'q1', status: 'RECEIVED',
    procedure: 'Cataract Surgery (Bilateral)',
    clinicName: 'Barcelona Vision Center',
    country: 'ES', flag: '🇪🇸',
    totalPriceCents: 98000, currencyCode: 'EUR',
    savedVsUK: 420000,
    proposedDate: '2026-08-15',
    includes: ['Surgery (both eyes)', 'Premium IOL lenses', 'Pre-op consultation', '1 follow-up'],
    rating: 4.8, accreditations: ['JCI Accredited'],
    receivedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 'q2', status: 'PENDING',
    procedure: 'Cataract Surgery (Bilateral)',
    clinicName: 'Prague Eye Institute',
    country: 'CZ', flag: '🇨🇿',
    totalPriceCents: 0, currencyCode: 'EUR',
    savedVsUK: 0,
    proposedDate: '',
    includes: [],
    rating: 4.7, accreditations: ['ISO 9001'],
    receivedAt: '',
  },
]

const JOURNEY_STEPS = [
  { id: 1, label: 'Upload documents', href: '/patient/documents', done: true, icon: FileText, desc: 'Medical history summarised by AI' },
  { id: 2, label: 'Search clinics', href: '/search', done: true, icon: Search, desc: '5 clinics found for cataract surgery' },
  { id: 3, label: 'Compare options', href: '/compare', done: true, icon: GitCompare, desc: 'ES, CZ, TR compared side-by-side' },
  { id: 4, label: 'Quotes received', href: '/patient/quotes', done: false, icon: MessageSquare, desc: '1 quote received · 1 pending', active: true },
  { id: 5, label: 'Book & confirm', href: '/patient/book', done: false, icon: CheckCircle, desc: 'Pending quote acceptance' },
]

const QUOTE_STATUS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  RECEIVED: { label: 'Quote received', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
  PENDING: { label: 'Awaiting quote', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  DECLINED: { label: 'Declined', color: 'bg-slate-100 text-slate-500 border-slate-200', icon: AlertCircle },
}

export default function PatientDashboardPage() {
  const [activeTab, setActiveTab] = useState<'quotes' | 'documents' | 'journey'>('quotes')

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1e3a5f]">My Health Journey</h1>
            <p className="text-slate-500 text-sm mt-1">Cataract Surgery · Started 3 days ago</p>
          </div>
          <div className="flex gap-3">
            <Link href="/patient/documents" className="btn-secondary text-sm py-2.5">
              <FileText className="w-4 h-4" /> Upload Documents
            </Link>
            <Link href="/search" className="btn-primary text-sm py-2.5">
              <Search className="w-4 h-4" /> Find More Clinics
            </Link>
          </div>
        </div>

        {/* AI summary callout */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-teal-600 to-[#1e3a5f] rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6 text-teal-300" />
          </div>
          <div className="flex-1">
            <p className="text-white font-bold mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-300" /> AI Medical Summary Ready
            </p>
            <p className="text-teal-100 text-sm">Your documents have been analysed. Critical allergy flagged: <strong className="text-white">Penicillin (anaphylaxis)</strong>. All clinics have been notified.</p>
          </div>
          <Link href="/patient/documents" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shrink-0">
            View Summary <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Savings banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-bold text-emerald-800">Potential saving: <span className="text-emerald-600">€4,200 vs. UK private price</span></p>
            <p className="text-emerald-700 text-sm">Barcelona Vision Center quoted €980 vs. estimated €5,200 in the UK.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 pb-0">
          {([
            { id: 'quotes', label: 'Quotes', count: 2 },
            { id: 'journey', label: 'My Journey' },
            { id: 'documents', label: 'Documents' },
          ] as const).map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn('flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors',
                activeTab === tab.id
                  ? 'border-teal-500 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700')}>
              {tab.label}
              {'count' in tab && tab.count && (
                <span className="bg-teal-100 text-teal-700 text-xs font-bold px-1.5 py-0.5 rounded-full">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab: Quotes */}
        {activeTab === 'quotes' && (
          <div className="space-y-4">
            {MOCK_QUOTES.map((q, i) => {
              const cfg = QUOTE_STATUS[q.status]
              const Icon = cfg.icon
              return (
                <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className="card p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <span className="text-2xl">{q.flag}</span>
                          <div>
                            <h3 className="font-bold text-slate-900">{q.clinicName}</h3>
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {q.country}
                              {q.rating > 0 && <><Star className="w-3 h-3 text-amber-400 fill-amber-400 ml-2" /> {q.rating}</>}
                            </p>
                          </div>
                          <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border', cfg.color)}>
                            <Icon className="w-3 h-3" /> {cfg.label}
                          </span>
                          {q.accreditations.map((a) => <span key={a} className="badge-verified text-xs"><Shield className="w-3 h-3" />{a}</span>)}
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{q.procedure}</p>

                        {q.status === 'RECEIVED' && (
                          <>
                            <div className="flex items-baseline gap-2 mb-3">
                              <span className="text-3xl font-extrabold text-[#1e3a5f]">€{(q.totalPriceCents / 100).toLocaleString()}</span>
                              <span className="text-sm text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                                Save €{(q.savedVsUK / 100).toLocaleString()} vs. UK
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {q.includes.map((item) => (
                                <span key={item} className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3 text-emerald-500" /> {item}
                                </span>
                              ))}
                            </div>
                            {q.proposedDate && (
                              <p className="text-sm text-slate-500 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" /> Proposed date: <strong className="text-slate-700">{new Date(q.proposedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                              </p>
                            )}
                          </>
                        )}

                        {q.status === 'PENDING' && (
                          <p className="text-sm text-slate-400 italic">Clinic is reviewing your case. Average response time: 4–8 hours.</p>
                        )}
                      </div>

                      {q.status === 'RECEIVED' && (
                        <div className="flex flex-col gap-2 shrink-0">
                          <button className="btn-primary py-2.5 px-5 text-sm">
                            Accept Quote <CheckCircle className="w-4 h-4" />
                          </button>
                          <button className="btn-secondary py-2.5 px-5 text-sm justify-center">
                            Message Clinic
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}

            <div className="card p-6 border-dashed border-2 border-slate-200 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-700">Want more options?</p>
                <p className="text-sm text-slate-500">Browse 2,400+ clinics and request additional quotes</p>
              </div>
              <Link href="/search?q=cataract+surgery" className="btn-secondary text-sm py-2">
                Browse Clinics <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Tab: Journey */}
        {activeTab === 'journey' && (
          <div className="card p-6">
            <h2 className="font-bold text-slate-900 mb-6">Your Medical Tourism Journey</h2>
            <div className="space-y-0">
              {JOURNEY_STEPS.map((step, i) => {
                const Icon = step.icon
                return (
                  <div key={step.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0 z-10',
                        step.done ? 'bg-teal-500 border-teal-500 text-white' :
                        (step as any).active ? 'bg-amber-500 border-amber-500 text-white' :
                        'bg-white border-slate-200 text-slate-400'
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {i < JOURNEY_STEPS.length - 1 && (
                        <div className={cn('w-0.5 h-12 my-1', step.done ? 'bg-teal-200' : 'bg-slate-200')} />
                      )}
                    </div>
                    <div className="pb-8 -mt-1">
                      <p className={cn('font-semibold text-sm', step.done ? 'text-teal-700' : (step as any).active ? 'text-amber-700' : 'text-slate-400')}>
                        {step.label}
                        {step.done && <CheckCircle className="w-3.5 h-3.5 inline ml-1.5" />}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                      {!(step.done) && (
                        <Link href={step.href} className="inline-flex items-center gap-1 text-xs text-teal-600 font-semibold mt-1 hover:text-teal-700">
                          Continue <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tab: Documents */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="card p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">ophthalmology_report_2026.pdf</p>
                <p className="text-sm text-slate-500">2.3 MB · Uploaded 3 days ago · AI analysed</p>
              </div>
              <span className="badge-verified text-xs"><Brain className="w-3 h-3" /> AI Processed</span>
              <Link href="/patient/documents" className="btn-secondary text-sm py-2">View Summary</Link>
            </div>
            <div className="card p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">blood_tests_may2026.pdf</p>
                <p className="text-sm text-slate-500">1.1 MB · Uploaded 3 days ago · AI analysed</p>
              </div>
              <span className="badge-verified text-xs"><Brain className="w-3 h-3" /> AI Processed</span>
              <Link href="/patient/documents" className="btn-secondary text-sm py-2">View Summary</Link>
            </div>
            <div className="card p-5 border-dashed border-2 border-slate-200 flex flex-col items-center text-center gap-3">
              <p className="text-sm text-slate-500">Upload additional documents for a more complete medical summary</p>
              <Link href="/patient/documents" className="btn-teal text-sm py-2.5">
                <FileText className="w-4 h-4" /> Upload More Documents
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
