"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { Suspense } from 'react'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  let errorMessage = "An error occurred during authentication."

  if (error === "CredentialsSignin") {
    errorMessage = "Invalid email or password. Please try again."
  } else if (error === "OAuthAccountNotLinked") {
    errorMessage = "This email is already associated with another account."
  } else if (error === "AccessDenied") {
    errorMessage = "Access denied. You do not have permission to access this resource."
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex min-h-screen items-center justify-center">
        <div className="mx-auto w-full max-w-md space-y-6 p-6">
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold">Authentication Error</h1>
            <p className="text-muted-foreground">{errorMessage}</p>
          </div>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/">Go to Home</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/login">Try Again</Link>
            </Button>
          </div>
        </div>
      </div>
    </Suspense>
  )
}
