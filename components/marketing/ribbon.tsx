"use client";

import { useEffect, useRef } from "react";

/** Bright brand colours along the ribbon: blue → coral → yellow → green. */
const STOPS: [number, string][] = [
  [0, "#2448E8"],
  [0.38, "#FF6B57"],
  [0.68, "#FFD54A"],
  [1, "#2FD08A"],
];
const ROWS = 28;
const COLS = 72;

/**
 * Hero signature: a slowly twisting silk ribbon in the brand colours (canvas 2D).
 * Pauses off-screen and in background tabs; draws a single still frame for reduced motion.
 */
export function Ribbon({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let frame = 0;
    let visible = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const grad = ctx.createLinearGradient(w * 0.05, h, w, 0);
      for (const [at, color] of STOPS) grad.addColorStop(at, color);
      ctx.fillStyle = grad;
      const band = Math.min(w, h) * 0.7; // ribbon width
      const phase = t * 0.00016;
      // Grid of points across the ribbon (rows) and along it (cols).
      const pts: [number, number][][] = [];
      const shade: number[] = [];
      for (let i = 0; i <= ROWS; i++) {
        const u = i / ROWS - 0.5;
        const row: [number, number][] = [];
        for (let s = 0; s <= COLS; s++) {
          const p = s / COLS;
          // Spine: a soft S-curve from bottom-left to top-right.
          const sx = 0.02 * w + p * 1.15 * w;
          const sy = h * (1.05 - p * 1.15) + Math.sin(p * Math.PI * 1.3 + phase) * h * 0.08;
          // Twist: the ribbon turns as it travels.
          const angle = p * Math.PI * 2 + phase * 1.6;
          const off = u * band * Math.cos(angle);
          row.push([sx + off * 0.5, sy + off]);
          if (i === 0) shade.push(0.5 + 0.5 * Math.abs(Math.sin(angle)));
        }
        pts.push(row);
      }
      // Fill each cell; faces turned towards the viewer are brighter, giving a silky twist.
      for (let i = 0; i < ROWS; i++) {
        for (let s = 0; s < COLS; s++) {
          const a = pts[i][s], b = pts[i][s + 1], c = pts[i + 1][s + 1], d = pts[i + 1][s];
          const edge = Math.abs(i / ROWS - 0.5) * 2;
          ctx.globalAlpha = (0.55 + 0.45 * shade[s]) * (1 - edge * edge * 0.4);
          ctx.beginPath();
          ctx.moveTo(a[0], a[1]);
          ctx.lineTo(b[0], b[1]);
          ctx.lineTo(c[0], c[1]);
          ctx.lineTo(d[0], d[1]);
          ctx.closePath();
          ctx.fill();
        }
      }
      // Fine highlight lines over the surface.
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 0.7;
      ctx.globalAlpha = 1;
      for (let i = 0; i <= ROWS; i += 2) {
        ctx.beginPath();
        pts[i].forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
      }
    };

    const loop = (t: number) => {
      draw(t);
      frame = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
    };
    const start = () => {
      if (!still && !frame && visible && !document.hidden) frame = requestAnimationFrame(loop);
    };

    resize();
    draw(4000);
    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      start();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", start);
    start();
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", start);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={className} />;
}
