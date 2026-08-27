'use client';

import { useState, type FormEvent } from 'react';
import { useSignup } from '@/context/SignupContext';

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

function validate(values: FormState): Record<string, string> {
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

  return errors;
}

const inputClasses =
  'w-full border border-gold-light/50 bg-ivory px-4 py-3 font-sans text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:border-gold transition-colors';

const labelClasses =
  'font-sans text-[11px] tracking-widest2 uppercase text-ink/60 mb-2 block';

export default function MembershipForm() {
  const { submitMembershipForm, isSubmitting, fieldErrors: serverErrors } =
    useSignup();
  const [values, setValues] = useState<FormState>(EMPTY_FORM);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const errors = { ...localErrors, ...serverErrors };

  function handleChange<K extends keyof FormState>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validation = validate(values);
    setLocalErrors(validation);
    if (Object.keys(validation).length > 0) return;
    await submitMembershipForm(values);
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
        />
        {errors.address && (
          <p className="mt-2 text-xs text-red-700/80 font-sans">{errors.address}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-3 border border-gold px-9 py-3.5 font-sans text-[13px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting…' : 'Continue to Agreement'}
      </button>
    </form>
  );
}
