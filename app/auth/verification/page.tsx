'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, ChevronLeft } from 'lucide-react';
import { verifyEmail } from '@/lib/api';

export default function VerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email';
  const [userEmail, setUserEmail] = useState(email);
  const [accessToken, setAccessToken] = useState('');
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  useEffect(() => {
    const fetchUserEmail = async () => {
      const email = localStorage.getItem('email');
      const accessTokens = localStorage.getItem('accessToken') || "";
      setUserEmail(email || '');
      setAccessToken(JSON.parse(accessTokens));
    };
    fetchUserEmail();
  }, []);

  // Start countdown timer for resend button
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);
  
  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      alert("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    const postData = {
      email: userEmail ? userEmail : email,
      verificationCode: otpValue,
    }

    try {
      const response = await verifyEmail(postData, accessToken);
      alert(response.message || "Email verified successfully");
      setTimeout(() => {
        router.push('/auth/sign-in');
      }, 1500);
    } catch (error: any) {
      alert(error.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    if (!canResend) return;
    setTimer(60);
    setCanResend(false);
  };
  
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="absolute top-8 left-4 bg-white/90 p-2 rounded-lg flex items-center shadow-sm hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
          <span className="ml-1 font-medium text-gray-700">Back</span>
        </button>
        
        {/* Verification Form */}
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-700" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Email Verification
            </h1>
            
            <p className="text-gray-500">
              We've sent a verification code to
            </p>
            <p className="text-gray-800 font-medium">
              {userEmail || email}
            </p>
          </div>
          
          <p className="text-gray-700 font-medium mb-4 text-center">
            Enter the 6-digit code
          </p>
          
          <div className="flex justify-between w-full mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={ref => inputRefs.current[index] = ref}
                className="w-12 h-14 border border-gray-300 rounded-lg text-center text-xl font-bold bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
          </div>
          
          <div className="flex items-center justify-center mb-8">
            <p className="text-gray-600">Didn't receive code? </p>
            <button 
              onClick={handleResendCode}
              disabled={!canResend}
              className={`ml-1 font-medium ${canResend ? 'text-blue-700 hover:text-blue-800' : 'text-gray-400'}`}
            >
              {canResend ? 'Resend code' : `Resend in ${timer}s`}
            </button>
          </div>
          
          <button 
            onClick={handleVerify}
            disabled={isLoading}
            className="w-full bg-blue-700 text-white py-4 rounded-lg mb-4 flex items-center justify-center hover:bg-blue-800 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Verify'
            )}
          </button>
          
          <button 
            onClick={() => router.push('/auth/register')}
            className="w-full py-3 text-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            Don't have an account? Register.
          </button>
        </div>
      </div>
    </div>
  );
}
