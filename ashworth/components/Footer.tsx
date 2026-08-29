// import Monogram from './ui/Monogram';
// import HairlineDivider from './ui/HairlineDivider';

// const links = ['Membership', 'About', 'Marketplace', 'Events', 'Partnerships', 'Enquire'];

// export default function Footer() {
//   return (
//     <footer className="bg-ivory border-t border-gold-light/40 pt-16 pb-10">
//       <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
//         <Monogram size={48} animated={false} />

//         <p className="mt-6 font-serif text-xl text-ink tracking-wide">The Ashworth Club</p>

//         <HairlineDivider width="56px" className="mt-6 mb-8" />

//         <nav aria-label="Footer">
//           <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
//             {links.map((link) => (
//               <li key={link}>
//                 <a
//                   href="#"
//                   className="font-sans text-[12px] tracking-widest2 uppercase text-ink/60 hover:text-gold-dark transition-colors duration-300"
//                 >
//                   {link}
//                 </a>
//               </li>
//             ))}
//           </ul>
//         </nav>

//         <p className="mt-10 font-sans text-[11px] tracking-wide text-ink/40">
//           &copy; {new Date().getFullYear()} The Ashworth Club. Membership by invitation and application only.
//         </p>
//       </div>
//     </footer>
//   );
// }


import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  ChevronUp,
} from 'lucide-react';
import Monogram from './ui/Monogram';

const QUICK_LINKS = [
  'About Us',
  'International Business Advantage',
  'Global Retained Search Company',
  'Management Services',
  'Coaching & Mentoring',
  'Internship Programs',
];

const MEMBERSHIP_LINKS = [
  'VRK Billionaires Club',
  'VRK Millionares Club',
  'VRK Global CXO Network Club',
  'Global Diversity Business Club',
  'Events & Entertainment',
];

const PARTNERSHIP_LINKS = [
  'Business Opportunities',
  'Franchise Partnership',
  'Collaborations & Tie Ups',
  'Luxury Marketplace',
  'Luxury Travel Holidays',
  'Luxury Real Estate',
];

const SOCIAL_ICONS = [Facebook, Instagram, Linkedin, Twitter, Youtube];

export default function Footer() {
  return (
    <footer className="bg-ink text-ivory relative">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-14 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Quick Links */}
        <div>
          <h3 className="font-sans text-sm tracking-widest2 uppercase font-semibold text-ivory">
            Quick Links
          </h3>
          <ul className="mt-6 space-y-3.5">
            {QUICK_LINKS.map((link) => (
              <li key={link}>
                <span className="font-sans text-[13px] tracking-wide uppercase text-ivory/80 hover:text-gold-light transition-colors cursor-pointer">
                  {link}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-center gap-2.5">
            {SOCIAL_ICONS.map((Icon, i) => (
              <button
                key={i}
                type="button"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-ivory/30 text-ivory/80 hover:text-gold-light hover:border-gold-light transition-colors"
              >
                <Icon size={14} strokeWidth={1.75} />
              </button>
            ))}
          </div>
        </div>

        {/* Membership */}
        <div>
          <h3 className="font-sans text-sm tracking-widest2 uppercase font-semibold text-ivory">
            Get Your Membership
          </h3>
          <ul className="mt-6 space-y-3.5">
            {MEMBERSHIP_LINKS.map((link) => (
              <li key={link}>
                <span className="font-sans text-[13px] tracking-wide uppercase text-ivory/80 hover:text-gold-light transition-colors cursor-pointer">
                  {link}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Partnership Opportunities */}
        <div>
          <h3 className="font-sans text-sm tracking-widest2 uppercase font-semibold text-ivory">
            Partnership Opportunities
          </h3>
          <ul className="mt-6 space-y-3.5">
            {PARTNERSHIP_LINKS.map((link) => (
              <li key={link}>
                <span className="font-sans text-[13px] tracking-wide uppercase text-ivory/80 hover:text-gold-light transition-colors cursor-pointer">
                  {link}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact form */}
        <div>
          <h3 className="font-sans text-sm tracking-widest2 uppercase font-semibold text-ivory">
            Contact Today
          </h3>

          <p className="mt-6 font-sans text-[13px] tracking-wide uppercase text-ivory/80">
            International Business Advantage
          </p>

          <p className="mt-4 font-sans text-[13px] text-ivory/70">Call us Today:</p>
          <p className="font-serif text-lg text-ivory">+91 88027-56666</p>
          <p className="font-serif text-lg text-ivory">+91 88027-06666</p>

          <p className="mt-4 font-sans text-[13px] text-ivory/80">
            <span className="font-semibold text-ivory">Email:</span> business@ibasearch.com
          </p>

          <form className="mt-6 space-y-3">
            <input
              type="text"
              placeholder="John Doe"
              className="w-full h-11 px-3.5 bg-ivory text-ink placeholder:text-ink/40 font-sans text-[13px] focus:outline-none"
            />
            <input
              type="email"
              placeholder="johndoe@email.com"
              className="w-full h-11 px-3.5 bg-ivory text-ink placeholder:text-ink/40 font-sans text-[13px] focus:outline-none"
            />
            <input
              type="tel"
              placeholder="+971 00-000-0000"
              className="w-full h-11 px-3.5 bg-ivory text-ink placeholder:text-ink/40 font-sans text-[13px] focus:outline-none"
            />
            <input
              type="text"
              placeholder="Company"
              className="w-full h-11 px-3.5 bg-ivory text-ink placeholder:text-ink/40 font-sans text-[13px] focus:outline-none"
            />
            <input
              type="text"
              placeholder="Country"
              className="w-full h-11 px-3.5 bg-ivory text-ink placeholder:text-ink/40 font-sans text-[13px] focus:outline-none"
            />
            <textarea
              placeholder="Type your Message here"
              rows={4}
              className="w-full px-3.5 py-3 bg-ivory text-ink placeholder:text-ink/40 font-sans text-[13px] focus:outline-none resize-y"
            />
            <button
              type="button"
              className="w-full h-12 bg-gold-dark text-ivory font-sans text-[12px] tracking-widest2 uppercase hover:bg-gold-light hover:text-ink transition-colors"
            >
              Submit
            </button>
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-gold-dark">
        <p className="text-center py-3 font-sans text-[12px] tracking-wide text-ivory">
          &copy; {new Date().getFullYear()} IBA Manpower Consulting Services, India. All Rights Reserved
        </p>
      </div>

      {/* Scroll to top */}
      <button
        type="button"
        className="absolute -top-6 right-6 w-12 h-12 rounded-full bg-gold-dark text-ivory flex items-center justify-center shadow-lg hover:bg-gold-light hover:text-ink transition-colors"
      >
        <ChevronUp size={20} strokeWidth={2} />
      </button>
    </footer>
  );
}