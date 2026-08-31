

'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useSignup } from '@/context/SignupContext';
import SignaturePad, { type SignaturePadHandle } from '@/components/ui/SignaturePad';

const CONSENT_VERSION = 'v1-2026';

const AGREEMENT_TEXT = `Membership Agreement — VRK Group

1. Discretion. Every member agrees to hold the identity and affairs of fellow members in strict confidence, and understands that the Society's arrangements are extended on that basis alone.

2. Admission. Admission to any circle of the Society is granted at the sole discretion of its governing committee, upon review of the applicant's form, supporting documentation and sponsorship, and is not guaranteed by submission of this form.

3. Fees. The membership fee stated at the time of application is payable in full to activate a membership, is charged in Indian Rupees, and is non-transferable between applicants.

4. Conduct. Members agree to conduct themselves, and any guests introduced to Society events or services, in a manner consistent with the standing of the Society.

5. Data. Information submitted in this form, together with supporting documents provided during the application process, is held by the Society solely for the purposes of verifying eligibility, administering membership, and arranging the services described in this application.

6. Termination. The Society reserves the right to suspend or terminate a membership, without refund of fees already paid, in the event of conduct inconsistent with this agreement.

7. Governing Terms. This agreement is governed by the terms published by the Society from time to time, of which this document forms a summary for the purpose of application.

By checking the box below, drawing your signature and continuing, you acknowledge that you have read, understood and agree to be bound by the above terms.`;

interface FormState {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  dob: string;
  address: string;
  occupation: string;
}

const EMPTY_FORM: FormState = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  dob: '',
  address: '',
  occupation: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+()\-\s]{7,15}$/;

function validate(
  values: FormState,
  agreed: boolean,
  hasSignature: boolean
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.fullName.trim()) errors.fullName = 'Full name is required.';
  else if (values.fullName.trim().length < 2)
    errors.fullName = 'Please enter a valid full name.';

  if (!values.email.trim()) errors.email = 'Email is required.';
  else if (!EMAIL_RE.test(values.email.trim()))
    errors.email = 'Please enter a valid email address.';

  if (!values.password) errors.password = 'Password is required.';
  else if (values.password.length < 8)
    errors.password = 'Password must be at least 8 characters.';

  if (!values.phone.trim()) errors.phone = 'Phone number is required.';
  else if (!PHONE_RE.test(values.phone.trim()))
    errors.phone = 'Please enter a valid phone number.';

  if (!values.dob) errors.dob = 'Date of birth is required.';
  else {
    const dobDate = new Date(values.dob);
    const now = new Date();
    const age = now.getFullYear() - dobDate.getFullYear();
    if (Number.isNaN(dobDate.getTime()) || dobDate > now) {
      errors.dob = 'Please enter a valid date of birth.';
    } else if (age < 18) {
      errors.dob = 'Membership requires applicants to be at least 18.';
    }
  }

  if (!values.address.trim()) errors.address = 'Address is required.';
  else if (values.address.trim().length < 8)
    errors.address = 'Please enter your full address.';

  if (!values.occupation.trim())
    errors.occupation = 'Occupation is required.';

  if (!agreed) errors.agreed = 'You must accept the membership agreement.';
  if (!hasSignature) errors.signature = 'Please sign to continue.';

  return errors;
}

const inputClasses =
  'w-full border border-gold-light/50 bg-ivory px-4 py-3 font-sans text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:border-gold transition-colors disabled:opacity-60 disabled:cursor-not-allowed';

const labelClasses =
  'font-sans text-[11px] tracking-widest2 uppercase text-ink/60 mb-2 block';

export default function JoinForm() {
  const { submitFormAndConsent, isSubmitting, fieldErrors: serverErrors, step } =
    useSignup();

  const locked = step !== 'form'; // form submitted successfully; show read-only

  const [values, setValues] = useState<FormState>(EMPTY_FORM);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const signaturePadRef = useRef<SignaturePadHandle>(null);

  const errors = { ...localErrors, ...serverErrors };

  function handleChange<K extends keyof FormState>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (locked) return;

    const validation = validate(values, agreed, hasSignature);
    setLocalErrors(validation);
    if (Object.keys(validation).length > 0) return;

    // Matches SignaturePadHandle's actual method name — was previously
    // (incorrectly) called as toDataURL(), which doesn't exist on this
    // component's exposed handle and threw at submit time.
    const signatureImage = signaturePadRef.current?.getDataUrl();
    if (!signatureImage) {
      setLocalErrors((prev) => ({ ...prev, signature: 'Please sign to continue.' }));
      return;
    }

    await submitFormAndConsent(values, {
      consentAccepted: true,
      consentVersion: CONSENT_VERSION,
      signatureImage,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div>
        <label className={labelClasses} htmlFor="fullName">
          Full Name
        </label>
        <input
          id="fullName"
          className={inputClasses}
          value={values.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          placeholder="As it should appear on your membership"
          autoComplete="name"
          disabled={locked}
        />
        {errors.fullName && (
          <p className="mt-2 text-xs text-red-700/80 font-sans">{errors.fullName}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className={labelClasses} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className={inputClasses}
            value={values.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            disabled={locked}
          />
          {errors.email && (
            <p className="mt-2 text-xs text-red-700/80 font-sans">{errors.email}</p>
          )}
        </div>

        <div>
          <label className={labelClasses} htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className={inputClasses}
            value={values.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            disabled={locked}
          />
          {errors.password && (
            <p className="mt-2 text-xs text-red-700/80 font-sans">{errors.password}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className={labelClasses} htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            className={inputClasses}
            value={values.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+91 98765 43210"
            autoComplete="tel"
            disabled={locked}
          />
          {errors.phone && (
            <p className="mt-2 text-xs text-red-700/80 font-sans">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className={labelClasses} htmlFor="dob">
            Date of Birth
          </label>
          <input
            id="dob"
            type="date"
            className={inputClasses}
            value={values.dob}
            onChange={(e) => handleChange('dob', e.target.value)}
            autoComplete="bday"
            disabled={locked}
          />
          {errors.dob && (
            <p className="mt-2 text-xs text-red-700/80 font-sans">{errors.dob}</p>
          )}
        </div>
      </div>

      <div>
        <label className={labelClasses} htmlFor="occupation">
          Occupation
        </label>
        <input
          id="occupation"
          className={inputClasses}
          value={values.occupation}
          onChange={(e) => handleChange('occupation', e.target.value)}
          placeholder="e.g. Managing Director"
          disabled={locked}
        />
        {errors.occupation && (
          <p className="mt-2 text-xs text-red-700/80 font-sans">
            {errors.occupation}
          </p>
        )}
      </div>

      <div>
        <label className={labelClasses} htmlFor="address">
          Address
        </label>
        <textarea
          id="address"
          rows={3}
          className={`${inputClasses} resize-none`}
          value={values.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Residential or registered address"
          autoComplete="street-address"
          disabled={locked}
        />
        {errors.address && (
          <p className="mt-2 text-xs text-red-700/80 font-sans">{errors.address}</p>
        )}
      </div>

      <div className="pt-2 border-t border-gold-light/40" />

      <div>
        <p className="font-sans text-[11px] tracking-widest2 uppercase text-ink/60 mb-2">
          Membership Agreement
        </p>
        <div
          className="border border-gold-light/50 bg-ivory px-6 py-6 max-h-72 overflow-y-auto font-sans text-sm leading-relaxed text-ink/75 whitespace-pre-line"
          tabIndex={0}
          aria-label="Membership agreement"
        >
          {AGREEMENT_TEXT}
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 w-4 h-4 accent-[#A6812F]"
          disabled={locked}
        />
        <span className="font-sans text-sm text-ink/80">
          I have read and agree to the membership agreement above.
        </span>
      </label>
      {errors.agreed && (
        <p className="-mt-3 text-xs text-red-700/80 font-sans">{errors.agreed}</p>
      )}

      <div>
        <label className={labelClasses}>Draw your signature to sign</label>
        <SignaturePad
          ref={signaturePadRef}
          disabled={locked}
          onChange={(has) => {
            setHasSignature(has);
            if (has) setLocalErrors((prev) => ({ ...prev, signature: '' }));
          }}
        />
        {errors.signature && (
          <p className="mt-2 text-xs text-red-700/80 font-sans">{errors.signature}</p>
        )}
      </div>

      {!locked && (
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-3 border border-gold px-9 py-3.5 font-sans text-[13px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting…' : 'Continue — Send Verification Code'}
        </button>
      )}
    </form>
  );
}