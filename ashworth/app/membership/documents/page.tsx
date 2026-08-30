'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, FileText, UploadCloud } from 'lucide-react';
import { toast } from 'react-toastify';
import AuthGuard from '@/components/auth/AuthGuard';
import HairlineDivider from '@/components/ui/HairlineDivider';
import LoadingState, { ErrorState } from '@/components/ui/LoadingState';
import {
  ApiClientError,
  getRequiredDocumentsList,
  getUserDocuments,
  saveKycNumbers,
  submitDocuments,
  uploadDocumentWithProgress,
} from '@/lib/api/client';
import type { RequiredDocumentListItem, UserDocument } from '@/lib/api/types';

interface FileFieldState {
  status: 'idle' | 'uploading' | 'done' | 'error';
  progress: number;
  fileName?: string;
}

function snakeToCamel(key: string) {
  return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

const inputClasses =
  'w-full  bg-ivory px-4 py-3 font-sans text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:border-gold transition-colors';

function DocumentsFlow() {
  const router = useRouter();

  const [requiredList, setRequiredList] = useState<RequiredDocumentListItem[] | null>(
    null
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fileFields, setFileFields] = useState<Record<string, FileFieldState>>({});
  const [textValues, setTextValues] = useState<Record<string, string>>({});
  const [kycSaved, setKycSaved] = useState(false);
  const [isSavingKyc, setIsSavingKyc] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const loadAll = useCallback(async () => {
    setLoadError(null);
    try {
      const [list, existingDocs] = await Promise.all([
        getRequiredDocumentsList(),
        getUserDocuments().catch(() => [] as UserDocument[]),
      ]);
      setRequiredList(list);

      const initialFileFields: Record<string, FileFieldState> = {};
      for (const item of list) {
        if (item.inputType !== 'file') continue;
        const existing = existingDocs.find((d) => d.documentType === item.key);
        initialFileFields[item.key] = existing
          ? { status: 'done', progress: 100, fileName: existing.fileName }
          : { status: 'idle', progress: 0 };
      }
      setFileFields(initialFileFields);

      const initialTextValues: Record<string, string> = {};
      for (const item of list) {
        if (item.inputType === 'text') initialTextValues[item.key] = '';
      }
      setTextValues(initialTextValues);
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : 'Could not load the document requirements. Please try again.';
      setLoadError(message);
      toast.error(message);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const fileItems = useMemo(
    () => (requiredList ?? []).filter((i) => i.inputType === 'file'),
    [requiredList]
  );
  const textItems = useMemo(
    () => (requiredList ?? []).filter((i) => i.inputType === 'text'),
    [requiredList]
  );

  const allFilesDone = fileItems.every(
    (item) => fileFields[item.key]?.status === 'done'
  );
  const kycRequired = textItems.length > 0;
  const kycComplete = !kycRequired || kycSaved;
  const canSubmit = allFilesDone && kycComplete && !isSubmitting;

  async function handleFileChange(item: RequiredDocumentListItem, file: File | null) {
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PNG, JPEG, or PDF file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File is too large. Please keep uploads under 10MB.');
      return;
    }

    setFileFields((prev) => ({
      ...prev,
      [item.key]: { status: 'uploading', progress: 0 },
    }));

    try {
      const res = await uploadDocumentWithProgress(item.key, file, (percent) => {
        setFileFields((prev) => ({
          ...prev,
          [item.key]: { status: 'uploading', progress: percent },
        }));
      });
      setFileFields((prev) => ({
        ...prev,
        [item.key]: {
          status: 'done',
          progress: 100,
          fileName: res.document.fileName,
        },
      }));
      toast.success(`${item.label} uploaded.`);
    } catch (err) {
      setFileFields((prev) => ({
        ...prev,
        [item.key]: { status: 'error', progress: 0 },
      }));
      const message =
        err instanceof ApiClientError
          ? err.message
          : `Could not upload ${item.label}. Please try again.`;
      toast.error(message);
    }
  }

  async function handleSaveKyc() {
    const missing = textItems.filter((item) => !textValues[item.key]?.trim());
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.map((m) => m.label).join(', ')}.`);
      return;
    }

    setIsSavingKyc(true);
    try {
      // The contract's kyc-numbers endpoint always accepts exactly
      // { aadharNumber, panNumber } — we build that from whatever text
      // items the required-list currently returns, camel-casing each key.
      const payload = textItems.reduce<Record<string, string>>((acc, item) => {
        acc[snakeToCamel(item.key)] = textValues[item.key].trim();
        return acc;
      }, {});

      await saveKycNumbers({
        aadharNumber: payload.aadharNumber ?? '',
        panNumber: payload.panNumber ?? '',
      });
      setKycSaved(true);
      toast.success('Identity numbers saved.');
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : 'Could not save your identity numbers. Please try again.';
      toast.error(message);
    } finally {
      setIsSavingKyc(false);
    }
  }

  async function handleSubmitForReview() {
    setIsSubmitting(true);
    try {
      await submitDocuments();
      setSubmitted(true);
      toast.success('Your application is now under review.');
      setTimeout(() => router.push('/profile'), 1800);
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : 'Could not submit your application. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="bg-gold-light/25 border border-gold-light/25 min-h-[80vh]">
      <div className="max-w-2xl mx-auto px-6 py-24 md:py-28">
        <div className="text-center mb-10 flex flex-col items-center">
          <FileText size={30} strokeWidth={1.25} className="text-gold-dark mb-4" />
          <p className="eyebrow">Membership &middot; Documents</p>
          <h1 className="font-serif text-3xl text-ink mt-3">
            Verify Your Identity
          </h1>
          <HairlineDivider width="56px" className="mt-6" />
          <p className="mt-6 font-sans text-sm text-ink/65 max-w-md">
            Upload the documents below so our admissions team can complete
            your verification.
          </p>
        </div>

        {!requiredList && !loadError && (
          <LoadingState message="Loading requirements…" />
        )}

        {loadError && !requiredList && (
          <ErrorState message={loadError} onRetry={loadAll} />
        )}

        {submitted && (
          <div className=" bg-gold-light/25 border border-gold-light/25 px-8 py-14 text-center flex flex-col items-center gap-4">
            <CheckCircle2 size={36} strokeWidth={1.25} className="text-gold-dark" />
            <h2 className="font-serif text-2xl text-ink">Under Review</h2>
            <p className="font-sans text-sm text-ink/65 max-w-md">
              Your application is now under review. Taking you to your
              profile…
            </p>
          </div>
        )}

        {requiredList && !submitted && (
          <div className="space-y-6">
            {fileItems.length > 0 && (
              <div className=" bg-gold-light/25 border border-gold-light/25 px-6 py-8 md:px-10">
                <h2 className="font-serif text-xl text-ink mb-6">Documents</h2>
                <div className="space-y-6">
                  {fileItems.map((item) => {
                    const field = fileFields[item.key] ?? {
                      status: 'idle' as const,
                      progress: 0,
                    };
                    return (
                      <div key={item.key}>
                        <div className="flex items-center justify-between mb-2">
                          <label
                            htmlFor={item.key}
                            className="font-sans text-[11px] tracking-widest2 uppercase text-ink/60"
                          >
                            {item.label}
                          </label>
                          {field.status === 'done' && (
                            <span className="inline-flex items-center gap-1.5 text-gold-dark">
                              <CheckCircle2 size={16} strokeWidth={1.5} />
                              <span className="font-sans text-xs">Uploaded</span>
                            </span>
                          )}
                        </div>

                        <label
                          htmlFor={item.key}
                          className={`flex items-center gap-3 border px-4 py-3 cursor-pointer transition-colors ${
                            field.status === 'done'
                              ? 'border-gold-light/50 bg-ivory'
                              : 'border-dashed border-gold-light/60 bg-ivory hover:border-gold'
                          }`}
                        >
                          <UploadCloud
                            size={18}
                            strokeWidth={1.5}
                            className="text-gold-dark shrink-0"
                          />
                          <span className="font-sans text-sm text-ink/70 truncate">
                            {field.fileName ||
                              (field.status === 'uploading'
                                ? `Uploading… ${field.progress}%`
                                : 'Choose a PNG, JPEG, or PDF file')}
                          </span>
                          <input
                            id={item.key}
                            type="file"
                            accept="image/png,image/jpeg,image/webp,application/pdf"
                            className="hidden"
                            onChange={(e) =>
                              handleFileChange(item, e.target.files?.[0] ?? null)
                            }
                          />
                        </label>

                        {field.status === 'uploading' && (
                          <div className="mt-2 h-1 bg-gold-light/25 overflow-hidden">
                            <div
                              className="h-full bg-gold transition-all duration-200"
                              style={{ width: `${field.progress}%` }}
                            />
                          </div>
                        )}
                        {field.status === 'error' && (
                          <p className="mt-2 text-xs text-red-700/80 font-sans">
                            Upload failed. Please choose the file again.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {textItems.length > 0 && (
              <div className=" bg-gold-light/25 border border-gold-light/25 px-6 py-8 md:px-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-xl text-ink">Identity Numbers</h2>
                  {kycSaved && (
                    <span className="inline-flex items-center gap-1.5 text-gold-dark">
                      <CheckCircle2 size={16} strokeWidth={1.5} />
                      <span className="font-sans text-xs">Saved</span>
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {textItems.map((item) => (
                    <div key={item.key}>
                      <label
                        className="font-sans text-[11px] tracking-widest2 uppercase text-ink/60 mb-2 block"
                        htmlFor={item.key}
                      >
                        {item.label}
                      </label>
                      <input
                        id={item.key}
                        className={inputClasses}
                        value={textValues[item.key] ?? ''}
                        onChange={(e) => {
                          setKycSaved(false);
                          setTextValues((prev) => ({
                            ...prev,
                            [item.key]: e.target.value,
                          }));
                        }}
                        placeholder={item.label}
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleSaveKyc}
                  disabled={isSavingKyc}
                  className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-3 border border-gold px-9 py-3 font-sans text-[13px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingKyc ? 'Saving…' : 'Save Details'}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmitForReview}
              disabled={!canSubmit}
              className="w-full inline-flex items-center justify-center gap-3 border border-gold px-9 py-3.5 font-sans text-[13px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gold-dark"
            >
              {isSubmitting ? 'Submitting…' : 'Submit for Review'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function DocumentsPage() {
  return (
    <AuthGuard>
      <DocumentsFlow />
    </AuthGuard>
  );
}
