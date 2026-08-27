import SectionHeading from './ui/SectionHeading';
import Reveal from './ui/Reveal';

const blocks = [
  {
    label: 'Who we are?',
    copy: 'A private members\u2019 society founded on discretion, standing since our first charter, and sustained by a small circle of sponsors and members.',
  },
  {
    label: 'Why is it unique?',
    copy: 'Four distinct circles operate under one Society, each with its own admissions standard, yet every member draws on the privileges of all.',
  },
  {
    label: 'How do you benefit?',
    copy: 'Access to vetted real estate, travel, acquisitions and enterprise, arranged through a single point of introduction and account.',
  },
  {
    label: 'Who should join?',
    copy: 'Those who value privacy over publicity, and relationships built over years rather than transactions built for the moment.',
  },
];

export default function AboutClub() {
  return (
    <section className="bg-beige py-24 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading eyebrow="Est. &middot; By Charter" title="About the Club" />

        <Reveal scale={0.98}>
          <div className="border border-gold-light/50 bg-ivory px-6 py-4 md:px-10">
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gold-light/40">
              {blocks.map((block) => (
                <div
                  key={block.label}
                  className="flex-1 py-10 md:py-12 px-2 md:px-8 text-center flex flex-col items-center"
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
  );
}
