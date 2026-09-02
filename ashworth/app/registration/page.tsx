'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  UserRound,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Briefcase,
  FileText,
  Image as ImageIcon,
  Lock,
} from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import HairlineDivider from '@/components/ui/HairlineDivider';
import Reveal from '@/components/ui/Reveal';
import Monogram from '@/components/ui/Monogram';

// Add env base url prefix support
const BASE_URL =
  typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_BASE_URL || ''
    : '';

interface RegistrationFormData {
  name: string;
  dob: string;
  mobile: string;
  email: string;
  password: string;
  city: string;
  state: string;
  currentAddress: string;
  pincode: string;
  preferredCity: string;
  highestEducation: string;
  education: string;
  stream: string;
  industryType: string;
  functionalArea: string;
  yearsOfExperience: string;
  currentCompany: string;
  designation: string;
  annualCTC: string;
  resume: string;
  photo: string;
}

const INITIAL_STATE: RegistrationFormData = {
  name: '',
  dob: '',
  mobile: '',
  email: '',
  password: '',
  city: '',
  state: '',
  currentAddress: '',
  pincode: '',
  preferredCity: '',
  highestEducation: '',
  education: '',
  stream: '',
  industryType: '',
  functionalArea: '',
  yearsOfExperience: '',
  currentCompany: '',
  designation: '',
  annualCTC: '',
  resume: '',
  photo: '',
};

const REQUIRED_FIELDS: (keyof RegistrationFormData)[] = [
  'name',
  'dob',
  'mobile',
  'email',
  'city',
  'state',
  'currentAddress',
  'pincode',
  'preferredCity',
  'highestEducation',
  'education',
  'stream',
  'industryType',
  'functionalArea',
];

function FieldWrapper({
  label,
  icon: Icon,
  required,
  children,
}: {
  label: string;
  icon: typeof UserRound;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 font-sans text-[11px] tracking-widest2 uppercase text-ink/55 mb-2">
        <Icon size={14} className="text-gold-dark" />
        {label}
        {required && <span className="text-gold-dark">*</span>}
      </span>
      {children}
    </label>
  );
}

const inputClasses =
  'w-full h-11 px-3.5 bg-white border border-gold-light/40 rounded-md text-ink placeholder:text-ink/35 font-sans text-[13px] focus:outline-none focus:border-gold-dark transition-colors';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegistrationFormData>(INITIAL_STATE);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof RegistrationFormData>(key: K, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const missing = REQUIRED_FIELDS.filter((field) => !formData[field].trim());
    if (missing.length > 0) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const url = `${BASE_URL}/registration`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
console.log(res)
        if (res.status === 409) {
          toast.error('This email is already registered.');
        } else {
          toast.error(data?.message ?? 'Could not submit the registration form.');
        }
        return;
      }

      toast.success(data?.message ?? 'Registration form submitted successfully.');
      router.push('/login');
    } catch {
      toast.error('Could not reach the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="bg-beige">
      <section className="relative overflow-hidden bg-gold-light/25 border border-gold-light/25">
        <div className="relative max-w-3xl mx-auto px-6 pt-24 pb-16 flex flex-col items-center text-center">
          <Monogram size={72} />
          <p className="eyebrow mt-6">Get Started</p>
          <HairlineDivider width="72px" className="mt-4" />
          <h1 className="font-serif text-3xl md:text-4xl text-ink mt-6">Registration Form</h1>
          <p className="mt-4 font-sans text-sm text-ink/60 max-w-md">
            Fill in your details below to begin your application.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-16 md:py-20">
        <Reveal scale={0.98}>
          <form
            onSubmit={handleSubmit}
            className="border border-gold-light/50 bg-ivory rounded-xl shadow-sm px-6 py-10 md:px-12 md:py-12 space-y-12"
          >
            {/* Personal Details */}
            <div>
              <SectionHeading eyebrow="Step 1" title="Personal Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <FieldWrapper label="Full Name" icon={UserRound} required>
                  <input
                    className={inputClasses}
                    value={formData.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="Jane Doe"
                    required
                  />
                </FieldWrapper>
                <FieldWrapper label="Date of Birth" icon={Calendar} required>
                  <input
                    type="date"
                    className={inputClasses}
                    value={formData.dob}
                    onChange={(e) => update('dob', e.target.value)}
                    required
                  />
                </FieldWrapper>
                <FieldWrapper label="Mobile Number" icon={Phone} required>
                  <input
                    type="tel"
                    className={inputClasses}
                    value={formData.mobile}
                    onChange={(e) => update('mobile', e.target.value)}
                    placeholder="+91 00000-00000"
                    required
                  />
                </FieldWrapper>
                <FieldWrapper label="Email" icon={Mail} required>
                  <input
                    type="email"
                    className={inputClasses}
                    value={formData.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="jane@email.com"
                    required
                  />
                </FieldWrapper>
             
              </div>
            </div>

            {/* Address */}
            <div>
              <SectionHeading eyebrow="Step 2" title="Address" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <FieldWrapper label="Current Address" icon={MapPin} required>
                  <input
                    className={inputClasses}
                    value={formData.currentAddress}
                    onChange={(e) => update('currentAddress', e.target.value)}
                    required
                  />
                </FieldWrapper>
                <FieldWrapper label="City" icon={MapPin} required>
                  <input
                    className={inputClasses}
                    value={formData.city}
                    onChange={(e) => update('city', e.target.value)}
                    required
                  />
                </FieldWrapper>
                <FieldWrapper label="State" icon={MapPin} required>
                  <input
                    className={inputClasses}
                    value={formData.state}
                    onChange={(e) => update('state', e.target.value)}
                    required
                  />
                </FieldWrapper>
                <FieldWrapper label="Pincode" icon={MapPin} required>
                  <input
                    className={inputClasses}
                    value={formData.pincode}
                    onChange={(e) => update('pincode', e.target.value)}
                    required
                  />
                </FieldWrapper>
                <FieldWrapper label="Preferred City" icon={MapPin} required>
                  <input
                    className={inputClasses}
                    value={formData.preferredCity}
                    onChange={(e) => update('preferredCity', e.target.value)}
                    required
                  />
                </FieldWrapper>
              </div>
            </div>

            {/* Education */}
            <div>
              <SectionHeading eyebrow="Step 3" title="Education" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <FieldWrapper label="Highest Education" icon={GraduationCap} required>
                  <input
                    className={inputClasses}
                    value={formData.highestEducation}
                    onChange={(e) => update('highestEducation', e.target.value)}
                    placeholder="e.g. Master's Degree"
                    required
                  />
                </FieldWrapper>
                <FieldWrapper label="Education" icon={GraduationCap} required>
                  <input
                    className={inputClasses}
                    value={formData.education}
                    onChange={(e) => update('education', e.target.value)}
                    placeholder="e.g. MBA"
                    required
                  />
                </FieldWrapper>
                <FieldWrapper label="Stream" icon={GraduationCap} required>
                  <input
                    className={inputClasses}
                    value={formData.stream}
                    onChange={(e) => update('stream', e.target.value)}
                    placeholder="e.g. Finance"
                    required
                  />
                </FieldWrapper>
              </div>
            </div>

            {/* Professional */}
            <div>
              <SectionHeading eyebrow="Step 4" title="Professional Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <FieldWrapper label="Industry Type" icon={Briefcase} required>
                  <input
                    className={inputClasses}
                    value={formData.industryType}
                    onChange={(e) => update('industryType', e.target.value)}
                    required
                  />
                </FieldWrapper>
                <FieldWrapper label="Functional Area" icon={Briefcase} required>
                  <input
                    className={inputClasses}
                    value={formData.functionalArea}
                    onChange={(e) => update('functionalArea', e.target.value)}
                    required
                  />
                </FieldWrapper>
                <FieldWrapper label="Years of Experience" icon={Briefcase}>
                  <input
                    className={inputClasses}
                    value={formData.yearsOfExperience}
                    onChange={(e) => update('yearsOfExperience', e.target.value)}
                    placeholder="Optional"
                  />
                </FieldWrapper>
                <FieldWrapper label="Current Company" icon={Briefcase}>
                  <input
                    className={inputClasses}
                    value={formData.currentCompany}
                    onChange={(e) => update('currentCompany', e.target.value)}
                    placeholder="Optional"
                  />
                </FieldWrapper>
                <FieldWrapper label="Designation" icon={Briefcase}>
                  <input
                    className={inputClasses}
                    value={formData.designation}
                    onChange={(e) => update('designation', e.target.value)}
                    placeholder="Optional"
                  />
                </FieldWrapper>
                <FieldWrapper label="Annual CTC" icon={Briefcase}>
                  <input
                    className={inputClasses}
                    value={formData.annualCTC}
                    onChange={(e) => update('annualCTC', e.target.value)}
                    placeholder="Optional"
                  />
                </FieldWrapper>
              </div>
            </div>

            {/* Documents */}
            <div>
              <SectionHeading eyebrow="Step 5" title="Documents (Optional)" />
              <p className="mt-3 font-sans text-xs text-ink/50">
                File upload isn't wired up on this endpoint yet — paste a
                hosted URL for now, or add multer middleware to the
                registration route to accept direct uploads.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <FieldWrapper label="Resume URL" icon={FileText}>
                  <input
                    type="url"
                    className={inputClasses}
                    value={formData.resume}
                    onChange={(e) => update('resume', e.target.value)}
                    placeholder="https://…"
                  />
                </FieldWrapper>
                <FieldWrapper label="Photo URL" icon={ImageIcon}>
                  <input
                    type="url"
                    className={inputClasses}
                    value={formData.photo}
                    onChange={(e) => update('photo', e.target.value)}
                    placeholder="https://…"
                  />
                </FieldWrapper>
              </div>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-3 border border-gold px-10 py-3.5 font-sans text-[13px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting…' : 'Submit Registration'}
              </button>
            </div>
          </form>
        </Reveal>
      </div>
    </main>
  );
}