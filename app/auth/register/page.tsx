"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ArrowLeft, Eye, EyeOff, AlertCircle, ChevronDown, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "@/components/auth-provider"
import { countries } from "@/lib/countries"
import TermsAndConditions from "@/app/terms-and-condition/page"
import PrivacyPolicy from "@/app/privacy-policy/page"
import { validatePhoneNumber } from "@/lib/validatePhone"

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

interface Country {
  name: string;
  code: string;
  flag: string;
  dialCode: string;
}

const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];

export default function RegisterPage() {
  const { signUp, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [gender, setGender] = useState("")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false)
  const [showTermsOfService, setShowTermsOfService] = useState(false)
  const [searchQuery, setSearchQuery] = useState("");
  const [isCountryDialogOpen, setIsCountryDialogOpen] = useState(false);

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    localStorage.clear();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!phone) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and numbers";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const validate = await validatePhoneNumber(phone);

    console.log(validate)
    if(!validate.isValid){
      alert("Invalid Phone Number")
      setPhone("")
      return;
    }
    
    if (!validateForm()) return;
    if (!agreeToTerms) {
      toast({
        title: "Terms & Conditions",
        description: "Please agree to the terms and conditions to continue",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await signUp({
        firstName,
        lastName,
        email,
        password,
        phone: phone ? `${selectedCountry?.dialCode}${phone}` : undefined,
        gender: gender || undefined,
      });

      toast({
        title: "Registration successful",
        description: "Please check your email for a verification code.",
      });
    } catch (error: any) {
      console.error("Registration error:", error.response.data);
      
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const newErrors: FormErrors = {};
        
        Object.entries(apiErrors).forEach(([key, value]) => {
          newErrors[key as keyof FormErrors] = Array.isArray(value) ? value[0] : value;
        });
        
        setErrors(newErrors);
      } else {
        setErrors({ 
          general: error.response?.data?.error || "An error occurred during registration. Please try again." 
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  const filteredCountries = countries.filter(country => 
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dialCode.includes(searchQuery)
  );

  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm font-medium text-muted-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to home
      </Link>

      <div className="relative hidden h-full flex-col bg-muted py-5 p-4 md:p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-blue-950" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Image src="/logo.png" alt="Jingally Logistics" width={50} height={50} className="h-10 w-auto mr-2" />
          Jingally Logistics
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Join thousands of businesses that trust Jingally Logistics for their shipping needs and experience
              seamless global logistics solutions."
            </p>
            <footer className="text-sm">Mr Ebrahim Jingally</footer>
          </blockquote>
        </div>
      </div>

      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
            <p className="text-sm text-muted-foreground">Enter your information to create an account</p>
          </div>

          {errors.general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          <Card>
            <form onSubmit={handleSubmit}>
              <CardContent className="pt-6">
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          setErrors(prev => ({ ...prev, firstName: undefined }));
                        }}
                        className={errors.firstName ? "border-red-500" : ""}
                        required
                      />
                      {errors.firstName && (
                        <p className="text-sm text-red-500">{errors.firstName}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          setErrors(prev => ({ ...prev, lastName: undefined }));
                        }}
                        className={errors.lastName ? "border-red-500" : ""}
                        required
                      />
                      {errors.lastName && (
                        <p className="text-sm text-red-500">{errors.lastName}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors(prev => ({ ...prev, email: undefined }));
                      }}
                      className={errors.email ? "border-red-500" : ""}
                      required
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone number (Optional)</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative w-full sm:w-auto">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-[80px] h-10 flex items-center justify-between"
                          onClick={() => setIsCountryDialogOpen(true)}
                        >
                          <div className="flex items-center gap-2">
                            {selectedCountry ? (
                              <>
                                {/* <span className="text-lg">{selectedCountry.flag}</span> */}
                                <span className="text-sm">{selectedCountry.dialCode}</span>
                              </>
                            ) : (
                              <span className="text-sm text-muted-foreground">Select</span>
                            )}
                          </div>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </Button>

                        <Dialog open={isCountryDialogOpen} onOpenChange={setIsCountryDialogOpen}>
                          <DialogContent className="max-h-[80vh] overflow-hidden flex flex-col">
                            <DialogHeader>
                              <DialogTitle>Select Country</DialogTitle>
                            </DialogHeader>
                            
                            <div className="sticky top-0 p-2 bg-background border-b z-10">
                              <Input
                                placeholder="Search country or code..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full"
                              />
                            </div>

                            <div className="flex-1 overflow-y-auto">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                                {filteredCountries && filteredCountries.map((country) => (
                                  <button
                                    key={country.code}
                                    className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                                      selectedCountry?.code === country.code
                                        ? 'border-primary bg-primary/5'
                                        : 'hover:bg-accent'
                                    }`}
                                    onClick={() => {
                          setSelectedCountry(country);
                                      setIsCountryDialogOpen(false);
                                    }}
                                  >
                                    <span className="text-lg">{country.flag}</span>
                                    <div className="flex flex-col items-start">
                                      <span className="text-sm font-medium">{country.name}</span>
                                      <span className="text-xs text-muted-foreground">{country.dialCode}</span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                              {filteredCountries.length === 0 && (
                                <div className="p-4 text-sm text-muted-foreground text-center">
                                  No countries found
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Phone number"
                        value={phone}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/[^0-9]/g, "");
                          setPhone(cleaned);
                          setErrors(prev => ({ ...prev, phone: undefined }));
                        }}
                        className={`flex-1 ${errors.phone ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setErrors(prev => ({ ...prev, password: undefined }));
                        }}
                        className={errors.password ? "border-red-500" : ""}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                        }}
                        className={errors.confirmPassword ? "border-red-500" : ""}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="gender">Gender (Optional)</Label>
                    <Select
                      value={gender}
                      onValueChange={setGender}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {genderOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 bg-gray-200 w-5 rounded-full p-0"
                      onClick={() => setAgreeToTerms(!agreeToTerms)}
                    >
                      {agreeToTerms && <Check className="h-4 w-4" />}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      I agree to the{" "}
                      <Dialog>
                        <DialogTrigger className="text-primary hover:underline">
                          Terms of Service
                        </DialogTrigger>
                        <DialogContent className="max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Terms and Conditions</DialogTitle>
                          </DialogHeader>
                          <div className="mt-4">
                            {/* Add your terms of service content here */}
                            <TermsAndConditions />
                          </div>
                        </DialogContent>
                      </Dialog>{" "}
                      and{" "}
                      <Dialog>
                        <DialogTrigger className="text-primary hover:underline">
                          Privacy Policy
                        </DialogTrigger>
                        <DialogContent className="max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Privacy Policy</DialogTitle>
                          </DialogHeader>
                          <div className="mt-4">
                            {/* Add your privacy policy content here */}
                            <PrivacyPolicy />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600" 
                  disabled={isLoading || authLoading || !agreeToTerms}
                >
                  {isLoading || authLoading ? (
                    <div className="flex items-center">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      Creating account...
                    </div>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <p className="px-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="underline underline-offset-4 hover:text-primary">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
