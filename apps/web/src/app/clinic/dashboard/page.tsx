'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Inbox, CheckCircle, Clock, AlertCircle, TrendingUp,
  ChevronRight, MapPin, Brain, MessageSquare, Loader2
} from 'lucide-react'
import { getClinicRequests } from '@/lib/api'
import { cn } from '@/lib/utils'

const MOCK_REQUESTS = [
  { id: 'r1', status: 'SUBMITTED', procedure: 'Cataract Surgery', specialty: 'Ophthalmology', createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), patient: { countryCode: 'GB', languageCode: 'en', sex: 'MALE' }, patientMessage: 'I have been waiting 18 months on the NHS. Looking for options in Spain. I have my latest ophthalmology report and blood tests ready.', hasQuote: false, quote: null },
  { id: 'r2', status: 'SUBMITTED', procedure: 'Dental Implant', specialty: 'Dental care', createdAt: new Date(Date.now() - 6 * 3600000).toISOString(), patient: { countryCode: 'FR', languageCode: 'fr', sex: 'FEMALE' }, patientMessage: 'Single implant lower jaw. Already have panoramic X-ray from my dentist.', hasQuote: false, quote: null },
  { id: 'r3', status: 'QUOTED', procedure: 'Rhinoplasty', specialty: 'Cosmetic surgery', createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), patient: { countryCode: 'DE', languageCode: 'de', sex: 'FEMALE' }, patientMessage: 'Interested in functional + cosmetic rhinoplasty. Have all pre-op documents.', hasQuote: true, quote: { totalPriceCents: 380000, currencyCode: 'EUR' } },
  { id: 'r4', status: 'CONSULTATION_PROPOSED', procedure: 'Knee Replacement', specialty: 'Orthopaedics', createdAt: new Date(Date.now() - 48 * 3600000).toISOString(), patient: { countryCode: 'NL', languageCode: 'en', sex: 'MALE' }, patientMessage: 'Total knee replacement. Cardiologist clearance already done.', hasQuote: false, quote: null },
]

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  SUBMITTED: { label: 'New Request', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertCircle },
  CONSULTATION_PROPOSED: { label: 'Consultation Set', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
  QUOTED: { label: 'Quote Sent', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'bg-slate-100 text-slate-500 border-slate-200', icon: AlertCircle },
}

const STATS = [
  { label: 'New requests', value: '2', color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Quotes sent', value: '1', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Avg response time', value: '4h', color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Acceptance rate', value: '78%', color: 'text-violet-600', bg: 'bg-violet-50' },
]

export default function ClinicDashboardPage() {
  const [requests, setRequests] = useState<typeof MOCK_REQUESTS>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('ALL')

  useEffect(() => {
    getClinicRequests()
      .then((r) => setRequests(r.data))
      .catch(() => setRequests(MOCK_REQUESTS))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'ALL' ? requests : requests.filter((r) => r.status === filter)

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1e3a5f]">Clinic Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Barcelona Vision & Dental Clinic</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge-verified"><CheckCircle className="w-3 h-3" /> Verified Partner</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map((s) => (
            <div key={s.label} className={cn('card p-5', s.bg)}>
              <p className={cn('text-3xl font-extrabold mb-1', s.color)}>{s.value}</p>
              <p className="text-sm text-slate-600 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { value: 'ALL', label: 'All' },
            { value: 'SUBMITTED', label: 'New' },
            { value: 'CONSULTATION_PROPOSED', label: 'Consultation' },
            { value: 'QUOTED', label: 'Quoted' },
          ].map((tab) => (
            <button key={tab.value} onClick={() => setFilter(tab.value)}
              className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-all',
                filter === tab.value
                  ? 'bg-[#1e3a5f] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-teal-300')}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Requests list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((req, i) => {
              const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.SUBMITTED
              const Icon = cfg.icon
              const timeAgo = getTimeAgo(req.createdAt)
              return (
                <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/clinic/request/${req.id}`} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:-translate-y-0.5 block">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-bold text-slate-900">{req.procedure}</h3>
                        <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border', cfg.color)}>
                          <Icon className="w-3 h-3" /> {cfg.label}
                        </span>
                        {req.patientMessage && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> Has message
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> Patient from {req.patient.countryCode}
                        </span>
                        <span>{req.specialty}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {timeAgo}
                        </span>
                      </div>
                      {req.patientMessage && (
                        <p className="text-sm text-slate-500 mt-2 line-clamp-1 italic">"{req.patientMessage}"</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {req.hasQuote && req.quote && (
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Quote sent</p>
                          <p className="font-bold text-[#1e3a5f]">€{(req.quote.totalPriceCents / 100).toLocaleString()}</p>
                        </div>
                      )}
                      <div className={cn(
                        'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                        req.status === 'SUBMITTED'
                          ? 'bg-amber-500 text-white hover:bg-amber-600'
                          : 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100'
                      )}>
                        {req.status === 'SUBMITTED' ? 'Review & Quote' : 'View Details'}
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function getTimeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}
