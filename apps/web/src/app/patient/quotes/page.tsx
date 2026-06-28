'use client'
import { redirect } from 'next/navigation'

// Quotes are shown inside the patient dashboard
export default function QuotesPage() {
  redirect('/patient/dashboard')
}
