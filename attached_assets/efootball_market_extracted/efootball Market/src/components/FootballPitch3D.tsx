import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Eye, Maximize2, RotateCcw, Sliders, Volume2, VolumeX } from 'lucide-react';

interface FootballPitch3DProps {
  interactive?: boolean;
}

export const FootballPitch3D: React.FC<FootballPitch3DProps> = ({ interactive = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pitchStyle, setPitchStyle] = useState<'emerald' | 'classic' | 'night' | 'cyan'>('emerald');
  const [tiltAngle, setTiltAngle] = useState<number>(58); // degrees pitch tilt
  const [rotation, setRotation] = useState<number>(-12); // degrees pitch rotation
  const [showTacticalDots, setShowTacticalDots] = useState<boolean>(true);
  const [stadiumLights, setStadiumLights] = useState<boolean>(true);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Ball animation state
  const ballPosRef = useRef({ x: 0.5, y: 0.5, vx: 0.002, vy: 0.0015 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
        canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Color definitions based on theme
    const getThemeColors = () => {
      switch (pitchStyle) {
        case 'classic':
          return {
            stripe1: '#1b4317',
            stripe2: '#23531e',
            lines: 'rgba(255, 255, 255, 0.85)',
            accent: '#f97316',
            skyTop: '#0f172a',
            skyBottom: '#1e293b',
            lightGlow: 'rgba(255, 255, 255, 0.15)'
          };
        case 'night':
          return {
            stripe1: '#0b1d28',
            stripe2: '#102736',
            lines: 'rgba(56, 189, 248, 0.75)',
            accent: '#38bdf8',
            skyTop: '#030712',
            skyBottom: '#0b1329',
            lightGlow: 'rgba(56, 189, 248, 0.25)'
          };
        case 'cyan':
          return {
            stripe1: '#082f49',
            stripe2: '#0c4a6e',
            lines: 'rgba(125, 211, 252, 0.85)',
            accent: '#f97316',
            skyTop: '#030712',
            skyBottom: '#0f172a',
            lightGlow: 'rgba(125, 211, 252, 0.2)'
          };
        case 'emerald':
        default:
          return {
            stripe1: '#064e3b',
            stripe2: '#047857',
            lines: 'rgba(255, 255, 255, 0.9)',
            accent: '#f97316',
            skyTop: '#020617',
            skyBottom: '#0f172a',
            lightGlow: 'rgba(16, 185, 129, 0.2)'
          };
      }
    };

    const render = () => {
      if (!ctx || !canvas) return;
      const width = canvas.width;
      const height = canvas.height;

      const colors = getThemeColors();

      // Clear Canvas & Background Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, colors.skyTop);
      skyGrad.addColorStop(0.6, colors.skyBottom);
      skyGrad.addColorStop(1, '#020617');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Render Stadium Floodlights Beam overlay
      if (stadiumLights) {
        ctx.save();
        // Top Left Floodlight
        const light1 = ctx.createRadialGradient(width * 0.15, height * 0.1, 10, width * 0.15, height * 0.1, width * 0.45);
        light1.addColorStop(0, colors.lightGlow);
        light1.addColorStop(1, 'transparent');
        ctx.fillStyle = light1;
        ctx.fillRect(0, 0, width, height);

        // Top Right Floodlight
        const light2 = ctx.createRadialGradient(width * 0.85, height * 0.1, 10, width * 0.85, height * 0.1, width * 0.45);
        light2.addColorStop(0, colors.lightGlow);
        light2.addColorStop(1, 'transparent');
        ctx.fillStyle = light2;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      // 3D Matrix Projection Setup
      ctx.save();
      
      // Center origin for 3D transformation
      const centerX = width / 2;
      const centerY = height * 0.58;
      ctx.translate(centerX, centerY);

      // Pitch Dimensions
      const pitchWidth = Math.min(width * 0.75, 750);
      const pitchHeight = pitchWidth * 1.45;

      // Transform logic (simulate 3D Perspective)
      const radTilt = (tiltAngle * Math.PI) / 180;
      const radRot = (rotation * Math.PI) / 180;

      ctx.rotate(radRot);
      ctx.scale(1, Math.cos(radTilt));

      // Draw Pitch Grass Base & Stripes
      const halfW = pitchWidth / 2;
      const halfH = pitchHeight / 2;

      // Outer Pitch Border Margin
      const margin = 35;
      ctx.fillStyle = colors.stripe1;
      ctx.beginPath();
      ctx.roundRect(-halfW - margin, -halfH - margin, pitchWidth + margin * 2, pitchHeight + margin * 2, 20);
      ctx.fill();

      // Pitch Grass Stripes (Horizontal alternating mowing patterns)
      const numStripes = 12;
      const stripeH = pitchHeight / numStripes;

      for (let i = 0; i < numStripes; i++) {
        ctx.fillStyle = i % 2 === 0 ? colors.stripe1 : colors.stripe2;
        ctx.fillRect(-halfW, -halfH + i * stripeH, pitchWidth, stripeH);
      }

      // Draw Pitch Markings (Boundary lines, center circle, boxes)
      ctx.strokeStyle = colors.lines;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = colors.lines;
      ctx.shadowBlur = 4;

      // Boundary Line
      ctx.strokeRect(-halfW, -halfH, pitchWidth, pitchHeight);

      // Halfway Line
      ctx.beginPath();
      ctx.moveTo(-halfW, 0);
      ctx.lineTo(halfW, 0);
      ctx.stroke();

      // Center Circle & Spot
      const centerRadius = pitchWidth * 0.18;
      ctx.beginPath();
      ctx.arc(0, 0, centerRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = colors.lines;
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      // Penalty Box Top
      const boxW = pitchWidth * 0.52;
      const boxH = pitchHeight * 0.18;
      ctx.strokeRect(-boxW / 2, -halfH, boxW, boxH);

      // Goal Area Top
      const goalAreaW = pitchWidth * 0.26;
      const goalAreaH = pitchHeight * 0.07;
      ctx.strokeRect(-goalAreaW / 2, -halfH, goalAreaW, goalAreaH);

      // Penalty Spot Top
      const penSpotYTop = -halfH + boxH * 0.65;
      ctx.beginPath();
      ctx.arc(0, penSpotYTop, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Penalty Arc Top
      ctx.beginPath();
      ctx.arc(0, penSpotYTop, centerRadius * 0.75, 0.1 * Math.PI, 0.9 * Math.PI, false);
      ctx.stroke();

      // Penalty Box Bottom
      ctx.strokeRect(-boxW / 2, halfH - boxH, boxW, boxH);

      // Goal Area Bottom
      ctx.strokeRect(-goalAreaW / 2, halfH - goalAreaH, goalAreaW, goalAreaH);

      // Penalty Spot Bottom
      const penSpotYBot = halfH - boxH * 0.65;
      ctx.beginPath();
      ctx.arc(0, penSpotYBot, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Penalty Arc Bottom
      ctx.beginPath();
      ctx.arc(0, penSpotYBot, centerRadius * 0.75, 1.1 * Math.PI, 1.9 * Math.PI, false);
      ctx.stroke();

      // Corner Arcs
      const cornerR = 16;
      // Top Left
      ctx.beginPath();
      ctx.arc(-halfW, -halfH, cornerR, 0, Math.PI * 0.5);
      ctx.stroke();
      // Top Right
      ctx.beginPath();
      ctx.arc(halfW, -halfH, cornerR, Math.PI * 0.5, Math.PI);
      ctx.stroke();
      // Bottom Left
      ctx.beginPath();
      ctx.arc(-halfW, halfH, cornerR, Math.PI * 1.5, Math.PI * 2);
      ctx.stroke();
      // Bottom Right
      ctx.beginPath();
      ctx.arc(halfW, halfH, cornerR, Math.PI, Math.PI * 1.5);
      ctx.stroke();

      // 3D Goals Net Frames
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      const goalNetW = goalAreaW * 0.7;
      const goalDepth = 18;

      // Top Goal
      ctx.strokeRect(-goalNetW / 2, -halfH - goalDepth, goalNetW, goalDepth);
      // Bottom Goal
      ctx.strokeRect(-goalNetW / 2, halfH, goalNetW, goalDepth);

      // Tactical Dots / Player Pins (4-3-3 Formation Visualization)
      if (showTacticalDots) {
        // Team A (Home Blue/Orange)
        const teamAPositions = [
          { x: 0, y: halfH * 0.85, role: 'GK' },
          { x: -halfW * 0.6, y: halfH * 0.55, role: 'LB' },
          { x: -halfW * 0.2, y: halfH * 0.62, role: 'CB' },
          { x: halfW * 0.2, y: halfH * 0.62, role: 'CB' },
          { x: halfW * 0.6, y: halfH * 0.55, role: 'RB' },
          { x: -halfW * 0.35, y: halfH * 0.3, role: 'CM' },
          { x: 0, y: halfH * 0.2, role: 'DMF' },
          { x: halfW * 0.35, y: halfH * 0.3, role: 'CM' },
          { x: -halfW * 0.6, y: halfH * 0.05, role: 'LWF' },
          { x: 0, y: halfH * 0.02, role: 'CF' },
          { x: halfW * 0.6, y: halfH * 0.05, role: 'RWF' },
        ];

        // Team B (Away Gold)
        const teamBPositions = [
          { x: 0, y: -halfH * 0.85, role: 'GK' },
          { x: -halfW * 0.5, y: -halfH * 0.5, role: 'DEF' },
          { x: 0, y: -halfH * 0.55, role: 'DEF' },
          { x: halfW * 0.5, y: -halfH * 0.5, role: 'DEF' },
          { x: -halfW * 0.3, y: -halfH * 0.25, role: 'MID' },
          { x: halfW * 0.3, y: -halfH * 0.25, role: 'MID' },
          { x: 0, y: -halfH * 0.08, role: 'AMF' },
        ];

        // Draw Team A
        teamAPositions.forEach(pos => {
          ctx.save();
          ctx.fillStyle = '#ea580c'; // Orange
          ctx.shadowColor = '#f97316';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // Draw Team B
        teamBPositions.forEach(pos => {
          ctx.save();
          ctx.fillStyle = '#312e81'; // Deep Indigo/Navy
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 7.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        });
      }

      // Ball Motion on Pitch
      const b = ballPosRef.current;
      b.x += b.vx;
      b.y += b.vy;

      if (b.x < 0.1 || b.x > 0.9) b.vx *= -1;
      if (b.y < 0.1 || b.y > 0.9) b.vy *= -1;

      const ballX = -halfW + b.x * pitchWidth;
      const ballY = -halfH + b.y * pitchHeight;

      ctx.save();
      // Ball shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(ballX + 3, ballY + 4, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ball body
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ballX, ballY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Ball pattern dot
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(ballX - 1, ballY - 1, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.restore(); // Restore 3D projection context

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [pitchStyle, tiltAngle, rotation, showTacticalDots, stadiumLights]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-90 select-none">
      
      {/* Dynamic 3D Canvas Background */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />

      {/* Top Floating Stadium Ambient Lighting Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/70 pointer-events-none" />

      {/* Pitch Controls Floating Button in Corner */}
      {interactive && (
        <div className="absolute bottom-4 right-4 z-20 pointer-events-auto">
          <div className="relative">
            {showControls && (
              <div className="absolute bottom-12 right-0 bg-indigo-950/95 border border-orange-500/40 text-white rounded-2xl p-4 shadow-2xl w-64 space-y-3 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center justify-between border-b border-indigo-900/80 pb-2">
                  <span className="text-xs font-black text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" /> 3D Stadium Field Controls
                  </span>
                  <button
                    onClick={() => setShowControls(false)}
                    className="text-slate-400 hover:text-white text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                {/* Pitch Style Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">Grass Turf Theme</label>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
                    <button
                      onClick={() => setPitchStyle('emerald')}
                      className={`px-2 py-1.5 rounded-lg border text-center transition-all ${
                        pitchStyle === 'emerald'
                          ? 'bg-emerald-600 text-white border-emerald-400'
                          : 'bg-indigo-900/60 text-slate-300 border-indigo-800 hover:bg-indigo-900'
                      }`}
                    >
                      eFootball Emerald
                    </button>
                    <button
                      onClick={() => setPitchStyle('classic')}
                      className={`px-2 py-1.5 rounded-lg border text-center transition-all ${
                        pitchStyle === 'classic'
                          ? 'bg-emerald-700 text-white border-emerald-400'
                          : 'bg-indigo-900/60 text-slate-300 border-indigo-800 hover:bg-indigo-900'
                      }`}
                    >
                      Classic Green
                    </button>
                    <button
                      onClick={() => setPitchStyle('night')}
                      className={`px-2 py-1.5 rounded-lg border text-center transition-all ${
                        pitchStyle === 'night'
                          ? 'bg-sky-600 text-white border-sky-400'
                          : 'bg-indigo-900/60 text-slate-300 border-indigo-800 hover:bg-indigo-900'
                      }`}
                    >
                      Stadium Night
                    </button>
                    <button
                      onClick={() => setPitchStyle('cyan')}
                      className={`px-2 py-1.5 rounded-lg border text-center transition-all ${
                        pitchStyle === 'cyan'
                          ? 'bg-cyan-700 text-white border-cyan-400'
                          : 'bg-indigo-900/60 text-slate-300 border-indigo-800 hover:bg-indigo-900'
                      }`}
                    >
                      Konami Neon
                    </button>
                  </div>
                </div>

                {/* Tilt Angle Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-300">
                    <span>3D Camera Tilt</span>
                    <span className="font-mono text-orange-400">{tiltAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="75"
                    value={tiltAngle}
                    onChange={(e) => setTiltAngle(Number(e.target.value))}
                    className="w-full accent-orange-500 h-1.5 bg-indigo-900 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Pitch Rotation Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-300">
                    <span>Pitch Angle Angle</span>
                    <span className="font-mono text-orange-400">{rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full accent-orange-500 h-1.5 bg-indigo-900 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Toggles */}
                <div className="pt-1 border-t border-indigo-900/80 flex items-center justify-between text-xs font-bold text-slate-300">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showTacticalDots}
                      onChange={(e) => setShowTacticalDots(e.target.checked)}
                      className="accent-orange-500 rounded"
                    />
                    <span>4-3-3 Player Pins</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stadiumLights}
                      onChange={(e) => setStadiumLights(e.target.checked)}
                      className="accent-orange-500 rounded"
                    />
                    <span>Floodlights</span>
                  </label>
                </div>

                {/* Reset button */}
                <button
                  onClick={() => {
                    setTiltAngle(58);
                    setRotation(-12);
                    setPitchStyle('emerald');
                    setShowTacticalDots(true);
                    setStadiumLights(true);
                  }}
                  className="w-full py-1.5 rounded-lg bg-indigo-900 hover:bg-indigo-800 text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-orange-400" /> Reset Camera &amp; Theme
                </button>
              </div>
            )}

            <button
              onClick={() => setShowControls(!showControls)}
              className="px-3.5 py-2.5 rounded-full bg-indigo-950/90 hover:bg-indigo-900 text-white font-extrabold text-xs shadow-xl border border-orange-500/50 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
              title="3D Pitch Background Settings"
            >
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>3D Pitch Angle</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
