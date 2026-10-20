import type { ElementType, ReactNode } from 'react';
import { useReveal } from '../hooks/useReveal';

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
  const [ref, shown] = useReveal<HTMLElement>();
  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition duration-1000 ease-(--ease-trail) ${shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'} ${className}`}
    >
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
      <p className={`eyebrow flex items-center gap-3 ${dark ? 'text-dahon' : 'text-heading'}`}>
        <span className={`h-px w-8 ${dark ? 'bg-dahon' : 'bg-heading'}`} />
        {eyebrow}
        {tagalog && <span className={`normal-case tracking-normal italic ${dark ? 'text-abo' : 'text-ink-muted'}`}>· {tagalog}</span>}
      </p>
      <h2 className={`mt-4 text-4xl leading-[1.05] font-bold tracking-tight md:text-6xl ${dark ? 'text-puti' : 'text-heading'}`}>{title}</h2>
      {children && <div className={`lead mt-5 ${dark ? 'text-puti/75' : 'text-ink/80'}`}>{children}</div>}
    </Reveal>
  );
}
