'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, LockKeyhole, Gem, Globe, Users, Star, Briefcase, Feather } from 'lucide-react';
import { ApiClientError, getClubBySlug } from '@/lib/api/client';
import { motion } from 'framer-motion';
import Monogram from '@/components/ui/Monogram';
import HairlineDivider from '@/components/ui/HairlineDivider';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import { useEffect, useState } from 'react';

interface ClubDetailPageProps {
  params: { slug: string };
}

export const dynamic = 'force-dynamic';

async function loadClub(slug: string) {
  try {
    return await getClubBySlug(slug);
  } catch (err) {
    if (err instanceof ApiClientError && err.code === 'NOT_FOUND') {
      notFound();
    }
    throw err;
  }
}

export default function ClubDetailPage({ params }: ClubDetailPageProps) {
  // Client component: useSWR or react-query would be ideal, but we'll keep plain for now
  const [club, setClub] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const clubData = await loadClub(params.slug);
      setClub(clubData);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug]);

  if (loading || !club) {
    return (
      <main>
        {/* Optionally a spinner or skeleton screen */}
        <section className="pt-40 text-center text-xl text-ink/70">Loading...</section>
      </main>
    );
  }

  const blocks = [
    {
      label: 'Who we are?',
      copy: `A private members’ society founded on discretion, standing since our first charter, and sustained by a small circle of sponsors and members.`,
    },
    {
      label: 'Why is it unique?',
      copy: `Four distinct circles operate under one Society, each with its own admissions standard, yet every member draws on the privileges of all.`,
    },
    {
      label: 'How do you benefit?',
      copy: `Access to vetted real estate, travel, acquisitions and enterprise, arranged through a single point of introduction and account.`,
    },
    {
      label: 'Who should join?',
      copy: `Those who value privacy over publicity, and relationships built over years rather than transactions built for the moment.`,
    },
  ];

  // Default fallback arrays for new categories if not present on club.whatWeOffer
  const opportunities = club.whatWeOffer?.opportunities ?? [
    'Personal introductions to a vetted network',
    'Invitations to private events and retreats',
    'Access to exclusive investment or travel opportunities',
  ];

  const privileges = club.whatWeOffer?.privileges ?? [
    'Exclusive access to private lounges and venues',
    'Priority booking for club accommodations',
    'White-glove member services',
  ];

  const philosophy = club.whatWeOffer?.philosophy ?? [
    'Commitment to member privacy and integrity',
    'Upholding tradition with modern sensibilities',
    'Fostering lasting, cross-generational relationships',
  ];

  return (
    <main>
      {/* Header Hero with club.name */}
      <section className="relative overflow-hidden bg-gold-light/25 border border-gold-light/25">
        <div className="relative max-w-3xl mx-auto px-6 pt-28 pb-24 md:pt-36 md:pb-32 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <Monogram size={92} />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="eyebrow mt-9"
          >
            Established for the Discerning &middot; By Invitation
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.55 }}
            className="mt-6 w-full"
          >
            <HairlineDivider width="88px" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              delay: 0.7,
              ease: [0.22, 0.61, 0.36, 1],
            }}
            className="font-serif text-[2.75rem] leading-[1.1] md:text-6xl md:leading-[1.08] text-ink mt-6"
          >
            {club.name}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.95 }}
            className="mt-6 w-full"
          >
            <HairlineDivider width="88px" />
          </motion.div>
          {club.tagline && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.05 }}
              className="mt-8 text-base md:text-lg text-ink/70 max-w-xl leading-relaxed font-sans"
            >
              {club.tagline}
            </motion.p>
          )}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.25 }}
            className="mt-12"
          >
            <a
              href="#membership"
              className="inline-flex items-center gap-3 border border-gold px-9 py-3.5 font-sans text-[13px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-500"
            >
              Enquire About Membership
            </a>
          </motion.div>
        </div>
      </section>

      {/* About the Club */}
      <section className="bg-beige py-24 md:py-28">
        <div className="max-w-7xl  mx-auto p-8 bg-gold-light/25 border border-gold-light/25 ">
          <SectionHeading eyebrow="Est. &middot; By Charter" title={`About the ${club.name}`} />
          <Reveal scale={0.98}>
            <div className=" ">
              <div className="flex flex-col md:flex-row divide-y gap-6 ">
                {blocks.map((block) => (
                  <div
                    key={block.label}
                    className="border border-gold-light/50 bg-ivory rounded-xl shadow-sm flex-1 py-10 md:py-12 px-2 md:px-8 text-center flex flex-col items-center"
                  >
                    <span className="eyebrow mb-4">{block.label}</span>
                    <p className="text-sm leading-relaxed text-ink/70 font-sans max-w-[220px]">
                      {block.copy}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* What We Offer - 6 Card Grid, 2 rows x 3 cols for large screens */}
      <section className="bg-beige py-20 md:py-24">
        <div className="max-w-7xl mx-auto p-8 bg-gold-light/25 border border-gold-light/25 ">
          <SectionHeading
            eyebrow="The Offering"
            title="What Do We Offer?"
            subtitle={club.whatWeOffer.purpose}
          />

          {/* 1 col (mobile), 2 cols (md), 3 cols 2 rows (lg+) */}
          <div
            className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            gap-6
            mt-8
          "
          >
            {/* Purpose card */}
            <Reveal scale={0.98}>
              <div className="bg-white h-full px-6 py-8 rounded-xl flex flex-col items-center text-center">
                <Gem size={28} className="mb-5 text-gold-dark" />
                <h3 className="font-serif text-xl text-ink mb-4">Purpose</h3>
                <p className="text-base font-sans text-ink/80 leading-relaxed">
                  {club.whatWeOffer.purpose}
                </p>
              </div>
            </Reveal>
            {/* Features card */}
            <Reveal delay={0.06} scale={0.98}>
              <div className="bg-white h-full px-6 py-8 rounded-xl flex flex-col items-center text-center">
                <Globe size={28} className="mb-5 text-gold-dark" />
                <h3 className="font-serif text-xl text-ink mb-4">Features</h3>
                <ul className="space-y-3 w-full text-left mx-auto max-w-xs">
                  {club.whatWeOffer.features.map((feature: string) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-1 diamond shrink-0" />
                      <span className="font-sans text-[15px] leading-snug text-ink/85">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            {/* Benefits card */}
            <Reveal delay={0.12} scale={0.98}>
              <div className="bg-white h-full px-6 py-8 rounded-xl flex flex-col items-center text-center">
                <CheckCircle2 size={28} className="mb-5 text-gold-dark" />
                <h3 className="font-serif text-xl text-ink mb-4">Benefits</h3>
                <ul className="space-y-3 w-full text-left mx-auto max-w-xs">
                  {club.whatWeOffer.benefits.map((benefit: string) => (
                    <li key={benefit} className="flex items-start gap-2">
                      <CheckCircle2
                        size={16}
                        strokeWidth={1.5}
                        className="text-gold-dark mt-0.5 shrink-0"
                      />
                      <span className="font-sans text-[15px] leading-snug text-ink/85">
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            {/* Opportunities card */}
            <Reveal delay={0.18} scale={0.98}>
              <div className="bg-white h-full px-6 py-8 rounded-xl flex flex-col items-center text-center">
                <Users size={28} className="mb-5 text-gold-dark" />
                <h3 className="font-serif text-xl text-ink mb-4">Opportunities</h3>
                <ul className="space-y-3 w-full text-left mx-auto max-w-xs">
                  {opportunities.map((opportunity: string) => (
                    <li key={opportunity} className="flex items-start gap-2">
                      <span className="mt-2 shrink-0 text-gold-dark">&#8226;</span>
                      <span className="font-sans text-[15px] leading-snug text-ink/85">
                        {opportunity}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            {/* Privileges card */}
            <Reveal delay={0.24} scale={0.98}>
              <div className="bg-white h-full px-6 py-8 rounded-xl flex flex-col items-center text-center">
                <Star size={28} className="mb-5 text-gold-dark" />
                <h3 className="font-serif text-xl text-ink mb-4">Privileges</h3>
                <ul className="space-y-3 w-full text-left mx-auto max-w-xs">
                  {privileges.map((privilege: string) => (
                    <li key={privilege} className="flex items-start gap-2">
                      <Star size={16} className="text-gold-dark mt-1.5 shrink-0" />
                      <span className="font-sans text-[15px] leading-snug text-ink/85">
                        {privilege}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            {/* Philosophy card */}
            <Reveal delay={0.3} scale={0.98}>
              <div className="bg-white h-full px-6 py-8 rounded-xl flex flex-col items-center text-center">
                <Feather size={28} className="mb-5 text-gold-dark" />
                <h3 className="font-serif text-xl text-ink mb-4">Philosophy</h3>
                <ul className="space-y-3 w-full text-left mx-auto max-w-xs">
                  {philosophy.map((item: string) => (
                    <li key={item} className="flex items-start gap-2">
                      <Feather size={15} className="text-gold-dark mt-1.5 shrink-0" />
                      <span className="font-sans text-[15px] leading-snug text-ink/85">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Membership Open Now / Closed */}
      <section id="membership" className="bg-beige py-20 md:py-24">
      <div className="max-w-7xl mx-auto p-8 bg-gold-light/25 border border-gold-light/25 ">
          <Reveal scale={0.98}>
            <div className="border border-gold-light/50 rounded-xl shadow-sm bg-ivory px-8 py-14 md:px-16 text-center flex flex-col items-center">
              {club.membershipOpen ? (
                <>
                  <p className="eyebrow">Membership Open Now</p>
                  <h2 className="font-serif text-3xl md:text-4xl text-ink mt-3">
                    Join {club.name}
                  </h2>
                  <HairlineDivider width="56px" className="mt-6 mb-6" />
                  <p className="font-sans text-sm text-ink/60">
                    Membership fee:{' '}
                    <span className="text-gold-dark font-medium">
                      {club.membershipFee.currency} {club.membershipFee.amount.toLocaleString('en-IN')}
                    </span>
                  </p>
                  <Link
                    href={`/clubs/${club.slug}/join`}
                    className="mt-8 inline-flex items-center gap-3 border border-gold px-9 py-3.5 font-sans text-[13px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-500"
                  >
                    Join
                  </Link>
                </>
              ) : (
                <>
                  <LockKeyhole size={28} strokeWidth={1.25} className="text-gold-dark mb-4" />
                  <p className="eyebrow">Membership Closed</p>
                  <h2 className="font-serif text-2xl md:text-3xl text-ink mt-3">
                    This circle is not currently accepting applications
                  </h2>
                  <p className="mt-4 font-sans text-sm text-ink/60 max-w-md">
                    Admissions to {club.name} reopen periodically to preserve the
                    intimacy of the circle. Please check back, or enquire to be
                    notified.
                  </p>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
