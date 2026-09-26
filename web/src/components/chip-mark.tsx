/** The chip glyph: an IC package seen from above. */
export function ChipMark({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect x="5.5" y="5.5" width="13" height="13" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8.5" cy="8.5" r="1" fill="currentColor" />
      {[8, 12, 16].map((p) => (
        <g key={p} stroke="currentColor" strokeWidth="1.6">
          <path d={`M${p} 2v3.5M${p} 18.5V22M2 ${p}h3.5M18.5 ${p}H22`} />
        </g>
      ))}
    </svg>
  );
}
