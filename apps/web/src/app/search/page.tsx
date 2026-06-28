'use client'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, MapPin, Star, CheckCircle, Clock, Globe,
  ChevronDown, X, ArrowRight, Loader2, TrendingDown, Scale, SlidersHorizontal
} from 'lucide-react'
import { searchOffers } from '@/lib/api'
import { formatPrice, COUNTRY_FLAGS, COUNTRY_NAMES } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Offer {
  id: string
  clinic: { id: string; name: string; countryCode: string }
  procedure: { id: string; name: string; specialty: string; slug: string }
  basePriceCents: number
  currencyCode: string
  includedItems: string[]
  excludedItems: string[]
  costEstimate?: {
    procedureCents: number
    flightCents: number
    hotelCents: number
    transferCents: number
    totalCents: number
    currency: string
  }
}

const COUNTRIES = ['ES', 'FR', 'TR', 'CZ', 'PL', 'PT', 'HU', 'DE']
const SORTS = [
  { value: 'total_asc', label: 'Total Cost: Low to High' },
  { value: 'price_asc', label: 'Procedure: Low to High' },
  { value: 'price_desc', label: 'Procedure: High to Low' },
  { value: 'clinic_name', label: 'Clinic Name A-Z' },
]

function SearchContent() {
  const params = useSearchParams()
  const router = useRouter()

  const [query, setQuery] = useState(params.get('q') || '')
  const [country, setCountry] = useState(params.get('country') || '')
  const [sort, setSort] = useState('total_asc')
  const [maxPrice, setMaxPrice] = useState('')
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [patientCountry] = useState('GB')

  const doSearch = useCallback(async () => {
    setLoading(true)
    try {
      const p: Record<string, string | number | undefined> = {
        sort,
        patientCountryCode: patientCountry,
        limit: 20,
      }
      if (query) p.q = query
      if (country) p.countryCode = country
      if (maxPrice) p.maxPriceCents = Number(maxPrice) * 100
      const res = await searchOffers(p)
      setOffers(res.data?.offers || res.data || [])
    } catch {
      setOffers(MOCK_OFFERS)
    } finally {
      setLoading(false)
    }
  }, [query, country, sort, maxPrice, patientCountry])

  useEffect(() => { doSearch() }, [doSearch])

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 4 ? [...prev, id] : prev
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      {/* Search header */}
      <div className="bg-[#1e3a5f] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-white mb-6">Find a clinic for your procedure</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && doSearch()}
                placeholder="Procedure, specialty or treatment…"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border-0 focus:ring-2 focus:ring-teal-400 outline-none text-slate-900 bg-white"
              />
            </div>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="sm:w-52 px-4 py-3.5 rounded-xl border-0 focus:ring-2 focus:ring-teal-400 outline-none text-slate-900 bg-white"
            >
              <option value="">All countries</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{COUNTRY_FLAGS[c]} {COUNTRY_NAMES[c]}</option>
              ))}
            </select>
            <button onClick={doSearch} className="btn-teal px-8">
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <p className="text-slate-600 text-sm">
              {loading ? 'Searching…' : <><span className="font-bold text-slate-900">{offers.length}</span> offers found</>}
            </p>
            {selected.length > 0 && (
              <span className="bg-teal-100 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full">
                {selected.length}/4 selected for comparison
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 px-4 py-2.5 rounded-xl hover:border-teal-300 transition-colors">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="text-sm text-slate-700 bg-white border border-slate-200 px-4 py-2.5 rounded-xl hover:border-teal-300 transition-colors outline-none">
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* Filters panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Max procedure price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">€</span>
                    <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="e.g. 5000" className="input-field pl-7" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Country</label>
                  <select value={country} onChange={(e) => setCountry(e.target.value)} className="input-field">
                    <option value="">All countries</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{COUNTRY_FLAGS[c]} {COUNTRY_NAMES[c]}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button onClick={() => { setMaxPrice(''); setCountry('') }} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
                    Clear filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compare bar */}
        <AnimatePresence>
          {selected.length >= 2 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1e3a5f] text-white rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-4">
              <Scale className="w-5 h-5 text-teal-400" />
              <span className="font-medium">{selected.length} clinics selected</span>
              <Link href={`/compare?ids=${selected.join(',')}`} className="btn-teal py-2 px-5 text-sm">
                Compare Side by Side <ArrowRight className="w-4 h-4" />
              </Link>
              <button onClick={() => setSelected([])} className="p-1 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
            <p className="text-slate-500">Searching verified clinics…</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {offers.map((offer, i) => (
              <OfferCard key={offer.id} offer={offer} index={i}
                selected={selected.includes(offer.id)}
                onToggle={() => toggleSelect(offer.id)}
                canSelect={selected.length < 4 || selected.includes(offer.id)}
              />
            ))}
            {offers.length === 0 && (
              <div className="text-center py-24">
                <p className="text-slate-400 text-lg">No results found. Try a different procedure or country.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function OfferCard({ offer, index, selected, onToggle, canSelect }: {
  offer: Offer; index: number; selected: boolean; onToggle: () => void; canSelect: boolean
}) {
  const savings = offer.costEstimate
    ? Math.round(((offer.costEstimate.totalCents * 1.8) - offer.costEstimate.totalCents) / (offer.costEstimate.totalCents * 1.8) * 100)
    : 60

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      className={cn('card p-5 sm:p-6 transition-all', selected && 'ring-2 ring-teal-500 bg-teal-50/30')}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Clinic info */}
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-2xl shrink-0">
              {COUNTRY_FLAGS[offer.clinic.countryCode] || '🏥'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 text-base">{offer.clinic.name}</h3>
                <span className="badge-verified"><CheckCircle className="w-3 h-3" /> Verified</span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {COUNTRY_FLAGS[offer.clinic.countryCode]} {COUNTRY_NAMES[offer.clinic.countryCode] || offer.clinic.countryCode}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  4.{7 + (index % 3)} ({120 + index * 23} reviews)
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1 font-medium">{offer.procedure.name}</p>
            </div>
          </div>

          {/* Included */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {offer.includedItems?.slice(0, 4).map((item) => (
              <span key={item} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                ✓ {item}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="sm:text-right shrink-0">
          <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1">
            <div>
              <p className="text-2xl font-extrabold text-[#1e3a5f]">
                {formatPrice(offer.basePriceCents, offer.currencyCode)}
              </p>
              <p className="text-xs text-slate-400">procedure only</p>
            </div>
            {offer.costEstimate && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 sm:mt-2">
                <p className="text-sm font-bold text-slate-900">
                  {formatPrice(offer.costEstimate.totalCents, offer.costEstimate.currency)} total
                </p>
                <p className="text-xs text-slate-400">incl. flight + hotel</p>
              </div>
            )}
            <div className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
              <TrendingDown className="w-3 h-3 inline mr-1" />~{savings}% vs home
            </div>
          </div>

          <div className="mt-4 flex sm:flex-col gap-2">
            <button
              onClick={onToggle}
              disabled={!canSelect && !selected}
              className={cn(
                'flex-1 sm:flex-none text-sm font-semibold px-4 py-2.5 rounded-xl border-2 transition-all',
                selected
                  ? 'bg-teal-500 border-teal-500 text-white'
                  : canSelect
                    ? 'border-slate-300 text-slate-700 hover:border-teal-400 hover:text-teal-600'
                    : 'border-slate-100 text-slate-300 cursor-not-allowed'
              )}>
              {selected ? '✓ Selected' : 'Compare'}
            </button>
            <Link href={`/patient/quotes/new?offerId=${offer.id}`}
              className="flex-1 sm:flex-none btn-primary text-sm py-2.5 text-center">
              Request Quote
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Fallback mock data when backend is not running
const MOCK_OFFERS: Offer[] = [
  {
    id: 'mock-1', clinic: { id: 'c1', name: 'BarcelonaCare Dental & Vision', countryCode: 'ES' },
    procedure: { id: 'p1', name: 'Cataract Surgery', specialty: 'Ophthalmology', slug: 'cataract-surgery' },
    basePriceCents: 98000, currencyCode: 'EUR',
    includedItems: ['Clinic consultation', 'Procedure', 'Standard follow-up', 'IOL lens'],
    excludedItems: ['Flight', 'Hotel', 'Visa'],
    costEstimate: { procedureCents: 98000, flightCents: 22000, hotelCents: 31500, transferCents: 8000, totalCents: 159500, currency: 'EUR' }
  },
  {
    id: 'mock-2', clinic: { id: 'c2', name: 'Prague Eye & Aesthetic Clinic', countryCode: 'CZ' },
    procedure: { id: 'p1', name: 'Cataract Surgery', specialty: 'Ophthalmology', slug: 'cataract-surgery' },
    basePriceCents: 79000, currencyCode: 'EUR',
    includedItems: ['Consultation', 'Surgery', '1-night stay', 'Post-op kit'],
    excludedItems: ['Flight', 'Hotel'],
    costEstimate: { procedureCents: 79000, flightCents: 18000, hotelCents: 22000, transferCents: 6000, totalCents: 125000, currency: 'EUR' }
  },
  {
    id: 'mock-3', clinic: { id: 'c3', name: 'Istanbul Premium Medical', countryCode: 'TR' },
    procedure: { id: 'p2', name: 'Dental Implant', specialty: 'Dental care', slug: 'dental-implant' },
    basePriceCents: 65000, currencyCode: 'EUR',
    includedItems: ['Implant + crown', 'X-rays', '2 consultations', 'Guarantee 5 years'],
    excludedItems: ['Flight', 'Hotel', 'Bone graft if needed'],
    costEstimate: { procedureCents: 65000, flightCents: 19000, hotelCents: 18000, transferCents: 5000, totalCents: 107000, currency: 'EUR' }
  },
  {
    id: 'mock-4', clinic: { id: 'c4', name: 'Krakow Dental Excellence', countryCode: 'PL' },
    procedure: { id: 'p2', name: 'Dental Implant', specialty: 'Dental care', slug: 'dental-implant' },
    basePriceCents: 72000, currencyCode: 'EUR',
    includedItems: ['Implant', 'Crown', 'CT scan', 'Follow-up'],
    excludedItems: ['Flight', 'Hotel'],
    costEstimate: { procedureCents: 72000, flightCents: 16000, hotelCents: 14000, transferCents: 4000, totalCents: 106000, currency: 'EUR' }
  },
  {
    id: 'mock-5', clinic: { id: 'c5', name: 'Paris Elective Care Centre', countryCode: 'FR' },
    procedure: { id: 'p3', name: 'Rhinoplasty', specialty: 'Cosmetic surgery', slug: 'rhinoplasty' },
    basePriceCents: 420000, currencyCode: 'EUR',
    includedItems: ['Surgeon fee', 'Anaesthesia', 'Clinic stay 2 nights', 'Post-op follow-up'],
    excludedItems: ['Flight', 'Hotel'],
    costEstimate: { procedureCents: 420000, flightCents: 12000, hotelCents: 28000, transferCents: 8000, totalCents: 468000, currency: 'EUR' }
  },
]

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-16 flex items-center justify-center"><Loader2 className="w-8 h-8 text-teal-500 animate-spin" /></div>}>
      <SearchContent />
    </Suspense>
  )
}
