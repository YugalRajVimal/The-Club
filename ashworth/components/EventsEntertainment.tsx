import SectionHeading from './ui/SectionHeading';
import Reveal from './ui/Reveal';

const items = [
  { title: 'Invitations: Music Concerts' },
  { title: 'Events: Branding \u2014 Launches, Promotions, Campaigns & Surveys' },
  { title: 'Conferences and Forums' },
  { title: 'Investors Meets' },
  { title: 'Partners Meets' },
  { title: 'Franchisee Meets' },
  // Removed: { title: 'Brand Parties and Get-Togethers' },
];

export default function EventsEntertainment() {
  return (
    <section className="bg-white py-24 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          eyebrow="The Calendar"
          title="Events & Entertainment"
          subtitle="A rotating calendar of gatherings, arranged for members and the enterprises they represent."
        />

        <Reveal scale={0.98}>
          <div className="border border-gold-light/50 bg-beige px-6 py-10 md:px-14 md:py-14">
            <div className="flex flex-wrap gap-7 justify-center">
              {items.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center bg-ivory border border-gold-light/40 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 px-6 py-6 mb-2"
                  style={{
                    flex: '1 1 240px',
                    minWidth: 320,
                    maxWidth: 420,
                  }}
                >
                  <span className="mt-1 diamond shrink-0" />
                  <span className="font-sans text-[15px] leading-snug text-ink/85 ml-4">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
