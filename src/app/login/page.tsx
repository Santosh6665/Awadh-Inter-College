
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';

// Add a global declaration for window.recaptchaVerifier if it doesn't exist
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // This effect ensures the reCAPTCHA is rendered only on the client-side
    // and only once.
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
      });
    }
  }, []);

  const formatPhoneNumber = (number: string) => {
    // 1. Remove all non-digit characters
    const digitsOnly = number.replace(/\D/g, '');

    // 2. Check if it starts with '+91' or '91'. If so, remove '91' to avoid duplication.
    let numberWithoutCountryCode = digitsOnly;
    if (digitsOnly.startsWith('91')) {
      numberWithoutCountryCode = digitsOnly.substring(2);
    }
    
    // 3. If the number is 10 digits long, prepend '+91'
    if (numberWithoutCountryCode.length === 10) {
      return `+91${numberWithoutCountryCode}`;
    }

    // 4. Handle numbers that might already include the plus
    if (number.startsWith('+')) {
      return `+${digitsOnly}`
    }

    return number; // Return original if it doesn't fit expected formats
  };


  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      toast({
        title: 'Phone Number Required',
        description: 'Please enter a valid phone number.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);

    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

    try {
      const verifier = window.recaptchaVerifier!;
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhoneNumber, verifier);
      window.confirmationResult = confirmationResult;
      setOtpSent(true);
      toast({
        title: 'OTP Sent',
        description: 'Please check your phone for the verification code.',
      });
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      let description = 'Please check the phone number or try again later.';
      if (error.code === 'auth/invalid-phone-number') {
        description = `Invalid phone number format: ${formattedPhoneNumber}. Please use a valid format like +91xxxxxxxxxx.`;
      }
      toast({
        title: 'Failed to Send OTP',
        description: description,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast({
        title: 'OTP Required',
        description: 'Please enter the OTP you received.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);

    try {
      const confirmationResult = window.confirmationResult;
      if (!confirmationResult) {
        throw new Error('No confirmation result found. Please request OTP again.');
      }
      await confirmationResult.confirm(otp);
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      router.push('/');
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast({
        title: 'Login Failed',
        description: 'The OTP is invalid or has expired. Please try again.',
        variant: 'destructive',
      });
       // Reset state to allow user to try again
      setOtpSent(false);
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              {otpSent
                ? 'Enter the OTP sent to your phone.'
                : 'Enter your phone number to receive an OTP.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 12345 67890"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : 'Send OTP'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="otp">One-Time Password</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter your 6-digit OTP"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={loading}
                    maxLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : 'Verify OTP & Sign in'}
                </Button>
                 <Button variant="link" size="sm" onClick={() => setOtpSent(false)} disabled={loading}>
                  Use a different phone number
                </Button>
              </form>
            )}
            <div id="recaptcha-container" className="mt-4"></div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
