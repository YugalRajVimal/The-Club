import Reveal from './Reveal';
import HairlineDivider from './HairlineDivider';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export default function SectionHeading({ eyebrow, title, subtitle }: SectionHeadingProps) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-16">
      <Reveal>
        <p className="eyebrow mb-4">{eyebrow}</p>
        <h2 className="section-heading">{title}</h2>
        <HairlineDivider width="64px" className="mt-6" />
        {subtitle && (
          <p className="mt-6 text-[15px] leading-relaxed text-ink/70">{subtitle}</p>
        )}
      </Reveal>
    </div>
  );
}
