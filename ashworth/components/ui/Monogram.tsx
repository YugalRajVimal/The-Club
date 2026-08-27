'use client';

import { useId } from 'react';

interface MonogramProps {
  size?: number;
  animated?: boolean;
  className?: string;
}

/**
 * A pure-SVG, abstract geometric crest: a compass-ringed emblem with a
 * central diamond, standing in for a heritage monogram without spelling
 * out any initials. The outer ring rotates almost imperceptibly and the
 * diamond has a slow gold shimmer.
 */
export default function Monogram({
  size = 88,
  animated = true,
  className = '',
}: MonogramProps) {
  const uid = useId().replace(/[:]/g, '');
  const gradId = `mono-grad-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8C6D2F" />
          <stop offset="50%" stopColor="#C6A85C" />
          <stop offset="100%" stopColor="#A6812F" />
        </linearGradient>
      </defs>

      <g className={animated ? 'animate-slow-rotate' : ''} style={{ transformOrigin: '60px 60px' }}>
        <circle cx="60" cy="60" r="52" stroke="#A6812F" strokeWidth="0.75" />
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i * 360) / 16;
          const isCardinal = i % 4 === 0;
          const outerR = 52;
          const innerR = isCardinal ? 45 : 48.5;
          const rad = (angle * Math.PI) / 180;
          const x1 = 60 + outerR * Math.cos(rad);
          const y1 = 60 + outerR * Math.sin(rad);
          const x2 = 60 + innerR * Math.cos(rad);
          const y2 = 60 + innerR * Math.sin(rad);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#C6A85C"
              strokeWidth="0.75"
            />
          );
        })}
      </g>

      <circle cx="60" cy="60" r="40" stroke="#C6A85C" strokeWidth="0.5" />

      <g className={animated ? 'animate-shimmer' : ''}>
        <rect
          x="42"
          y="42"
          width="36"
          height="36"
          transform="rotate(45 60 60)"
          stroke={`url(#${gradId})`}
          strokeWidth="1"
        />
        <rect
          x="50"
          y="50"
          width="20"
          height="20"
          transform="rotate(45 60 60)"
          stroke="#8C6D2F"
          strokeWidth="0.6"
        />
      </g>

      <circle cx="60" cy="60" r="2.2" fill="#A6812F" />

      <line x1="60" y1="14" x2="60" y2="24" stroke="#A6812F" strokeWidth="0.75" />
      <line x1="60" y1="96" x2="60" y2="106" stroke="#A6812F" strokeWidth="0.75" />
      <line x1="14" y1="60" x2="24" y2="60" stroke="#A6812F" strokeWidth="0.75" />
      <line x1="96" y1="60" x2="106" y2="60" stroke="#A6812F" strokeWidth="0.75" />
    </svg>
  );
}
