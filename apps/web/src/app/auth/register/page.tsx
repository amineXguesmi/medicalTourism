'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Shield, Mail, Lock, Eye, EyeOff, User, ArrowRight, Loader2, Building2, UserRound, CheckCircle } from 'lucide-react'
import { register } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

const PERKS = [
  'Compare 2,400+ clinics across 40+ countries',
  'AI medical document summaries in seconds',
  'GDPR-compliant · your data stays yours',
  'Free to use — no hidden fees',
]

export default function RegisterPage() {
  const router = useRouter()
  const { setAuth } = useAuth()
  const [role, setRole] = useState<'PATIENT' | 'CLINIC'>('PATIENT')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Email and password are required'); return }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      const res = await register({ email, password, role, firstName: firstName || undefined, lastName: lastName || undefined })
      const { accessToken, user } = res.data
      setAuth(accessToken, user)
      toast.success('Account created! Welcome to MedTour AI.')
      if (user.roles?.includes('CLINIC')) router.push('/clinic/dashboard')
      else router.push('/patient/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed. Try a different email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0f4c75] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side — value prop */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="hidden lg:block">
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center border border-white/20">
              <Shield className="w-5 h-5 text-teal-400" />
            </div>
            <span className="font-bold text-2xl text-white">MedTour<span className="text-teal-400">AI</span></span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Medical care abroad,<br />
            <span className="text-teal-400">without the stress.</span>
          </h1>
          <p className="text-slate-300 text-lg mb-10">
            Join 12,000+ patients who saved an average of €4,200 on their medical procedure.
          </p>
          <div className="space-y-4">
            {PERKS.map((perk) => (
              <div key={perk} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-teal-500/20 border border-teal-500/40 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <p className="text-slate-200 text-sm">{perk}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">S</div>
              <div>
                <p className="text-slate-200 text-sm italic leading-relaxed">"I saved €6,800 on my hip replacement in Prague. The AI summary helped my surgeon abroad understand my whole history in minutes."</p>
                <p className="text-slate-400 text-xs mt-2">— Sophie, 62 · United Kingdom</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right side — form */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          {/* Logo (mobile only) */}
          <div className="flex items-center justify-center gap-2.5 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center border border-white/20">
              <Shield className="w-5 h-5 text-teal-400" />
            </div>
            <span className="font-bold text-2xl text-white">MedTour<span className="text-teal-400">AI</span></span>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">Create your account</h2>
            <p className="text-slate-500 text-sm mb-6">Free forever · No credit card required</p>

            {/* Role toggle */}
            <div className="flex bg-slate-100 rounded-2xl p-1 mb-6">
              {(['PATIENT', 'CLINIC'] as const).map((r) => (
                <button key={r} type="button" onClick={() => setRole(r)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    role === r ? 'bg-white text-[#1e3a5f] shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}>
                  {r === 'PATIENT' ? <UserRound className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                  {r === 'PATIENT' ? 'I\'m a Patient' : 'I\'m a Clinic'}
                </button>
              ))}
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {role === 'PATIENT' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">First name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Sophie" className="input-field pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Last name</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                      placeholder="Martin" className="input-field" />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                  {role === 'CLINIC' ? 'Clinic email' : 'Email address'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder={role === 'CLINIC' ? 'contact@yourclinic.com' : 'your@email.com'}
                    className="input-field pl-10" autoComplete="email" required />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters" className="input-field pl-10 pr-10" autoComplete="new-password" required />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {role === 'CLINIC' && (
                <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
                  <p className="text-xs text-teal-700 font-medium">After registration, a MedTour team member will verify your clinic credentials within 24 hours. During the demo, you can access the clinic dashboard immediately.</p>
                </div>
              )}

              <div className="text-xs text-slate-400">
                By creating an account you agree to our <span className="text-teal-600 underline cursor-pointer">Terms of Service</span> and <span className="text-teal-600 underline cursor-pointer">Privacy Policy</span> (GDPR compliant).
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
                  : <>{role === 'CLINIC' ? 'Register my clinic' : 'Create free account'} <ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-5">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-teal-600 font-semibold hover:text-teal-700">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
