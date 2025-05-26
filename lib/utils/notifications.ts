import { toast } from 'sonner';

interface NotificationOptions {
  duration?: number;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
}

const defaultOptions: NotificationOptions = {
  duration: 5000,
  position: 'top-right'
};

// Success notifications
export const showSuccess = (message: string, options: NotificationOptions = {}) => {
  toast.success(message, {
    ...defaultOptions,
    ...options,
  });
};

// Error notifications
export const showError = (error: Error | string, options: NotificationOptions = {}) => {
  const message = error instanceof Error ? error.message : error;
  toast.error(message, {
    ...defaultOptions,
    ...options,
  });
};

// Warning notifications
export const showWarning = (message: string, options: NotificationOptions = {}) => {
  toast.warning(message, {
    ...defaultOptions,
    ...options,
  });
};

// Info notifications
export const showInfo = (message: string, options: NotificationOptions = {}) => {
  toast.info(message, {
    ...defaultOptions,
    ...options,
  });
};

// Loading notifications
export const showLoading = (message: string, options: NotificationOptions = {}) => {
  return toast.loading(message, {
    ...defaultOptions,
    ...options,
  });
};

// Promise notifications
export const showPromise = <T>(
  promise: Promise<T>,
  {
    loading = 'Loading...',
    success = 'Success!',
    error = 'Something went wrong',
  }: {
    loading?: string;
    success?: string | ((data: T) => string);
    error?: string | ((error: Error) => string);
  },
  options: NotificationOptions = {}
) => {
  toast.promise(promise, {
    loading,
    success,
    error,
    ...defaultOptions,
    ...options,
  });
};

// Authentication specific notifications
export const authNotifications = {
  loginSuccess: () => showSuccess('Logged in successfully'),
  loginError: (error: string) => showError(error),
  logoutSuccess: () => showSuccess('Logged out successfully'),
  registrationSuccess: () => showSuccess('Account created successfully! You can now log in.'),
  registrationError: (error: string) => showError(error),
  emailVerificationSent: () => showSuccess('Verification code sent to your email'),
  emailVerificationSuccess: () => showSuccess('Email verified successfully'),
  emailVerificationError: (error: string) => showError(error),
  passwordResetSent: () => showSuccess('Password reset instructions sent to your email'),
  passwordResetSuccess: () => showSuccess('Password reset successfully'),
  passwordResetError: (error: string) => showError(error),
  invalidCredentials: () => showError('Invalid email or password. Please try again.'),
  emailNotVerified: () => showError('Please verify your email before logging in. Check your inbox for the verification link.'),
  emailAlreadyExists: () => showError('This email is already registered. Please try logging in instead.'),
  tooManyRequests: () => {
    toast.error("Too many attempts. Please try again later.");
  },
  invalidEmailFormat: () => {
    toast.error("Please enter a valid email address.");
  },
};

// Form specific notifications
export const formNotifications = {
  invalidEmail: () => showError('Please enter a valid email address'),
  invalidPassword: (errors: string[]) => showError(errors.join('. ')),
  passwordMismatch: () => showError('Passwords do not match'),
  requiredField: (fieldName: string) => showError(`${fieldName} is required`),
  submitError: (error: string) => showError(`Form submission failed: ${error}`),
  submitSuccess: (message: string) => showSuccess(message),
};

// OTP specific notifications
export const otpNotifications = {
  sendSuccess: () => showSuccess('Verification code sent to your email'),
  sendError: () => showError('Failed to send verification code'),
  invalidOTP: () => showError('Invalid verification code. Please try again.'),
  expiredOTP: () => showError('Verification code has expired. Please request a new one.'),
  incompleteOTP: () => showError('Please enter all 6 digits of the verification code'),
  emailAlreadyExists: () => showError('This email is already registered. Please try logging in instead.'),
  verificationFailed: (error: string) => showError(`Verification failed: ${error}`),
}; 