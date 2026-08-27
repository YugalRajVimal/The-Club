import type { LucideIcon } from 'lucide-react';

interface IconFrameProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { box: 'w-10 h-10', icon: 16 },
  md: { box: 'w-16 h-16', icon: 22 },
  lg: { box: 'w-20 h-20', icon: 26 },
};

export default function IconFrame({ icon: Icon, size = 'md', className = '' }: IconFrameProps) {
  const s = sizeMap[size];
  return (
    <span
      className={`inline-flex items-center justify-center ${s.box} rounded-full border border-gold-light/70 bg-gradient-to-br from-[#FBF6E9] via-[#F3E9D2] to-[#E9DBB9] shrink-0 ${className}`}
    >
      <Icon size={s.icon} strokeWidth={1.25} className="text-gold-dark" />
    </span>
  );
}
