'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { login } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import Cookies from 'js-cookie'

const DEMO_ACCOUNTS = [
  { label: 'Patient Demo', email: 'patient.demo@medtour.local', password: 'ChangeMeMvp2026!', role: 'PATIENT' },
  { label: 'Clinic Demo', email: 'clinic.demo@medtour.local', password: 'ChangeMeMvp2026!', role: 'CLINIC' },
  { label: 'Admin Demo', email: 'admin@medtour.local', password: 'ChangeMeMvp2026!', role: 'ADMIN' },
]

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!email || !password) { toast.error('Please enter email and password'); return }
    setLoading(true)
    try {
      const res = await login(email, password)
      const { accessToken, user } = res.data
      setAuth(accessToken, user)
      toast.success(`Welcome back, ${user.email.split('@')[0]}!`)
      if (user.roles?.includes('CLINIC')) router.push('/clinic/dashboard')
      else if (user.roles?.includes('ADMIN')) router.push('/admin')
      else router.push('/patient/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const demoLogin = async (account: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(account.email)
    setPassword(account.password)
    setLoading(true)
    try {
      const res = await login(account.email, account.password)
      const { accessToken, user } = res.data
      setAuth(accessToken, user)
      toast.success(`Logged in as ${account.label}`)
      if (account.role === 'CLINIC') router.push('/clinic/dashboard')
      else if (account.role === 'ADMIN') router.push('/admin')
      else router.push('/patient/dashboard')
    } catch {
      // Demo mode — fake login
      const fakeToken = 'demo-token'
      const fakeUser = { id: 'demo', email: account.email, roles: [account.role] }
      Cookies.set('medtour_token', fakeToken)
      setAuth(fakeToken, fakeUser as any)
      toast.success(`Demo: logged in as ${account.label}`)
      if (account.role === 'CLINIC') router.push('/clinic/dashboard')
      else router.push('/patient/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0f4c75] flex items-center justify-center px-4 py-20">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center border border-white/20">
            <Shield className="w-5 h-5 text-teal-400" />
          </div>
          <span className="font-bold text-2xl text-white">MedTour<span className="text-teal-400">AI</span></span>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h1 className="text-2xl font-bold text-[#1e3a5f] mb-2">Welcome back</h1>
          <p className="text-slate-500 text-sm mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com" className="input-field pl-10" autoComplete="email" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" className="input-field pl-10 pr-10" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="border-t border-slate-100 pt-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 text-center">Demo accounts</p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button key={acc.role} onClick={() => demoLogin(acc)} disabled={loading}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-all text-left group">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-teal-700">{acc.label}</p>
                    <p className="text-xs text-slate-400">{acc.email}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            No account yet?{' '}
            <Link href="/auth/register" className="text-teal-600 font-semibold hover:text-teal-700">
              Create one free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
