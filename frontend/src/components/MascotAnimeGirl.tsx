import type { CSSProperties } from "react";

interface Props {
  sizePx?: number;
  className?: string;
  style?: CSSProperties;
}

export function MascotAnimeGirl({ sizePx = 160, className, style }: Props) {
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
        viewBox="0 0 20 20"
        width="100%"
        height="100%"
        shapeRendering="crispEdges"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Palette */}
        {/* outline */} {/* #0b0b0d */}
        {/* hair */} {/* #0f172a */}
        {/* hair highlight */} {/* #1f2a44 */}
        {/* skin */} {/* #f1cdb5 */}
        {/* cheek */} {/* #f2a7b8 */}
        {/* eye */} {/* #0b0b0d */}
        {/* hoodie */} {/* #f4f5f6 */}
        {/* jacket */} {/* #2f5a72 */}
        {/* cyan */} {/* #00e5ff */}
        {/* purple */} {/* #7c3aed */}

        {/* Hair silhouette (round-ish head) */}
        <rect x="6" y="2" width="8" height="1" fill="#0f172a" />
        <rect x="4" y="3" width="12" height="1" fill="#0f172a" />
        <rect x="3" y="4" width="14" height="1" fill="#0f172a" />
        <rect x="2" y="5" width="16" height="1" fill="#0f172a" />
        <rect x="2" y="6" width="16" height="1" fill="#0f172a" />

        {/* Hair buns */}
        <rect x="1" y="5" width="2" height="3" fill="#0f172a" />
        <rect x="17" y="5" width="2" height="3" fill="#0f172a" />
        <rect x="0" y="6" width="2" height="2" fill="#0f172a" />
        <rect x="18" y="6" width="2" height="2" fill="#0f172a" />

        {/* Face */}
        <rect x="5" y="5" width="10" height="8" fill="#f1cdb5" />
        <rect x="4" y="6" width="1" height="6" fill="#f1cdb5" />
        <rect x="15" y="6" width="1" height="6" fill="#f1cdb5" />

        {/* Bangs */}
        <rect x="5" y="5" width="10" height="2" fill="#0f172a" />
        <rect x="6" y="7" width="2" height="1" fill="#0f172a" />
        <rect x="12" y="7" width="2" height="1" fill="#0f172a" />
        <rect x="7" y="6" width="2" height="1" fill="#1f2a44" fillOpacity="0.55" />
        <rect x="11" y="6" width="2" height="1" fill="#1f2a44" fillOpacity="0.55" />

        {/* Eyes (anime-ish bigger) */}
        <rect x="7" y="9" width="2" height="2" fill="#0b0b0d" />
        <rect x="11" y="9" width="2" height="2" fill="#0b0b0d" />
        <rect x="7" y="9" width="1" height="1" fill="#00e5ff" fillOpacity="0.5" />
        <rect x="12" y="9" width="1" height="1" fill="#7c3aed" fillOpacity="0.45" />
        <rect x="8" y="9" width="1" height="1" fill="#f4f5f6" fillOpacity="0.7" />
        <rect x="12" y="9" width="1" height="1" fill="#f4f5f6" fillOpacity="0.55" />

        {/* Brows */}
        <rect x="7" y="8" width="2" height="1" fill="#0b0b0d" fillOpacity="0.45" />
        <rect x="11" y="8" width="2" height="1" fill="#0b0b0d" fillOpacity="0.45" />

        {/* Cheeks */}
        <rect x="6" y="11" width="1" height="1" fill="#f2a7b8" fillOpacity="0.5" />
        <rect x="13" y="11" width="1" height="1" fill="#f2a7b8" fillOpacity="0.5" />

        {/* Mouth */}
        <rect x="9" y="12" width="2" height="1" fill="#a46a52" fillOpacity="0.9" />

        {/* Neck */}
        <rect x="8" y="13" width="4" height="1" fill="#f1cdb5" />

        {/* Hoodie */}
        <rect x="5" y="14" width="10" height="4" fill="#f4f5f6" />
        <rect x="6" y="14" width="8" height="2" fill="#ffffff" fillOpacity="0.12" />
        <rect x="9" y="14" width="2" height="4" fill="#d8dde2" fillOpacity="0.55" />

        {/* Jacket */}
        <rect x="3" y="14" width="2" height="6" fill="#2f5a72" />
        <rect x="15" y="14" width="2" height="6" fill="#2f5a72" />
        <rect x="2" y="16" width="1" height="3" fill="#2f5a72" />
        <rect x="17" y="16" width="1" height="3" fill="#2f5a72" />

        {/* Accessory: small cyan badge */}
        <rect x="4" y="17" width="2" height="2" fill="#00e5ff" fillOpacity="0.85" />
        <rect x="4" y="18" width="2" height="1" fill="#00e5ff" fillOpacity="0.55" />
      </svg>
    </div>
  );
}

