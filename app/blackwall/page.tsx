"use client";

import { useEffect, useRef, useState } from "react";

export default function Blackwall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const W = canvas.width;
    const H = canvas.height;

    let frame = 0;
    let animId: number;

    // Data stream particles
    const streams: { x: number; y: number; speed: number; length: number; color: string; opacity: number }[] = [];
    for (let i = 0; i < 80; i++) {
      streams.push({
        x: Math.random() * W,
        y: Math.random() * H,
        speed: Math.random() * 4 + 2,
        length: Math.random() * 80 + 20,
        color: Math.random() > 0.5 ? "#ff003c" : "#00f5ff",
        opacity: Math.random() * 0.8 + 0.2,
      });
    }

    // Glitch blocks
    const glitchBlocks: { x: number; y: number; w: number; h: number; color: string; life: number }[] = [];

    const spawnGlitch = () => {
      for (let i = 0; i < 8; i++) {
        glitchBlocks.push({
          x: Math.random() * W,
          y: Math.random() * H,
          w: Math.random() * 200 + 20,
          h: Math.random() * 8 + 2,
          color: Math.random() > 0.5 ? "#ff003c" : "#00f5ff",
          life: Math.random() * 10 + 5,
        });
      }
    };

    // Geometric rings
    const rings: { x: number; y: number; radius: number; maxRadius: number; color: string; opacity: number }[] = [];
    const spawnRings = () => {
      for (let i = 0; i < 5; i++) {
        rings.push({
          x: W / 2,
          y: H / 2,
          radius: i * 80,
          maxRadius: W,
          color: i % 2 === 0 ? "#00f5ff" : "#ff003c",
          opacity: 1,
        });
      }
    };

    const draw = () => {
      // Phase 1: noise (0-60 frames)
      // Phase 2: streams (60-150 frames)
      // Phase 3: rings (150-240 frames)
      // Phase 4: collapse (240-300 frames)

      ctx.fillStyle = `rgba(0, 0, 0, ${frame < 60 ? 0.3 : 0.15})`;
      ctx.fillRect(0, 0, W, H);

      // Phase 1 - Digital noise
      if (frame < 100) {
        if (frame % 3 === 0) spawnGlitch();
        glitchBlocks.forEach((block, i) => {
          ctx.globalAlpha = block.life / 15;
          ctx.fillStyle = block.color;
          ctx.fillRect(block.x, block.y, block.w, block.h);
          block.life--;
          if (block.life <= 0) glitchBlocks.splice(i, 1);
        });
      }

      // Phase 2 - Data streams
      if (frame >= 60 && frame < 200) {
        ctx.globalAlpha = Math.min((frame - 60) / 40, 1);
        streams.forEach((s) => {
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 1;
          ctx.globalAlpha = s.opacity * Math.min((frame - 60) / 40, 1);
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x, s.y + s.length);
          ctx.stroke();
          s.y += s.speed;
          if (s.y > H) s.y = -s.length;
        });
      }

      // Phase 3 - Geometric rings
      if (frame === 150) spawnRings();
      if (frame >= 150 && frame < 260) {
        rings.forEach((ring) => {
          ctx.globalAlpha = ring.opacity;
          ctx.strokeStyle = ring.color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
          ctx.stroke();
          ring.radius += 6;
          ring.opacity -= 0.008;
        });
      }

      // Phase 4 - Collapse/flash
      if (frame >= 260 && frame < 300) {
        const progress = (frame - 260) / 40;
        ctx.globalAlpha = 1 - progress;
        ctx.fillStyle = frame % 4 === 0 ? "#ff003c" : "#00f5ff";
        ctx.fillRect(0, 0, W, H);
      }

      ctx.globalAlpha = 1;
      frame++;

      if (frame < 300) {
        animId = requestAnimationFrame(draw);
      } else {
        setIntroComplete(true);
      }
    };

    animId = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <>
      {!introComplete && (
        <canvas
          ref={canvasRef}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 99999,
            background: "#000",
          }}
        />
      )}
      <main className="blackwall-page">
        <section className="page-hero blackwall-hero">
          <h1>BLACKWALL</h1>
          <p>UNDER CONSTRUCTION</p>
        </section>
      </main>
    </>
  );
}