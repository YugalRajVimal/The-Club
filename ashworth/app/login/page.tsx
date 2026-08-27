'use client';

import { Suspense, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { ApiClientError } from '@/lib/api/client';
import { useAuth } from '@/context/AuthContext';
import Monogram from '@/components/ui/Monogram';
import HairlineDivider from '@/components/ui/HairlineDivider';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const inputClasses =
  'w-full border border-gold-light/50 bg-ivory px-4 py-3 font-sans text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:border-gold transition-colors';

const labelClasses =
  'font-sans text-[11px] tracking-widest2 uppercase text-ink/60 mb-2 block';

function LoginForm() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const next: Record<string, string> = {};
    if (!email.trim()) next.email = 'Email is required.';
    if (!password) next.password = 'Password is required.';
    return next;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      toast.success('Welcome back.');
      router.push(redirectTo);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === 'VALIDATION_ERROR' && err.details) {
          setErrors(err.details);
        }
        toast.error(err.message || 'Could not log you in. Please try again.');
      } else {
        toast.error('Could not log you in. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSuccess(credential: string | undefined) {
    if (!credential) {
      toast.error('Google sign-in did not return a valid token. Please try again.');
      return;
    }
    try {
      await loginWithGoogle(credential);
      toast.success('Welcome back.');
      router.push(redirectTo);
    } catch (err) {
      if (err instanceof ApiClientError && err.code === 'NOT_FOUND') {
        toast.error(
          'No membership account exists with that Google email yet. Please apply for membership first.'
        );
      } else if (err instanceof ApiClientError) {
        toast.error(err.message || 'Could not sign you in with Google.');
      } else {
        toast.error('Could not sign you in with Google.');
      }
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-24 md:py-28">
      <div className="flex flex-col items-center text-center mb-10">
        <Monogram size={56} animated={false} />
        <p className="eyebrow mt-6">Members&rsquo; Sign In</p>
        <h1 className="font-serif text-3xl text-ink mt-3">Welcome Back</h1>
        <HairlineDivider width="56px" className="mt-6" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
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

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelClasses.replace('mb-2 block', '')} htmlFor="password">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="font-sans text-[11px] tracking-wide text-gold-dark hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            className={inputClasses}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
            autoComplete="current-password"
          />
          {errors.password && (
            <p className="mt-2 text-xs text-red-700/80 font-sans">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center gap-3 border border-gold px-9 py-3.5 font-sans text-[13px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Signing In…' : 'Sign In'}
        </button>
      </form>

      <div className="flex items-center gap-4 my-8">
        <span className="flex-1 h-px bg-gold-light/40" />
        <span className="font-sans text-[11px] tracking-widest2 uppercase text-ink/40">
          Or
        </span>
        <span className="flex-1 h-px bg-gold-light/40" />
      </div>

      <div className="flex justify-center">
        {GOOGLE_CLIENT_ID ? (
          <GoogleLogin
            onSuccess={(credentialResponse) =>
              handleGoogleSuccess(credentialResponse.credential)
            }
            onError={() => toast.error('Google sign-in failed. Please try again.')}
            useOneTap={false}
            text="continue_with"
            width="320"
          />
        ) : (
          <p className="font-sans text-xs text-ink/40 text-center">
            Google sign-in is not configured for this environment.
          </p>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="bg-white min-h-screen">
      <Suspense fallback={null}>
        {GOOGLE_CLIENT_ID ? (
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <LoginForm />
          </GoogleOAuthProvider>
        ) : (
          <LoginForm />
        )}
      </Suspense>
    </main>
  );
}
