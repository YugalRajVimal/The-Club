'use client';

import { useState } from 'react';
import { useSignup } from '@/context/SignupContext';

const CONSENT_VERSION = 'v1-2026';

const AGREEMENT_TEXT = `Membership Agreement — VRK Group

1. Discretion. Every member agrees to hold the identity and affairs of fellow members in strict confidence, and understands that the Society's arrangements are extended on that basis alone.

2. Admission. Admission to any circle of the Society is granted at the sole discretion of its governing committee, upon review of the applicant's form, supporting documentation and sponsorship, and is not guaranteed by submission of this form.

3. Fees. The membership fee stated at the time of application is payable in full to activate a membership, is charged in Indian Rupees, and is non-transferable between applicants.

4. Conduct. Members agree to conduct themselves, and any guests introduced to Society events or services, in a manner consistent with the standing of the Society.

5. Data. Information submitted in this form, together with supporting documents provided during the application process, is held by the Society solely for the purposes of verifying eligibility, administering membership, and arranging the services described in this application.

6. Termination. The Society reserves the right to suspend or terminate a membership, without refund of fees already paid, in the event of conduct inconsistent with this agreement.

7. Governing Terms. This agreement is governed by the terms published by the Society from time to time, of which this document forms a summary for the purpose of application.

By checking the box below and typing your full name, you acknowledge that you have read, understood and agree to be bound by the above terms.`;

export default function ConsentStep() {
  const { fullName, isSubmitting } = useSignup();
  const [agreed, setAgreed] = useState(false);
  const [signedName, setSignedName] = useState('');
  const [touched, setTouched] = useState(false);

  const nameMatches =
    signedName.trim().length > 0 &&
    signedName.trim().toLowerCase() === fullName.trim().toLowerCase();

  const canContinue = agreed && nameMatches && !isSubmitting;

  async function handleContinue() {
    setTouched(true);
    if (!canContinue) return;
    // No submitConsent or submitStep method exists; Call a placeholder or simply do nothing
    // This should be filled in when the correct submit method is available
    // Example: show a message or advance a local step
    // For now, just a no-op
  }

  return (
    <div className="space-y-6">
      <div
        className="border border-gold-light/50 bg-ivory px-6 py-6 max-h-72 overflow-y-auto font-sans text-sm leading-relaxed text-ink/75 whitespace-pre-line"
        tabIndex={0}
        aria-label="Membership agreement"
      >
        {AGREEMENT_TEXT}
      </div>

      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 w-4 h-4 accent-[#A6812F]"
        />
        <span className="font-sans text-sm text-ink/80">
          I have read and agree to the membership agreement above.
        </span>
      </label>

      <div>
        <label
          className="font-sans text-[11px] tracking-widest2 uppercase text-ink/60 mb-2 block"
          htmlFor="signedName"
        >
          Type your full name to sign
        </label>
        <input
          id="signedName"
          className="w-full border border-gold-light/50 bg-ivory px-4 py-3 font-sans text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:border-gold transition-colors"
          value={signedName}
          onChange={(e) => setSignedName(e.target.value)}
          placeholder={fullName || 'Your full name'}
        />
        {touched && !nameMatches && (
          <p className="mt-2 text-xs text-red-700/80 font-sans">
            Please type your full name exactly as entered on the membership
            form ({fullName}).
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleContinue}
        disabled={!canContinue}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-3 border border-gold px-9 py-3.5 font-sans text-[13px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gold-dark"
      >
        {isSubmitting ? 'Recording…' : 'I Agree — Continue'}
      </button>
    </div>
  );
}
