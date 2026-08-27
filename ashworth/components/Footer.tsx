import Monogram from './ui/Monogram';
import HairlineDivider from './ui/HairlineDivider';

const links = ['Membership', 'About', 'Marketplace', 'Events', 'Partnerships', 'Enquire'];

export default function Footer() {
  return (
    <footer className="bg-ivory border-t border-gold-light/40 pt-16 pb-10">
      <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
        <Monogram size={48} animated={false} />

        <p className="mt-6 font-serif text-xl text-ink tracking-wide">The Ashworth Club</p>

        <HairlineDivider width="56px" className="mt-6 mb-8" />

        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {links.map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="font-sans text-[12px] tracking-widest2 uppercase text-ink/60 hover:text-gold-dark transition-colors duration-300"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <p className="mt-10 font-sans text-[11px] tracking-wide text-ink/40">
          &copy; {new Date().getFullYear()} The Ashworth Club. Membership by invitation and application only.
        </p>
      </div>
    </footer>
  );
}
