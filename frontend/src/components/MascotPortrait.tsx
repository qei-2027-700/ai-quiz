import type { CSSProperties } from "react";

interface Props {
  sizePx?: number;
  className?: string;
  style?: CSSProperties;
}

export function MascotPortrait({ sizePx = 220, className, style }: Props) {
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
        viewBox="0 0 48 48"
        width="100%"
        height="100%"
        shapeRendering="crispEdges"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Palette */}
        {/* outline */} {/* #0b0b0d */}
        {/* hair */} {/* #c8cdd6 */}
        {/* hair shadow */} {/* #9ea7b3 */}
        {/* skin */} {/* #d8c2b1 */}
        {/* skin shadow */} {/* #c2a998 */}
        {/* hoodie */} {/* #f4f5f6 */}
        {/* hoodie shadow */} {/* #d8dde2 */}
        {/* jacket */} {/* #2f5a72 */}
        {/* jacket shadow */} {/* #24485c */}
        {/* cyan */} {/* #00e5ff */}
        {/* purple */} {/* #7c3aed */}

        {/* ---- Hair bun / back hair ---- */}
        <rect x="6" y="10" width="10" height="10" fill="#c8cdd6" />
        <rect x="8" y="12" width="6" height="6" fill="#9ea7b3" fillOpacity="0.5" />
        <rect x="32" y="9" width="10" height="10" fill="#c8cdd6" />
        <rect x="34" y="11" width="6" height="6" fill="#9ea7b3" fillOpacity="0.5" />

        {/* ---- Hair outline ---- */}
        <rect x="10" y="7" width="28" height="2" fill="#0b0b0d" />
        <rect x="9" y="9" width="30" height="1" fill="#0b0b0d" />

        {/* ---- Face base ---- */}
        <rect x="14" y="10" width="20" height="18" fill="#d8c2b1" />
        <rect x="13" y="12" width="1" height="14" fill="#d8c2b1" />
        <rect x="34" y="12" width="1" height="14" fill="#d8c2b1" />

        {/* face shadow */}
        <rect x="14" y="25" width="20" height="3" fill="#c2a998" fillOpacity="0.75" />
        <rect x="15" y="24" width="4" height="1" fill="#c2a998" fillOpacity="0.5" />

        {/* ---- Hair bangs ---- */}
        <rect x="14" y="10" width="20" height="4" fill="#c8cdd6" />
        <rect x="14" y="14" width="6" height="2" fill="#c8cdd6" />
        <rect x="22" y="14" width="3" height="2" fill="#c8cdd6" />
        <rect x="27" y="14" width="7" height="2" fill="#c8cdd6" />
        <rect x="16" y="12" width="4" height="2" fill="#9ea7b3" fillOpacity="0.35" />
        <rect x="28" y="12" width="4" height="2" fill="#9ea7b3" fillOpacity="0.35" />

        {/* ---- Eyes ---- */}
        <rect x="19" y="18" width="4" height="2" fill="#0b0b0d" />
        <rect x="28" y="18" width="4" height="2" fill="#0b0b0d" />
        <rect x="20" y="18" width="2" height="1" fill="#00e5ff" fillOpacity="0.35" />
        <rect x="29" y="18" width="2" height="1" fill="#7c3aed" fillOpacity="0.3" />

        {/* eye highlights */}
        <rect x="21" y="18" width="1" height="1" fill="#f4f5f6" fillOpacity="0.7" />
        <rect x="30" y="18" width="1" height="1" fill="#f4f5f6" fillOpacity="0.7" />

        {/* ---- Brows ---- */}
        <rect x="18" y="16" width="5" height="1" fill="#0b0b0d" fillOpacity="0.65" />
        <rect x="27" y="16" width="5" height="1" fill="#0b0b0d" fillOpacity="0.65" />

        {/* ---- Nose / cheek ---- */}
        <rect x="25" y="21" width="1" height="2" fill="#c2a998" fillOpacity="0.35" />
        <rect x="18" y="22" width="2" height="1" fill="#ffffff" fillOpacity="0.08" />

        {/* ---- Smile ---- */}
        <rect x="21" y="24" width="8" height="1" fill="#0b0b0d" fillOpacity="0.55" />
        <rect x="22" y="25" width="6" height="1" fill="#a46a52" fillOpacity="0.8" />
        <rect x="21" y="25" width="1" height="1" fill="#0b0b0d" fillOpacity="0.35" />
        <rect x="28" y="25" width="1" height="1" fill="#0b0b0d" fillOpacity="0.35" />

        {/* ---- Neck ---- */}
        <rect x="21" y="28" width="6" height="3" fill="#d8c2b1" />
        <rect x="21" y="30" width="6" height="1" fill="#c2a998" fillOpacity="0.7" />

        {/* ---- Hoodie ---- */}
        <rect x="12" y="30" width="24" height="12" fill="#f4f5f6" />
        <rect x="12" y="30" width="24" height="2" fill="#d8dde2" fillOpacity="0.9" />
        <rect x="14" y="32" width="20" height="8" fill="#f4f5f6" />
        <rect x="18" y="32" width="12" height="7" fill="#ffffff" fillOpacity="0.18" />

        {/* hoodie opening */}
        <rect x="20" y="32" width="8" height="10" fill="#d8dde2" fillOpacity="0.55" />
        <rect x="21" y="33" width="6" height="9" fill="#f4f5f6" />

        {/* ---- Jacket ---- */}
        <rect x="8" y="30" width="6" height="16" fill="#2f5a72" />
        <rect x="34" y="30" width="6" height="16" fill="#2f5a72" />
        <rect x="10" y="31" width="2" height="14" fill="#24485c" fillOpacity="0.75" />
        <rect x="36" y="31" width="2" height="14" fill="#24485c" fillOpacity="0.75" />

        {/* jacket collar */}
        <rect x="12" y="30" width="4" height="4" fill="#2f5a72" />
        <rect x="32" y="30" width="4" height="4" fill="#2f5a72" />

        {/* badge */}
        <rect x="9" y="38" width="6" height="6" fill="#24485c" />
        <rect x="10" y="39" width="4" height="4" fill="#0b0b0d" fillOpacity="0.25" />
        <rect x="11" y="40" width="2" height="2" fill="#00e5ff" fillOpacity="0.85" />

        {/* ---- Outline pass (selective) ---- */}
        <rect x="13" y="10" width="1" height="18" fill="#0b0b0d" />
        <rect x="34" y="10" width="1" height="18" fill="#0b0b0d" />
        <rect x="14" y="28" width="20" height="1" fill="#0b0b0d" fillOpacity="0.45" />
        <rect x="12" y="30" width="24" height="1" fill="#0b0b0d" fillOpacity="0.35" />
        <rect x="8" y="30" width="1" height="16" fill="#0b0b0d" fillOpacity="0.25" />
        <rect x="39" y="30" width="1" height="16" fill="#0b0b0d" fillOpacity="0.25" />
      </svg>
    </div>
  );
}

