import { Landmark, Car, Plane, Palmtree, Rocket, ClipboardList, Video, Globe, TrendingUp } from 'lucide-react';
import SectionHeading from './ui/SectionHeading';
import IconFrame from './ui/IconFrame';
import Reveal from './ui/Reveal';
import HairlineDivider from './ui/HairlineDivider';

const categories = [
  { icon: Landmark, name: 'Real Estate' },
  { icon: Car, name: 'Luxury Cars' },
  { icon: Plane, name: 'Luxury Business Travel' },
  { icon: Palmtree, name: 'Luxury Holidays' },
];

const pills = ['Booking', 'Sell', 'Purchase', 'Buyback', 'Launch', 'Pre-Approved'];

const brandingItems = [
  { icon: Rocket, label: 'Launches & Promotions' },
  { icon: ClipboardList, label: 'Campaigns & Surveys' },
  { icon: Video, label: 'Videos, Reels & Display' },
  { icon: Globe, label: 'Website Development' },
  { icon: TrendingUp, label: 'Digital Marketing' },
];

export default function Marketplace() {
  return (
    <section className="bg-beige py-24 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          eyebrow="For Members"
          title="The Marketplace"
          subtitle="A private exchange for assets and experiences, transacted with the same discretion afforded every member relationship."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gold-light/25 border border-gold-light/25">
          {categories.map((cat, i) => (
            <Reveal key={cat.name} delay={i * 0.1} scale={0.97}>
              <div className="bg-ivory h-full px-6 py-10 flex flex-col items-center text-center gap-5">
                <IconFrame icon={cat.icon} />
                <h3 className="font-serif text-lg text-ink">{cat.name}</h3>
                <div className="flex flex-wrap justify-center gap-2 mt-1">
                  {pills.map((pill) => (
                    <span
                      key={pill}
                      className="text-[10px] tracking-wide uppercase font-sans text-gold-dark border border-gold-light/60 px-2.5 py-1"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-20">
          <Reveal scale={0.98}>
            <div className="border border-gold-light/50 bg-ivory px-6 py-12 md:px-14">
              <div className="text-center mb-10">
                <p className="eyebrow">In Support</p>
                <h3 className="font-serif text-2xl md:text-3xl text-ink mt-2">
                  Branding &middot; Media &middot; PR
                </h3>
                <HairlineDivider width="48px" className="mt-5" />
              </div>
              <div className="flex flex-wrap justify-center gap-x-12 gap-y-8">
                {brandingItems.map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-3 w-32 text-center">
                    <IconFrame icon={item.icon} size="sm" />
                    <span className="text-xs font-sans tracking-wide text-ink/70 leading-snug">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
