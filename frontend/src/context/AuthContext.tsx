import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import apiClient from '../api/client'
import type { CurrentUser } from '../types'

interface AuthContextValue {
  token: string | null
  isAuthenticated: boolean
  currentUser: CurrentUser | null
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<string>
  verifyEmail: (verificationToken: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    if (!token) {
      setCurrentUser(null)
      return
    }
    apiClient
      .get<CurrentUser>('/auth/me')
      .then(({ data }) => setCurrentUser(data))
      .catch(() => setCurrentUser(null))
  }, [token])

  const login = async (email: string, password: string) => {
    const { data } = await apiClient.post('/auth/login', { email, password })
    localStorage.setItem('token', data.access_token)
    setToken(data.access_token)
  }

  const register = async (email: string, password: string) => {
    const { data } = await apiClient.post('/auth/register', { email, password })
    return data.message as string
  }

  const verifyEmail = async (verificationToken: string) => {
    const { data } = await apiClient.post('/auth/verify-email', { token: verificationToken })
    localStorage.setItem('token', data.access_token)
    setToken(data.access_token)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        currentUser,
        isAdmin: currentUser?.is_admin ?? false,
        login,
        register,
        verifyEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
