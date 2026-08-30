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
    <footer className="bg-[#e5dbc7] text-black relative">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-14 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Quick Links */}
        <div>
          <h3 className="font-sans text-sm tracking-widest2 uppercase font-semibold text-black">
            Quick Links
          </h3>
          <ul className="mt-6 space-y-3.5">
            {QUICK_LINKS.map((link) => (
              <li key={link}>
                <span className="font-sans text-[13px] tracking-wide uppercase text-black/80 hover:text-gold-light transition-colors cursor-pointer">
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
                className="w-8 h-8 flex items-center justify-center rounded-full border border-black/30 text-black/80 hover:text-gold-light hover:border-gold-light transition-colors"
              >
                <Icon size={14} strokeWidth={1.75} />
              </button>
            ))}
          </div>
        </div>

        {/* Membership */}
        <div>
          <h3 className="font-sans text-sm tracking-widest2 uppercase font-semibold text-black">
            Get Your Membership
          </h3>
          <ul className="mt-6 space-y-3.5">
            {MEMBERSHIP_LINKS.map((link) => (
              <li key={link}>
                <span className="font-sans text-[13px] tracking-wide uppercase text-black/80 hover:text-gold-light transition-colors cursor-pointer">
                  {link}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Partnership Opportunities */}
        <div>
          <h3 className="font-sans text-sm tracking-widest2 uppercase font-semibold text-black">
            Partnership Opportunities
          </h3>
          <ul className="mt-6 space-y-3.5">
            {PARTNERSHIP_LINKS.map((link) => (
              <li key={link}>
                <span className="font-sans text-[13px] tracking-wide uppercase text-black/80 hover:text-gold-light transition-colors cursor-pointer">
                  {link}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact form */}
        <div>
          <h3 className="font-sans text-sm tracking-widest2 uppercase font-semibold text-black">
            Contact Today
          </h3>

          <p className="mt-6 font-sans text-[13px] tracking-wide uppercase text-black/80">
            International Business Advantage
          </p>

          <p className="mt-4 font-sans text-[13px] text-black/70">Call us Today:</p>
          <p className="font-serif text-lg text-black">+91 88027-56666</p>
          <p className="font-serif text-lg text-black">+91 88027-06666</p>

          <p className="mt-4 font-sans text-[13px] text-black/80">
            <span className="font-semibold text-black">Email:</span> business@ibasearch.com
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
        className="absolute -top-6 right-6 w-12 h-12 rounded-full bg-gold-dark text-ivory flex items-center justify-center shadow-lg hover:bg-gold-light hover:text-black transition-colors"
      >
        <ChevronUp size={20} strokeWidth={2} />
      </button>
    </footer>
  );
}