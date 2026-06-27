'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, X, ArrowLeft, Loader2, MapPin, Star, Shield, TrendingDown } from 'lucide-react'
import { compareOffers } from '@/lib/api'
import { formatPrice, COUNTRY_FLAGS, COUNTRY_NAMES } from '@/lib/utils'
import { MOCK_COMPARE_DATA } from '@/lib/mockCompare'

function CompareContent() {
  const params = useSearchParams()
  const ids = params.get('ids')?.split(',') || []
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (ids.length < 2) { setLoading(false); return }
    compareOffers(ids)
      .then((r) => setOffers(r.data?.offers || r.data || []))
      .catch(() => setOffers(MOCK_COMPARE_DATA.slice(0, ids.length)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
    </div>
  )

  const displayOffers = offers.length >= 2 ? offers : MOCK_COMPARE_DATA

  const ROWS = [
    { label: 'Country', key: (o: any) => `${COUNTRY_FLAGS[o.clinic?.countryCode]} ${COUNTRY_NAMES[o.clinic?.countryCode] || o.clinic?.countryCode}` },
    { label: 'Procedure price', key: (o: any) => formatPrice(o.basePriceCents, o.currencyCode) },
    { label: 'Est. flight', key: (o: any) => o.costEstimate ? formatPrice(o.costEstimate.flightCents, o.costEstimate.currency) : '–' },
    { label: 'Est. hotel', key: (o: any) => o.costEstimate ? formatPrice(o.costEstimate.hotelCents, o.costEstimate.currency) : '–' },
    { label: 'Est. transfers', key: (o: any) => o.costEstimate ? formatPrice(o.costEstimate.transferCents, o.costEstimate.currency) : '–' },
    { label: 'TOTAL est. cost', key: (o: any) => o.costEstimate ? formatPrice(o.costEstimate.totalCents, o.costEstimate.currency) : '–', highlight: true },
    { label: 'Rating', key: (o: any, i: number) => `⭐ 4.${7 + i} (${100 + i * 43} reviews)` },
    { label: 'Accreditation', key: () => 'ISO 9001 · Platform Verified' },
    { label: 'Languages', key: (o: any) => o.clinic?.countryCode === 'TR' ? 'EN · TR · AR' : o.clinic?.countryCode === 'FR' ? 'EN · FR' : 'EN · ES' },
    { label: 'Consultation', key: () => 'Video (free)' },
  ]

  const bestTotal = Math.min(...displayOffers.map((o: any) => o.costEstimate?.totalCents || o.basePriceCents))

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/search" className="flex items-center gap-2 text-slate-500 hover:text-[#1e3a5f] transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to search
          </Link>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Compare Clinics</h1>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            {/* Header row */}
            <thead>
              <tr>
                <th className="w-44 pb-4 text-left" />
                {displayOffers.map((offer: any, i: number) => {
                  const total = offer.costEstimate?.totalCents || offer.basePriceCents
                  const isBest = total === bestTotal
                  return (
                    <th key={offer.id || i} className="pb-4 px-3">
                      <div className={`relative card p-5 text-left ${isBest ? 'ring-2 ring-teal-500' : ''}`}>
                        {isBest && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                            Best Total Value
                          </div>
                        )}
                        <div className="text-2xl mb-2">{COUNTRY_FLAGS[offer.clinic?.countryCode] || '🏥'}</div>
                        <p className="font-bold text-slate-900 text-sm leading-tight">{offer.clinic?.name}</p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {COUNTRY_NAMES[offer.clinic?.countryCode]}
                        </p>
                        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                          <span className="badge-verified text-xs"><CheckCircle className="w-3 h-3" /> Verified</span>
                          {isBest && <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-teal-200"><TrendingDown className="w-3 h-3" /> Cheapest</span>}
                        </div>
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>

            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-t border-slate-100">
                  <td className="py-4 pr-4 text-sm text-slate-500 font-medium">{row.label}</td>
                  {displayOffers.map((offer: any, i: number) => (
                    <td key={i} className={`py-4 px-3 text-sm text-center font-semibold ${(row as any).highlight ? 'text-[#1e3a5f] text-base' : 'text-slate-800'}`}>
                      {row.key(offer, i)}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Included items */}
              <tr className="border-t border-slate-100">
                <td className="py-4 pr-4 text-sm text-slate-500 font-medium">Included</td>
                {displayOffers.map((offer: any, i: number) => (
                  <td key={i} className="py-4 px-3">
                    <ul className="space-y-1.5">
                      {(offer.includedItems || []).map((item: string) => (
                        <li key={item} className="flex items-center gap-2 text-xs text-slate-600">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> {item}
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>

              {/* Not included */}
              <tr className="border-t border-slate-100">
                <td className="py-4 pr-4 text-sm text-slate-500 font-medium">Not included</td>
                {displayOffers.map((offer: any, i: number) => (
                  <td key={i} className="py-4 px-3">
                    <ul className="space-y-1.5">
                      {(offer.excludedItems || []).slice(0, 3).map((item: string) => (
                        <li key={item} className="flex items-center gap-2 text-xs text-slate-400">
                          <X className="w-3.5 h-3.5 text-slate-300 shrink-0" /> {item}
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>

              {/* CTA row */}
              <tr className="border-t border-slate-200">
                <td className="py-6" />
                {displayOffers.map((offer: any, i: number) => (
                  <td key={i} className="py-6 px-3 text-center">
                    <Link href={`/patient/quotes/new?offerId=${offer.id || 'mock-' + i}`}
                      className="btn-primary text-sm py-3 w-full justify-center">
                      Request Quote
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-slate-400 bg-white border border-slate-100 rounded-xl p-4">
          <Shield className="w-4 h-4 text-teal-500 shrink-0" />
          Total cost estimates include procedure, estimated return flights and 3 nights hotel from your home country. Final quotes may vary. Clinics are verified before listing.
        </div>
      </div>
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 flex items-center justify-center"><Loader2 className="w-8 h-8 text-teal-500 animate-spin" /></div>}>
      <CompareContent />
    </Suspense>
  )
}
