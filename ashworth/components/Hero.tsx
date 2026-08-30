'use client';

import { motion } from 'framer-motion';
import Monogram from './ui/Monogram';
import HairlineDivider from './ui/HairlineDivider';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gold-light/25 border border-gold-light/25">
      {/* soft sepia-toned ambient background, built purely in CSS */}
      {/* <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 8%, rgba(198,168,92,0.14), transparent 60%), radial-gradient(ellipse 70% 60% at 50% 100%, rgba(227,213,184,0.4), transparent 65%)',
        }}
      /> */}
      {/* <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 border-x border-gold-light/0 md:border-gold-light/20 max-w-6xl mx-auto"
      /> */}

      <div className="relative max-w-3xl mx-auto px-6 pt-28 pb-24 md:pt-36 md:pb-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <Monogram size={92} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="eyebrow mt-4"
        >
    By Invitation
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.55 }}
          className="mt-4 w-full"
        >
          <HairlineDivider width="88px" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
          className="font-serif text-[2.75rem] leading-[1.1] md:text-6xl md:leading-[1.08] text-ink mt-6"
        >
          VRK Group
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.95 }}
          className="mt-6 w-full"
        >
          <HairlineDivider width="88px" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.05 }}
          className="mt-8 text-base md:text-lg text-ink/70 max-w-xl leading-relaxed font-sans"
        >
          A private society for those who prize discretion, provenance and good
          company &mdash; extending curated privilege across residences, travel,
          enterprise and the arts.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.25 }}
          className="mt-12"
        >
          <a
            href="#membership"
            className="inline-flex items-center gap-3 border border-gold px-9 py-3.5 font-sans text-[13px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-500"
          >
            Enquire About Group Of Companies
          </a>
        </motion.div>
      </div>
    </section>
  );
}
