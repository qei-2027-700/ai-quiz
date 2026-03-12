import type { CSSProperties } from "react";

interface Props {
  sizePx?: number;
  className?: string;
  style?: CSSProperties;
}

export function MascotShortHair({ sizePx = 180, className, style }: Props) {
  return (
    <div
      className={className}
      style={{
        width: sizePx,
        height: sizePx,
        ...style,
      }}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        width="100%"
        height="100%"
        shapeRendering="crispEdges"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outline */}
        {/* #0b0b0d */}
        {/* Hair */}
        {/* #2f5a72 */}
        {/* Hair shadow */}
        {/* #24485c */}
        {/* Skin */}
        {/* #e2d8d0 */}
        {/* Skin shadow */}
        {/* #cfc1b6 */}
        {/* Shirt */}
        {/* #f4f5f6 */}
        {/* Shirt shadow */}
        {/* #d8dde2 */}
        {/* Strap */}
        {/* #1f2a44 */}
        {/* Eye */}
        {/* #0b0b0d */}

        {/* Hair silhouette (side-swept bob) */}
        <rect x="7" y="2" width="10" height="1" fill="#2f5a72" />
        <rect x="5" y="3" width="14" height="1" fill="#2f5a72" />
        <rect x="4" y="4" width="16" height="1" fill="#2f5a72" />
        <rect x="3" y="5" width="18" height="1" fill="#2f5a72" />
        <rect x="3" y="6" width="18" height="1" fill="#2f5a72" />
        <rect x="3" y="7" width="5" height="5" fill="#2f5a72" />
        <rect x="16" y="7" width="5" height="6" fill="#2f5a72" />
        <rect x="4" y="12" width="3" height="2" fill="#2f5a72" />
        <rect x="17" y="13" width="3" height="2" fill="#2f5a72" />

        {/* hair shadow / texture */}
        <rect x="6" y="6" width="12" height="1" fill="#24485c" fillOpacity="0.55" />
        <rect x="6" y="7" width="4" height="1" fill="#24485c" fillOpacity="0.55" />
        <rect x="14" y="7" width="4" height="1" fill="#24485c" fillOpacity="0.55" />
        <rect x="17" y="9" width="3" height="1" fill="#24485c" fillOpacity="0.55" />
        <rect x="4" y="9" width="3" height="1" fill="#24485c" fillOpacity="0.55" />

        {/* Face */}
        <rect x="7" y="7" width="10" height="9" fill="#e2d8d0" />
        <rect x="6" y="8" width="1" height="7" fill="#e2d8d0" />
        <rect x="17" y="8" width="1" height="7" fill="#e2d8d0" />
        <rect x="7" y="15" width="10" height="1" fill="#cfc1b6" fillOpacity="0.8" />

        {/* Ear */}
        <rect x="6" y="10" width="1" height="3" fill="#e2d8d0" />
        <rect x="17" y="10" width="1" height="3" fill="#e2d8d0" />
        <rect x="6" y="11" width="1" height="1" fill="#cfc1b6" fillOpacity="0.55" />
        <rect x="17" y="11" width="1" height="1" fill="#cfc1b6" fillOpacity="0.55" />

        {/* Fringe (diagonal sweep) */}
        <rect x="7" y="7" width="10" height="1" fill="#2f5a72" />
        <rect x="8" y="8" width="8" height="1" fill="#2f5a72" />
        <rect x="9" y="9" width="6" height="1" fill="#2f5a72" />
        <rect x="10" y="10" width="4" height="1" fill="#2f5a72" />
        <rect x="14" y="8" width="2" height="4" fill="#2f5a72" />

        {/* fringe shadow lines */}
        <rect x="9" y="8" width="3" height="1" fill="#24485c" fillOpacity="0.6" />
        <rect x="12" y="9" width="3" height="1" fill="#24485c" fillOpacity="0.6" />
        <rect x="11" y="10" width="2" height="1" fill="#24485c" fillOpacity="0.6" />
        <rect x="15" y="10" width="1" height="2" fill="#24485c" fillOpacity="0.6" />

        {/* Eyes (soft) */}
        <rect x="9" y="11" width="2" height="2" fill="#0b0b0d" />
        <rect x="13" y="11" width="2" height="2" fill="#0b0b0d" />
        <rect x="9" y="11" width="1" height="1" fill="#f4f5f6" fillOpacity="0.7" />
        <rect x="14" y="11" width="1" height="1" fill="#f4f5f6" fillOpacity="0.7" />
        <rect x="10" y="12" width="1" height="1" fill="#2f5a72" fillOpacity="0.35" />
        <rect x="13" y="12" width="1" height="1" fill="#2f5a72" fillOpacity="0.35" />

        {/* Nose + smile */}
        <rect x="12" y="13" width="1" height="1" fill="#0b0b0d" fillOpacity="0.18" />
        {/* smile curve */}
        <rect x="11" y="14" width="1" height="1" fill="#0b0b0d" fillOpacity="0.32" />
        <rect x="13" y="14" width="1" height="1" fill="#0b0b0d" fillOpacity="0.32" />
        <rect x="12" y="15" width="1" height="1" fill="#0b0b0d" fillOpacity="0.28" />
        <rect x="12" y="15" width="1" height="1" fill="#a46a52" fillOpacity="0.32" />

        {/* Neck */}
        <rect x="10" y="16" width="4" height="2" fill="#e2d8d0" />
        <rect x="10" y="17" width="4" height="1" fill="#cfc1b6" fillOpacity="0.55" />

        {/* Shirt */}
        <rect x="7" y="18" width="10" height="5" fill="#f4f5f6" />
        <rect x="7" y="18" width="10" height="1" fill="#d8dde2" fillOpacity="0.85" />
        <rect x="9" y="19" width="6" height="1" fill="#ffffff" fillOpacity="0.12" />
        <rect x="11" y="18" width="2" height="5" fill="#d8dde2" fillOpacity="0.45" />

        {/* Collar / tie hint */}
        <rect x="10" y="18" width="1" height="2" fill="#0b0b0d" fillOpacity="0.18" />
        <rect x="13" y="18" width="1" height="2" fill="#0b0b0d" fillOpacity="0.18" />
        <rect x="11" y="20" width="2" height="1" fill="#2f5a72" fillOpacity="0.35" />

        {/* Backpack strap + shoulder */}
        <rect x="6" y="18" width="1" height="5" fill="#1f2a44" />
        <rect x="17" y="18" width="1" height="5" fill="#1f2a44" />
        <rect x="5" y="19" width="2" height="3" fill="#1f2a44" fillOpacity="0.85" />

        {/* Outline accents */}
        <rect x="7" y="7" width="10" height="1" fill="#0b0b0d" fillOpacity="0.25" />
        <rect x="6" y="8" width="1" height="7" fill="#0b0b0d" fillOpacity="0.2" />
        <rect x="17" y="8" width="1" height="7" fill="#0b0b0d" fillOpacity="0.2" />
      </svg>
    </div>
  );
}
