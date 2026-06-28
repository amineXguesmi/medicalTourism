'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  ArrowRight,
  Building2,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Route,
  Shield,
  User,
} from 'lucide-react'
import { register } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

const PERKS = [
  'Verified clinic marketplace for the MVP network',
  'Distance-aware clinic cards from your home city',
  'Quote requests stay inside the platform',
  'Consent-first medical file sharing',
]

export default function RegisterPage() {
  const router = useRouter()
  const { setAuth } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('FR')
  const [residenceCity, setResidenceCity] = useState('')
  const [password, setPassword] = useState('')
  const [travelRadiusKm, setTravelRadiusKm] = useState('2500')
  const [medicalSummary, setMedicalSummary] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !email || !phone || !countryCode || !residenceCity || !password) {
      toast.error('Please complete the required patient profile fields.')
      return
    }
    if (password.length < 12) {
      toast.error('Password must be at least 12 characters.')
      return
    }

    setLoading(true)
    try {
      const res = await register({
        fullName,
        email,
        password,
        phone,
        countryCode: countryCode.toUpperCase(),
        residenceCity,
        languageCode: 'en',
        currencyCode: 'EUR',
        biologicalSex: 'UNKNOWN',
        travelRadiusKm: Number(travelRadiusKm) || undefined,
        medicalSummary: medicalSummary || undefined,
      })
      const { accessToken, user } = res.data
      setAuth(accessToken, user)
      toast.success('Patient profile created.')
      router.push('/patient/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed. Try a different email or phone.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#083f3c] via-[#0a5b56] to-[#087096] px-4 py-12 lg:py-20">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} className="text-white">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
              <Shield className="h-5 w-5 text-cyan-200" />
            </div>
            <span className="text-2xl font-black">MedTour AI</span>
          </div>

          <h1 className="mb-4 text-4xl font-black leading-tight lg:text-5xl">
            Build your patient travel profile.
          </h1>
          <p className="mb-8 max-w-xl text-base font-medium leading-7 text-teal-50">
            Your location helps estimate clinic distance and travel context before you request quotes or share medical documents.
          </p>

          <div className="space-y-3">
            {PERKS.map((perk) => (
              <div key={perk} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-cyan-200" />
                <p className="text-sm font-semibold text-teal-50">{perk}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200/40 bg-amber-50/10 p-4">
            <div className="flex gap-3">
              <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-100" />
              <p className="text-sm font-semibold text-amber-50">
                Clinic registration is handled through verified onboarding for now. Demo clinic users can sign in with the seeded clinic account.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-[2rem] border border-white/20 bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-6">
              <p className="mb-2 text-sm font-black uppercase tracking-wide text-teal-700">Patient signup</p>
              <h2 className="text-2xl font-black text-[#083f3c]">Create your account</h2>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Distance estimates use your home city and clinic destination. Exact map routing can come later.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <Field label="Full name" icon={<User className="h-4 w-4" />}>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Demo Patient" className="input-field pl-10" required />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" icon={<Mail className="h-4 w-4" />}>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="patient@example.com" className="input-field pl-10" autoComplete="email" required />
                </Field>
                <Field label="Phone" icon={<Phone className="h-4 w-4" />}>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+33123456789" className="input-field pl-10" required />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-[0.8fr_1.2fr]">
                <Field label="Country code" icon={<MapPin className="h-4 w-4" />}>
                  <input value={countryCode} onChange={(e) => setCountryCode(e.target.value.toUpperCase())} maxLength={2} placeholder="FR" className="input-field pl-10 uppercase" required />
                </Field>
                <Field label="Home city" icon={<MapPin className="h-4 w-4" />}>
                  <input value={residenceCity} onChange={(e) => setResidenceCity(e.target.value)} placeholder="Paris" className="input-field pl-10" required />
                </Field>
              </div>

              <Field label="Max clinic distance" icon={<Route className="h-4 w-4" />}>
                <input type="number" value={travelRadiusKm} onChange={(e) => setTravelRadiusKm(e.target.value)} placeholder="2500" className="input-field pl-10 pr-12" />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">km</span>
              </Field>

              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-800">
                We show whether each clinic appears within or above this preferred distance. It is not a medical eligibility filter.
              </div>

              <Field label="Password" icon={<Lock className="h-4 w-4" />}>
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 12 characters" className="input-field pl-10 pr-10" autoComplete="new-password" required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </Field>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Medical context optional</label>
                <textarea value={medicalSummary} onChange={(e) => setMedicalSummary(e.target.value)} rows={3} placeholder="Treatment interest, allergies, mobility needs" className="input-field resize-none" />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Creating account...
                  </>
                ) : (
                  <>
                    Create patient account <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-bold text-teal-700 hover:text-teal-800">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function Field({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
        {children}
      </div>
    </div>
  )
}
