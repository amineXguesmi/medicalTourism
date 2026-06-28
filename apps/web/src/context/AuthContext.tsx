'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import Cookies from 'js-cookie'
import { getMe } from '@/lib/api'

interface User {
  id: string
  email: string
  roles: string[]
  firstName?: string
  lastName?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  setAuth: (token: string, user: User) => void
  logout: () => void
  isClinic: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = Cookies.get('medtour_token')
    if (saved) {
      setToken(saved)
      getMe()
        .then((r) => setUser(r.data))
        .catch(() => Cookies.remove('medtour_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const setAuth = (newToken: string, newUser: User) => {
    Cookies.set('medtour_token', newToken, { expires: 1 })
    setToken(newToken)
    setUser(newUser)
  }

  const logout = () => {
    Cookies.remove('medtour_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user, token, loading, setAuth, logout,
      isClinic: user?.roles?.includes('CLINIC') ?? false,
      isAdmin: user?.roles?.includes('ADMIN') ?? false,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
