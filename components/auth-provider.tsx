"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { signIn, signUp, signOut, getUser, verifyEmail, sendVerificationCode } from "@/lib/api"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  gender?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem("accessToken")
    if (storedToken) {
      setToken(JSON.parse(storedToken))
      refreshUser()
    } else {
      setIsLoading(false)
    }
  }, [])

  const refreshUser = async () => {
    try {
      const storedToken = localStorage.getItem("accessToken")
      if (!storedToken) {
        setUser(null)
        return
      }

      const userData = await getUser(JSON.parse(storedToken))
      setUser(userData)
    } catch (error) {
      console.error("Error refreshing user:", error)
      // Clear invalid token
      localStorage.removeItem("accessToken")
      setToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await signIn(email, password)
      
      // Store token
      localStorage.setItem("accessToken", response.token)
      setToken(response.token)
      
      // Get user data
      const userData = await getUser(response.token)
      setUser(userData)
      
      router.push("/dashboard")
    } catch (error) {
      console.error("Sign in error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (data: {
    firstName: string
    lastName: string
    email: string
    password: string
    phone?: string
    gender?: string
  }) => {
    try {
      setIsLoading(true)
      const response = await signUp(data)
      
      // Store email for verification
      localStorage.setItem("email", data.email)
      
      // Redirect to verification page
      router.push(`/auth/verification?email=${encodeURIComponent(data.email)}`)
    } catch (error) {
      console.error("Sign up error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      if (token) {
        await signOut()
      }
      
      // Clear auth data
      localStorage.removeItem("accessToken")
      setToken(null)
      setUser(null)
      localStorage.clear();
      router.replace("")
    } catch (error) {
      console.error("Sign out error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyEmail = async (email: string, verificationCode: string) => {
    try {
      setIsLoading(true)
      const response = await verifyEmail({ email, verificationCode }, token!)
      
      // Store token
      localStorage.setItem("accessToken", response.token)
      setToken(response.token)
      
      // Get user data
      const userData = await getUser(response.token)
      setUser(userData)
      
      router.push("/dashboard")
    } catch (error) {
      console.error("Email verification error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendVerificationCode = async (email: string, type: 'email' | 'phone') => {
    try {
      setIsLoading(true)
      await sendVerificationCode(email, type)
    } catch (error) {
      console.error("Send verification code error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    verifyEmail: handleVerifyEmail,
    sendVerificationCode: handleSendVerificationCode,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
