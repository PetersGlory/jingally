'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Key, ArrowLeft, Loader2, AlertCircle, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

// API service
const requestPasswordReset = async (email: string) => {
  try {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return { success: false, message: 'Failed to send reset code' };
  }
};

const verifyResetCode = async (email: string, verificationCode: string) => {
  try {
    const response = await fetch('/api/auth/verify-reset-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, verificationCode }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying reset code:', error);
    return { success: false, message: 'Failed to verify reset code' };
  }
};

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRequestCode = async () => {
    setError('');
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const response = await requestPasswordReset(email);
      
      if (response.success) {
        setShowCodeInput(true);
        setError('');
        toast.success('A reset code has been sent to your email address.', {
          duration: 5000,
          position: 'top-center',
        });
      } else {
        setError(response.message || 'Failed to send reset code. Please try again.');
      }
    } catch (err) {
      console.error('Error requesting reset code:', err);
      setError('Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');
    
    if (!resetCode.trim()) {
      setError('Reset code is required');
      return;
    }

    if (resetCode.length !== 6) {
      setError('Reset code must be 6 digits');
      return;
    }

    try {
      setLoading(true);
      const response = await verifyResetCode(email, resetCode);
      
      if (response.success) {
        setSuccess(true);
        setEmail('');
        setResetCode('');
        toast.success('Your password has been reset successfully!', {
          duration: 5000,
          position: 'top-center',
        });
      } else {
        setError(response.message || 'Invalid reset code. Please try again.');
      }
    } catch (err) {
      console.error('Error verifying reset code:', err);
      setError('Invalid reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <button 
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Forgot Password</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
                <Key className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Reset Your Password
              </h2>
              <p className="text-gray-600">
                {showCodeInput 
                  ? 'Enter the 6-digit code sent to your email'
                  : 'Enter your email address to receive a reset code'}
              </p>
            </div>

            {success ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Password Reset Successful!
                </h3>
                <p className="text-gray-600 mb-8">
                  You can now log in with your new password.
                </p>
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="w-full px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <>
                {!showCodeInput ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setError('');
                          }}
                          className={`pl-11 block w-full rounded-lg border ${
                            error ? 'border-red-300' : 'border-gray-300'
                          } py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors`}
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-center text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      onClick={handleRequestCode}
                      disabled={loading}
                      className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                          Sending Code...
                        </>
                      ) : (
                        'Send Reset Code'
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reset Code
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Key className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={resetCode}
                          onChange={(e) => {
                            setResetCode(e.target.value.replace(/[^0-9]/g, ''));
                            setError('');
                          }}
                          maxLength={6}
                          className={`pl-11 block w-full rounded-lg border ${
                            error ? 'border-red-300' : 'border-gray-300'
                          } py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors`}
                          placeholder="Enter 6-digit code"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-center text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      onClick={handleVerifyCode}
                      disabled={loading}
                      className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify Code'
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setShowCodeInput(false);
                        setError('');
                      }}
                      className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                    >
                      Didn't receive the code? Try again
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="text-center mt-6">
          <span className="text-gray-600">Remember your password?</span>
          <button
            onClick={() => router.push('/auth/signin')}
            className="text-blue-600 hover:text-blue-700 font-medium ml-1 transition-colors"
          >
            Sign in
          </button>
        </div>
      </main>
    </div>
  );
}