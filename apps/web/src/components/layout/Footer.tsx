import Link from 'next/link'
import { Shield, Lock, Globe } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#1e3a5f] to-[#14b8a6] rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl text-white">MedTour<span className="text-teal-400">AI</span></span>
            </div>
            <p className="text-sm leading-relaxed mb-5">
              Compare verified clinics across Europe. Secure medical document sharing. AI-powered summaries. All GDPR compliant.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700">
                <Lock className="w-3 h-3 text-teal-400" /> GDPR Compliant
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700">
                <Globe className="w-3 h-3 text-teal-400" /> EU/UK Regulated
              </span>
            </div>
          </div>

          {[
            {
              title: 'Platform',
              links: [
                { href: '/search', label: 'Find a Clinic' },
                { href: '/procedures', label: 'Procedures' },
                { href: '/how-it-works', label: 'How It Works' },
                { href: '/patient/documents', label: 'Medical Documents' },
              ],
            },
            {
              title: 'For Clinics',
              links: [
                { href: '/clinic/login', label: 'Clinic Login' },
                { href: '/clinics', label: 'Join Our Network' },
                { href: '/clinic/dashboard', label: 'Dashboard' },
              ],
            },
            {
              title: 'Legal & Trust',
              links: [
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Service' },
                { href: '/security', label: 'Security' },
                { href: '/compliance', label: 'GDPR Compliance' },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-semibold mb-4 text-sm">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm hover:text-teal-400 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © 2026 MedTour AI. All rights reserved. Platform does not provide medical advice.
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-teal-500" />
            Medical data protected under GDPR Article 9 · EU AI Act compliant
          </p>
        </div>
      </div>
    </footer>
  )
}
