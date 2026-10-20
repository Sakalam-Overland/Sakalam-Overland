/** Five-point star path, used for the flag's three stars in illustrations. */
export function starPath(cx: number, cy: number, r: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.42;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
}

/** The simplified Sakalam logo (sun, stars and mountains in a ring) on transparent. */
export function LogoMark({
  className = '',
  decorative = false,
  tone = 'white',
}: {
  className?: string;
  decorative?: boolean;
  tone?: 'white' | 'forest';
}) {
  return <img src={`/brand/mark-${tone}.png`} alt={decorative ? '' : 'Sakalam Overland'} className={className} draggable={false} />;
}
