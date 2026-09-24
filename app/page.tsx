"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";

// Brand identity cards scattered around the hero
const CARDS = [
  // Left side
  { x: 3,  y: 16, rot: -8,  scale: 1.0, opacity: 1.0,  type: "image",     src: "/background-cards/Moodboard%20Img-4.webp", width: 160 },
  { x: 12, y: 55, rot: 6,   scale: 0.8, opacity: 0.93, type: "image",     src: "/background-cards/Moodboard%20Img-1.webp", width: 170 },
  { x: 2,  y: 35, rot: -4,  scale: 0.7, opacity: 0.98, type: "image",     src: "/background-cards/Inclusivity%201.webp", width: 190 }, // larger grey pill
  { x: 18, y: 78, rot: 10,  scale: 0.65,opacity: 0.78, type: "image",     src: "/background-cards/Moodboard%20Img-2.webp", width: 160 },
  { x: 7,  y: 72, rot: -12, scale: 0.75,opacity: 0.68, type: "image",     src: "/background-cards/Group%2067%201.webp", width: 150 },
  { x: 25, y: 6,  rot: 8,   scale: 0.9, opacity: 1.0,  type: "image",     src: "/background-cards/Moodboard%20Img-3.webp", width: 150 }, 

  // Right side
  { x: 72, y: 5,  rot: 10,  scale: 0.85,opacity: 1.0,  type: "image",     src: "/background-cards/landingpage-img-1.webp", width: 180 },
  { x: 80, y: 30, rot: -7,  scale: 0.75,opacity: 1.0,  type: "image",     src: "/background-cards/Group%2077%201.webp", width: 140 }, 
  { x: 88, y: 10, rot: 5,   scale: 0.9, opacity: 1.0,  type: "image",     src: "/background-cards/Moodboard%20Img-6.webp", width: 170 },
  { x: 75, y: 60, rot: -10, scale: 0.8, opacity: 0.73, type: "image",     src: "/background-cards/Moodboard%20Img-5.webp", width: 130 }, // smaller red image
  { x: 90, y: 55, rot: 8,   scale: 0.7, opacity: 0.68, type: "image",     src: "/background-cards/Inclusivity%202.webp", width: 200 }, // larger grey pill
  { x: 65, y: 85, rot: 12,  scale: 0.6, opacity: 0.63, type: "image",     src: "/background-cards/Moodboard%20Img-7.webp", width: 200 }, // doubled size red image
];

function BrandCard({ card }: { card: any }) {
  const style: React.CSSProperties = {
    position: "absolute",
    left: `${card.x}%`,
    top: `${card.y}%`,
    transform: `rotate(${card.rot}deg) scale(${card.scale})`,
    opacity: card.opacity,
    pointerEvents: "none",
    userSelect: "none",
  };

  const baseCard = "rounded-[14px] overflow-hidden shadow-sm flex-shrink-0";
  const defaultDim = "w-[110px] h-[110px]";

  if (card.type === "image") {
    return (
      <div style={style}>
        <div 
          className={baseCard} 
          style={{ 
            width: card.width || 130, 
            background: "transparent",
            boxShadow: "none"
          }}
        >
          <Image 
            src={card.src} 
            alt="Brand Identity" 
            width={400} 
            height={400} 
            priority={card.y < 50}
            style={{ 
              width: "100%", 
              height: "auto", 
              display: "block" 
            }}
          />
        </div>
      </div>
    );
  }

  if (card.type === "palette") {
    return (
      <div style={style}>
        <div className={`${baseCard} ${defaultDim}`} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr" }}>
          {(card.colors as string[]).map((c, i) => (
            <div key={i} style={{ background: c }} />
          ))}
        </div>
      </div>
    );
  }

  if (card.type === "typo") {
    return (
      <div style={style}>
        <div className={`${baseCard} ${defaultDim}`} style={{ background: "#FFFFFF", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "12px", border: "1px solid #E8E4DF" }}>
          <span style={{ fontFamily: "var(--font-gt-super), Georgia, serif", fontSize: "40px", fontWeight: 300, color: "#1A1A1A", lineHeight: 1 }}>{card.label as string}</span>
          <span style={{ fontFamily: "var(--font-favorit), system-ui, sans-serif", fontSize: "9px", color: "#999", marginTop: "6px", letterSpacing: "0.05em" }}>{card.sub as string}</span>
        </div>
      </div>
    );
  }

  if (card.type === "swatch") {
    return (
      <div style={style}>
        <div className={`${baseCard} ${defaultDim}`} style={{ background: card.color as string, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "10px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: card.accent as string }} />
        </div>
      </div>
    );
  }

  if (card.type === "logo") {
    return (
      <div style={style}>
        <div className={`${baseCard} ${defaultDim}`} style={{ background: card.bg as string, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "var(--font-gt-super), Georgia, serif", fontSize: "52px", fontWeight: 300, color: card.fg as string, lineHeight: 1 }}>{card.letter as string}</span>
        </div>
      </div>
    );
  }

  return null;
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Very subtle parallax on mouse move
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number;
    const cards = container.querySelectorAll<HTMLElement>("[data-float-card]");

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const xRatio = (e.clientX / innerWidth - 0.5) * 2;
      const yRatio = (e.clientY / innerHeight - 0.5) * 2;

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        cards.forEach((card, i) => {
          const depth = (i % 3) * 0.4 + 0.2;
          card.style.transform = card.dataset.baseTransform!.replace(
            "translate(0,0)",
            `translate(${xRatio * depth * 6}px, ${yRatio * depth * 5}px)`
          );
        });
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden" style={{ background: "#EDEAE4" }}>

      {/* ── Floating Brand Cards ── */}
      <div ref={containerRef} className="absolute inset-0 z-0" aria-hidden="true">
        {CARDS.map((card, i) => {
          const baseTransform = `rotate(${card.rot}deg) scale(${card.scale}) translate(0,0)`;
          return (
            <div
              key={i}
              data-float-card
              data-base-transform={baseTransform}
              style={{
                position: "absolute",
                left: `${card.x}%`,
                top: `${card.y}%`,
                opacity: card.opacity,
                pointerEvents: "none",
                userSelect: "none",
                transform: baseTransform,
                animation: `floatCard${i % 4} ${5 + (i % 4) * 1.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.4}s`,
                transitionProperty: "transform",
                transitionDuration: "0.6s",
                transitionTimingFunction: "ease-out",
              }}
            >
              <BrandCard card={card} />
            </div>
          );
        })}
      </div>

      {/* ── Radial gradient fade toward center ── */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 55% 60% at 50% 48%, #EDEAE4 38%, transparent 100%)",
        }}
      />

      {/* ── Nav ── */}
      <header
        className="relative z-20 flex items-center justify-between px-6 lg:px-10"
        style={{ paddingTop: "32px" }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/Branding/BrandLogicIcon-UltraBlur.png"
            alt="Brand Logic"
            width={27}
            height={27}
            className="rounded-full"
          />
          <span
            style={{
              fontFamily: "var(--font-favorit), system-ui, sans-serif",
              fontSize: "17px",
              fontWeight: 700,
              letterSpacing: "0.04em",
              color: "#1A1A1A",
            }}
          >
            BRAND LOGIC
          </span>
        </Link>

        {/* Auth links */}
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            style={{
              fontFamily: "var(--font-favorit), system-ui, sans-serif",
              fontSize: "14px",
              color: "#1A1A1A",
              textDecoration: "none",
              padding: "16px 32px",
              borderRadius: "9999px",
              border: "1px solid #D0CDC7",
              transition: "background 0.15s ease",
              lineHeight: 1,
            }}
            className="hover:bg-black/5"
          >
            Login
          </Link>
          <Link
            href="/signup"
            style={{
              fontFamily: "var(--font-favorit), system-ui, sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              color: "#FFFFFF",
              background: "#1A1A1A",
              textDecoration: "none",
              padding: "16px 32px",
              borderRadius: "9999px",
              transition: "opacity 0.15s ease",
              lineHeight: 1,
            }}
            className="hover:opacity-80"
          >
            Sign up
          </Link>
        </nav>
      </header>

      {/* ── Hero ── */}
      <main className="relative z-10 flex-1 flex items-center justify-center">
        <div
          className="flex flex-col items-center text-center"
          style={{ animation: "heroFadeUp 0.7s ease forwards", opacity: 0 }}
        >
          {/* Eyebrow icon */}
          <div style={{ marginBottom: "24px" }}>
            <Image
              src="/Branding/BrandLogicIcon-UltraBlur.png"
              alt="Brand Logic"
              width={64}
              height={64}
              className="rounded-full"
            />
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "var(--font-gt-super), Georgia, serif",
              fontSize: "clamp(40px, 6.5vw, 76px)",
              fontWeight: 300,
              lineHeight: 1.1,
              color: "#1A1A1A",
              letterSpacing: "-0.02em",
              maxWidth: "740px",
              marginBottom: "20px",
            }}
          >
            A brand system for<br />founders, built in minutes.
          </h1>

          {/* Subtext */}
          <p
            style={{
              fontFamily: "var(--font-favorit), system-ui, sans-serif",
              fontSize: "15px",
              fontWeight: 400,
              color: "#636464",
              maxWidth: "460px",
              lineHeight: 1.6,
              marginBottom: "36px",
            }}
          >
            Turn your vision into a clear, usable brand system: positioning, voice, visuals, and next steps included.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-4">
            <Link
              href="/signup"
              style={{
                fontFamily: "var(--font-favorit), system-ui, sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                color: "#FFFFFF",
                background: "#1A1A1A",
                textDecoration: "none",
                padding: "16px 32px",
                borderRadius: "9999px",
                transition: "opacity 0.15s ease",
                lineHeight: 1,
              }}
              className="hover:opacity-80"
            >
              Sign up
            </Link>
            <Link
              href="/login"
              style={{
                fontFamily: "var(--font-favorit), system-ui, sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                color: "#1A1A1A",
                textDecoration: "none",
                padding: "16px 32px",
                borderRadius: "9999px",
                border: "1px solid #D0CDC7",
                transition: "background 0.15s ease",
                lineHeight: 1,
              }}
              className="hover:bg-black/5"
            >
              Log in
            </Link>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        className="relative z-20 flex items-center justify-between px-6 lg:px-10 py-5"
      >
        <p style={{ fontFamily: "var(--font-favorit), system-ui, sans-serif", fontSize: "12px", color: "#999" }}>
          © 2026 Brand Logic
        </p>
        <nav className="flex gap-5">
          {["Terms", "Privacy"].map((label) => (
            <Link
              key={label}
              href="#"
              style={{
                fontFamily: "var(--font-favorit), system-ui, sans-serif",
                fontSize: "12px",
                color: "#999",
                textDecoration: "none",
                transition: "color 0.15s ease",
              }}
              className="hover:text-[#1A1A1A]"
            >
              {label}
            </Link>
          ))}
        </nav>
      </footer>

      {/* ── Keyframe animations injected globally ── */}
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatCard0 {
          0%, 100% { translate: 0 0px; }
          50%       { translate: 0 -8px; }
        }
        @keyframes floatCard1 {
          0%, 100% { translate: 0 0px; }
          50%       { translate: 0 -12px; }
        }
        @keyframes floatCard2 {
          0%, 100% { translate: 0 0px; }
          50%       { translate: 0 -6px; }
        }
        @keyframes floatCard3 {
          0%, 100% { translate: 0 0px; }
          50%       { translate: 0 -10px; }
        }
      `}</style>
    </div>
  );
}
