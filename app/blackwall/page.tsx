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

    // Horizontal glitch lines
    const glitchLines: { y: number; w: number; x: number; color: string; life: number; height: number }[] = [];

    const spawnGlitchLines = () => {
      for (let i = 0; i < 6; i++) {
        glitchLines.push({
          y: Math.random() * H,
          w: Math.random() * W * 0.8 + W * 0.1,
          x: Math.random() * W * 0.2,
          color: Math.random() > 0.5 ? "#ff003c" : "#00f5ff",
          life: Math.random() * 6 + 3,
          height: Math.random() * 3 + 1,
        });
      }
    };

    // Data corruption blocks
    const corruptBlocks: { x: number; y: number; w: number; h: number; color: string; life: number; alpha: number }[] = [];

    const spawnCorruptBlocks = () => {
      for (let i = 0; i < 12; i++) {
        corruptBlocks.push({
          x: Math.random() * W,
          y: Math.random() * H,
          w: Math.random() * 120 + 10,
          h: Math.random() * 4 + 1,
          color: Math.random() > 0.5 ? "#ff003c" : "#00f5ff",
          life: Math.random() * 8 + 4,
          alpha: Math.random() * 0.7 + 0.3,
        });
      }
    };

    // Central radial burst
    let burstRadius = 0;
    let burstOpacity = 0;
    let burstStarted = false;

    const draw = () => {
      // Total animation: ~180 frames (3 seconds at 60fps)
      // Phase 1 (0-20): white flash
      // Phase 2 (20-120): glitch lines + corrupt blocks
      // Phase 3 (80-150): radial burst
      // Phase 4 (150-180): fade out

      // Clear with dark trail
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fillRect(0, 0, W, H);

      // Phase 1 - Initial flash
      if (frame < 20) {
        const flashAlpha = frame < 10
          ? frame / 10
          : 1 - (frame - 10) / 10;
        ctx.globalAlpha = flashAlpha * 0.9;
        ctx.fillStyle = "#00f5ff";
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }

      // Phase 2 - Glitch lines
      if (frame >= 15 && frame < 140) {
        if (frame % 4 === 0) spawnGlitchLines();
        if (frame % 6 === 0) spawnCorruptBlocks();

        glitchLines.forEach((line, i) => {
          ctx.globalAlpha = (line.life / 9) * 0.9;
          ctx.fillStyle = line.color;
          ctx.fillRect(line.x, line.y, line.w, line.height);
          line.life--;
          if (line.life <= 0) glitchLines.splice(i, 1);
        });

        corruptBlocks.forEach((block, i) => {
          ctx.globalAlpha = block.alpha * (block.life / 12);
          ctx.fillStyle = block.color;
          ctx.fillRect(block.x, block.y, block.w, block.h);
          block.life--;
          if (block.life <= 0) corruptBlocks.splice(i, 1);
        });
      }

      // Phase 3 - Radial burst from center
      if (frame === 80) {
        burstStarted = true;
        burstOpacity = 1;
      }
      if (burstStarted && frame < 160) {
        burstRadius += 15;
        burstOpacity -= 0.02;

        // Outer ring - red
        ctx.globalAlpha = Math.max(burstOpacity, 0);
        ctx.strokeStyle = "var(--neon-red)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, burstRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner ring - cyan (slightly behind)
        ctx.strokeStyle = "var(--neon-cyan)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, burstRadius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Phase 4 - Fade out
      if (frame >= 150) {
        const fadeProgress = (frame - 150) / 30;
        ctx.globalAlpha = fadeProgress;
        ctx.fillStyle = "var(--background)";
        ctx.fillRect(0, 0, W, H);
      }

      ctx.globalAlpha = 1;
      frame++;

      if (frame < 180) {
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
        <div className="blackwall-border-overlay" />
        <section className="page-hero blackwall-hero">
          <h1>BLACKWALL LINE</h1>
          <p>UNDER CONSTRUCTION</p>
        </section>
        <section className="blackwall-grid-section">
            <div className="blackwall-grid">
                <div className="blackwall-grid-card">
                    <h3>Title Here</h3>
                    <p>Description here</p>
                </div>
                <div className="blackwall-grid-card">
                    <h3>Title Here</h3>
                    <p>Description here</p>
                </div>
                <div className="blackwall-grid-card">
                    <h3>Title Here</h3>
                    <p>Description here</p>
                </div>
            </div>
        </section>
      </main>
    </>
  );
}