// 'use client';

// import {
//   createContext,
//   useCallback,
//   useContext,
//   useMemo,
//   useState,
//   type ReactNode,
// } from 'react';
// import { toast } from 'react-toastify';
// import {
//   ApiClientError,
//   signupConsent,
//   signupOtpSend,
//   signupOtpVerify,
//   signupStart,
// } from '@/lib/api/client';
// import type { SignupStartRequest } from '@/lib/api/types';
// import { useAuth } from '@/context/AuthContext';

// export type SignupStep = 'form' | 'consent' | 'otp' | 'complete';

// interface SignupContextValue {
//   step: SignupStep;
//   clubId: string | null;
//   clubSlug: string | null;
//   clubName: string | null;
//   signupSessionId: string | null;
//   fullName: string;
//   isSubmitting: boolean;
//   fieldErrors: Record<string, string>;
//   otpExpiresInSeconds: number | null;
//   beginForClub: (clubId: string, clubSlug: string, clubName: string) => void;
//   submitMembershipForm: (
//     data: Omit<SignupStartRequest, 'clubId'>
//   ) => Promise<boolean>;
//   submitConsent: (data: {
//     consentAccepted: true;
//     consentVersion: string;
//     signedName: string;
//   }) => Promise<boolean>;
//   requestOtp: () => Promise<boolean>;
//   verifyOtp: (otp: string) => Promise<boolean>;
//   reset: () => void;
// }

// const SignupContext = createContext<SignupContextValue | undefined>(undefined);

// export function SignupProvider({ children }: { children: ReactNode }) {
//   const [step, setStep] = useState<SignupStep>('form');
//   const [clubId, setClubId] = useState<string | null>(null);
//   const [clubSlug, setClubSlug] = useState<string | null>(null);
//   const [clubName, setClubName] = useState<string | null>(null);
//   const [signupSessionId, setSignupSessionId] = useState<string | null>(null);
//   const [fullName, setFullName] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
//   const [otpExpiresInSeconds, setOtpExpiresInSeconds] = useState<number | null>(
//     null
//   );

//   const { setSession } = useAuth();

//   const beginForClub = useCallback(
//     (newClubId: string, newClubSlug: string, newClubName: string) => {
//       setClubId(newClubId);
//       setClubSlug(newClubSlug);
//       setClubName(newClubName);
//       setStep('form');
//       setSignupSessionId(null);
//       setFieldErrors({});
//     },
//     []
//   );

//   const handleError = useCallback((err: unknown, fallback: string) => {
//     if (err instanceof ApiClientError) {
//       if (err.code === 'VALIDATION_ERROR' && err.details) {
//         setFieldErrors(err.details);
//         toast.error(err.message || 'Please check the highlighted fields.');
//       } else {
//         setFieldErrors({});
//         toast.error(err.message || fallback);
//       }
//     } else {
//       setFieldErrors({});
//       toast.error(fallback);
//     }
//   }, []);

//   const submitMembershipForm = useCallback<
//     SignupContextValue['submitMembershipForm']
//   >(
//     async (data) => {
//       if (!clubId) {
//         toast.error('No club selected. Please start again from the club page.');
//         return false;
//       }
//       setIsSubmitting(true);
//       setFieldErrors({});
//       try {
//         const res = await signupStart({ clubId, ...data });
//         setSignupSessionId(res.signupSessionId);
//         setFullName(data.fullName);
//         setStep('consent');
//         toast.success('Details received — please review and accept the agreement.');
//         return true;
//       } catch (err) {
//         handleError(err, 'Could not submit your membership form. Please try again.');
//         return false;
//       } finally {
//         setIsSubmitting(false);
//       }
//     },
//     [clubId, handleError]
//   );

//   const submitConsent = useCallback<SignupContextValue['submitConsent']>(
//     async (data) => {
//       if (!signupSessionId) {
//         toast.error('Your session has expired. Please start the form again.');
//         setStep('form');
//         return false;
//       }
//       setIsSubmitting(true);
//       setFieldErrors({});
//       try {
//         await signupConsent({ signupSessionId, ...data });
//         setStep('otp');
//         toast.success('Agreement accepted. Verifying your email next.');
//         return true;
//       } catch (err) {
//         handleError(err, 'Could not record your consent. Please try again.');
//         return false;
//       } finally {
//         setIsSubmitting(false);
//       }
//     },
//     [signupSessionId, handleError]
//   );

//   const requestOtp = useCallback(async () => {
//     if (!signupSessionId) {
//       toast.error('Your session has expired. Please start the form again.');
//       setStep('form');
//       return false;
//     }
//     setIsSubmitting(true);
//     try {
//       const res = await signupOtpSend({ signupSessionId });
//       setOtpExpiresInSeconds(res.expiresInSeconds);
//       toast.success(res.message || 'OTP sent to your email.');
//       return true;
//     } catch (err) {
//       handleError(err, 'Could not send an OTP. Please try again.');
//       return false;
//     } finally {
//       setIsSubmitting(false);
//     }
//   }, [signupSessionId, handleError]);

//   const verifyOtp = useCallback(
//     async (otp: string) => {
//       if (!signupSessionId) {
//         toast.error('Your session has expired. Please start the form again.');
//         setStep('form');
//         return false;
//       }
//       setIsSubmitting(true);
//       setFieldErrors({});
//       try {
//         const res = await signupOtpVerify({ signupSessionId, otp });
//         setSession(res.token, res.user);
//         setStep('complete');
//         toast.success('Email verified — welcome to the Society.');
//         return true;
//       } catch (err) {
//         handleError(err, 'Could not verify that code. Please try again.');
//         return false;
//       } finally {
//         setIsSubmitting(false);
//       }
//     },
//     [signupSessionId, handleError, setSession]
//   );

//   const reset = useCallback(() => {
//     setStep('form');
//     setClubId(null);
//     setClubSlug(null);
//     setClubName(null);
//     setSignupSessionId(null);
//     setFullName('');
//     setFieldErrors({});
//     setOtpExpiresInSeconds(null);
//   }, []);

//   const value = useMemo<SignupContextValue>(
//     () => ({
//       step,
//       clubId,
//       clubSlug,
//       clubName,
//       signupSessionId,
//       fullName,
//       isSubmitting,
//       fieldErrors,
//       otpExpiresInSeconds,
//       beginForClub,
//       submitMembershipForm,
//       submitConsent,
//       requestOtp,
//       verifyOtp,
//       reset,
//     }),
//     [
//       step,
//       clubId,
//       clubSlug,
//       clubName,
//       signupSessionId,
//       fullName,
//       isSubmitting,
//       fieldErrors,
//       otpExpiresInSeconds,
//       beginForClub,
//       submitMembershipForm,
//       submitConsent,
//       requestOtp,
//       verifyOtp,
//       reset,
//     ]
//   );

//   return (
//     <SignupContext.Provider value={value}>{children}</SignupContext.Provider>
//   );
// }

// export function useSignup() {
//   const ctx = useContext(SignupContext);
//   if (!ctx) throw new Error('useSignup must be used within a SignupProvider');
//   return ctx;
// }


'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { toast } from 'react-toastify';
import {
  ApiClientError,
  signupConsent,
  signupOtpSend,
  signupOtpVerify,
  signupStart,
} from '@/lib/api/client';
import type { SignupStartRequest } from '@/lib/api/types';
import { useAuth } from '@/context/AuthContext';

export type SignupStep = 'form' | 'otp' | 'complete';

interface ConsentInput {
  consentAccepted: true;
  consentVersion: string;
  signatureImage: string;
}

interface SignupContextValue {
  step: SignupStep;
  clubId: string | null;
  clubSlug: string | null;
  clubName: string | null;
  signupSessionId: string | null;
  fullName: string;
  isSubmitting: boolean;
  fieldErrors: Record<string, string>;
  otpExpiresInSeconds: number | null;
  beginForClub: (clubId: string, clubSlug: string, clubName: string) => void;
  /**
   * Single combined submit for the merged form: registers the applicant,
   * records consent (with signature), and sends the OTP — in one request
   * chain — advancing straight to the 'otp' step only if all three succeed.
   */
  submitFormAndConsent: (
    formData: Omit<SignupStartRequest, 'clubId'>,
    consent: ConsentInput
  ) => Promise<boolean>;
  requestOtp: () => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<boolean>;
  reset: () => void;
}

const SignupContext = createContext<SignupContextValue | undefined>(undefined);

export function SignupProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<SignupStep>('form');
  const [clubId, setClubId] = useState<string | null>(null);
  const [clubSlug, setClubSlug] = useState<string | null>(null);
  const [clubName, setClubName] = useState<string | null>(null);
  const [signupSessionId, setSignupSessionId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [otpExpiresInSeconds, setOtpExpiresInSeconds] = useState<number | null>(
    null
  );

  const { setSession } = useAuth();

  const beginForClub = useCallback(
    (newClubId: string, newClubSlug: string, newClubName: string) => {
      setClubId(newClubId);
      setClubSlug(newClubSlug);
      setClubName(newClubName);
      setStep('form');
      setSignupSessionId(null);
      setFieldErrors({});
    },
    []
  );

  const handleError = useCallback((err: unknown, fallback: string) => {
    if (err instanceof ApiClientError) {
      if (err.code === 'VALIDATION_ERROR' && err.details) {
        setFieldErrors(err.details);
        toast.error(err.message || 'Please check the highlighted fields.');
      } else {
        setFieldErrors({});
        toast.error(err.message || fallback);
      }
    } else {
      setFieldErrors({});
      toast.error(fallback);
    }
  }, []);

  const submitFormAndConsent = useCallback<
    SignupContextValue['submitFormAndConsent']
  >(
    async (formData, consent) => {
      if (!clubId) {
        toast.error('No club selected. Please start again from the club page.');
        return false;
      }
      setIsSubmitting(true);
      setFieldErrors({});
      try {
        const startRes = await signupStart({ clubId, ...formData });
        setSignupSessionId(startRes.signupSessionId);
        setFullName(formData.fullName);

        await signupConsent({
          signupSessionId: startRes.signupSessionId,
          consentAccepted: consent.consentAccepted,
          consentVersion: consent.consentVersion,
          // Signature is drawn, not typed, so the signed name is taken
          // directly from the applicant's full name on the same form.
          signedName: formData.fullName,
          signatureImage: consent.signatureImage,
        });

        const otpRes = await signupOtpSend({
          signupSessionId: startRes.signupSessionId,
        });
        setOtpExpiresInSeconds(otpRes.expiresInSeconds);

        setStep('otp');
        toast.success('Details received — a verification code has been sent to your email.');
        return true;
      } catch (err) {
        console.log(err);
        handleError(err, 'Could not submit your membership details. Please try again.');
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [clubId, handleError]
  );

  const requestOtp = useCallback(async () => {
    if (!signupSessionId) {
      toast.error('Your session has expired. Please start the form again.');
      setStep('form');
      return false;
    }
    setIsSubmitting(true);
    try {
      const res = await signupOtpSend({ signupSessionId });
      setOtpExpiresInSeconds(res.expiresInSeconds);
      toast.success(res.message || 'OTP sent to your email.');
      return true;
    } catch (err) {
      handleError(err, 'Could not send an OTP. Please try again.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [signupSessionId, handleError]);

  const verifyOtp = useCallback(
    async (otp: string) => {
      if (!signupSessionId) {
        toast.error('Your session has expired. Please start the form again.');
        setStep('form');
        return false;
      }
      setIsSubmitting(true);
      setFieldErrors({});
      try {
        const res = await signupOtpVerify({ signupSessionId, otp });
        setSession(res.token, res.user);
        setStep('complete');
        toast.success('Email verified — welcome to the Society.');
        return true;
      } catch (err) {
        handleError(err, 'Could not verify that code. Please try again.');
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [signupSessionId, handleError, setSession]
  );

  const reset = useCallback(() => {
    setStep('form');
    setClubId(null);
    setClubSlug(null);
    setClubName(null);
    setSignupSessionId(null);
    setFullName('');
    setFieldErrors({});
    setOtpExpiresInSeconds(null);
  }, []);

  const value = useMemo<SignupContextValue>(
    () => ({
      step,
      clubId,
      clubSlug,
      clubName,
      signupSessionId,
      fullName,
      isSubmitting,
      fieldErrors,
      otpExpiresInSeconds,
      beginForClub,
      submitFormAndConsent,
      requestOtp,
      verifyOtp,
      reset,
    }),
    [
      step,
      clubId,
      clubSlug,
      clubName,
      signupSessionId,
      fullName,
      isSubmitting,
      fieldErrors,
      otpExpiresInSeconds,
      beginForClub,
      submitFormAndConsent,
      requestOtp,
      verifyOtp,
      reset,
    ]
  );

  return (
    <SignupContext.Provider value={value}>{children}</SignupContext.Provider>
  );
}

export function useSignup() {
  const ctx = useContext(SignupContext);
  if (!ctx) throw new Error('useSignup must be used within a SignupProvider');
  return ctx;
}