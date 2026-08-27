import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, LockKeyhole } from 'lucide-react';
import { ApiClientError, getClubBySlug } from '@/lib/api/client';
import HairlineDivider from '@/components/ui/HairlineDivider';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';

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

const infoBlocks = (club: Awaited<ReturnType<typeof loadClub>>) => [
  { label: 'Who We Are?', copy: club.whoWeAre },
  { label: 'What Is Unique About Us?', copy: club.whatIsUnique },
  { label: 'Who Should Join Us?', copy: club.whoShouldJoin },
  { label: 'How Do You Benefit?', copy: club.howYouBenefit },
];

export default async function ClubDetailPage({ params }: ClubDetailPageProps) {
  const club = await loadClub(params.slug);
  const blocks = infoBlocks(club);

  return (
    <main>
      {/* Header */}
      <section className="relative overflow-hidden bg-ivory">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: club.heroImageUrl
              ? `linear-gradient(rgba(253,252,249,0.88), rgba(253,252,249,0.96)), url(${club.heroImageUrl}) center/cover no-repeat`
              : 'radial-gradient(ellipse 60% 50% at 50% 8%, rgba(198,168,92,0.14), transparent 60%)',
          }}
        />
        <div className="relative max-w-3xl mx-auto px-6 pt-24 pb-16 md:pt-32 md:pb-20 flex flex-col items-center text-center">
          <p className="eyebrow">The Ashworth Club &middot; Est. by Charter</p>
          <HairlineDivider width="72px" className="mt-6" />
          <h1 className="font-serif text-[2.5rem] leading-[1.1] md:text-5xl text-ink mt-6">
            {club.name}
          </h1>
          <p className="mt-6 text-base md:text-lg text-ink/70 max-w-xl leading-relaxed font-sans">
            {club.tagline}
          </p>
        </div>
      </section>

      {/* Who / Why / How / Who-should */}
      <section className="bg-beige py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal scale={0.98}>
            <div className="border border-gold-light/50 bg-ivory px-6 py-4 md:px-10">
              <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gold-light/40">
                {blocks.map((block) => (
                  <div
                    key={block.label}
                    className="flex-1 py-10 md:py-12 px-2 md:px-8 text-center flex flex-col items-center"
                  >
                    <span className="eyebrow mb-4">{block.label}</span>
                    <p className="text-sm leading-relaxed text-ink/70 font-sans max-w-[240px]">
                      {block.copy}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* What We Offer */}
      <section className="bg-white py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <SectionHeading
            eyebrow="The Offering"
            title="What Do We Offer?"
            subtitle={club.whatWeOffer.purpose}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Reveal scale={0.98}>
              <div className="border border-gold-light/50 bg-beige h-full px-8 py-10">
                <h3 className="font-serif text-xl text-ink mb-6">Features</h3>
                <ul className="space-y-4">
                  {club.whatWeOffer.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="mt-1.5 diamond shrink-0" />
                      <span className="font-sans text-[15px] leading-snug text-ink/85">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.1} scale={0.98}>
              <div className="border border-gold-light/50 bg-beige h-full px-8 py-10">
                <h3 className="font-serif text-xl text-ink mb-6">Benefits</h3>
                <ul className="space-y-4">
                  {club.whatWeOffer.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <CheckCircle2
                        size={18}
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
          </div>
        </div>
      </section>

      {/* Membership Open Now / Closed */}
      <section className="bg-beige py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <Reveal scale={0.98}>
            <div className="border border-gold-light/50 bg-ivory px-8 py-14 md:px-16 text-center flex flex-col items-center">
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
