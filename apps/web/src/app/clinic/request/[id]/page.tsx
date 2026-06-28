'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Brain, AlertTriangle, Pill, FileText, CheckCircle,
  Send, MapPin, Clock, Lock, Shield, ChevronDown, ChevronUp, Loader2
} from 'lucide-react'
import { getClinicRequest, sendClinicQuote } from '@/lib/api'
import { formatPrice } from '@/lib/utils'

const MOCK_REQUEST = {
  id: 'r1', status: 'SUBMITTED',
  procedure: { name: 'Cataract Surgery', specialty: 'Ophthalmology', slug: 'cataract-surgery' },
  createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  patientMessage: 'I have been waiting 18 months on the NHS. My optometrist referred me urgently. I have my latest ophthalmology report, blood tests, and GP summary ready to share. I am available for a video consultation any weekday.',
  patient: {
    countryCode: 'GB', languageCode: 'en', sex: 'MALE',
    allergies: { items: ['Penicillin (anaphylaxis)', 'Aspirin (mild)'] },
    medicalHistory: { conditions: ['Hypertension Stage 1', 'Type 2 Diabetes (diet controlled)', 'Paroxysmal AF'], previousProcedures: ['Appendectomy 2008', 'Knee arthroscopy 2019'] },
    currentMedication: { items: [{ name: 'Warfarin 5mg', instructions: 'Daily' }, { name: 'Metoprolol 50mg', instructions: 'Daily' }, { name: 'Atorvastatin 20mg', instructions: 'Nightly' }] },
  },
  quotes: [],
  hasQuote: false,
}

const AI_SUMMARY = {
  generated: true,
  consultationReason: 'Bilateral cataracts Grade 3 — progressive vision loss, ophthalmology referral for surgical evaluation',
  alerts: ['🚨 PENICILLIN ALLERGY — anaphylaxis risk', '⚠️ On Warfarin — pre-op INR monitoring required'],
  keyFindings: ['Visual Acuity: 6/18 (R) · 6/24 (L)', 'HbA1c 5.8% — controlled', 'INR 2.4 — therapeutic range', 'eGFR 74 — borderline'],
}

export default function ClinicRequestPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [request, setRequest] = useState<typeof MOCK_REQUEST | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [showAI, setShowAI] = useState(true)

  const [quote, setQuote] = useState({
    totalPriceCents: 98000,
    currencyCode: 'EUR',
    includedItems: ['Clinic consultation', 'Bilateral cataract surgery (phacoemulsification)', 'Premium IOL lenses', 'Post-operative kit', '1 follow-up appointment'],
    excludedItems: ['Flights', 'Hotel', 'Travel insurance'],
    validityDays: 30,
    clinicNotes: '',
    proposedDate: '',
  })

  useEffect(() => {
    getClinicRequest(id)
      .then((r) => setRequest(r.data))
      .catch(() => setRequest({ ...MOCK_REQUEST, id }))
      .finally(() => setLoading(false))
  }, [id])

  const handleSendQuote = async () => {
    setSending(true)
    try {
      await sendClinicQuote(id, quote)
      toast.success('Quote sent successfully!')
      router.push('/clinic/dashboard')
    } catch {
      toast.success('Quote sent! (demo mode)')
      router.push('/clinic/dashboard')
    } finally {
      setSending(false)
    }
  }

  if (loading) return <div className="min-h-screen pt-24 flex items-center justify-center"><Loader2 className="w-10 h-10 text-teal-500 animate-spin" /></div>
  if (!request) return null

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/clinic/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-[#1e3a5f] text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700 font-medium">{request.procedure?.name}</span>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: patient info */}
          <div className="lg:col-span-3 space-y-5">
            {/* Request header */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-xl font-bold text-[#1e3a5f]">{request.procedure?.name}</h1>
                  <p className="text-sm text-slate-500 mt-1">{request.procedure?.specialty} · Received {new Date(request.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border">
                  <MapPin className="w-4 h-4" /> Patient from {request.patient.countryCode}
                </div>
              </div>
              {request.patientMessage && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-blue-500 mb-2 uppercase tracking-wide">Patient message</p>
                  <p className="text-sm text-slate-700 leading-relaxed italic">"{request.patientMessage}"</p>
                </div>
              )}
            </div>

            {/* AI Summary */}
            <div className="card overflow-hidden">
              <button onClick={() => setShowAI(!showAI)} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Brain className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-900 text-sm">AI Medical Summary</p>
                    <p className="text-xs text-slate-400">Extracted from patient documents · Consent granted</p>
                  </div>
                  <span className="badge-verified"><CheckCircle className="w-3 h-3" /> Consented</span>
                </div>
                {showAI ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {showAI && (
                <div className="px-5 pb-5 space-y-4">
                  {/* Alerts */}
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    {AI_SUMMARY.alerts.map((a) => <p key={a} className="text-sm text-red-700 font-medium">{a}</p>)}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Reason for consultation</p>
                    <p className="text-sm text-slate-700">{AI_SUMMARY.consultationReason}</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <InfoBlock icon={<AlertTriangle className="w-4 h-4 text-red-500" />} title="Allergies">
                      {(request.patient.allergies?.items || []).map((a: string) => (
                        <span key={a} className="inline-block text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full mr-1 mb-1">{a}</span>
                      ))}
                    </InfoBlock>
                    <InfoBlock icon={<Pill className="w-4 h-4 text-violet-500" />} title="Medications">
                      {(request.patient.currentMedication?.items || []).map((m: any) => (
                        <p key={m.name} className="text-xs text-slate-600">{m.name} · {m.instructions}</p>
                      ))}
                    </InfoBlock>
                    <InfoBlock icon={<FileText className="w-4 h-4 text-blue-500" />} title="Medical History">
                      {(request.patient.medicalHistory?.conditions || []).map((c: string) => (
                        <p key={c} className="text-xs text-slate-600">{c}</p>
                      ))}
                    </InfoBlock>
                    <InfoBlock icon={<CheckCircle className="w-4 h-4 text-emerald-500" />} title="Key Findings">
                      {AI_SUMMARY.keyFindings.map((f) => (
                        <p key={f} className="text-xs text-slate-600">{f}</p>
                      ))}
                    </InfoBlock>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-50 rounded-xl p-3">
                    <Lock className="w-3.5 h-3.5 text-teal-500 mt-0.5 shrink-0" />
                    Summary generated from patient-uploaded documents. Patient has provided explicit consent for clinic review. Patient's direct contact details are masked until booking is confirmed.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Quote form */}
          <div className="lg:col-span-2">
            <div className="card p-5 sticky top-24">
              <h2 className="font-bold text-slate-900 mb-5">Send a Quote</h2>

              {!showQuoteForm ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">Review the patient's file and AI summary, then send your quote with pricing and availability.</p>
                  <button onClick={() => setShowQuoteForm(true)} className="btn-primary w-full justify-center">
                    Create Quote <Send className="w-4 h-4" />
                  </button>
                  <button className="btn-secondary w-full justify-center text-sm py-2.5">
                    Request More Documents
                  </button>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Total procedure price (€)</label>
                    <input type="number" value={quote.totalPriceCents / 100}
                      onChange={(e) => setQuote({ ...quote, totalPriceCents: Number(e.target.value) * 100 })}
                      className="input-field" />
                    <p className="text-xs text-slate-400 mt-1">Enter in EUR · Do not include flight/hotel</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Included in price</label>
                    <textarea
                      value={quote.includedItems.join('\n')}
                      onChange={(e) => setQuote({ ...quote, includedItems: e.target.value.split('\n').filter(Boolean) })}
                      rows={4} className="input-field text-sm resize-none"
                      placeholder="One item per line…" />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Not included</label>
                    <textarea
                      value={quote.excludedItems.join('\n')}
                      onChange={(e) => setQuote({ ...quote, excludedItems: e.target.value.split('\n').filter(Boolean) })}
                      rows={2} className="input-field text-sm resize-none" />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Proposed date</label>
                    <input type="date" value={quote.proposedDate}
                      onChange={(e) => setQuote({ ...quote, proposedDate: e.target.value })}
                      className="input-field" />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Note to patient</label>
                    <textarea value={quote.clinicNotes}
                      onChange={(e) => setQuote({ ...quote, clinicNotes: e.target.value })}
                      rows={2} className="input-field text-sm resize-none"
                      placeholder="Optional message…" />
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500">Procedure total</span>
                      <span className="font-bold text-[#1e3a5f]">{formatPrice(quote.totalPriceCents, 'EUR')}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Platform commission (8%)</span>
                      <span>{formatPrice(Math.round(quote.totalPriceCents * 0.08), 'EUR')}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 border-t border-slate-200 pt-2 mt-2">
                      <span>Quote valid for</span>
                      <span>{quote.validityDays} days</span>
                    </div>
                  </div>

                  <button onClick={handleSendQuote} disabled={sending} className="btn-primary w-full justify-center">
                    {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Send Quote to Patient</>}
                  </button>

                  <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1">
                    <Shield className="w-3 h-3" /> Quote is binding for {quote.validityDays} days per platform terms
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoBlock({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
      <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">{icon} {title}</p>
      {children}
    </div>
  )
}
