'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Search,
  RefreshCcw,
  FileText,
  Image as ImageIcon,
  AlertTriangle,
} from 'lucide-react';

// Add base url from env
const BASE_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_BASE_URL|| "")
    : "";

// Mirrors IRegistrationForm on the backend, minus `password` (never
// returned by getAllRegistrationForms — it's excluded via .select('-password')).
interface RegistrationEntry {
  _id: string;
  name: string;
  dob: string;
  mobile: string;
  email: string;
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
  yearsOfExperience?: string;
  currentCompany?: string;
  designation?: string;
  annualCTC?: string;
  resume?: string;
  photo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminRegistrationsPage() {
  const [entries, setEntries] = useState<RegistrationEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  async function loadEntries() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/registration`, { cache: 'no-store' });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message ?? 'Could not load registration data.');
      }

      setEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not load registration data.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!entries) return [];
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) =>
      [e.name, e.email, e.mobile, e.city, e.state, e.industryType, e.functionalArea]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q))
    );
  }, [entries, query]);

  // Helper to prefix document URLs with BASE_URL if not already absolute.
  function getDocUrl(url?: string): string | undefined {
    if (!url) return undefined;
    if (/^https?:\/\//i.test(url)) return url;
    return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  return (
    <main className="bg-beige min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="eyebrow">Admin &middot; Registrations</p>
            <h1 className="font-serif text-3xl text-ink mt-2">
              Registration Submissions
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border border-gold-light/40 bg-white rounded-md px-3 h-10">
              <Search size={15} className="text-ink/40" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, mobile…"
                className="h-full bg-transparent font-sans text-[13px] text-ink placeholder:text-ink/35 focus:outline-none w-56"
              />
            </div>
            <button
              type="button"
              onClick={loadEntries}
              disabled={loading}
              className="inline-flex items-center gap-2 border border-gold px-4 h-10 font-sans text-[12px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-300 disabled:opacity-50"
            >
              <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-8">
          {!loading && error && (
            <div className="border border-red-200 bg-red-50 rounded-xl px-8 py-10 text-center flex flex-col items-center gap-3">
              <AlertTriangle size={22} className="text-red-500" />
              <p className="font-sans text-sm text-red-700">{error}</p>
              <button
                type="button"
                onClick={loadEntries}
                className="mt-1 font-sans text-[12px] tracking-widest2 uppercase text-gold-dark hover:underline"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && entries && entries.length === 0 && (
            <div className="border border-gold-light/50 bg-ivory rounded-xl px-8 py-12 text-center">
              <p className="font-sans text-sm text-ink/60">
                No registration submissions yet.
              </p>
            </div>
          )}

          {!loading && !error && entries && entries.length > 0 && (
            <>
              <p className="font-sans text-xs text-ink/50 mb-3">
                Showing {filtered.length} of {entries.length} submission
                {entries.length === 1 ? '' : 's'}
              </p>

              <div className="border border-gold-light/50 bg-ivory rounded-xl shadow-sm overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left border-collapse">
                  <thead>
                    <tr className="bg-gold-light/25 border-b border-gold-light/40">
                      {[
                        'Name',
                        'Email',
                        'Mobile',
                        'DOB',
                        'City / State',
                        'Preferred City',
                        'Education',
                        'Industry / Function',
                        'Experience',
                        'Company',
                        'Designation',
                        'CTC',
                        'Docs',
                        'Submitted',
                      ].map((col) => (
                        <th
                          key={col}
                          className="px-4 py-3 font-sans text-[11px] tracking-widest2 uppercase text-ink/60 whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((entry) => (
                      <tr
                        key={entry._id}
                        className="border-b border-gold-light/20 last:border-b-0 hover:bg-beige/60 transition-colors"
                      >
                        <td className="px-4 py-3 font-sans text-[13px] text-ink/85 whitespace-nowrap">
                          {entry.name}
                        </td>
                        <td className="px-4 py-3 font-sans text-[13px] text-ink/70 whitespace-nowrap">
                          {entry.email}
                        </td>
                        <td className="px-4 py-3 font-sans text-[13px] text-ink/70 whitespace-nowrap">
                          {entry.mobile}
                        </td>
                        <td className="px-4 py-3 font-sans text-[13px] text-ink/70 whitespace-nowrap">
                          {entry.dob ? new Date(entry.dob).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td className="px-4 py-3 font-sans text-[13px] text-ink/70 whitespace-nowrap">
                          {entry.city}, {entry.state}
                        </td>
                        <td className="px-4 py-3 font-sans text-[13px] text-ink/70 whitespace-nowrap">
                          {entry.preferredCity}
                        </td>
                        <td className="px-4 py-3 font-sans text-[13px] text-ink/70 whitespace-nowrap">
                          {entry.highestEducation} &middot; {entry.education} ({entry.stream})
                        </td>
                        <td className="px-4 py-3 font-sans text-[13px] text-ink/70 whitespace-nowrap">
                          {entry.industryType} &middot; {entry.functionalArea}
                        </td>
                        <td className="px-4 py-3 font-sans text-[13px] text-ink/70 whitespace-nowrap">
                          {entry.yearsOfExperience || '—'}
                        </td>
                        <td className="px-4 py-3 font-sans text-[13px] text-ink/70 whitespace-nowrap">
                          {entry.currentCompany || '—'}
                        </td>
                        <td className="px-4 py-3 font-sans text-[13px] text-ink/70 whitespace-nowrap">
                          {entry.designation || '—'}
                        </td>
                        <td className="px-4 py-3 font-sans text-[13px] text-ink/70 whitespace-nowrap">
                          {entry.annualCTC || '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {entry.resume && (
                              <a
                                href={getDocUrl(entry.resume)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Resume"
                                className="text-gold-dark hover:text-ink transition-colors"
                              >
                                <FileText size={16} />
                              </a>
                            )}
                            {entry.photo && (
                              <a
                                href={getDocUrl(entry.photo)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Photo"
                                className="text-gold-dark hover:text-ink transition-colors"
                              >
                                <ImageIcon size={16} />
                              </a>
                            )}
                            {!entry.resume && !entry.photo && (
                              <span className="text-ink/30 text-[12px]">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-sans text-[13px] text-ink/60 whitespace-nowrap">
                          {entry.createdAt
                            ? new Date(entry.createdAt).toLocaleDateString('en-IN')
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}