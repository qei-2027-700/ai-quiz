import type { CSSProperties } from "react";

interface Props {
  sizePx?: number;
  className?: string;
  style?: CSSProperties;
}

export function Mascot({ sizePx = 140, className, style }: Props) {
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
        viewBox="0 0 16 16"
        width="100%"
        height="100%"
        shapeRendering="crispEdges"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* hat */}
        <rect x="4" y="1" width="8" height="1" fill="#0b0b0d" />
        <rect x="3" y="2" width="10" height="1" fill="#0b0b0d" />
        <rect x="4" y="3" width="8" height="1" fill="#141418" />
        <rect x="5" y="2" width="6" height="1" fill="#1d1d24" />
        <rect x="6" y="2" width="1" height="1" fill="#00e5ff" />

        {/* head */}
        <rect x="5" y="4" width="6" height="1" fill="#2a2a33" />
        <rect x="4" y="5" width="8" height="4" fill="#f2d2b6" />
        <rect x="4" y="9" width="8" height="1" fill="#d9b89b" />

        {/* hair/outline */}
        <rect x="4" y="5" width="1" height="3" fill="#2a2a33" />
        <rect x="11" y="5" width="1" height="3" fill="#2a2a33" />
        <rect x="5" y="5" width="1" height="1" fill="#2a2a33" />
        <rect x="10" y="5" width="1" height="1" fill="#2a2a33" />

        {/* eyes */}
        <rect x="6" y="6" width="1" height="1" fill="#0b0b0d" />
        <rect x="9" y="6" width="1" height="1" fill="#0b0b0d" />

        {/* mouth */}
        <rect x="7" y="8" width="2" height="1" fill="#a46a52" />

        {/* coat */}
        <rect x="3" y="10" width="10" height="1" fill="#1a1a22" />
        <rect x="3" y="11" width="10" height="4" fill="#232331" />

        {/* lapels */}
        <rect x="5" y="11" width="1" height="2" fill="#17171f" />
        <rect x="10" y="11" width="1" height="2" fill="#17171f" />
        <rect x="6" y="11" width="1" height="1" fill="#7c3aed" />

        {/* tie */}
        <rect x="7" y="10" width="2" height="1" fill="#00e5ff" />
        <rect x="7" y="11" width="2" height="2" fill="#0ea5b7" />

        {/* arms */}
        <rect x="2" y="12" width="2" height="2" fill="#232331" />
        <rect x="12" y="12" width="2" height="2" fill="#232331" />
        <rect x="1" y="13" width="1" height="1" fill="#232331" />

        {/* magnifying glass */}
        <rect x="12" y="9" width="1" height="1" fill="#00e5ff" />
        <rect x="13" y="8" width="2" height="2" fill="#00e5ff" fillOpacity="0.25" />
        <rect x="13" y="8" width="2" height="1" fill="#00e5ff" fillOpacity="0.35" />
        <rect x="13" y="10" width="2" height="1" fill="#00e5ff" fillOpacity="0.35" />
        <rect x="12" y="10" width="1" height="1" fill="#00e5ff" />
        <rect x="14" y="10" width="1" height="1" fill="#00e5ff" />
        <rect x="15" y="9" width="1" height="1" fill="#00e5ff" />
        <rect x="12" y="11" width="2" height="1" fill="#00e5ff" />
        <rect x="11" y="12" width="2" height="1" fill="#00e5ff" />

        {/* subtle highlight */}
        <rect x="6" y="5" width="2" height="1" fill="#ffffff" fillOpacity="0.08" />
        <rect x="4" y="11" width="1" height="2" fill="#ffffff" fillOpacity="0.04" />
      </svg>
    </div>
  );
}

