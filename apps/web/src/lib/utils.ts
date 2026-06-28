import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(cents: number, currency = 'EUR') {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export function formatPriceShort(cents: number, currency = 'EUR') {
  const amount = cents / 100
  if (amount >= 1000) return `${currency === 'EUR' ? '€' : '£'}${(amount / 1000).toFixed(1)}k`
  return formatPrice(cents, currency)
}

export const COUNTRY_FLAGS: Record<string, string> = {
  ES: '🇪🇸',
  FR: '🇫🇷',
  GB: '🇬🇧',
  TR: '🇹🇷',
  CZ: '🇨🇿',
  PL: '🇵🇱',
  PT: '🇵🇹',
  DE: '🇩🇪',
  IT: '🇮🇹',
  HU: '🇭🇺',
}

export const COUNTRY_NAMES: Record<string, string> = {
  ES: 'Spain',
  FR: 'France',
  GB: 'United Kingdom',
  TR: 'Turkey',
  CZ: 'Czech Republic',
  PL: 'Poland',
  PT: 'Portugal',
  DE: 'Germany',
  IT: 'Italy',
  HU: 'Hungary',
}

export const SPECIALTY_ICONS: Record<string, string> = {
  'Dental care': '🦷',
  'Ophthalmology': '👁️',
  'Cosmetic surgery': '✨',
  'Orthopaedics': '🦴',
  'Hair restoration': '💇',
  'Cardiology': '❤️',
  'Oncology': '🔬',
}
