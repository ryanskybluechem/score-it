"use client";

import { motion } from "motion/react";

export default function TennisCourtSvg({
  highlightTop,
  highlightBottom,
  serverHalf,
  pulse,
}: {
  highlightTop: boolean;
  highlightBottom: boolean;
  /** Which service box is the server positioned in, if known. */
  serverHalf: { side: "deuce" | "ad"; team: 1 | 2 } | null;
  pulse: { team: 1 | 2; key: number } | null;
}) {
  // Doubles court: 36×78 ft → 180×390 units
  // Singles sidelines inset 4.5 ft → 22.5 units
  // Service line 21 ft from net → 105 units from y=195
  const W = 180;
  const H = 390;
  const singlesLeft = 22.5;
  const singlesRight = 157.5;
  const netY = 195;
  const svcTop = 90;
  const svcBottom = 300;
  const centerX = 90;

  // Map "deuce" / "ad" court for each team to SVG coords.
  // Team 1 (bottom) faces up → their deuce (server's right) is viewer's left (x=singlesLeft..centerX, y=svcBottom..H)
  // Team 2 (top) faces down → their deuce (server's right) is viewer's right (x=centerX..singlesRight, y=0..svcTop)
  let serverRect: { x: number; y: number; w: number; h: number } | null = null;
  if (serverHalf) {
    if (serverHalf.team === 1) {
      // Server is behind bottom baseline. Highlight their service box on the OTHER side
      // (where they're serving INTO). Actually standard scoreboards highlight the serving
      // player's side, so we highlight where they *stand*: bottom service box.
      const left = serverHalf.side === "deuce";
      serverRect = {
        x: left ? singlesLeft : centerX,
        y: svcBottom,
        w: centerX - singlesLeft,
        h: H - svcBottom,
      };
    } else {
      const left = serverHalf.side !== "deuce";
      serverRect = {
        x: left ? singlesLeft : centerX,
        y: 0,
        w: centerX - singlesLeft,
        h: svcTop,
      };
    }
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="pointer-events-none h-full w-full"
    >
      <defs>
        <linearGradient id="tennis-court" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e5aa8" />
          <stop offset="0.5" stopColor="#184c8c" />
          <stop offset="1" stopColor="#1e5aa8" />
        </linearGradient>
        <radialGradient id="tennis-server-glow">
          <stop offset="0" stopColor="#c6ff3d" stopOpacity="0.55" />
          <stop offset="1" stopColor="#c6ff3d" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Doubles surface (slightly darker alleys) */}
      <rect x="0" y="0" width={W} height={H} fill="#153f72" />
      {/* Singles surface */}
      <rect
        x={singlesLeft}
        y="0"
        width={singlesRight - singlesLeft}
        height={H}
        fill="url(#tennis-court)"
      />

      {/* Serving-side tint */}
      {highlightTop && (
        <rect x="0" y="0" width={W} height={netY} fill="#c6ff3d" opacity="0.04" />
      )}
      {highlightBottom && (
        <rect x="0" y={netY} width={W} height={H - netY} fill="#c6ff3d" opacity="0.04" />
      )}

      {/* Server box */}
      {serverRect && (
        <>
          <motion.rect
            key={`svr-${serverRect.x}-${serverRect.y}`}
            x={serverRect.x}
            y={serverRect.y}
            width={serverRect.w}
            height={serverRect.h}
            fill="#c6ff3d"
            initial={{ opacity: 0.08 }}
            animate={{ opacity: [0.08, 0.22, 0.08] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.circle
            key={`svr-dot-${serverRect.x}-${serverRect.y}`}
            cx={serverRect.x + serverRect.w / 2}
            cy={serverRect.y + serverRect.h / 2}
            r={8}
            fill="url(#tennis-server-glow)"
            initial={{ scale: 0.6 }}
            animate={{ scale: [0.6, 1.2, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {/* Lines */}
      <g stroke="#f3f7ef" strokeWidth="1.6" fill="none" opacity="0.95">
        {/* Doubles outline */}
        <rect x="2" y="2" width={W - 4} height={H - 4} />
        {/* Singles sidelines */}
        <line x1={singlesLeft} y1="0" x2={singlesLeft} y2={H} />
        <line x1={singlesRight} y1="0" x2={singlesRight} y2={H} />
        {/* Service lines */}
        <line x1={singlesLeft} y1={svcTop} x2={singlesRight} y2={svcTop} />
        <line x1={singlesLeft} y1={svcBottom} x2={singlesRight} y2={svcBottom} />
        {/* Center service line */}
        <line x1={centerX} y1={svcTop} x2={centerX} y2={svcBottom} />
        {/* Center marks on baselines */}
        <line x1={centerX} y1={0} x2={centerX} y2={8} />
        <line x1={centerX} y1={H - 8} x2={centerX} y2={H} />
      </g>

      {/* Net */}
      <g>
        <rect x="0" y={netY - 3} width={W} height="6" fill="#0a1a2a" opacity="0.6" />
        <line
          x1="0"
          y1={netY}
          x2={W}
          y2={netY}
          stroke="#f3f7ef"
          strokeWidth="1.6"
          strokeDasharray="3 3"
          opacity="0.75"
        />
      </g>

      {/* Score pulse */}
      {pulse && (
        <motion.circle
          key={pulse.key}
          cx={W / 2}
          cy={pulse.team === 1 ? H - 70 : 70}
          r={20}
          fill="#c6ff3d"
          initial={{ opacity: 0.55, r: 20 }}
          animate={{ opacity: 0, r: 120 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      )}
    </svg>
  );
}
