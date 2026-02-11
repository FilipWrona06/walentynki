'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Petal {
  id: number; x: number; y: number;
  vx: number; vy: number;
  rot: number; rotV: number;
  opacity: number; size: number;
  wobble: number; wobbleV: number;
}

interface Spark {
  x: number; y: number;
  vx: number; vy: number;
  color: string;
  life: number; maxLife: number;
  size: number;
  trail: { x: number; y: number }[];
}

type Stage = 'envelope' | 'opening' | 'question' | 'yes';

const G = '#C9A84C';
const NO_W = 130;
const NO_H = 48;

export default function ValentineCard() {
  const [stage, setStage]                 = useState<Stage>('envelope');
  const [typed, setTyped]                 = useState('');
  const [typeDone, setTypeDone]           = useState(false);
  const [noCount, setNoCount]             = useState(0);
  const [noPos, setNoPos]                 = useState({ x: 0, y: 0 });
  const [noFear, setNoFear]               = useState(0);
  const [shaking, setShaking]             = useState(false);
  const [showLetter, setShowLetter]       = useState(false);
  const [noInitialized, setNoInitialized] = useState(false);

  const petalRef   = useRef<HTMLCanvasElement>(null);
  const sparkRef   = useRef<HTMLCanvasElement>(null);
  const cursorRef  = useRef<HTMLDivElement>(null);
  const petalsArr  = useRef<Petal[]>([]);
  const sparksArr  = useRef<Spark[]>([]);
  const petalAnim  = useRef(0);
  const sparkAnim  = useRef(0);

  const QUESTION = 'Czy zostaniesz moją walentynką?';

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!cursorRef.current) return;
      cursorRef.current.style.left = e.clientX + 'px';
      cursorRef.current.style.top  = e.clientY + 'px';
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  useEffect(() => {
    const canvas = petalRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const mkPetal = (scattered: boolean): Petal => ({
      id: Math.random(),
      x: Math.random() * window.innerWidth,
      y: scattered ? Math.random() * window.innerHeight : -20,
      vx: (Math.random() - 0.5) * 1.2,
      vy: 0.6 + Math.random() * 1.0,
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 2.5,
      opacity: 0.3 + Math.random() * 0.45,
      size: 8 + Math.random() * 14,
      wobble: Math.random() * Math.PI * 2,
      wobbleV: 0.018 + Math.random() * 0.025,
    });

    for (let i = 0; i < 30; i++) petalsArr.current.push(mkPetal(true));

    const draw = (p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
      g.addColorStop(0, '#FFCCD5');
      g.addColorStop(0.5, '#FF6B8A');
      g.addColorStop(1, '#B5294A');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.48, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(180,40,70,0.25)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(-p.size * 0.65, 0);
      ctx.lineTo(p.size * 0.65, 0);
      ctx.stroke();
      ctx.restore();
    };

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (Math.random() < 0.12) petalsArr.current.push(mkPetal(false));
      petalsArr.current = petalsArr.current.filter(p => {
        p.x += p.vx + Math.sin(p.wobble) * 0.7;
        p.y += p.vy;
        p.rot += p.rotV;
        p.wobble += p.wobbleV;
        if (p.y > canvas.height * 0.88) p.opacity -= 0.012;
        draw(p);
        return p.y < canvas.height + 20 && p.opacity > 0;
      });
      petalAnim.current = requestAnimationFrame(loop);
    };
    loop();

    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(petalAnim.current); };
  }, []);

  const launchFireworks = useCallback(() => {
    const canvas = sparkRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#FF1744','#FF4081','#FF80AB',G,'#FFD700','#FF69B4','#FFC0CB','#FF1493'];

    const burst = (x: number, y: number) => {
      for (let i = 0; i < 90; i++) {
        const angle = (i / 90) * Math.PI * 2 + Math.random() * 0.3;
        const speed = 1.5 + Math.random() * 9;
        sparksArr.current.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 70 + Math.random() * 50,
          maxLife: 70 + Math.random() * 50,
          size: 2.5 + Math.random() * 3,
          trail: [],
        });
      }
    };

    [[0.25,0.3],[0.75,0.28],[0.5,0.15],[0.12,0.45],[0.88,0.42],[0.5,0.45],[0.35,0.6],[0.65,0.55]]
      .forEach(([rx, ry], i) => setTimeout(() => burst(canvas.width * rx, canvas.height * ry), i * 180));

    const loop = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.13)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      sparksArr.current = sparksArr.current.filter(p => {
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 7) p.trail.shift();
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.14; p.vx *= 0.985;
        p.life--;

        const a = Math.max(0, p.life / p.maxLife);

        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let i = 1; i < p.trail.length; i++) ctx.lineTo(p.trail[i].x, p.trail[i].y);
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = a * 0.35;
          ctx.lineWidth = p.size * 0.6;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0, p.size * a), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = a;
        ctx.fill();
        ctx.globalAlpha = 1;

        return p.life > 0;
      });

      if (sparksArr.current.length > 0) {
        sparkAnim.current = requestAnimationFrame(loop);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    sparkAnim.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    if (stage !== 'question') return;
    let i = 0;
    const t = setInterval(() => {
      if (i < QUESTION.length) { setTyped(QUESTION.slice(0, ++i)); }
      else { setTypeDone(true); clearInterval(t); }
    }, 55);
    return () => clearInterval(t);
  }, [stage]);

  const openEnvelope = () => {
    setStage('opening');
    setTimeout(() => setStage('question'), 1300);
  };

  const handleYes = () => {
    setStage('yes');
    launchFireworks();
    setTimeout(() => setShowLetter(true), 700);
  };

  const handleNoHover = () => {
    const pad = 24;
    const maxX = window.innerWidth  - NO_W - pad;
    const maxY = window.innerHeight - NO_H - pad;

    const curX = noInitialized ? noPos.x : window.innerWidth / 2 - NO_W / 2;
    const curY = noInitialized ? noPos.y : window.innerHeight / 2 + 60;

    let nx = 0, ny = 0, attempts = 0;
    do {
      nx = pad + Math.random() * maxX;
      ny = pad + Math.random() * maxY;
      attempts++;
    } while (attempts < 25 && Math.abs(nx - curX) < 200 && Math.abs(ny - curY) < 150);

    nx = Math.min(Math.max(nx, pad), maxX);
    ny = Math.min(Math.max(ny, pad), maxY);

    setNoPos({ x: nx, y: ny });
    setNoInitialized(true);
    const next = noCount + 1;
    setNoCount(next);
    setNoFear(Math.min(1, next / 9));

    if (next >= 5) {
      setShaking(true);
      setTimeout(() => setShaking(false), 450);
    }
  };

  const NO_MSGS = [
    'Naprawdę? 🥺',
    'Nie rób mi tego... 💔',
    'Proszę! 🙏',
    'Moje serce pęka ❤️‍🩹',
    'Ale dlaczego?! 😭',
    'Daj mi szansę!',
    'Prawie tam jesteś... 💕',
    'Kliknij TAK!! 🎯',
    'Błagam Cię! 😫',
  ];
  const noMsg = noCount > 0 ? NO_MSGS[Math.min(noCount - 1, NO_MSGS.length - 1)] : null;

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,600;0,6..96,700;1,6..96,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Great+Vibes&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; cursor: none !important; }
        * { cursor: none !important; }

        @keyframes idleEnv   { 0%,100%{transform:translateY(0) rotate(-0.8deg) scale(1);}50%{transform:translateY(-12px) rotate(0.8deg) scale(1.01);} }
        @keyframes openEnv   { 0%{transform:translateY(0) scale(1);opacity:1;filter:blur(0);}50%{transform:translateY(-30px) scale(1.04);opacity:.8;filter:blur(1px);}100%{transform:translateY(-80px) scale(.9);opacity:0;filter:blur(6px);} }
        @keyframes cardIn    { 0%{transform:translateY(50px) scale(.92);opacity:0;filter:blur(8px);}100%{transform:translateY(0) scale(1);opacity:1;filter:blur(0);} }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);} }
        @keyframes hbeat     { 0%,100%{transform:scale(1);}14%{transform:scale(1.18);}28%{transform:scale(1);}42%{transform:scale(1.1);} }
        @keyframes goldFlow  { 0%{background-position:0% center;}100%{background-position:200% center;} }
        @keyframes shake     { 0%,100%{transform:translate(0,0);}12%{transform:translate(-9px,4px) rotate(-0.8deg);}25%{transform:translate(9px,-4px) rotate(.8deg);}38%{transform:translate(-7px,6px);}50%{transform:translate(7px,-2px);}62%{transform:translate(-5px,4px);}75%{transform:translate(5px,-2px);}88%{transform:translate(-2px,2px);} }
        @keyframes waxIn     { 0%{transform:scale(0) rotate(-200deg);opacity:0;}70%{transform:scale(1.15) rotate(8deg);opacity:1;}100%{transform:scale(1) rotate(0deg);opacity:1;} }
        @keyframes blink     { 0%,100%{opacity:1;}50%{opacity:0;} }
        @keyframes pulseGlow { 0%,100%{box-shadow:0 0 30px rgba(139,26,26,.35),inset 0 1px 0 rgba(201,168,76,.3);}50%{box-shadow:0 0 60px rgba(192,57,43,.55),0 0 100px rgba(139,26,26,.25),inset 0 1px 0 rgba(201,168,76,.5);} }
        @keyframes celebIn   { 0%{transform:scale(.85) translateY(40px);opacity:0;}60%{transform:scale(1.02) translateY(-4px);opacity:1;}100%{transform:scale(1) translateY(0);opacity:1;} }
        @keyframes floatH    { 0%,100%{transform:translateY(0) scale(1);}50%{transform:translateY(-8px) scale(1.05);} }
        @keyframes cursorA   { 0%,100%{transform:translate(-50%,-50%) scale(1);}50%{transform:translate(-50%,-50%) scale(1.4);} }
        @keyframes orbDrift  { 0%,100%{transform:translate(0,0) scale(1);}33%{transform:translate(30px,-20px) scale(1.05);}66%{transform:translate(-20px,15px) scale(.97);} }

        .env-idle  { animation: idleEnv 3.2s ease-in-out infinite; }
        .env-open  { animation: openEnv 1.3s cubic-bezier(.4,0,1,1) forwards; }
        .card-in   { animation: cardIn .9s cubic-bezier(.22,1,.36,1) forwards; }
        .fade-up   { animation: fadeUp .6s ease-out forwards; opacity: 0; }
        .hbeat     { animation: hbeat 2s ease-in-out infinite; }
        .shake-it  { animation: shake .45s ease-in-out; }
        .wax-in    { animation: waxIn .7s cubic-bezier(.34,1.56,.64,1) forwards; }
        .celeb-in  { animation: celebIn .8s cubic-bezier(.22,1,.36,1) forwards; }
        .float-h   { animation: floatH 2.8s ease-in-out infinite; }
        .cursor-h  { animation: cursorA 1.8s ease-in-out infinite; }
        .orb-drift { animation: orbDrift 12s ease-in-out infinite; }

        .gold-text {
          background: linear-gradient(90deg,#8a5d00,${G},#f5d78e,${G},#8a5d00);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: goldFlow 5s linear infinite;
        }

        .velvet { background: radial-gradient(ellipse at 25% 15%,#3A0A0A 0%,#1A0008 45%,#0D0005 100%); }

        .glass {
          background: rgba(255,248,240,.06);
          backdrop-filter: blur(18px) saturate(1.4);
          border: 1px solid rgba(201,168,76,.22);
        }

        .btn-yes {
          background: linear-gradient(135deg,#7A1515 0%,#B02020 40%,#D04040 60%,#7A1515 100%);
          background-size: 200% 100%;
          border: 1px solid rgba(201,168,76,.55);
          animation: pulseGlow 3s ease-in-out infinite;
          letter-spacing: .18em;
          transition: background-position .4s ease, transform .25s cubic-bezier(.34,1.56,.64,1);
        }
        .btn-yes:hover { background-position: 100% 0; transform: scale(1.07) translateY(-3px) !important; }
        .btn-yes:active { transform: scale(.98) !important; }

        .no-btn {
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.1);
          color: rgba(255,255,255,.28);
          letter-spacing: .1em;
          transition: opacity .3s, transform .3s, background .2s;
        }
        .no-btn:hover { background: rgba(255,255,255,.07); }

        .orn-line { flex:1; height:1px; background: linear-gradient(90deg,transparent,rgba(201,168,76,.5),transparent); }

        .c { position:absolute; width:28px; height:28px; border-color:rgba(201,168,76,.35); border-style:solid; }
        .c-tl { top:18px;left:18px;border-width:1px 0 0 1px;border-radius:3px 0 0 0; }
        .c-tr { top:18px;right:18px;border-width:1px 1px 0 0;border-radius:0 3px 0 0; }
        .c-bl { bottom:18px;left:18px;border-width:0 0 1px 1px;border-radius:0 0 0 3px; }
        .c-br { bottom:18px;right:18px;border-width:0 1px 1px 0;border-radius:0 0 3px 0; }
      `}</style>

      {/* Cursor */}
      <div ref={cursorRef} className="cursor-h" style={{
        position:'fixed', pointerEvents:'none', zIndex:9999,
        fontSize:18, lineHeight:1, transform:'translate(-50%,-50%)',
        filter:'drop-shadow(0 0 4px rgba(255,100,100,.7))',
      }}>❤️</div>

      {/* Petals */}
      <canvas ref={petalRef} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:1 }} />

      {/* Fireworks */}
      <canvas ref={sparkRef} style={{
        position:'fixed', inset:0, pointerEvents:'none',
        zIndex: stage === 'yes' ? 2 : -1,
      }} />

      {/* Scene */}
      <div
        className={`velvet min-h-screen w-full relative overflow-hidden flex items-center justify-center ${shaking ? 'shake-it' : ''}`}
        style={{ fontFamily:"'Cormorant Garamond', serif" }}
      >
        {/* Orbs */}
        <div className="orb-drift" style={{ position:'absolute',top:'8%',left:'5%',width:480,height:480,background:'radial-gradient(circle,rgba(120,20,20,.22) 0%,transparent 68%)',pointerEvents:'none',zIndex:0 }} />
        <div className="orb-drift" style={{ position:'absolute',bottom:'6%',right:'4%',width:560,height:560,animationDelay:'-4s',background:'radial-gradient(circle,rgba(201,168,76,.09) 0%,transparent 65%)',pointerEvents:'none',zIndex:0 }} />
        <div style={{ position:'absolute',top:'45%',right:'12%',width:300,height:300,background:'radial-gradient(circle,rgba(100,10,40,.18) 0%,transparent 70%)',pointerEvents:'none',zIndex:0 }} />

        {/* ── ENVELOPE ── */}
        {(stage === 'envelope' || stage === 'opening') && (
          <div style={{ position:'relative', zIndex:10, textAlign:'center' }}>
            <div className="fade-up" style={{ animationDelay:'.2s', color:'rgba(201,168,76,.65)', fontSize:12, letterSpacing:'.45em', textTransform:'uppercase', fontStyle:'italic', marginBottom:52 }}>
              — Tylko dla Ciebie —
            </div>

            <button onClick={openEnvelope} className={stage==='opening'?'env-open':'env-idle'}
              style={{ background:'none', border:'none', display:'block', margin:'0 auto', padding:0 }}>
              <svg width="300" height="215" viewBox="0 0 300 215" fill="none" style={{ filter:'drop-shadow(0 8px 40px rgba(139,26,26,.5))' }}>
                <ellipse cx="150" cy="210" rx="130" ry="8" fill="rgba(0,0,0,.35)" />
                <rect x="6" y="45" width="288" height="162" rx="10" fill="url(#envG)" stroke="rgba(201,168,76,.55)" strokeWidth="1.5" />
                <path d="M6 207 L150 122 L294 207" fill="#150606" stroke="rgba(201,168,76,.3)" strokeWidth="1" />
                <path d="M6 45 L6 207 L150 122 Z" fill="#1B0808" stroke="rgba(201,168,76,.2)" strokeWidth=".8" />
                <path d="M294 45 L294 207 L150 122 Z" fill="#1B0808" stroke="rgba(201,168,76,.2)" strokeWidth=".8" />
                <path d="M6 45 L150 128 L294 45 L294 12 Q294 6 288 6 L12 6 Q6 6 6 12 Z" fill="url(#flapG)" stroke="rgba(201,168,76,.55)" strokeWidth="1.5" />
                <path d="M30 6 L150 100 L270 6" fill="none" stroke="rgba(201,168,76,.12)" strokeWidth="1" />
                <circle cx="150" cy="100" r="30" fill="url(#waxG)" stroke="rgba(201,168,76,.9)" strokeWidth="1.8" className="wax-in" />
                <circle cx="150" cy="100" r="23" fill="none" stroke="rgba(201,168,76,.5)" strokeWidth=".8" />
                <text x="150" y="107" textAnchor="middle" fill="#C9A84C" fontSize="22" fontFamily="Georgia, serif">❧</text>
                {[[22,58],[278,58],[22,196],[278,196]].map(([cx,cy],i)=>(
                  <circle key={i} cx={cx} cy={cy} r="3.5" fill="none" stroke="rgba(201,168,76,.4)" strokeWidth="1" />
                ))}
                <path d="M35 58 L95 58" stroke="rgba(201,168,76,.25)" strokeWidth=".8"/>
                <path d="M205 58 L265 58" stroke="rgba(201,168,76,.25)" strokeWidth=".8"/>
                <defs>
                  <linearGradient id="envG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1E0A0A"/><stop offset="100%" stopColor="#130505"/></linearGradient>
                  <linearGradient id="flapG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#280D0D"/><stop offset="100%" stopColor="#1A0808"/></linearGradient>
                  <radialGradient id="waxG" cx="40%" cy="35%"><stop offset="0%" stopColor="#C0302A"/><stop offset="60%" stopColor="#8B1A1A"/><stop offset="100%" stopColor="#5A0E0E"/></radialGradient>
                </defs>
              </svg>
            </button>

            <div className="fade-up" style={{ animationDelay:'.9s', marginTop:44, color:stage==='opening'?'rgba(201,168,76,.5)':'rgba(255,255,255,.22)', fontSize:12, letterSpacing:'.3em', textTransform:'uppercase' }}>
              {stage==='opening' ? '✦  Otwieranie  ✦' : '↑  dotknij, aby otworzyć  ↑'}
            </div>
          </div>
        )}

        {/* ── QUESTION ── */}
        {stage === 'question' && (
          <div className="card-in" style={{ position:'relative', zIndex:10, width:'100%', maxWidth:680, padding:'20px 16px' }}>
            <div className="glass" style={{ borderRadius:28, padding:'clamp(36px,6vw,56px) clamp(28px,5vw,52px)', textAlign:'center', position:'relative' }}>
              <div className="c c-tl"/><div className="c c-tr"/><div className="c c-bl"/><div className="c c-br"/>

              <div className="hbeat" style={{ fontSize:'clamp(52px,8vw,72px)', marginBottom:20 }}>❤️</div>

              <div style={{ color:'rgba(201,168,76,.6)', fontSize:11, letterSpacing:'.45em', textTransform:'uppercase', marginBottom:20 }}>
                Walentynki · MMXXVI
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:36 }}>
                <div className="orn-line"/><span style={{ color:'rgba(201,168,76,.6)', fontSize:16 }}>✦</span><div className="orn-line"/>
              </div>

              <h1 style={{ fontFamily:"'Bodoni Moda', serif", fontSize:'clamp(26px,4.5vw,46px)', fontWeight:600, color:'#FFF8F0', letterSpacing:'.03em', lineHeight:1.35, minHeight:'2.8em' }}>
                {typed}
                <span style={{ display:'inline-block', width:2, height:'.85em', background:G, marginLeft:3, verticalAlign:'middle', animation: typeDone?'none':'blink .9s step-end infinite', opacity: typeDone?0:1, transition:'opacity .5s' }} />
              </h1>

              {typeDone && (
                <div className="fade-up" style={{ animationDelay:'.15s', marginTop:44 }}>
                  <button onClick={handleYes} className="btn-yes" style={{ display:'block', margin:'0 auto', color:'#FFF8F0', padding:'17px 58px', borderRadius:100, fontSize:17, fontFamily:"'Cormorant Garamond', serif", fontWeight:500 }}>
                    TAK, zostanę 💕
                  </button>

                  {/* NO — clamped to viewport */}
                  <button
                    onMouseEnter={handleNoHover}
                    onTouchStart={handleNoHover}
                    className="no-btn"
                    style={{
                      marginTop:16, padding:'13px 0', borderRadius:100, fontSize:15,
                      fontFamily:"'Cormorant Garamond', serif",
                      width: NO_W,
                      position: noInitialized ? 'fixed' : 'relative',
                      left: noInitialized ? noPos.x : 'auto',
                      top:  noInitialized ? noPos.y  : 'auto',
                      zIndex: 200,
                      transform: `scale(${Math.max(0.45, 1 - noFear * 0.55)})`,
                      opacity: Math.max(0.1, 1 - noFear * 0.8),
                    }}
                  >
                    Nie
                  </button>

                  {noMsg && (
                    <div key={noCount} className="fade-up" style={{ animationDelay:'0s', marginTop: noInitialized ? 72 : 16, color:'#F2A5A5', fontSize:20, fontStyle:'italic' }}>
                      {noMsg}
                    </div>
                  )}

                  {!noInitialized && (
                    <p style={{ marginTop:30, color:'rgba(255,255,255,.2)', fontSize:12, letterSpacing:'.18em', fontStyle:'italic' }}>
                      psst — najedź na „Nie" 😏
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CELEBRATION ── */}
        {stage === 'yes' && showLetter && (
          <div className="celeb-in" style={{ position:'relative', zIndex:10, width:'100%', maxWidth:740, padding:'20px 16px', textAlign:'center' }}>
            <div className="hbeat" style={{ fontSize:'clamp(60px,10vw,90px)', marginBottom:12 }}>💖</div>

            <h1 className="gold-text" style={{ fontFamily:"'Bodoni Moda', serif", fontSize:'clamp(38px,7vw,76px)', fontWeight:700, letterSpacing:'.04em', lineHeight:1.1, marginBottom:10 }}>
              Wiedziałem! 🎉
            </h1>

            <div style={{ color:'rgba(201,168,76,.55)', fontSize:11, letterSpacing:'.45em', textTransform:'uppercase', marginBottom:36 }}>
              ✦ &nbsp; Walentynki 2026 &nbsp; ✦
            </div>

            <div className="glass" style={{ borderRadius:22, padding:'clamp(32px,5vw,48px) clamp(24px,4vw,44px)', textAlign:'left', position:'relative', overflow:'hidden' }}>
              <div className="c c-tl"/><div className="c c-tr"/><div className="c c-bl"/><div className="c c-br"/>
              <div style={{ position:'absolute', top:10, left:20, fontFamily:'Georgia, serif', fontSize:100, color:'rgba(201,168,76,.1)', lineHeight:1, pointerEvents:'none' }}>"</div>

              <p style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'clamp(17px,2.4vw,22px)', color:'rgba(255,248,240,.92)', lineHeight:1.95, marginBottom:22, paddingLeft:12 }}>
                Jesteś najpiękniejszą częścią mojego świata. Każdy moment z Tobą
                to skarb, który noszę w sercu — każdy Twój uśmiech rozjaśnia mi dzień
                bardziej niż jakiekolwiek inne słońce.
              </p>

              <p style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'clamp(16px,2vw,20px)', color:'rgba(255,248,240,.72)', lineHeight:1.9, paddingLeft:12 }}>
                Dziękuję, że powiedziałaś <em style={{ color:'rgba(255,248,240,.9)' }}>tak</em>. Kocham Cię bardziej,
                niż słowa potrafią wyrazić — i zamierzam Ci to udowadniać każdego dnia.
              </p>

              <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(201,168,76,.4),transparent)', margin:'28px 0' }} />

              <div style={{ textAlign:'right' }}>
                <p style={{ fontFamily:"'Great Vibes', cursive", fontSize:'clamp(30px,4vw,44px)', color:G, marginBottom:4 }}>Na zawsze Twój</p>
                <p style={{ color:'rgba(201,168,76,.45)', fontSize:11, letterSpacing:'.32em', textTransform:'uppercase' }}>14 · II · MMXXVI</p>
              </div>
            </div>

            <div style={{ display:'flex', justifyContent:'center', gap:20, marginTop:34 }}>
              {['💝','💖','💗','💘','💕'].map((h,i)=>(
                <span key={i} className="float-h" style={{ fontSize:'clamp(22px,3.5vw,30px)', animationDelay:`${i*.18}s` }}>{h}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}