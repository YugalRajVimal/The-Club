

// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { CheckCircle2 } from 'lucide-react';
// import { toast } from 'react-toastify';
// import { SignupProvider, useSignup } from '@/context/SignupContext';
// import { ApiClientError, getClubBySlug } from '@/lib/api/client';
// import type { Club } from '@/lib/api/types';
// import HairlineDivider from '@/components/ui/HairlineDivider';
// import LoadingState from '@/components/ui/LoadingState';
// import MembershipForm from '@/components/join/MembershipForm';
// import OtpStep from '@/components/join/OtpStep';

// function JoinWizard({ club }: { club: Club }) {
//   const { step, beginForClub } = useSignup();
//   const router = useRouter();

//   useEffect(() => {
//     beginForClub(club._id, club.slug, club.name);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [club._id]);

//   // Redirect after 2 seconds when step becomes 'complete'
//   useEffect(() => {
//     if (step === 'complete') {
//       const timeout = setTimeout(() => {
//         router.push('/membership/payment');
//       }, 2000);
//       return () => clearTimeout(timeout);
//     }
//   }, [step, router]);

//   return (
//     <div className="max-w-2xl  mx-auto px-6 py-24 md:py-28">
//       <div className="max-w-7xl mx-auto p-8 bg-gold-light/25 border border-gold-light/25 ">

//       <div className="text-center mb-10">
//         <p className="eyebrow">Joining &middot; {club.name}</p>
//         <h1 className="font-serif text-3xl md:text-4xl text-ink mt-3">
//           Path to Membership
//         </h1>
//         <HairlineDivider width="56px" className="mt-6" />
//       </div>

//       <div className="border border-gold-light/50 bg-white rounded-xl shadow-sm px-6 py-10 md:px-12 md:py-12 space-y-10">
//         {/* The membership form (with agreement checkbox + signature) stays
//             mounted and locks itself once submitted — the OTP step then
//             appears inline below it, on the same page. */}
//         <MembershipForm />

//         {step === 'otp' && (
//           <div className="pt-10 border-t border-gold-light/40">
//             <OtpStep />
//           </div>
//         )}

//         {step === 'complete' && (
//           <div className="pt-10 border-t border-gold-light/40 text-center flex flex-col items-center gap-4 py-4">
//             <CheckCircle2 size={36} strokeWidth={1.25} className="text-gold-dark" />
//             <h2 className="font-serif text-2xl text-ink">Email Verified</h2>
//             <p className="font-sans text-sm text-ink/65 max-w-md">
//               Welcome to the Society. Taking you to the payment step now…
//             </p>
//           </div>
//         )}
//       </div>

//       </div>
    
//     </div>
//   );
// }

// export default function JoinPage() {
//   const params = useParams<{ slug: string }>();
//   const slug = params?.slug ?? '';

//   const [club, setClub] = useState<Club | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!slug) return;
//     let cancelled = false;

//     getClubBySlug(slug)
//       .then((data) => {
//         if (cancelled) return;
//         if (!data.membershipOpen) {
//           setError(
//             `Membership for ${data.name} is currently closed. Please check back later.`
//           );
//           return;
//         }
//         setClub(data);
//       })
//       .catch((err) => {
//         if (cancelled) return;
//         const message =
//           err instanceof ApiClientError
//             ? err.message
//             : 'Could not load this club. Please try again.';
//         setError(message);
//         toast.error(message);
//       });

//     return () => {
//       cancelled = true;
//     };
//   }, [slug]);

//   if (error) {
//     return (
//       <main className="bg-white min-h-[60vh] flex items-center justify-center px-6 py-24">
//         <div className="text-center max-w-md">
//           <p className="eyebrow">Unable to Continue</p>
//           <h1 className="font-serif text-2xl text-ink mt-3">{error}</h1>
//           <Link
//             href={`/clubs/${slug}`}
//             className="mt-6 inline-block font-sans text-[12px] tracking-widest2 uppercase text-gold-dark hover:underline"
//           >
//             Return to Club Page
//           </Link>
//         </div>
//       </main>
//     );
//   }

//   if (!club) {
//     return (
//       <main className="bg-white min-h-[60vh] flex items-center justify-center px-6 py-24">
//         <div className="w-full max-w-md">
//           <LoadingState message="Loading club details…" />
//         </div>
//       </main>
//     );
//   }

//   return (
//     <main className="bg-beige">
//       <SignupProvider>
//         <JoinWizard club={club} />
//       </SignupProvider>
//     </main>
//   );
// }

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, LockKeyhole } from 'lucide-react';
import { toast } from 'react-toastify';
import { SignupProvider, useSignup } from '@/context/SignupContext';
import { useAuth } from '@/context/AuthContext';
import { ApiClientError, getClubBySlug } from '@/lib/api/client';
import type { Club } from '@/lib/api/types';
import HairlineDivider from '@/components/ui/HairlineDivider';
import LoadingState from '@/components/ui/LoadingState';
import MembershipForm from '@/components/join/MembershipForm';
import OtpStep from '@/components/join/OtpStep';

function JoinWizard({ club }: { club: Club }) {
  const { step, beginForClub } = useSignup();
  const router = useRouter();

  useEffect(() => {
    beginForClub(club._id, club.slug, club.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [club._id]);

  // Redirect after 2 seconds when step becomes 'complete'
  useEffect(() => {
    if (step === 'complete') {
      const timeout = setTimeout(() => {
        router.push('/membership/payment');
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [step, router]);

  return (
    <div className="max-w-2xl  mx-auto px-6 py-24 md:py-28">
      <div className="max-w-7xl mx-auto p-8 bg-gold-light/25 border border-gold-light/25 ">

      <div className="text-center mb-10">
        <p className="eyebrow">Joining &middot; {club.name}</p>
        <h1 className="font-serif text-3xl md:text-4xl text-ink mt-3">
          Path to Membership
        </h1>
        <HairlineDivider width="56px" className="mt-6" />
      </div>

      <div className="border border-gold-light/50 bg-white rounded-xl shadow-sm px-6 py-10 md:px-12 md:py-12 space-y-10">
        {/* The membership form (with agreement checkbox + signature) stays
            mounted and locks itself once submitted — the OTP step then
            appears inline below it, on the same page. */}
        <MembershipForm />

        {step === 'otp' && (
          <div className="pt-10 border-t border-gold-light/40">
            <OtpStep />
          </div>
        )}

        {step === 'complete' && (
          <div className="pt-10 border-t border-gold-light/40 text-center flex flex-col items-center gap-4 py-4">
            <CheckCircle2 size={36} strokeWidth={1.25} className="text-gold-dark" />
            <h2 className="font-serif text-2xl text-ink">Email Verified</h2>
            <p className="font-sans text-sm text-ink/65 max-w-md">
              Welcome to the Society. Taking you to the payment step now…
            </p>
          </div>
        )}
      </div>

      </div>
    
    </div>
  );
}

/**
 * Shown instead of JoinWizard when the visitor is already logged in. Because
 * `User` in this schema is 1:1 with a club (clubId + membershipStatus live
 * directly on the user), being authenticated at all means "already has a
 * membership" — there is no such thing as a logged-in user with no
 * membership. So we never run the signup flow for a logged-in user; we
 * either point them at payment (if their own club's payment is still
 * pending) or at their profile.
 */
function AlreadyMemberBlock({ club }: { club: Club }) {
  const { user } = useAuth();
  const sameClub = user?.clubId === club._id;
  const canPay = sameClub && user?.membershipStatus === 'payment_pending';

  return (
    <main className="bg-beige min-h-[60vh] flex items-center justify-center px-6 py-24">
      <div className="max-w-md text-center border border-gold-light/50 bg-white rounded-xl shadow-sm px-8 py-12">
        <LockKeyhole size={28} strokeWidth={1.25} className="text-gold-dark mb-4 mx-auto" />
        <p className="eyebrow">Membership Already Present</p>
        <h1 className="font-serif text-2xl text-ink mt-3">
          You cannot hold more than one membership
        </h1>
        <p className="mt-4 font-sans text-sm text-ink/60">
          {sameClub
            ? `Your account is already registered with ${club.name}${
                canPay ? ', with payment still pending.' : '.'
              }`
            : 'Your account is already registered with another club. Each account may hold only one membership.'}
        </p>
        {canPay ? (
          <Link
            href="/membership/payment"
            className="mt-8 inline-flex items-center gap-3 border border-gold px-9 py-3.5 font-sans text-[13px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-500"
          >
            Continue to Payment
          </Link>
        ) : (
          <Link
            href="/profile"
            className="mt-8 inline-flex items-center gap-3 border border-gold px-9 py-3.5 font-sans text-[13px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-500"
          >
            View My Membership
          </Link>
        )}
      </div>
    </main>
  );
}

export default function JoinPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? '';

  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
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

  // Wait for both the club data AND the auth check — deciding which UI to
  // show (form vs. "already a member") depends on knowing isAuthenticated
  // first, so don't flash the signup form before that resolves.
  if (!club || authLoading) {
    return (
      <main className="bg-white min-h-[60vh] flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md">
          <LoadingState message="Loading club details…" />
        </div>
      </main>
    );
  }

  if (isAuthenticated && user) {
    return <AlreadyMemberBlock club={club} />;
  }

  return (
    <main className="bg-beige">
      <SignupProvider>
        <JoinWizard club={club} />
      </SignupProvider>
    </main>
  );
}