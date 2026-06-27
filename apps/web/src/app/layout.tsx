import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'MedTour AI — Compare Verified Clinics. AI Medical Summaries.',
  description: 'Find and compare verified clinics across Europe. Upload medical documents and get AI-powered summaries in seconds. GDPR compliant.',
  keywords: 'medical tourism, clinic comparison, AI medical summary, health travel, EU healthcare',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <Toaster position="top-right" toastOptions={{
            style: {
              borderRadius: '12px',
              background: '#0f172a',
              color: '#f8fafc',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#14b8a6', secondary: '#fff' } },
          }} />
        </AuthProvider>
      </body>
    </html>
  )
}
