import { Landmark, Car, Plane, Palmtree, Rocket, ClipboardList, Video, Globe, TrendingUp } from 'lucide-react';
import SectionHeading from './ui/SectionHeading';
import IconFrame from './ui/IconFrame';
import Reveal from './ui/Reveal';
import HairlineDivider from './ui/HairlineDivider';

const categories = [
  {
    icon: Landmark,
    name: 'Real Estate',
    description: 'Vetted property listings and exclusive introductions for purchase, sale, or investment.'
  },
  {
    icon: Car,
    name: 'Luxury Cars',
    description: 'Access to luxury and collectible vehicles—trade, purchase, or sell discreetly.'
  },
  {
    icon: Plane,
    name: 'Luxury Business Travel',
    description: 'Chartered flights, executive aviation, and bespoke travel for members and their guests.'
  },
  {
    icon: Palmtree,
    name: 'Luxury Holidays',
    description: 'Getaways, resorts, and curated experiences at premier destinations worldwide.'
  },
];

const pills = ['Booking', 'Sell', 'Purchase', 'Buyback', 'Launch', 'Pre-Approved'];

const brandingItems = [
  { icon: Rocket, label: 'Launches & Promotions', description: "Strategic support for new business launches, product introductions, and promotional campaigns to maximize reach and impact." },
  { icon: ClipboardList, label: 'Campaigns & Surveys', description: "Organizing marketing campaigns and gathering actionable insights through targeted surveys." },
  { icon: Video, label: 'Videos, Reels & Display', description: "Creation of video content, reels, and visuals to enhance brand visibility across digital and physical platforms." },
  { icon: Globe, label: 'Website Development', description: "Custom website design and development services for high-impact digital presence." },
  { icon: TrendingUp, label: 'Digital Marketing', description: "Digital marketing strategies encompassing SEO, social media, and online advertising for broad engagement." },
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

        {/* Added gap-8 for proper spacing between cards and removed bg/border from grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((cat, i) => (
            <Reveal key={cat.name} delay={i * 0.1} scale={0.97}>
              <div className="bg-ivory border border-gold-light/30 h-full px-6 py-10 flex flex-col items-center text-center gap-5 rounded-lg shadow-sm">
                <IconFrame icon={cat.icon} />
                <h3 className="font-serif text-lg text-ink">{cat.name}</h3>
                <p className="text-sm text-ink/70 font-sans mb-2 leading-snug">{cat.description}</p>
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
                  <div key={item.label} className="flex flex-col items-center gap-2 w-32 text-center">
                    <IconFrame icon={item.icon} size="sm" />
                    <span className="text-sm font-sans tracking-wide text-ink/70 leading-snug">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-ink/50 font-sans leading-snug mt-1">
                      {item.description}
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
