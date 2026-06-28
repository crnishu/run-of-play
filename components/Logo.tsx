"use client";

import { useState, useEffect } from "react";

const LOGO_SRC = "/ryze_logo.svg";

export default function Logo({ size = 56 }: { size?: number }) {
  const [hasImg, setHasImg] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setHasImg(true);
    img.src = LOGO_SRC;
  }, []);

  // Once you drop your artwork at public/ryze-logo.png it shows on a clean
  // white tile (so the black-R-on-white reads against the dark UI).
  if (hasImg) {
    const inner = Math.round(size * 0.84);
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: size,
          height: size,
          background: "#fff",
          borderRadius: Math.round(size * 0.22),
          boxShadow: "0 3px 12px rgba(0,0,0,.35)",
          flexShrink: 0,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_SRC} alt="Ryze Sports" width={inner} height={inner} style={{ display: "block", objectFit: "contain" }} />
      </span>
    );
  }

  // Fallback mark until the image file exists
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label="Ryze Sports"
      style={{ display: "block", flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="ryzeBolt" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#5b8cff" />
          <stop offset="1" stopColor="#1b3fd6" />
        </linearGradient>
      </defs>
      <text
        x="38"
        y="47"
        textAnchor="middle"
        style={{ fontFamily: "var(--font-anton), sans-serif", fontSize: 52, fill: "var(--ink)" }}
      >
        R
      </text>
      <path
        d="M27 7 L10 35 L21 35 L16 57 L41 27 L29 27 L35 7 Z"
        fill="url(#ryzeBolt)"
        stroke="var(--bg)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
