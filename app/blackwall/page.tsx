"use client";

import { useEffect, useRef, useState } from "react";

export default function Blackwall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const idleCanvasRef = useRef<HTMLCanvasElement>(null);
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

    let burstRadius = 0;
    let burstOpacity = 0;
    let burstStarted = false;

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fillRect(0, 0, W, H);

      if (frame < 20) {
        const flashAlpha = frame < 10 ? frame / 10 : 1 - (frame - 10) / 10;
        ctx.globalAlpha = flashAlpha * 0.9;
        ctx.fillStyle = "#00f5ff";
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }

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

      if (frame === 80) { burstStarted = true; burstOpacity = 1; }
      if (burstStarted && frame < 160) {
        burstRadius += 15;
        burstOpacity -= 0.02;
        ctx.globalAlpha = Math.max(burstOpacity, 0);
        ctx.strokeStyle = "#ff003c";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, burstRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "#00f5ff";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, burstRadius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (frame >= 150) {
        const fadeProgress = (frame - 150) / 30;
        ctx.globalAlpha = fadeProgress;
        ctx.fillStyle = "#000000";
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

  useEffect(() => {
    if (!introComplete) return;
    const canvas = idleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const W = canvas.width;
    const H = canvas.height;

    let animId: number;

    // Track which card is hovered
    const hoveredCard = { current: null as Element | null };
    const cards = document.querySelectorAll('.blackwall-grid-card');
    const onEnter = (card: Element) => () => { hoveredCard.current = card; };
    const onLeave = () => { hoveredCard.current = null; };
    cards.forEach((card) => {
      card.addEventListener('mouseenter', onEnter(card));
      card.addEventListener('mouseleave', onLeave);
    });

    // Layer 1: screen edge scan lines
    const scanLines: { x: number; y: number; length: number; color: string; alpha: number; height: number }[] = [];

    const spawnScanLine = () => {
      if (Math.random() > 0.7) {
        const corner = Math.floor(Math.random() * 4);
        let x = 0;
        let y = 0;
        const length = Math.random() * 150 + 50;

        switch(corner) {
          case 0:
            x = Math.random() * W * 0.25;
            y = Math.random() * H * 0.25;
            break;
          case 1:
            x = W - Math.random() * W * 0.25;
            y = Math.random() * H * 0.25;
            break;
          case 2:
            x = Math.random() * W * 0.25;
            y = H - Math.random() * H * 0.25;
            break;
          case 3:
            x = W - Math.random() * W * 0.25;
            y = H - Math.random() * H * 0.25;
            break;
        }

        scanLines.push({
          x,
          y,
          length,
          color: Math.random() > 0.5 ? "#ff003c" : "#00f5ff",
          alpha: Math.min(0.9, (Math.pow(Math.random(), 0.4) * 0.7 + 0.2) * (1 - Math.min(
            Math.min(x, W - x) / (W * 0.25),
            Math.min(y, H - y) / (H * 0.25)
          ) * 0.5)),
          height: Math.random() * 15 + 2,
        });
      }
    };

    // Layer 2: card edge bars (only on hovered card)
    const cardLines: { x: number; y: number; w: number; h: number; color: string; alpha: number }[] = [];

    const spawnCardEffects = () => {
      if (!hoveredCard.current) return;
      const rect = hoveredCard.current.getBoundingClientRect();

      // Vertical bars mirrored over top edge
      if (Math.random() > 0.7) {
        const color = Math.random() > 0.5 ? "#ff003c" : "#00f5ff";
        const width = Math.random() * 10 + 2;
        const x = rect.left + Math.random() * rect.width;
        const length = Math.random() * 20 + 5;
        cardLines.push({ x, y: rect.top - length, w: width, h: length * 2, color, alpha: Math.random() * 0.7 + 0.2 });
      }

      // Vertical bars mirrored over bottom edge
      if (Math.random() > 0.7) {
        const color = Math.random() > 0.5 ? "#ff003c" : "#00f5ff";
        const width = Math.random() * 10 + 2;
        const x = rect.left + Math.random() * rect.width;
        const length = Math.random() * 20 + 5;
        cardLines.push({ x, y: rect.bottom - length, w: width, h: length * 2, color, alpha: Math.random() * 0.7 + 0.2 });
      }

      // Horizontal bars mirrored over left edge
      if (Math.random() > 0.7) {
        const color = Math.random() > 0.5 ? "#ff003c" : "#00f5ff";
        const height = Math.random() * 10 + 2;
        const y = rect.top + Math.random() * rect.height;
        const length = Math.random() * 20 + 5;
        cardLines.push({ x: rect.left - length, y, w: length * 2, h: height, color, alpha: Math.random() * 0.7 + 0.2 });
      }

      // Horizontal bars mirrored over right edge
      if (Math.random() > 0.7) {
        const color = Math.random() > 0.5 ? "#ff003c" : "#00f5ff";
        const height = Math.random() * 10 + 2;
        const y = rect.top + Math.random() * rect.height;
        const length = Math.random() * 20 + 5;
        cardLines.push({ x: rect.right - length, y, w: length * 2, h: height, color, alpha: Math.random() * 0.7 + 0.2 });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Layer 1: screen edges
      spawnScanLine();
      scanLines.forEach((line, i) => {
        ctx.globalAlpha = line.alpha;
        ctx.fillStyle = line.color;
        ctx.fillRect(line.x, line.y, line.length, line.height);
        line.alpha -= 0.006;
        if (line.alpha <= 0) scanLines.splice(i, 1);
      });

      // Layer 2: card edges on hover
      spawnCardEffects();
      cardLines.forEach((line, i) => {
        ctx.globalAlpha = line.alpha;
        ctx.fillStyle = line.color;
        ctx.fillRect(line.x, line.y, line.w, line.h);
        line.alpha -= 0.003;
        if (line.alpha <= 0) cardLines.splice(i, 1);
      });

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      cards.forEach((card) => {
        card.removeEventListener('mouseenter', onEnter(card));
        card.removeEventListener('mouseleave', onLeave);
      });
    };
  }, [introComplete]);

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
      {introComplete && (
        <canvas
          ref={idleCanvasRef}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 9996,
            pointerEvents: "none",
            background: "transparent",
          }}
        />
      )}
      <main className="blackwall-page">
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
