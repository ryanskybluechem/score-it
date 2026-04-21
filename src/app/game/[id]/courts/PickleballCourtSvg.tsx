"use client";

import { motion } from "motion/react";

export type ServerBox = { x: number; y: number; w: number; h: number } | null;

export default function PickleballCourtSvg({
  highlightTop,
  highlightBottom,
  serverBox,
  pulse,
}: {
  highlightTop: boolean;
  highlightBottom: boolean;
  serverBox: ServerBox;
  pulse: { team: 1 | 2; key: number } | null;
}) {
  return (
    <svg
      viewBox="0 0 200 440"
      preserveAspectRatio="xMidYMid meet"
      className="pointer-events-none h-full w-full"
    >
      <defs>
        <linearGradient id="pickleball-court" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e5f44" />
          <stop offset="0.5" stopColor="#184e37" />
          <stop offset="1" stopColor="#1e5f44" />
        </linearGradient>
        <linearGradient id="pickleball-kitchen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a7a5a" />
          <stop offset="1" stopColor="#2a7a5a" />
        </linearGradient>
        <radialGradient id="pickleball-server-glow">
          <stop offset="0" stopColor="#c6ff3d" stopOpacity="0.55" />
          <stop offset="1" stopColor="#c6ff3d" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Court surface */}
      <rect x="0" y="0" width="200" height="440" fill="url(#pickleball-court)" />

      {/* Serving-side tint */}
      {highlightTop && (
        <rect x="0" y="0" width="200" height="220" fill="#c6ff3d" opacity="0.04" />
      )}
      {highlightBottom && (
        <rect x="0" y="220" width="200" height="220" fill="#c6ff3d" opacity="0.04" />
      )}

      {/* Kitchen (non-volley zone) */}
      <rect x="0" y="150" width="200" height="140" fill="url(#pickleball-kitchen)" />

      {/* Server indicator */}
      {serverBox && (
        <>
          <motion.rect
            key={`${serverBox.x}-${serverBox.y}`}
            x={serverBox.x}
            y={serverBox.y}
            width={serverBox.w}
            height={serverBox.h}
            fill="#c6ff3d"
            initial={{ opacity: 0.08 }}
            animate={{ opacity: [0.08, 0.22, 0.08] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.circle
            key={`dot-${serverBox.x}-${serverBox.y}`}
            cx={serverBox.x + serverBox.w / 2}
            cy={serverBox.y + serverBox.h / 2}
            r={10}
            fill="url(#pickleball-server-glow)"
            initial={{ scale: 0.6 }}
            animate={{ scale: [0.6, 1.2, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {/* Court lines */}
      <g stroke="#f3f7ef" strokeWidth="1.8" fill="none" opacity="0.95">
        <rect x="2" y="2" width="196" height="436" />
        {/* Kitchen lines */}
        <line x1="0" y1="150" x2="200" y2="150" />
        <line x1="0" y1="290" x2="200" y2="290" />
        {/* Centerlines (only outside kitchen) */}
        <line x1="100" y1="2" x2="100" y2="150" />
        <line x1="100" y1="290" x2="100" y2="438" />
      </g>

      {/* Net */}
      <g>
        <rect x="0" y="216" width="200" height="8" fill="#0a1a12" opacity="0.55" />
        <line
          x1="0"
          y1="220"
          x2="200"
          y2="220"
          stroke="#f3f7ef"
          strokeWidth="1.8"
          strokeDasharray="3 3"
          opacity="0.75"
        />
      </g>

      {/* Score pulse */}
      {pulse && (
        <motion.circle
          key={pulse.key}
          cx={100}
          cy={pulse.team === 1 ? 355 : 85}
          r={20}
          fill="#c6ff3d"
          initial={{ opacity: 0.55, r: 20 }}
          animate={{ opacity: 0, r: 130 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      )}
    </svg>
  );
}
