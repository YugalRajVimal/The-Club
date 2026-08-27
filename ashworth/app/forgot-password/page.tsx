'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { ApiClientError, forgotPasswordOtpSend, forgotPasswordOtpVerify } from '@/lib/api/client';
import Monogram from '@/components/ui/Monogram';
import HairlineDivider from '@/components/ui/HairlineDivider';

const inputClasses =
  'w-full border border-gold-light/50 bg-ivory px-4 py-3 font-sans text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:border-gold transition-colors';

const labelClasses =
  'font-sans text-[11px] tracking-widest2 uppercase text-ink/60 mb-2 block';

function describeError(err: unknown, fallback: string) {
  return err instanceof ApiClientError ? err.message || fallback : fallback;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSendOtp(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setErrors({ email: 'Email is required.' });
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      const res = await forgotPasswordOtpSend({ email: email.trim() });
      toast.success(res.message || 'OTP sent to your email.');
      setStep('reset');
    } catch (err) {
      toast.error(describeError(err, 'Could not send an OTP. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    const validation: Record<string, string> = {};
    if (!otp.trim()) validation.otp = 'Enter the OTP sent to your email.';
    if (!newPassword) validation.newPassword = 'New password is required.';
    else if (newPassword.length < 8)
      validation.newPassword = 'Password must be at least 8 characters.';
    if (confirmPassword !== newPassword)
      validation.confirmPassword = 'Passwords do not match.';
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setIsSubmitting(true);
    try {
      await forgotPasswordOtpVerify({ email: email.trim(), otp: otp.trim(), newPassword });
      toast.success('Password reset. Please sign in with your new password.');
      router.push('/login');
    } catch (err) {
      const message = describeError(err, 'Could not reset your password. Please try again.');
      if (err instanceof ApiClientError && err.code === 'OTP_EXPIRED') {
        toast.error('That code has expired. Please request a new one.');
        setStep('email');
      } else if (err instanceof ApiClientError && err.code === 'OTP_INVALID') {
        setErrors({ otp: 'That code is incorrect.' });
        toast.error(message);
      } else {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-md mx-auto px-6 py-24 md:py-28">
        <div className="flex flex-col items-center text-center mb-10">
          <Monogram size={56} animated={false} />
          <p className="eyebrow mt-6">Account Recovery</p>
          <h1 className="font-serif text-3xl text-ink mt-3">Reset Your Password</h1>
          <HairlineDivider width="56px" className="mt-6" />
        </div>

        {step === 'email' && (
          <form onSubmit={handleSendOtp} noValidate className="space-y-6">
            <p className="font-sans text-sm text-ink/65 text-center">
              Enter the email associated with your membership and we&rsquo;ll
              send a one-time code to reset your password.
            </p>
            <div>
              <label className={labelClasses} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={inputClasses}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-2 text-xs text-red-700/80 font-sans">{errors.email}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-3 border border-gold px-9 py-3.5 font-sans text-[13px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending…' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} noValidate className="space-y-6">
            <p className="font-sans text-sm text-ink/65 text-center">
              Enter the code sent to <span className="text-ink">{email}</span>{' '}
              along with your new password.
            </p>

            <div>
              <label className={labelClasses} htmlFor="otp">
                OTP
              </label>
              <input
                id="otp"
                inputMode="numeric"
                className={inputClasses}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="6-digit code"
              />
              {errors.otp && (
                <p className="mt-2 text-xs text-red-700/80 font-sans">{errors.otp}</p>
              )}
            </div>

            <div>
              <label className={labelClasses} htmlFor="newPassword">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                className={inputClasses}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              {errors.newPassword && (
                <p className="mt-2 text-xs text-red-700/80 font-sans">
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div>
              <label className={labelClasses} htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={inputClasses}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-xs text-red-700/80 font-sans">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-3 border border-gold px-9 py-3.5 font-sans text-[13px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Resetting…' : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full font-sans text-[12px] tracking-widest2 uppercase text-ink/50 hover:text-gold-dark transition-colors"
            >
              Use a different email
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
