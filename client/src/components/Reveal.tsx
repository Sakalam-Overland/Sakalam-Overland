import type { ElementType, ReactNode } from 'react';

/** Marks a block to ease in on first scroll. The page-level useAutoReveal does the work. */
export function Reveal({
  as: Tag = 'div',
  delay = 0,
  className = '',
  children,
}: {
  as?: ElementType;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag data-reveal="" style={delay ? { transitionDelay: `${delay}ms` } : undefined} className={className}>
      {children}
    </Tag>
  );
}

/** Section heading with a trail-marker eyebrow and an optional Tagalog gloss. */
export function SectionHead({
  eyebrow,
  title,
  tagalog,
  children,
  dark = false,
  className = '',
}: {
  eyebrow: string;
  title: ReactNode;
  tagalog?: string;
  children?: ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <Reveal className={`max-w-3xl ${className}`}>
      <p className={`eyebrow flex items-center gap-3 ${dark ? 'text-dahon-300' : 'text-heading'}`}>
        <span className={`h-px w-8 ${dark ? 'bg-dahon' : 'bg-heading'}`} />
        {eyebrow}
        {tagalog && <span className={`normal-case tracking-normal italic ${dark ? 'text-abo' : 'text-ink-muted'}`}>· {tagalog}</span>}
      </p>
      <h2 className={`mt-3 text-[1.85rem] leading-[1.05] font-bold tracking-tight sm:text-4xl md:mt-3 md:text-5xl ${dark ? 'text-puti' : 'text-heading'}`}>{title}</h2>
      {children && <div className={`mt-3 text-base leading-relaxed font-light md:mt-4 md:text-lg ${dark ? 'text-puti/75' : 'text-ink/80'}`}>{children}</div>}
    </Reveal>
  );
}
