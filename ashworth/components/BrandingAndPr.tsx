import { Landmark, Car, Plane, Palmtree, Rocket, ClipboardList, Video, Globe, TrendingUp, Ship } from 'lucide-react';
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
    icon: Palmtree,
    name: 'Luxury Holidays',
    description: 'Getaways, resorts, and curated experiences at premier destinations worldwide.'
  },
  {
    icon: Plane,
    name: 'Luxury Business Travel',
    description: 'Chartered flights, executive aviation, and bespoke travel for members and their guests.'
  },
  {
    icon: Car,
    name: 'Luxury Cars',
    description: 'Access to luxury and collectible vehicles—trade, purchase, or sell discreetly.'
  },
  {
    icon: Plane,
    name: 'Luxury Aviation',
    description: 'Private jets, charter flights, and luxury aviation services for rapid and exclusive international connections.'
  },
  {
    icon: Ship,
    name: 'Luxury Yachts',
    description: 'Access to private yachts, charters, and discreet purchase or sale for exclusive seafaring experiences.'
  },

];

const pills = ['Booking', 'Sell', 'Purchase', 'Buyback', 'Launch', 'Pre-Approved'];

const brandingItems = [
  { icon: Landmark, label: 'Brand Strategy', description: "End-to-end brand positioning, messaging, and identity building for businesses and individuals." },
  { icon: Rocket, label: 'Launches And Promotions', description: "Strategic support for new business launches, product introductions, and promotional campaigns to maximize reach and impact." },
  { icon: ClipboardList, label: 'Campaigns And Surveys', description: "Organizing marketing campaigns and gathering actionable insights through targeted surveys." },
  { icon: TrendingUp, label: 'Digital Marketing', description: "Digital marketing strategies encompassing SEO, social media, and online advertising for broad engagement." },
  { icon: Globe, label: 'Website Development', description: "Custom website design and development services for high-impact digital presence." },
  { icon: Video, label: 'Videos, Reels And Display', description: "Creation of video content, reels, and visuals to enhance brand visibility across digital and physical platforms." },
];

export default function BrandingAndPr() {
  return (
    <section className="bg-beige py-8 md:py-8">
      <div className="max-w-7xl  mx-auto px-6 bg-gold-light/25 border border-gold-light/25 py-16">
        <SectionHeading
          eyebrow="In Support"
          title="Branding &middot; Media &middot; PR"
        />
        <div className="px-6 py-6  ">
          <Reveal scale={0.98}>
            <div className="">
    
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-center">
                {brandingItems.map((item, i) => (
                  <div
                    key={item.label}
                    className="bg-white border border-gold-light/30 rounded-lg shadow-sm flex flex-col items-center text-center px-7 py-10 h-full"
                    style={{ minHeight: 240, margin: "0 auto" }}
                  >
                    <IconFrame icon={item.icon} size="md" />
                    <h4 className="font-serif text-lg text-ink mt-4 mb-1">{item.label}</h4>
                    <p className="text-sm text-ink/70 font-sans leading-snug">{item.description}</p>
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
