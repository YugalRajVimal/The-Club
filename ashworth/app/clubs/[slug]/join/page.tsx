'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { SignupProvider, useSignup } from '@/context/SignupContext';
import { ApiClientError, getClubBySlug } from '@/lib/api/client';
import type { Club } from '@/lib/api/types';
import HairlineDivider from '@/components/ui/HairlineDivider';
import LoadingState from '@/components/ui/LoadingState';
import MembershipForm from '@/components/join/MembershipForm';
import ConsentStep from '@/components/join/ConsentStep';
import OtpStep from '@/components/join/OtpStep';
import type { SignupStep } from '@/context/SignupContext';

const STEP_ORDER: Record<SignupStep, number> = {
  form: 0,
  consent: 1,
  otp: 2,
  complete: 2,
};

function StepIndicator({ step }: { step: SignupStep }) {
  const labels = ['Membership Form', 'Agreement', 'Verification'];
  const activeIndex = STEP_ORDER[step];

  return (
    <div className="flex items-center justify-center gap-4 mb-12">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <span
              className={`w-8 h-8 rounded-full border flex items-center justify-center font-serif text-sm ${
                i <= activeIndex
                  ? 'border-gold bg-gold text-ivory'
                  : 'border-gold-light/50 text-ink/40'
              }`}
            >
              {i < activeIndex ? <CheckCircle2 size={16} /> : i + 1}
            </span>
            <span
              className={`font-sans text-[10px] tracking-widest2 uppercase ${
                i <= activeIndex ? 'text-gold-dark' : 'text-ink/40'
              }`}
            >
              {label}
            </span>
          </div>
          {i < labels.length - 1 && (
            <span className="w-8 sm:w-16 h-px bg-gold-light/40 mb-5" />
          )}
        </div>
      ))}
    </div>
  );
}

function JoinWizard({ club }: { club: Club }) {
  const { step, beginForClub } = useSignup();

  useEffect(() => {
    beginForClub(club._id, club.slug, club.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [club._id]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-24 md:py-28">
      <div className="text-center mb-10">
        <p className="eyebrow">Joining &middot; {club.name}</p>
        <h1 className="font-serif text-3xl md:text-4xl text-ink mt-3">
          Path to Membership
        </h1>
        <HairlineDivider width="56px" className="mt-6" />
      </div>

      <StepIndicator step={step} />

      <div className="border border-gold-light/50 bg-beige px-6 py-10 md:px-12 md:py-12">
        {step === 'form' && <MembershipForm />}
        {step === 'consent' && <ConsentStep />}
        {step === 'otp' && <OtpStep />}
        {step === 'complete' && (
          <div className="text-center flex flex-col items-center gap-4 py-4">
            <CheckCircle2 size={36} strokeWidth={1.25} className="text-gold-dark" />
            <h2 className="font-serif text-2xl text-ink">Email Verified</h2>
            <p className="font-sans text-sm text-ink/65 max-w-md">
              Welcome to the Society. Taking you to the payment step now…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function JoinPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? '';

  const [club, setClub] = useState<Club | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    getClubBySlug(slug)
      .then((data) => {
        if (cancelled) return;
        if (!data.membershipOpen) {
          setError(
            `Membership for ${data.name} is currently closed. Please check back later.`
          );
          return;
        }
        setClub(data);
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          err instanceof ApiClientError
            ? err.message
            : 'Could not load this club. Please try again.';
        setError(message);
        toast.error(message);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (error) {
    return (
      <main className="bg-white min-h-[60vh] flex items-center justify-center px-6 py-24">
        <div className="text-center max-w-md">
          <p className="eyebrow">Unable to Continue</p>
          <h1 className="font-serif text-2xl text-ink mt-3">{error}</h1>
          <Link
            href={`/clubs/${slug}`}
            className="mt-6 inline-block font-sans text-[12px] tracking-widest2 uppercase text-gold-dark hover:underline"
          >
            Return to Club Page
          </Link>
        </div>
      </main>
    );
  }

  if (!club) {
    return (
      <main className="bg-white min-h-[60vh] flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md">
          <LoadingState message="Loading club details…" />
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white">
      <SignupProvider>
        <JoinWizard club={club} />
      </SignupProvider>
    </main>
  );
}
