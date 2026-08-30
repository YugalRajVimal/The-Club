import Reveal from './Reveal';
import HairlineDivider from './HairlineDivider';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export default function SectionHeading({ eyebrow, title, subtitle }: SectionHeadingProps) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-3">
      <Reveal>
        
        <h2 className="section-heading">{title}</h2>
        <p className="eyebrow mb-2 mt-4">{eyebrow}</p>
        <HairlineDivider width="64px" className="mt-2" />
        {subtitle && (
          <p className="mt-5 text-[15px] leading-relaxed text-ink/70">{subtitle}</p>
        )}
      </Reveal>
    </div>
  );
}
