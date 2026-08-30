import SectionHeading from './ui/SectionHeading';
import Reveal from './ui/Reveal';

// Icon suggestion (optionally use distinct icons for variation)
import { Music, Megaphone, Users, DollarSign, Handshake, Store } from 'lucide-react';

const items = [
  { title: 'Invitations: Music Concerts', icon: Music },
  { title: 'Events: Branding — Launches, Promotions, Campaigns & Surveys', icon: Megaphone },
  { title: 'Conferences and Forums', icon: Users },
  { title: 'Investors Meets', icon: DollarSign },
  { title: 'Partners Meets', icon: Handshake },
  { title: 'Franchisee Meets', icon: Store },
];

export default function EventsEntertainment() {
  return (
    <section className="bg-beige py-12 md:py-12">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          eyebrow="Varun Rai Kochhar Initiative"
          title="Events & Entertainment"
          subtitle="A rotating calendar of gatherings, arranged for members and the enterprises they represent."
        />

        <Reveal scale={0.98}>
          <div className="border border-gold-light/50 bg-gold-light/25 px-6 py-6  ">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7 justify-center items-stretch">
              {items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex flex-col items-center justify-between h-full bg-ivory border border-gold-light/40 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 px-7 py-10 mb-2 relative group"
                    style={{
                      minHeight: 260,
                      maxWidth: 380,
                      width: '100%',
                    }}
                  >
                    <div className="mb-4 flex flex-col items-center flex-1">
                      {/* Icon in circle */}
                      <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gold-light/20 mb-5 shadow">
                        <Icon className="w-7 h-7 text-gold-dark" />
                      </div>
                      <h3 className="font-serif text-lg text-ink mb-2 text-center">{item.title}</h3>
                    </div>
                    <div className="w-10 h-px bg-gold-light mt-4 mb-1" />
                    {/* Two buttons side by side below (inside each card): */}
                    <div className="flex flex-row gap-3 mt-4">
                      <button
                        className="inline-flex items-center justify-center border border-gold px-6 py-2 rounded-md font-sans text-xs uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-300"
                        type="button"
                      >
Register
                      </button>
                      <button
                        className="inline-flex items-center justify-center border border-gold px-6 py-2 rounded-md font-sans text-xs uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-300"
                        type="button"
                      >
Participate
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
