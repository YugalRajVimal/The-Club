
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSignup } from '@/context/SignupContext';

const OTP_LENGTH = 6;

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function OtpStep() {
  const { requestOtp, verifyOtp, otpExpiresInSeconds, isSubmitting, step } =
    useSignup();
  const router = useRouter();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [hasSentOnce, setHasSentOnce] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // The combined membership-form submit already triggers the OTP send, so
  // only send here if we land on this step without an expiry already set
  // (e.g. this step is ever reused standalone in the future).
  useEffect(() => {
    if (hasSentOnce) return;
    setHasSentOnce(true);
    if (otpExpiresInSeconds === null) {
      requestOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start/refresh the countdown whenever a new expiry comes back.
  useEffect(() => {
    if (otpExpiresInSeconds !== null) setSecondsLeft(otpExpiresInSeconds);
  }, [otpExpiresInSeconds]);

  // Tick the countdown.
  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => (prev === null ? null : Math.max(prev - 1, 0)));
    }, 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  // Once verified, this step's context resolves to 'complete' — redirect
  // into the (placeholder) payment step.
  useEffect(() => {
    if (step === 'complete') {
      router.push('/membership/payment');
    }
  }, [step, router]);

  const canResend = secondsLeft === null || secondsLeft <= 0;
  const otp = digits.join('');
  const canSubmit = otp.length === OTP_LENGTH && !isSubmitting;

  function handleDigitChange(index: number, value: string) {
    const clean = value.replace(/[^0-9]/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = clean;
      return next;
    });
    if (clean && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    if (!pasted) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < Math.min(pasted.length, OTP_LENGTH); i++) next[i] = pasted[i];
    setDigits(next);
    const focusIndex = Math.min(pasted.length, OTP_LENGTH) - 1;
    inputRefs.current[Math.max(focusIndex, 0)]?.focus();
  }

  async function handleResend() {
    setDigits(Array(OTP_LENGTH).fill(''));
    await requestOtp();
    inputRefs.current[0]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    await verifyOtp(otp);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="text-center">
        <p className="font-sans text-sm text-ink/65">
          Enter the 6-digit code sent to your email to verify your account.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            value={digit}
            onChange={(e) => handleDigitChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            inputMode="numeric"
            maxLength={1}
            aria-label={`Digit ${i + 1}`}
            className="w-11 h-14 sm:w-12 sm:h-16 text-center border border-gold-light/50 bg-ivory font-serif text-2xl text-ink focus:outline-none focus:border-gold transition-colors"
          />
        ))}
      </div>

      <div className="text-center font-sans text-xs text-ink/50">
        {secondsLeft !== null && secondsLeft > 0 ? (
          <span>Code expires in {formatTime(secondsLeft)}</span>
        ) : (
          <span>Your code has expired. Please request a new one.</span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-3 border border-gold px-9 py-3.5 font-sans text-[13px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gold-dark"
        >
          {isSubmitting ? 'Verifying…' : 'Verify & Continue'}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend || isSubmitting}
          className="font-sans text-[12px] tracking-widest2 uppercase text-ink/50 hover:text-gold-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Resend OTP
        </button>
      </div>
    </form>
  );
}