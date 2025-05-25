// OTP configuration
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;

interface OTPData {
  code: string;
  expiresAt: Date;
  verified: boolean;
}

// In-memory OTP storage (replace with database in production)
const otpStore = new Map<string, OTPData>();

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOTP(email: string, otp: string): void {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

  otpStore.set(email, {
    code: otp,
    expiresAt,
    verified: false,
  });
}

export function verifyOTP(email: string, otp: string): { 
  isValid: boolean; 
  error?: string;
} {
  const otpData = otpStore.get(email);

  if (!otpData) {
    return { 
      isValid: false, 
      error: 'No OTP found. Please request a new verification code.' 
    };
  }

  if (otpData.verified) {
    return { 
      isValid: false, 
      error: 'This OTP has already been used.' 
    };
  }

  if (new Date() > otpData.expiresAt) {
    otpStore.delete(email);
    return { 
      isValid: false, 
      error: 'OTP has expired. Please request a new verification code.' 
    };
  }

  if (otpData.code !== otp) {
    return { 
      isValid: false, 
      error: 'Invalid OTP. Please try again.' 
    };
  }

  // Mark OTP as verified
  otpData.verified = true;
  otpStore.set(email, otpData);

  return { isValid: true };
}

export function clearOTP(email: string): void {
  otpStore.delete(email);
}

export function isEmailVerified(email: string): boolean {
  const otpData = otpStore.get(email);
  return otpData?.verified || false;
} 