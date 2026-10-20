import { useId } from 'react';

const NAVY = '#1c2a5e';
const FONT = 'Montserrat, sans-serif';

/** Stamped lettering: a light edge above, a shadow below, then the ink. */
function Embossed({ children, ...props }: React.SVGProps<SVGTextElement>) {
  return (
    <g>
      <text {...props} fill="#000" opacity="0.28" transform="translate(1.6 2.4)">
        {children}
      </text>
      <text {...props} fill="#fff" opacity="0.9" transform="translate(-1 -1.2)">
        {children}
      </text>
      <text {...props} fill={NAVY}>
        {children}
      </text>
    </g>
  );
}

function Screw({ cx, cy, id }: { cx: number; cy: number; id: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy + 1.5} r="12" fill="#000" opacity="0.25" />
      <circle cx={cx} cy={cy} r="12" fill={`url(#${id}chrome)`} stroke="#7d827e" strokeWidth="1.2" />
      <path d={`M${cx - 6.5},${cy - 1.5} L${cx + 6.5},${cy + 1.5}`} stroke="#4d524e" strokeWidth="2.6" strokeLinecap="round" />
      <path d={`M${cx - 1.5},${cy - 6.5} L${cx + 1.5},${cy + 6.5}`} stroke="#4d524e" strokeWidth="2.6" strokeLinecap="round" />
    </g>
  );
}

/** A New York "Excelsior"-style vanity plate, redrawn. Purely illustrative. */
export function LicensePlate({ text = 'SAKALAM', className = '' }: { text?: string; className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 600 300" className={className} role="img" aria-label={`New York license plate reading ${text}`}>
      <defs>
        <linearGradient id={`${id}face`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#f4f5f1" />
          <stop offset="1" stopColor="#e6e8e2" />
        </linearGradient>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dfe8f5" stopOpacity="0" />
          <stop offset="1" stopColor="#c3d3ea" />
        </linearGradient>
        <linearGradient id={`${id}band`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ef9d35" />
          <stop offset="0.5" stopColor="#f6b81a" />
          <stop offset="1" stopColor="#ef9d35" />
        </linearGradient>
        {/* Reflective sheeting catches the light in a soft diagonal band */}
        <linearGradient id={`${id}sheen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0.25" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.42" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        {/* Pressed rim: lit along the top, shaded along the bottom */}
        <linearGradient id={`${id}rim`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#9aa0a6" />
        </linearGradient>
        <radialGradient id={`${id}chrome`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#c4c8c5" />
          <stop offset="1" stopColor="#8b918d" />
        </radialGradient>
        <filter id={`${id}grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
          <feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.12  0 0 0 0 0.1  0 0 0 0.35 0" />
        </filter>
        <clipPath id={`${id}clip`}>
          <rect x="4" y="4" width="592" height="292" rx="24" />
        </clipPath>
      </defs>

      <rect x="4" y="4" width="592" height="292" rx="24" fill={`url(#${id}face)`} />
      <g clipPath={`url(#${id}clip)`}>
        {/* Scenery: skyline and Liberty on the left, a lighthouse on the right */}
        <rect x="4" y="150" width="592" height="90" fill={`url(#${id}sky)`} opacity="0.6" />
        <path
          d="M4,238 L4,212 L30,212 L30,190 L46,190 L46,202 L70,202 L70,170 L78,160 L86,170 L86,198 L112,198 L112,176 L126,176 L126,150 L134,142 L142,150 L142,184 L168,184 L168,206 L196,206 L196,196 L220,196 L220,238Z"
          fill="#a9bedd"
          opacity="0.55"
        />
        <path d="M238,238 L240,206 L236,198 L242,192 L244,176 L247,170 L249,176 L250,192 L256,198 L252,206 L254,238Z" fill="#a9bedd" opacity="0.5" />
        <path d="M524,238 L530,176 L527,170 L533,160 L541,160 L547,170 L544,176 L550,238Z M520,168 L554,168" fill="#a9bedd" stroke="#a9bedd" strokeWidth="2" opacity="0.5" />
        <path d="M380,238 Q420,214 470,224 T596,216 L596,238Z" fill="#a9bedd" opacity="0.4" />
        <rect x="4" y="238" width="592" height="58" fill={`url(#${id}band)`} />
        <rect x="4" y="238" width="592" height="2" fill="#c97a1e" opacity="0.5" />
      </g>

      {/* Raised edge and border line */}
      <rect x="4" y="4" width="592" height="292" rx="24" fill="none" stroke={`url(#${id}rim)`} strokeWidth="6" />
      <rect x="14" y="14" width="572" height="272" rx="17" fill="none" stroke={NAVY} strokeWidth="3" />

      <Embossed x="300" y="70" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="40" letterSpacing="4">
        NEW YORK
      </Embossed>
      <Embossed x="300" y="202" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="122" textLength="470" lengthAdjust="spacingAndGlyphs">
        {text}
      </Embossed>
      <text x="300" y="277" textAnchor="middle" fill={NAVY} fontFamily={FONT} fontWeight="700" fontSize="24" letterSpacing="11">
        EXCELSIOR
      </text>

      <g clipPath={`url(#${id}clip)`}>
        <rect x="4" y="4" width="592" height="292" fill={`url(#${id}sheen)`} />
        <rect x="4" y="4" width="592" height="292" filter={`url(#${id}grain)`} opacity="0.18" />
      </g>

      <Screw cx={150} cy={36} id={id} />
      <Screw cx={450} cy={36} id={id} />
      <Screw cx={150} cy={264} id={id} />
      <Screw cx={450} cy={264} id={id} />
    </svg>
  );
}

/** The plate bolted to a beadlock spare. The tire turns slowly; the plate stays level on its mount. */
export function SpareTire({ className = '' }: { className?: string }) {
  const treads = Array.from({ length: 48 }, (_, i) => i * 7.5);
  const bolts = Array.from({ length: 24 }, (_, i) => i * 15);
  const windows = Array.from({ length: 8 }, (_, i) => i * 45 + 22.5);
  return (
    <div className={`relative ${className}`}>
      {/* The wheel is its own layer so the GPU rotates it; animating an SVG group repaints every frame. */}
      <svg
        viewBox="0 0 600 600"
        className="absolute inset-0 h-full w-full animate-[spin_40s_linear_infinite] will-change-transform motion-reduce:animate-none"
        aria-hidden
      >
        <g>
          <circle cx="300" cy="300" r="296" fill="#171918" />
          {treads.map((a) => (
            <g key={a} transform={`rotate(${a} 300 300)`}>
              <rect x="289" y="6" width="22" height="36" rx="4" fill="#262928" />
              <rect x="294" y="44" width="12" height="10" rx="2" fill="#1f2221" />
            </g>
          ))}
          <circle cx="300" cy="300" r="250" fill="#1c1e1d" />
          <circle cx="300" cy="300" r="250" fill="none" stroke="#2c2f2d" strokeWidth="3" />
          <circle cx="300" cy="300" r="214" fill="#3a3d3b" />
          <circle cx="300" cy="300" r="214" fill="none" stroke="#4d514e" strokeWidth="4" />
          {bolts.map((a) => (
            <g key={a} transform={`rotate(${a} 300 300)`}>
              <circle cx="300" cy="104" r="7.5" fill="#a3a9a4" />
              <circle cx="298.5" cy="102.5" r="2.5" fill="#d9ddd9" />
            </g>
          ))}
          <circle cx="300" cy="300" r="182" fill="#2e312f" />
          {windows.map((a) => (
            <rect key={a} x="276" y="150" width="48" height="74" rx="22" fill="#121413" transform={`rotate(${a} 300 300)`} />
          ))}
          <circle cx="300" cy="300" r="76" fill="#3a3d3b" stroke="#4d514e" strokeWidth="4" />
        </g>
      </svg>
      <svg viewBox="0 0 600 600" className="relative block h-auto w-full" aria-hidden>
        <defs>
          <radialGradient id="tire-shade" cx="0.4" cy="0.35" r="0.75">
            <stop offset="0.6" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.45" />
          </radialGradient>
        </defs>
        {/* Fixed lighting on top so the spin reads as rotation, not a spinning picture */}
        <circle cx="300" cy="300" r="296" fill="url(#tire-shade)" />
        {/* Mounting bracket behind the plate */}
        <rect x="262" y="250" width="76" height="100" rx="8" fill="#232625" />
      </svg>
      <div className="absolute top-1/2 left-1/2 w-[66%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_12px_20px_rgba(0,0,0,0.5)]">
        <LicensePlate />
      </div>
    </div>
  );
}
