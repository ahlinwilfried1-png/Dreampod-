import React, { useState, useRef, useEffect } from "react";

interface FloatingCustomerServiceProps {
  onClick: () => void;
}

export default function FloatingCustomerService({ onClick }: FloatingCustomerServiceProps) {
  // Position state (bottom-right default)
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    return {
      x: Math.max(16, window.innerWidth - 90),
      y: Math.max(100, window.innerHeight - 170)
    };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const posStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  // Recalculate boundary on resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.min(Math.max(10, prev.x), window.innerWidth - 80),
        y: Math.min(Math.max(10, prev.y), window.innerHeight - 80)
      }));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    posStartRef.current = { ...position };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasMovedRef.current = true;
    }
    const newX = Math.min(Math.max(10, posStartRef.current.x + dx), window.innerWidth - 80);
    const newY = Math.min(Math.max(10, posStartRef.current.y + dy), window.innerHeight - 80);
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    posStartRef.current = { ...position };
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasMovedRef.current = true;
    }
    const newX = Math.min(Math.max(10, posStartRef.current.x + dx), window.innerWidth - 80);
    const newY = Math.min(Math.max(10, posStartRef.current.y + dy), window.innerHeight - 80);
    setPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging]);

  const handleClick = () => {
    if (!hasMovedRef.current) {
      onClick();
    }
  };

  return (
    <div
      id="floating-customer-service-badge"
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
        touchAction: "none"
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
      className={`cursor-grab active:cursor-grabbing group select-none transition-transform duration-100 ${
        isDragging ? "scale-105 shadow-2xl" : "hover:scale-108"
      }`}
      title="Service Client (Déplaçable)"
    >
      <div className="relative w-18 h-18 sm:w-20 sm:h-20 drop-shadow-xl filter">
        {/* Pulsing Backlight */}
        <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping opacity-75 pointer-events-none" />

        {/* SVG Customer Service Badge matching the requested design */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full transform transition-transform duration-200"
        >
          <defs>
            {/* Curved Path for TOP Text "CUSTOMER SERVICE" */}
            <path
              id="topTextArc"
              d="M 32,100 A 68,68 0 0,1 168,100"
              fill="none"
            />
            {/* Curved Path for BOTTOM Text "Support Center" */}
            <path
              id="bottomTextArc"
              d="M 168,100 A 68,68 0 0,1 32,100"
              fill="none"
            />
            {/* Radial gradient for outer ring */}
            <radialGradient id="badgeBlue" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0a4b8c" />
              <stop offset="100%" stopColor="#052a52" />
            </radialGradient>
          </defs>

          {/* Serrated Starburst Badge Edge (32 points) */}
          <polygon
            points={Array.from({ length: 32 }, (_, i) => {
              const angle = (i * Math.PI) / 16;
              const r = i % 2 === 0 ? 98 : 88;
              const x = 100 + r * Math.cos(angle);
              const y = 100 + r * Math.sin(angle);
              return `${x},${y}`;
            }).join(" ")}
            fill="#09447e"
            stroke="#031e3b"
            strokeWidth="1.5"
          />

          {/* Outer Ring Border */}
          <circle cx="100" cy="100" r="88" fill="url(#badgeBlue)" stroke="#1a62ab" strokeWidth="2" />

          {/* Inner Light Ring Border */}
          <circle cx="100" cy="100" r="64" fill="#ffffff" stroke="#00305f" strokeWidth="4" />

          {/* Text: CUSTOMER SERVICE */}
          <text
            fill="#ffffff"
            fontSize="15"
            fontWeight="900"
            letterSpacing="1.8"
            fontFamily="Arial, sans-serif"
          >
            <textPath href="#topTextArc" startOffset="50%" textAnchor="middle">
              CUSTOMER SERVICE
            </textPath>
          </text>

          {/* Left Star */}
          <polygon
            points="24,100 27,93 34,93 28,88 30,81 24,85 18,81 20,88 14,93 21,93"
            fill="#ffffff"
            transform="translate(8, 0)"
          />

          {/* Text: Support Center */}
          <text
            fill="#ffffff"
            fontSize="14"
            fontWeight="bold"
            fontStyle="italic"
            fontFamily="Georgia, serif"
          >
            <textPath href="#bottomTextArc" startOffset="50%" textAnchor="middle">
              Support Center
            </textPath>
          </text>

          {/* Agent Avatar inside the white circle */}
          <g transform="translate(100, 100) scale(0.65) translate(-100, -100)">
            {/* Suit & Shoulders */}
            <path
              d="M 50,150 C 50,118 70,110 100,110 C 130,110 150,118 150,150 Z"
              fill="#22272e"
            />
            {/* White Shirt Collar */}
            <polygon points="82,110 100,135 118,110" fill="#ffffff" />
            {/* Red Tie */}
            <polygon points="96,118 104,118 106,145 100,155 94,145" fill="#dc2626" />

            {/* Neck */}
            <rect x="88" y="96" width="24" height="18" fill="#f5d0a9" rx="2" />

            {/* Head / Face */}
            <ellipse cx="100" cy="76" rx="28" ry="32" fill="#f5d0a9" />

            {/* Brown Hair */}
            <path
              d="M 72,70 C 70,48 85,42 100,42 C 115,42 130,48 128,70 C 122,58 112,50 100,50 C 88,50 78,58 72,70 Z"
              fill="#4a2e18"
            />

            {/* Glasses */}
            <rect x="76" y="66" width="18" height="13" rx="2" fill="none" stroke="#222" strokeWidth="2.5" />
            <rect x="106" y="66" width="18" height="13" rx="2" fill="none" stroke="#222" strokeWidth="2.5" />
            <line x1="94" y1="72" x2="106" y2="72" stroke="#222" strokeWidth="2.5" />

            {/* Eyes */}
            <circle cx="85" cy="72" r="2" fill="#222" />
            <circle cx="115" cy="72" r="2" fill="#222" />

            {/* Smile */}
            <path d="M 90,90 Q 100,98 110,90" fill="none" stroke="#a0522d" strokeWidth="2" strokeLinecap="round" />

            {/* Headset Band (Over Head) */}
            <path
              d="M 68,78 C 65,42 135,42 132,78"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Earcups */}
            <rect x="64" y="68" width="8" height="20" rx="3" fill="#1e293b" />
            <rect x="128" y="68" width="8" height="20" rx="3" fill="#1e293b" />

            {/* Microphone Boom & Mic Tip */}
            <path
              d="M 132,80 C 132,98 116,100 110,100"
              fill="none"
              stroke="#1e293b"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="108" cy="100" r="3.5" fill="#1e293b" />
          </g>
        </svg>

        {/* Small "SAV" badge tag overlay */}
        <div className="absolute -bottom-1 inset-x-0 flex justify-center">
          <span className="bg-gradient-to-r from-blue-600 to-sky-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md border border-white/80">
            SAV 24/7
          </span>
        </div>
      </div>
    </div>
  );
}
