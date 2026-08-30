'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Landmark, Compass, Gem, Crown, type LucideIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import SectionHeading from './ui/SectionHeading';
import IconFrame from './ui/IconFrame';
import Reveal from './ui/Reveal';
import { ApiClientError, getClubs } from '@/lib/api/client';
import type { Club } from '@/lib/api/types';

const FALLBACK_ICONS: LucideIcon[] = [Landmark, Compass, Gem, Crown];

export default function ClubCards() {
  const [clubs, setClubs] = useState<Club[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getClubs()
      .then((data) => {
        if (!cancelled) setClubs(data);
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          err instanceof ApiClientError
            ? err.message
            : 'Could not load the Society\u2019s clubs. Please try again shortly.';
        setError(message);
        toast.error(message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
 <section id="membership" className="bg-beige py-8 md:py-8">
      <div className="max-w-7xl  mx-auto px-6 bg-gold-light/25 border border-gold-light/25 py-16">
        <SectionHeading
          eyebrow="Varun Rai Kochhar Initiative"
          title="Four Clubs, One Vision"
          subtitle="Each circle admits a limited number of members by application and sponsorship, preserving the intimacy the Club was founded upon."
        />

        {error && !clubs && (
          <div className="border border-gold-light/50 bg-ivory px-8 py-12 text-center">
            <p className="font-sans text-sm text-ink/60">{error}</p>
          </div>
        )}

        {!error && !clubs && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 bg-gold-light/25 border border-gold-light/25 p-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-ivory h-full px-8 py-12 flex flex-col items-center gap-5 animate-pulse rounded-xl shadow-sm"
              >
                <span className="w-16 h-16 rounded-full bg-gold-light/20" />
                <span className="h-4 w-24 bg-gold-light/20 rounded" />
                <span className="h-3 w-32 bg-gold-light/10 rounded" />
              </div>
            ))}
          </div>
        )}

        {clubs && clubs.length === 0 && (
          <div className="border border-gold-light/50 bg-ivory px-8 py-12 text-center">
            <p className="font-sans text-sm text-ink/60">
              No clubs are published yet. Please check back shortly.
            </p>
          </div>
        )}

        {clubs && clubs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6  p-6">
            {clubs.map((club, i) => {
              const Icon = FALLBACK_ICONS[i % FALLBACK_ICONS.length];
              return (
                <Reveal key={club._id} delay={i * 0.12} scale={0.97}>
                  <Link
                    href={`/clubs/${club.slug}`}
                    className="group bg-ivory h-full px-4 py-6 flex flex-col items-center  justify-between text-center gap-14 hover:bg-beige transition-colors duration-300 rounded-xl shadow-sm"
                  >
                    <div>
                    <IconFrame icon={Icon} />
                    <h3 className="font-serif text-xl tracking-wide uppercase text-ink mt-2">
                      {club.name}
                    </h3>
                    <span className="block w-6 h-px my-4 bg-gold-light mx-auto" />
                    <p className="text-sm leading-relaxed text-ink/65 font-sans">
                      {club.tagline}
                    </p>

                    </div>
                    
                    <span className="mt-1 font-sans text-[11px] tracking-widest2 uppercase text-gold-dark group-hover:underline">
                      {club.membershipOpen ? 'View Club \u2192' : 'View Club'}
                    </span>
     
          <div className="flex w-full gap-3">
            <a
              href="#membership"
              className="inline-flex flex-1 min-w-0 items-center justify-center gap-2 border border-gold px-4 py-2 font-sans text-[11px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-300 whitespace-nowrap rounded"
            >
              Enquire
            </a>
            <a
              href="#membership"
              className="inline-flex flex-1 min-w-0 items-center justify-center gap-2 border border-gold px-4 py-2 font-sans text-[11px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-300 whitespace-nowrap rounded"
            >
              Membership
            </a>
          </div>
     

                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
<section id="membership" className="bg-beige py-8 md:py-8">
      <div className="max-w-7xl  mx-auto px-6 bg-gold-light/25 border border-gold-light/25 py-16">
        <SectionHeading
          eyebrow="Varun Rai Kochhar Initiative"
          title="Four Clubs, One Vision"
          subtitle="Each circle admits a limited number of members by application and sponsorship, preserving the intimacy the Club was founded upon."
        />

        {error && !clubs && (
          <div className="border border-gold-light/50 bg-ivory px-8 py-12 text-center">
            <p className="font-sans text-sm text-ink/60">{error}</p>
          </div>
        )}

        {!error && !clubs && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 bg-gold-light/25 border border-gold-light/25 p-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-ivory h-full px-8 py-12 flex flex-col items-center gap-5 animate-pulse rounded-xl shadow-sm"
              >
                <span className="w-16 h-16 rounded-full bg-gold-light/20" />
                <span className="h-4 w-24 bg-gold-light/20 rounded" />
                <span className="h-3 w-32 bg-gold-light/10 rounded" />
              </div>
            ))}
          </div>
        )}

        {clubs && clubs.length === 0 && (
          <div className="border border-gold-light/50 bg-ivory px-8 py-12 text-center">
            <p className="font-sans text-sm text-ink/60">
              No clubs are published yet. Please check back shortly.
            </p>
          </div>
        )}

        {clubs && clubs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6  p-6">
            {clubs.map((club, i) => {
              const Icon = FALLBACK_ICONS[i % FALLBACK_ICONS.length];
              return (
                <Reveal key={club._id} delay={i * 0.12} scale={0.97}>
                  <Link
                    href={`/clubs/${club.slug}`}
                    className="group bg-ivory h-full px-4 py-6 flex flex-col items-center  justify-between text-center gap-14 hover:bg-beige transition-colors duration-300 rounded-xl shadow-sm"
                  >
                    <div>
                    <IconFrame icon={Icon} />
                    <h3 className="font-serif text-xl tracking-wide uppercase text-ink mt-2">
                      {club.name}
                    </h3>
                    <span className="block w-6 h-px my-4 bg-gold-light mx-auto" />
                    <p className="text-sm leading-relaxed text-ink/65 font-sans">
                      {club.tagline}
                    </p>

                    </div>
                    
                    <span className="mt-1 font-sans text-[11px] tracking-widest2 uppercase text-gold-dark group-hover:underline">
                      {club.membershipOpen ? 'View Club \u2192' : 'View Club'}
                    </span>
     
          <div className="flex w-full gap-3">
            <a
              href="#membership"
              className="inline-flex flex-1 min-w-0 items-center justify-center gap-2 border border-gold px-4 py-2 font-sans text-[11px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-300 whitespace-nowrap rounded"
            >
              Enquire
            </a>
            <a
              href="#membership"
              className="inline-flex flex-1 min-w-0 items-center justify-center gap-2 border border-gold px-4 py-2 font-sans text-[11px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-300 whitespace-nowrap rounded"
            >
              Membership
            </a>
          </div>
     

                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
    </>
   
  );
}
