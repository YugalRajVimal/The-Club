'use client';

import { motion } from 'framer-motion';

interface HairlineDividerProps {
  width?: string;
  className?: string;
  withDiamond?: boolean;
}

export default function HairlineDivider({
  width = '120px',
  className = '',
  withDiamond = true,
}: HairlineDividerProps) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <motion.span
        initial={{ width: 0, opacity: 0 }}
        whileInView={{ width, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
        className="h-px bg-gold-light block"
      />
      {withDiamond && (
        <motion.span
          initial={{ opacity: 0, rotate: 0 }}
          whileInView={{ opacity: 1, rotate: 45 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="w-[6px] h-[6px] bg-gold shrink-0"
        />
      )}
      <motion.span
        initial={{ width: 0, opacity: 0 }}
        whileInView={{ width, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
        className="h-px bg-gold-light block"
      />
    </div>
  );
}
