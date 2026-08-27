'use client';

import { motion } from 'framer-motion';
import SectionHeading from './ui/SectionHeading';

const steps = [
  { n: '01', label: 'Membership Form' },
  { n: '02', label: 'Contract Agreement' },
  { n: '03', label: 'Membership Fee' },
  { n: '04', label: 'Payment Gateway' },
  { n: '05', label: 'Receipt' },
];

export default function PathToMembership() {
  return (
    <section className="bg-white py-24 md:py-28">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeading
          eyebrow="Admissions"
          title="The Path to Membership"
          subtitle="A deliberate process, unchanged since the Club\u2019s founding, ensuring every member is admitted with the same measure of care."
        />

        {/* Desktop: straight horizontal ledger */}
        <div className="hidden md:block relative">
          <div className="absolute left-0 right-0 top-6 h-px bg-gold-light/30" />
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.22, 0.61, 0.36, 1] }}
            style={{ transformOrigin: 'left' }}
            className="absolute left-0 right-0 top-6 h-px bg-gold-light"
          />
          <div className="relative grid grid-cols-5">
            {steps.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.8, delay: i * 0.18, ease: [0.22, 0.61, 0.36, 1] }}
                className="flex flex-col items-center text-center px-3"
              >
                <span className="w-12 h-12 rounded-full border border-gold bg-ivory flex items-center justify-center font-serif text-lg text-gold-dark">
                  {step.n}
                </span>
                <span className="mt-5 font-sans text-[13px] tracking-wide uppercase text-ink/80">
                  {step.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile: vertical ledger */}
        <div className="md:hidden relative pl-6">
          <div className="absolute left-[23px] top-2 bottom-2 w-px bg-gold-light/30" />
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.22, 0.61, 0.36, 1] }}
            style={{ transformOrigin: 'top' }}
            className="absolute left-[23px] top-2 bottom-2 w-px bg-gold-light"
          />
          <div className="flex flex-col gap-10">
            {steps.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
                className="relative flex items-center gap-5"
              >
                <span className="w-11 h-11 rounded-full border border-gold bg-ivory flex items-center justify-center font-serif text-base text-gold-dark shrink-0">
                  {step.n}
                </span>
                <span className="font-sans text-[13px] tracking-wide uppercase text-ink/80">
                  {step.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
