"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const handleLogout = async () => {
      localStorage.clear();
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    }

    handleLogout()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Logging out...</h1>
        <p className="mt-2 text-muted-foreground">You are being redirected to the home page.</p>
      </div>
    </div>
  )
}
