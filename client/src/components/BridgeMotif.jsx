// The recurring visual signature of the product: a signing hand on the left
// resolving into a spoken-word waveform on the right, joined by a single
// continuous line. Used large on the landing hero, and small elsewhere
// (e.g. between the two video tiles on a call) to echo the same idea.
export default function BridgeMotif({ className = "" }) {
  return (
    <svg
      viewBox="0 0 600 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="A hand shape connected by a line to a soundwave, representing sign translated to voice"
    >
      {/* Hand outline (simplified open palm) */}
      <g stroke="var(--color-cobalt)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M70 130 L70 70 Q70 60 78 60 Q86 60 86 70 L86 100" />
        <path d="M86 100 L86 50 Q86 40 94 40 Q102 40 102 50 L102 100" />
        <path d="M102 100 L102 45 Q102 35 110 35 Q118 35 118 45 L118 100" />
        <path d="M118 100 L118 55 Q118 46 126 46 Q134 46 134 55 L134 105" />
        <path d="M70 108 Q50 108 50 128 Q50 148 78 148 L118 148 Q140 148 140 126 L140 105" />
      </g>

      {/* Connecting line */}
      <line x1="150" y1="100" x2="430" y2="100" stroke="var(--color-line)" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" />
      <circle cx="290" cy="100" r="4" fill="var(--color-amber)" />

      {/* Soundwave */}
      <g stroke="var(--color-amber)" strokeWidth="4" strokeLinecap="round">
        <line x1="440" y1="90" x2="440" y2="110" />
        <line x1="455" y1="75" x2="455" y2="125" />
        <line x1="470" y1="55" x2="470" y2="145" />
        <line x1="485" y1="70" x2="485" y2="130" />
        <line x1="500" y1="85" x2="500" y2="115" />
        <line x1="515" y1="60" x2="515" y2="140" />
        <line x1="530" y1="80" x2="530" y2="120" />
      </g>
    </svg>
  );
}
