import type { CSSProperties } from "react";
const paths = {
  plus: "M12 5v14M5 12h14",
  trash: "M3 6h18M9 6V4h6v2M6 6l1 14h10l1-14M10 10v6M14 10v6",
  reset: "M3 10a9 9 0 1 1 2 8M3 4v6h6",
  copy: "M8 8h12v12H8zM16 8V4H4v12h4",
  save: "M5 3h12l4 4v14H3V3h2M7 3v7h10V3M7 21v-7h10v7",
  download: "M12 3v12M7 10l5 5 5-5M4 16v5h16v-5",
  upload: "M12 16V4M7 9l5-5 5 5M4 16v5h16v-5",
  history: "M3 11a9 9 0 1 1 3 8M3 5v6h6M12 7v5l3 2",
  arrow: "M5 12h14M14 7l5 5-5 5",
  check: "M5 12l4 4L19 6",
  close: "M6 6l12 12M18 6L6 18",
  info: "M12 11v6M12 7h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
  sun: "M12 3V1M12 23v-2M3 12H1M23 12h-2M5.5 5.5 4 4M20 20l-1.5-1.5M5.5 18.5 4 20M20 4l-1.5 1.5M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0",
  layers: "m12 3 10 6-10 6L2 9l10-6M2 13l10 6 10-6M2 17l10 6 10-6",
  palette:
    "M12 3a9 9 0 1 0 0 18h1a3 3 0 0 0 0-6h-1a2 2 0 0 1 0-4h5a4 4 0 0 0 4-4c0-3-4-4-9-4M7 8h.01M6 13h.01M10 6h.01M15 6h.01",
} as const;
export function Icon({
  name,
  size = 18,
  style,
}: {
  name: keyof typeof paths;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      <path d={paths[name]} />
    </svg>
  );
}
