'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserRound,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  ShieldCheck,
  FileText,
  CreditCard,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  LockKeyhole,
  Building2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import { ApiClientError, getUserProfile } from '@/lib/api/client';
import type { MembershipStatus, UserProfileResponse } from '@/lib/api/types';
import SectionHeading from '@/components/ui/SectionHeading';
import HairlineDivider from '@/components/ui/HairlineDivider';
import Reveal from '@/components/ui/Reveal';
import Monogram from '@/components/ui/Monogram';
import LoadingState from '@/components/ui/LoadingState';

// TODO: replace with the real membership-services domain once it's ready.
const MEMBERSHIP_SERVICES_URL = 'https://membership.example.com';

const STATUS_META: Record<
  MembershipStatus,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  payment_pending: {
    label: 'Payment Pending',
    icon: Clock,
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  documents_pending: {
    label: 'Documents Pending',
    icon: Clock,
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  pending_approval: {
    label: 'Pending Approval',
    icon: Clock,
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle2,
    className: 'bg-green-50 text-green-700 border-green-200',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'bg-red-50 text-red-700 border-red-200',
  },
};

function StatusBadge({ status }: { status: MembershipStatus }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border font-sans text-[12px] tracking-widest2 uppercase ${meta.className}`}
    >
      <Icon size={14} strokeWidth={2} />
      {meta.label}
    </span>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3.5 py-3 border-b border-gold-light/25 last:border-b-0">
      <Icon size={17} strokeWidth={1.5} className="text-gold-dark mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="font-sans text-[11px] tracking-widest2 uppercase text-ink/45">{label}</p>
        <p className="font-sans text-[14px] text-ink/85 mt-0.5 break-words">{value || '—'}</p>
      </div>
    </div>
  );
}

const DOCUMENT_LABELS: Record<string, string> = {
  aadhar_front: 'Aadhar Card (Front)',
  aadhar_back: 'Aadhar Card (Back)',
  pan_front: 'PAN Card',
};

export default function DashboardPage() {
  const router = useRouter();
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();

  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    let cancelled = false;
    setLoading(true);

    getUserProfile()
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          err instanceof ApiClientError
            ? err.message
            : 'Could not load your dashboard. Please try again.';
        setError(message);
        toast.error(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, router]);

  // Handler for redirecting with token from localStorage
  const handleRedirectWithToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      const token = window.localStorage.getItem('ashworth_user_token');
      if (token) {
        // Construct the URL to the other site with the token as a query param (e.g., ?token=...)
        // The query parameter can be changed as per the target site's expected parameter.
        const url = `${MEMBERSHIP_SERVICES_URL}/direct-login?token=${encodeURIComponent(token)}`;
        window.open(url, '_blank', 'noopener noreferrer');
      } else {
        toast.error('Login token not found. Please try logging in again.');
      }
    }
  }, []);

  if (authLoading || loading) {
    return (
      <main className="bg-white min-h-[60vh] flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md">
          <LoadingState message="Loading your dashboard…" />
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="bg-white min-h-[60vh] flex items-center justify-center px-6 py-24">
        <div className="text-center max-w-md">
          <p className="eyebrow">Unable to Load Dashboard</p>
          <h1 className="font-serif text-2xl text-ink mt-3">
            {error ?? 'Something went wrong.'}
          </h1>
          <Link
            href="/"
            className="mt-6 inline-block font-sans text-[12px] tracking-widest2 uppercase text-gold-dark hover:underline"
          >
            Return Home
          </Link>
        </div>
      </main>
    );
  }

  const { user, club, documents, payment, membershipStatus } = profile;
  const canUseMembershipServices = membershipStatus === 'approved';

  return (
    <main className="bg-beige">
      {/* Header */}
      <section className="relative overflow-hidden bg-gold-light/25 border border-gold-light/25">
        <div className="relative max-w-3xl mx-auto px-6 pt-24 pb-16 flex flex-col items-center text-center">
          <Monogram size={72} />
          <p className="eyebrow mt-6">Member Dashboard</p>
          <HairlineDivider width="72px" className="mt-4" />
          <h1 className="font-serif text-3xl md:text-4xl text-ink mt-6">
            Welcome, {user.fullName}
          </h1>
          <div className="mt-6">
            <StatusBadge status={membershipStatus} />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-16 md:py-20 space-y-14">
        {/* Profile */}
        <Reveal scale={0.98}>
          <div className="border border-gold-light/50 bg-ivory rounded-xl shadow-sm px-7 py-8">
            <div className="flex items-center gap-2 mb-2">
              <UserRound size={18} className="text-gold-dark" />
              <h2 className="font-serif text-xl text-ink">Your Profile</h2>
            </div>
            <HairlineDivider width="48px" className="mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-10">
              <InfoRow icon={UserRound} label="Full Name" value={user.fullName} />
              <InfoRow icon={Mail} label="Email" value={user.email} />
              <InfoRow icon={Phone} label="Phone" value={user.phone} />
              <InfoRow
                icon={Calendar}
                label="Date of Birth"
                value={user.dob ? new Date(user.dob).toLocaleDateString('en-IN') : ''}
              />
              <InfoRow icon={MapPin} label="Address" value={user.address} />
              <InfoRow icon={Briefcase} label="Occupation" value={user.occupation} />
              <InfoRow
                icon={ShieldCheck}
                label="Email Verified"
                value={user.emailVerified ? 'Yes' : 'No'}
              />
            </div>
          </div>
        </Reveal>

        {/* Membership status + payment */}
        <Reveal delay={0.06} scale={0.98}>
          <div className="border border-gold-light/50 bg-ivory rounded-xl shadow-sm px-7 py-8">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={18} className="text-gold-dark" />
              <h2 className="font-serif text-xl text-ink">Membership Status</h2>
            </div>
            <HairlineDivider width="48px" className="mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-10">
              <InfoRow icon={ShieldCheck} label="Club" value={club.name} />
              <InfoRow icon={ShieldCheck} label="Status" value={STATUS_META[membershipStatus].label} />
              {payment && (
                <>
                  <InfoRow icon={CreditCard} label="Receipt No." value={payment.receiptNumber} />
                  <InfoRow
                    icon={Calendar}
                    label="Paid On"
                    value={new Date(payment.paidAt).toLocaleDateString('en-IN')}
                  />
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mt-2">
              {payment?.downloadUrl && (
                <a
                  href={payment.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-gold px-6 py-2.5 font-sans text-[12px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-300"
                >
                  <Download size={14} />
                  Download Receipt
                </a>
              )}

              {membershipStatus === 'payment_pending' && (
                <Link
                  href="/membership/payment"
                  className="inline-flex items-center justify-center gap-2 border border-gold px-6 py-2.5 font-sans text-[12px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-300"
                >
                  Complete Payment
                </Link>
              )}

              {/* Redirect to membership services with token */}
           
            </div>
          </div>
        </Reveal>

        {/* Full club / membership details */}
        <Reveal delay={0.12} scale={0.98}>
          <div className="border border-gold-light/50 bg-ivory rounded-xl shadow-sm overflow-hidden">
            {club.heroImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={club.heroImageUrl}
                alt={club.name}
                className="w-full h-56 md:h-72 object-cover"
              />
            )}

            <div className="px-7 py-8 md:px-10 md:py-10">
              <div className="flex items-center gap-2 mb-1">
                <Building2 size={18} className="text-gold-dark" />
                <h2 className="font-serif text-xl text-ink">{club.name}</h2>
              </div>
              {club.tagline && (
                <p className="font-sans text-sm text-ink/60 italic mt-1">{club.tagline}</p>
              )}
              <HairlineDivider width="48px" className="my-5" />

              {/* Fee + open status, front and center */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <span className="inline-flex items-center gap-2 border border-gold-light/50 bg-white rounded-full px-4 py-1.5 font-sans text-[12px] text-ink/75">
                  <CreditCard size={14} className="text-gold-dark" />
                  Membership Fee:{' '}
                  <span className="text-gold-dark font-medium">
                    {club.membershipFee.currency} {club.membershipFee.amount.toLocaleString('en-IN')}
                  </span>
                </span>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-sans text-[12px] border ${
                    club.membershipOpen
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  {club.membershipOpen ? (
                    <CheckCircle2 size={14} strokeWidth={2} />
                  ) : (
                    <LockKeyhole size={14} strokeWidth={2} />
                  )}
                  {club.membershipOpen ? 'Open for Signups' : 'Signups Closed'}
                </span>
              </div>

              {/* Narrative fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="eyebrow mb-2">Who We Are</p>
                  <p className="font-sans text-sm text-ink/75 leading-relaxed">{club.whoWeAre}</p>
                </div>
                <div>
                  <p className="eyebrow mb-2">What Is Unique</p>
                  <p className="font-sans text-sm text-ink/75 leading-relaxed">{club.whatIsUnique}</p>
                </div>
                <div>
                  <p className="eyebrow mb-2">Who Should Join</p>
                  <p className="font-sans text-sm text-ink/75 leading-relaxed">{club.whoShouldJoin}</p>
                </div>
                <div>
                  <p className="eyebrow mb-2">How You Benefit</p>
                  <p className="font-sans text-sm text-ink/75 leading-relaxed">{club.howYouBenefit}</p>
                </div>
              </div>

              {/* What We Offer */}
              <div className="border-t border-gold-light/30 pt-8">
                <p className="eyebrow mb-2">What We Offer</p>
                {club.whatWeOffer.purpose && (
                  <p className="font-sans text-sm text-ink/75 leading-relaxed mb-6">
                    {club.whatWeOffer.purpose}
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="font-serif text-base text-ink mb-3">Features</p>
                    <ul className="space-y-2">
                      {club.whatWeOffer.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-gold-dark" />
                          <span className="font-sans text-[14px] leading-snug text-ink/80">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-serif text-base text-ink mb-3">Benefits</p>
                    <ul className="space-y-2">
                      {club.whatWeOffer.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-2">
                          <CheckCircle2
                            size={15}
                            strokeWidth={1.5}
                            className="text-gold-dark mt-0.5 shrink-0"
                          />
                          <span className="font-sans text-[14px] leading-snug text-ink/80">
                            {benefit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRedirectWithToken}
                className="inline-flex items-center mt-10 justify-center gap-2 border border-gold px-6 py-2.5 font-sans text-[12px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-300"
              >
                <ExternalLink size={14} />
                Membership Services
              </button>
            </div>
            
          </div>
        </Reveal>

        {/* Documents */}
        <Reveal scale={0.98}>
          <div className="border border-gold-light/50 bg-ivory rounded-xl shadow-sm px-7 py-8">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={18} className="text-gold-dark" />
              <h2 className="font-serif text-xl text-ink">Documents</h2>
            </div>
            <HairlineDivider width="48px" className="mb-6" />

            {documents.length === 0 ? (
              <p className="font-sans text-sm text-ink/60">
                No documents uploaded yet.{' '}
                <Link href="/documents" className="text-gold-dark hover:underline">
                  Upload your documents
                </Link>{' '}
                to continue your application.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 border border-gold-light/40 bg-white rounded-lg px-4 py-4 hover:shadow-md transition-shadow"
                  >
                    <FileText size={18} className="text-gold-dark mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-sans text-[13px] text-ink/85 truncate">
                        {DOCUMENT_LABELS[doc.documentType] ?? doc.documentType}
                      </p>
                      <span
                        className={`mt-1.5 inline-flex items-center gap-1.5 font-sans text-[11px] tracking-wide uppercase ${
                          doc.verified ? 'text-green-700' : 'text-amber-700'
                        }`}
                      >
                        {doc.verified ? (
                          <CheckCircle2 size={12} strokeWidth={2} />
                        ) : (
                          <Clock size={12} strokeWidth={2} />
                        )}
                        {doc.verified ? 'Verified' : 'Pending Review'}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </Reveal>

   
      </div>
    </main>
  );
}