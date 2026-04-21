"use client";

import { motion } from "motion/react";
import { useMemo } from "react";

const COLORS = ["#c6ff3d", "#9fd428", "#f5f7f3", "#7ac5e9", "#ffcf5a"];

export default function Confetti({ team }: { team: 1 | 2 }) {
  // Pre-compute confetti particles so they don't re-randomize on re-render.
  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }, () => ({
        x: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 1.6 + Math.random() * 1.6,
        drift: (Math.random() - 0.5) * 60,
        rotate: Math.random() * 720 - 360,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 6,
        isCircle: Math.random() > 0.6,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p, i) => (
        <motion.div
          key={i}
          initial={{
            x: `${p.x}vw`,
            y: team === 2 ? "100vh" : "-10vh",
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: team === 2 ? "-10vh" : "100vh",
            x: `calc(${p.x}vw + ${p.drift}px)`,
            rotate: p.rotate,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeOut",
          }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? "50%" : "2px",
            top: 0,
            left: 0,
          }}
        />
      ))}
    </div>
  );
}
