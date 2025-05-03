"use client"

import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { signIn, signUp, signOut, getUser, verifyEmail, sendVerificationCode } from "@/lib/api"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  gender?: string
  isEmailVerified?: boolean
  isPhoneVerified?: boolean
  createdAt: string
  updatedAt: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (data: {
    firstName: string
    lastName: string
    email: string
    password: string
    phone?: string
    gender?: string
  }) => Promise<void>
  signOut: () => Promise<void>
  verifyEmail: (email: string, verificationCode: string) => Promise<void>
  sendVerificationCode: (email: string, type: 'email' | 'phone') => Promise<void>
  refreshUser: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const setAuthError = useCallback((message: string) => {
    setError(message)
    setTimeout(clearError, 5000) // Clear error after 5 seconds
  }, [clearError])

  const storeToken = useCallback((newToken: string) => {
    localStorage.setItem("accessToken", JSON.stringify(newToken))
    setToken(newToken)
  }, [])

  const clearAuthData = useCallback(() => {
    localStorage.removeItem("accessToken")
    setToken(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem("accessToken")
      if (!storedToken) {
        clearAuthData()
        return
      }

      const parsedToken = JSON.parse(storedToken)
      const userData = await getUser(parsedToken)
      setUser(userData)
      setToken(parsedToken)
    } catch (error) {
      console.error("Error refreshing user:", error)
      clearAuthData()
      setAuthError("Session expired. Please sign in again.")
    } finally {
      setIsLoading(false)
    }
  }, [clearAuthData, setAuthError])

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken")
    if (storedToken) {
      refreshUser()
    } else {
      setIsLoading(false)
    }
  }, [refreshUser])

  const handleSignIn = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await signIn(email, password)
      
      storeToken(response.token)
      const userData = await getUser(response.token)
      setUser(userData)
      
      router.push("/dashboard")
    } catch (error: any) {
      setAuthError(error.message || "Failed to sign in. Please check your credentials.")
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [router, storeToken, setAuthError])

  const handleSignUp = useCallback(async (data: {
    firstName: string
    lastName: string
    email: string
    password: string
    phone?: string
    gender?: string
  }) => {
    try {
      setIsLoading(true)
      await signUp(data)
      
      localStorage.setItem("email", data.email)
      router.push(`/auth/verification?email=${encodeURIComponent(data.email)}`)
    } catch (error: any) {
      setAuthError(error.message || "Failed to sign up. Please try again.")
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [router, setAuthError])

  const handleSignOut = useCallback(async () => {
    try {
      setIsLoading(true)
      if (token) {
        await signOut()
      }
      
      clearAuthData()
      router.replace("/")
    } catch (error: any) {
      setAuthError(error.message || "Failed to sign out. Please try again.")
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [token, clearAuthData, router, setAuthError])

  const handleVerifyEmail = useCallback(async (email: string, verificationCode: string) => {
    try {
      setIsLoading(true)
      const response = await verifyEmail({ email, verificationCode }, token!)
      
      storeToken(response.token)
      const userData = await getUser(response.token)
      setUser(userData)
      
      router.push("/dashboard")
    } catch (error: any) {
      setAuthError(error.message || "Failed to verify email. Please try again.")
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [token, router, storeToken, setAuthError])

  const handleSendVerificationCode = useCallback(async (email: string, type: 'email' | 'phone') => {
    try {
      setIsLoading(true)
      await sendVerificationCode(email, type)
    } catch (error: any) {
      setAuthError(error.message || "Failed to send verification code. Please try again.")
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [setAuthError])

  const value = useMemo(() => ({
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    error,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    verifyEmail: handleVerifyEmail,
    sendVerificationCode: handleSendVerificationCode,
    refreshUser,
    clearError
  }), [
    user,
    token,
    isLoading,
    error,
    handleSignIn,
    handleSignUp,
    handleSignOut,
    handleVerifyEmail,
    handleSendVerificationCode,
    refreshUser,
    clearError
  ])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
