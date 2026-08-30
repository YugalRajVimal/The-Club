import { TrendingUp, Handshake, Building2, Award, Star, Cpu } from 'lucide-react';
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
  // New Technology Partnership card before Brand Partnership
  {
    icon: Cpu,
    title: 'Technology Partnership',
    line: 'Collaborations on innovative tech solutions and digital transformation initiatives.',
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
    <section className="bg-beige py-12 md:py-12">
       <div className="max-w-7xl  mx-auto px-6 bg-gold-light/25 border border-gold-light/25 py-16">
        <SectionHeading eyebrow="Varun Rai Kochhar Initiative" title="Collaborations & Partnerships" />

        <div className="flex flex-wrap gap-6 mt-5 justify-center items-stretch">
          {items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08} y={10}>
              <div
                className="flex flex-col items-center text-center bg-ivory border border-gold-light/40 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 px-7 py-10 flex-1"
                style={{ flex: '1 1 275px', minWidth: 260, maxWidth: 340, height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}
              >
                <div className="mb-5">
                  <IconFrame icon={item.icon} size="lg" />
                </div>
                <h3 className="font-serif text-xl text-ink mb-2">{item.title}</h3>
                <p className="text-sm text-ink/70 font-sans">{item.line}</p>
                {/* Justify end with a flex spacer for matching height, if needed */}
                <div className="flex-1" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
