import { TrendingUp, Handshake, Building2, Award, Star } from 'lucide-react';
import SectionHeading from './ui/SectionHeading';
import IconFrame from './ui/IconFrame';
import Reveal from './ui/Reveal';

const items = [
  {
    icon: TrendingUp,
    title: 'Investors Connect',
    line: 'Introductions to capital partners aligned with member ventures.',
  },
  {
    icon: Handshake,
    title: 'Partners Connect',
    line: 'Formal channels for strategic alliance between member enterprises.',
  },
  {
    icon: Building2,
    title: 'Franchise Connect',
    line: 'Vetted expansion opportunities under established member brands.',
  },
  {
    icon: Award,
    title: 'Brand Partnership',
    line: 'Curated collaborations between member houses and the Society.',
  },
  {
    icon: Star,
    title: 'Sponsors Connect',
    line: 'Patronage arrangements for the Society\u2019s events and circles.',
  },
];

export default function Collaborations() {
  return (
    <section className="bg-beige py-24 md:py-28">
      <div className="max-w-3xl mx-auto px-6">
        <SectionHeading eyebrow="In Confidence" title="Collaborations & Partnerships" />

        <div className="border-t border-gold-light/40">
          {items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08} y={10}>
              <div className="flex items-center gap-6 py-6 border-b border-gold-light/40">
                <IconFrame icon={item.icon} size="sm" />
                <div className="text-left">
                  <h3 className="font-serif text-lg text-ink">{item.title}</h3>
                  <p className="text-sm text-ink/60 font-sans mt-0.5">{item.line}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
