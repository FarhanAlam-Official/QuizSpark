'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface OTPVerificationProps {
  email: string;
  onVerificationComplete: (otp: string) => Promise<void>;
  onResendOTP: () => Promise<void>;
}

export function OTPVerification({
  email,
  onVerificationComplete,
  onResendOTP,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);
  };

  const handleResendOTP = async () => {
    try {
      setIsLoading(true);
      await onResendOTP();
      setResendTimer(60);
      toast.success('New verification code sent');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter all digits');
      return;
    }

    setIsLoading(true);
    try {
      await onVerificationComplete(otpString);
      toast.success('Email verified successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium">Verify Your Email</h3>
        <p className="text-sm text-muted-foreground mt-1">
          We sent a verification code to {email}
        </p>
      </div>

      <div className="flex justify-center gap-2">
        {otp.map((digit, index) => (
          <Input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            value={digit}
            onChange={e => handleChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="w-12 h-12 text-center text-lg"
            maxLength={1}
            disabled={isLoading}
          />
        ))}
      </div>

      <Button
        className="w-full"
        onClick={handleVerify}
        disabled={isLoading || otp.join('').length !== 6}
      >
        {isLoading ? 'Verifying...' : 'Verify Email'}
      </Button>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Didn&apos;t receive the code?{' '}
          {resendTimer > 0 ? (
            <span>Resend in {resendTimer}s</span>
          ) : (
            <button
              onClick={handleResendOTP}
              disabled={isLoading}
              className="text-primary hover:underline disabled:opacity-50"
            >
              Resend code
            </button>
          )}
        </p>
      </div>
    </div>
  );
} 