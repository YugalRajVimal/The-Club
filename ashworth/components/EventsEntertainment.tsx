import SectionHeading from './ui/SectionHeading';
import Reveal from './ui/Reveal';

// Icon suggestion (optionally use distinct icons for variation)
import { Music, Megaphone, Users, DollarSign, Handshake, Store } from 'lucide-react';

const items = [
  {
    title: 'Music Concerts',
    icon: Music,
    description:
      'Live musical performances and entertainment events for members to enjoy celebrated artists and emerging talent.',
  },
  {
    title: 'Events',
    icon: Megaphone,
    description:
      'Launches, Promotions, Campaigns & Surveys',
  },
  {
    title: 'Conferences and Forums',
    icon: Users,
    description:
      'Insightful gatherings featuring luminaries and thought leaders, fostering dialogue and networking on industry trends.',
  },
  {
    title: 'Investors Meets',
    icon: DollarSign,
    description:
      'Periodic meets connecting members with investors for interactive sessions, funding opportunities, and deal-making.',
  },
  {
    title: 'Partners Meets',
    icon: Handshake,
    description:
      'Collaborative sessions bringing together business partners to discuss partnerships, opportunities, and shared goals.',
  },
  {
    title: 'Franchisee Meets',
    icon: Store,
    description:
      'Dedicated forums for franchisees, offering advice, updates, and networking within the enterprise ecosystem.',
  },
];

export default function EventsEntertainment() {
  return (
    <section className="bg-beige py-8 md:py-8">
      <div className="max-w-7xl  mx-auto px-6 bg-gold-light/25 border border-gold-light/25 py-16">
        <SectionHeading
          eyebrow="Varun Rai Kochhar Initiative"
          title="Events & Entertainment"
          subtitle="A rotating calendar of gatherings, arranged for members and the enterprises they represent."
        />

        <Reveal scale={0.98}>
          <div className=" px-6 py-6  ">
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
                      <h3 className="font-serif text-xl tracking-wide uppercase text-ink mt-2">{item.title}</h3>
                      <p className="eyebrow mb-2 mt-4 text-center">{item.description}</p>
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
