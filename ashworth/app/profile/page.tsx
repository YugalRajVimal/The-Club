'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BadgeCheck,
  Banknote,
  Clock3,
  CreditCard,
  FileWarning,
  Pencil,
  ShieldCheck,
  UploadCloud,
  UserRound,
  XCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import AuthGuard from '@/components/auth/AuthGuard';
import HairlineDivider from '@/components/ui/HairlineDivider';
import Monogram from '@/components/ui/Monogram';
import LoadingState, { ErrorState } from '@/components/ui/LoadingState';
import {
  ApiClientError,
  getUserProfile,
  updateUserProfile,
} from '@/lib/api/client';
import type { MembershipStatus, UserProfileResponse } from '@/lib/api/types';

const inputClasses =
  'w-full  bg-ivory px-4 py-2.5 font-sans text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:border-gold transition-colors';

function humanizeDocumentType(type: string) {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

const STATUS_META: Record<
  MembershipStatus,
  { label: string; tone: 'amber' | 'gold' | 'green' | 'red' }
> = {
  payment_pending: { label: 'Payment Pending', tone: 'amber' },
  documents_pending: { label: 'Documents Pending', tone: 'amber' },
  pending_approval: { label: 'Pending Approval', tone: 'gold' },
  approved: { label: 'Approved Member', tone: 'green' },
  rejected: { label: 'Application Rejected', tone: 'red' },
};

function StatusBanner({ status }: { status: MembershipStatus }) {
  const meta = STATUS_META[status];

  const toneClasses: Record<typeof meta.tone, string> = {
    amber: 'border-amber-600/30 bg-amber-50 text-amber-800',
    gold: 'border-gold-light/60 bg-gold-light/25 border border-gold-light/25 text-gold-dark',
    green: 'border-emerald-700/25 bg-emerald-50 text-emerald-800',
    red: 'border-red-700/25 bg-red-50 text-red-800',
  };

  return (
    <div className={`border px-6 py-6 flex flex-col items-center text-center gap-3 ${toneClasses[meta.tone]}`}>
      {status === 'payment_pending' && (
        <CreditCard size={26} strokeWidth={1.25} />
      )}
      {status === 'documents_pending' && (
        <UploadCloud size={26} strokeWidth={1.25} />
      )}
      {status === 'pending_approval' && <Clock3 size={26} strokeWidth={1.25} />}
      {status === 'approved' && <BadgeCheck size={26} strokeWidth={1.25} />}
      {status === 'rejected' && <XCircle size={26} strokeWidth={1.25} />}

      <p className="font-serif text-xl">{meta.label}</p>

      {status === 'payment_pending' && (
        <>
          <p className="font-sans text-sm max-w-sm">
            Your application is confirmed — complete your membership payment
            to continue.
          </p>
          <Link
            href="/membership/payment"
            className="mt-2 inline-flex items-center gap-2 border border-current px-7 py-2.5 font-sans text-[12px] tracking-widest2 uppercase hover:bg-current hover:text-ivory transition-colors duration-500"
          >
            Complete Payment
          </Link>
        </>
      )}

      {status === 'documents_pending' && (
        <>
          <p className="font-sans text-sm max-w-sm">
            Payment received. Please upload your identity documents to
            proceed with verification.
          </p>
          <Link
            href="/membership/documents"
            className="mt-2 inline-flex items-center gap-2 border border-current px-7 py-2.5 font-sans text-[12px] tracking-widest2 uppercase hover:bg-gold-dark hover:text-ivory transition-colors duration-500"
          >
            Upload Documents
          </Link>
     
        </>
      )}

      {status === 'pending_approval' && (
        <p className="font-sans text-sm max-w-sm">
          Your membership is under review by our admissions committee. We
          will notify you by email once a decision has been made.
        </p>
      )}

      {status === 'approved' && (
        <p className="font-sans text-sm max-w-sm">
          Welcome to the Society. Your membership is fully active — enjoy
          every privilege of your circle.
        </p>
      )}

      {status === 'rejected' && (
        <p className="font-sans text-sm max-w-sm">
          Your application was not approved at this time. If you have
          questions about this decision, please contact our membership team.
        </p>
      )}
    </div>
  );
}

function ProfileView() {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formValues, setFormValues] = useState({
    phone: '',
    address: '',
    occupation: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const loadProfile = useCallback(async () => {
    setError(null);
    try {
      const res = await getUserProfile();
      setProfile(res);
      setFormValues({
        phone: res.user.phone,
        address: res.user.address,
        occupation: res.user.occupation,
      });
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : 'Could not load your profile. Please try again.';
      setError(message);
      toast.error(message);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  function startEditing() {
    if (!profile) return;
    setFormValues({
      phone: profile.user.phone,
      address: profile.user.address,
      occupation: profile.user.occupation,
    });
    setFieldErrors({});
    setIsEditing(true);
  }

  async function handleSave() {
    setIsSaving(true);
    setFieldErrors({});
    try {
      const updatedUser = await updateUserProfile(formValues);
      setProfile((prev) => (prev ? { ...prev, user: updatedUser } : prev));
      setIsEditing(false);
      toast.success('Your details have been updated.');
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === 'VALIDATION_ERROR' && err.details) {
          setFieldErrors(err.details);
        }
        toast.error(err.message || 'Could not save your details.');
      } else {
        toast.error('Could not save your details. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="bg-beige min-h-[80vh]">
      <div className="max-w-3xl mx-auto px-6 py-24 md:py-28">
        <div className="text-center mb-10 flex flex-col items-center">
          <Monogram size={48} animated={false} />
          <p className="eyebrow mt-6">Your Membership</p>
          <h1 className="font-serif text-3xl text-ink mt-3">
            {profile ? profile.user.fullName : 'Profile'}
          </h1>
          <HairlineDivider width="56px" className="mt-6" />
        </div>

        {!profile && !error && <LoadingState message="Loading your profile…" />}
        {error && !profile && <ErrorState message={error} onRetry={loadProfile} />}

        {profile && (
          <div className="space-y-8">
            <StatusBanner status={profile.membershipStatus} />

            {/* Club */}
            <div className=" bg-gold-light/25 border border-gold-light/25 px-6 py-8 md:px-10">
              <p className="eyebrow mb-2">Club</p>
              <h2 className="font-serif text-2xl text-ink">{profile.club.name}</h2>
              <p className="mt-2 font-sans text-sm text-ink/60">
                {profile.club.tagline}
              </p>
            </div>

            {/* Personal details */}
            <div className=" bg-gold-light/25 border border-gold-light/25 px-6 py-8 md:px-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <UserRound size={18} strokeWidth={1.5} className="text-gold-dark" />
                  <h2 className="font-serif text-xl text-ink">Your Details</h2>
                </div>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={startEditing}
                    className="inline-flex items-center gap-2 font-sans text-[11px] tracking-widest2 uppercase text-gold-dark hover:underline"
                  >
                    <Pencil size={13} strokeWidth={1.5} />
                    Edit
                  </button>
                )}
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                <div>
                  <dt className="font-sans text-[11px] tracking-widest2 uppercase text-ink/50 mb-1">
                    Full Name
                  </dt>
                  <dd className="font-sans text-sm text-ink/80">
                    {profile.user.fullName}
                  </dd>
                </div>
                <div>
                  <dt className="font-sans text-[11px] tracking-widest2 uppercase text-ink/50 mb-1">
                    Email
                  </dt>
                  <dd className="font-sans text-sm text-ink/80">
                    {profile.user.email}
                  </dd>
                </div>
                <div>
                  <dt className="font-sans text-[11px] tracking-widest2 uppercase text-ink/50 mb-1">
                    Date of Birth
                  </dt>
                  <dd className="font-sans text-sm text-ink/80">
                    {formatDate(profile.user.dob)}
                  </dd>
                </div>

                <div>
                  <dt className="font-sans text-[11px] tracking-widest2 uppercase text-ink/50 mb-1">
                    Phone
                  </dt>
                  {isEditing ? (
                    <>
                      <input
                        className={inputClasses}
                        value={formValues.phone}
                        onChange={(e) =>
                          setFormValues((v) => ({ ...v, phone: e.target.value }))
                        }
                      />
                      {fieldErrors.phone && (
                        <p className="mt-1 text-xs text-red-700/80 font-sans">
                          {fieldErrors.phone}
                        </p>
                      )}
                    </>
                  ) : (
                    <dd className="font-sans text-sm text-ink/80">
                      {profile.user.phone}
                    </dd>
                  )}
                </div>

                <div>
                  <dt className="font-sans text-[11px] tracking-widest2 uppercase text-ink/50 mb-1">
                    Occupation
                  </dt>
                  {isEditing ? (
                    <>
                      <input
                        className={inputClasses}
                        value={formValues.occupation}
                        onChange={(e) =>
                          setFormValues((v) => ({
                            ...v,
                            occupation: e.target.value,
                          }))
                        }
                      />
                      {fieldErrors.occupation && (
                        <p className="mt-1 text-xs text-red-700/80 font-sans">
                          {fieldErrors.occupation}
                        </p>
                      )}
                    </>
                  ) : (
                    <dd className="font-sans text-sm text-ink/80">
                      {profile.user.occupation}
                    </dd>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <dt className="font-sans text-[11px] tracking-widest2 uppercase text-ink/50 mb-1">
                    Address
                  </dt>
                  {isEditing ? (
                    <>
                      <textarea
                        rows={2}
                        className={`${inputClasses} resize-none`}
                        value={formValues.address}
                        onChange={(e) =>
                          setFormValues((v) => ({ ...v, address: e.target.value }))
                        }
                      />
                      {fieldErrors.address && (
                        <p className="mt-1 text-xs text-red-700/80 font-sans">
                          {fieldErrors.address}
                        </p>
                      )}
                    </>
                  ) : (
                    <dd className="font-sans text-sm text-ink/80">
                      {profile.user.address}
                    </dd>
                  )}
                </div>
              </dl>

              {isEditing && (
                <div className="flex items-center gap-4 mt-7">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-3 border border-gold px-7 py-2.5 font-sans text-[12px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                    className="font-sans text-[12px] tracking-widest2 uppercase text-ink/50 hover:text-gold-dark transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Documents */}
            {profile.documents.length > 0 && (
              <div className=" bg-gold-light/25 border border-gold-light/25 px-6 py-8 md:px-10">
                <div className="flex items-center gap-2 mb-6">
                  <ShieldCheck size={18} strokeWidth={1.5} className="text-gold-dark" />
                  <h2 className="font-serif text-xl text-ink">Documents</h2>
                </div>
                <ul className="divide-y divide-gold-light/40">
                  {profile.documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between py-3"
                    >
                      <span className="font-sans text-sm text-ink/80">
                        {humanizeDocumentType(doc.documentType)}
                      </span>
                      {doc.verified ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-700">
                          <BadgeCheck size={15} strokeWidth={1.5} />
                          <span className="font-sans text-xs">Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-amber-700">
                          <FileWarning size={15} strokeWidth={1.5} />
                          <span className="font-sans text-xs">Pending Review</span>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Payment */}
            {profile.payment && (
              <div className=" bg-gold-light/25 border border-gold-light/25 px-6 py-8 md:px-10">
                <div className="flex items-center gap-2 mb-6">
                  <Banknote size={18} strokeWidth={1.5} className="text-gold-dark" />
                  <h2 className="font-serif text-xl text-ink">Payment</h2>
                </div>
                <div className="flex items-center justify-between font-sans text-sm text-ink/70 mb-2">
                  <span>Receipt Number</span>
                  <span className="text-ink">{profile.payment.receiptNumber}</span>
                </div>
                <div className="flex items-center justify-between font-sans text-sm text-ink/70 mb-2">
                  <span>Amount Paid</span>
                  <span className="text-ink">
                    {profile.payment.currency}{' '}
                    {profile.payment.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between font-sans text-sm text-ink/70 mb-6">
                  <span>Paid On</span>
                  <span className="text-ink">
                    {formatDate(profile.payment.paidAt)}
                  </span>
                </div>
                <Link
                  href="/membership/receipt"
                  className="inline-flex items-center gap-2 font-sans text-[12px] tracking-widest2 uppercase text-gold-dark hover:underline"
                >
                  View Receipt &rarr;
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileView />
    </AuthGuard>
  );
}
