'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, User, Phone, Globe } from 'lucide-react';
// import { updateUserProfile } from '@/lib/user';

interface UserProfile {
  name: string;
  phoneNumber: string;
  country: string;
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    phoneNumber: '',
    country: ''
  });

  useEffect(() => {
    // Fetch user profile data
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('No access token found');
        }

        // TODO: Replace with actual API call
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${JSON.parse(token)}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      // const response = await updateUserProfile(profile, JSON.parse(token));
      
      // if (response.success) {
        setSuccess('Profile updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      // } else {
      //   throw new Error(response.message || 'Failed to update profile');
      // }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (value: string) => {
    setProfile(prev => ({ ...prev, country: value }));
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-100 text-green-700 rounded-md">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={profile.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Select
                  value={profile.country}
                  onValueChange={handleCountryChange}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nigeria">Nigeria</SelectItem>
                    <SelectItem value="ghana">Ghana</SelectItem>
                    <SelectItem value="south-africa">South Africa</SelectItem>
                    <SelectItem value="kenya">Kenya</SelectItem>
                    <SelectItem value="egypt">Egypt</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}