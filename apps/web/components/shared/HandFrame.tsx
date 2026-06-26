/**
 * A hand-drawn, slightly wobbly rounded-rectangle border (Nook Riso notebook
 * look). Drop it inside a `position: relative` card as an absolutely-positioned
 * layer; it stretches to fill via `preserveAspectRatio="none"`. Inherits the
 * current text color, so set `color` on the wrapper to tint it.
 */
export function HandFrame({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 300 200"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M26 9 Q150 5 274 10 Q293 11 292 30 Q294 100 291 172 Q292 191 273 191 Q150 195 27 190 Q8 189 9 170 Q6 100 9 28 Q8 9 26 9 Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
