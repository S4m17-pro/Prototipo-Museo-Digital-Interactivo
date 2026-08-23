import { useState, useEffect, useRef, useCallback } from 'react';
import { timeline } from '../data';
import type { Page, TimelineEvent } from '../data';

// ── LA RUTA — Cronología interactiva con dibujo por scroll ──────────────────

const typeColors: Record<string, string> = {
  fundacion: '#d32f2f',
  logro: '#22c55e',
  evento: '#3b82f6',
  investigacion: '#a855f7',
};

const typeLabels: Record<string, string> = {
  fundacion: 'Fundación',
  logro: 'Logro',
  evento: 'Evento',
  investigacion: 'Investigación',
};

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isDesktop;
}

interface CronologiaProps {
  navigate: (page: Page, id?: string) => void;
}

export function CronologiaPage({ navigate }: CronologiaProps) {
  const isDesktop = useIsDesktop();
  const containerRef = useRef<HTMLDivElement>(null);
  const drawPathRef = useRef<SVGPathElement>(null);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pathLenRef = useRef(0);

  const [pathD, setPathD] = useState('');
  const [viewBox, setViewBox] = useState('0 0 1000 4000');
  const [activeIndex, setActiveIndex] = useState(0);
  const [railVisible, setRailVisible] = useState(false);

  // Construir el camino serpenteante midiendo los nodos reales en el DOM
  const buildPath = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const w = container.offsetWidth;
    const h = container.offsetHeight;
    if (!w || !h) return;

    const cRect = container.getBoundingClientRect();
    const points = dotRefs.current
      .filter((d): d is HTMLDivElement => !!d && d.offsetParent !== null)
      .map(d => {
        const r = d.getBoundingClientRect();
        return { x: r.left - cRect.left + r.width / 2, y: r.top - cRect.top + r.height / 2 };
      })
      .sort((a, b) => a.y - b.y);

    if (points.length < 2) return;

    // Entrada desde el borde superior y salida hacia el inferior
    const all = [
      { x: points[0].x, y: -8 },
      ...points,
      { x: points[points.length - 1].x, y: h + 8 },
    ];

    let d = `M ${all[0].x} ${all[0].y}`;
    for (let i = 1; i < all.length; i++) {
      const prev = all[i - 1];
      const cur = all[i];
      const midY = (prev.y + cur.y) / 2;
      d += ` C ${prev.x} ${midY}, ${cur.x} ${midY}, ${cur.x} ${cur.y}`;
    }
    setViewBox(`0 0 ${w} ${h}`);
    setPathD(d);
  }, []);

  // Medir al montar y ante cambios de tamaño / breakpoint
  useEffect(() => {
    buildPath();
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => buildPath());
    ro.observe(container);
    // Segunda pasada tras asentar fuentes/layout
    const t = setTimeout(buildPath, 350);
    return () => {
      ro.disconnect();
      clearTimeout(t);
    };
  }, [buildPath, isDesktop]);

  // Preparar el trazo cuando cambia el camino
  useEffect(() => {
    const draw = drawPathRef.current;
    if (!draw || !pathD) return;
    const len = draw.getTotalLength();
    pathLenRef.current = len;
    draw.style.strokeDasharray = `${len}`;
    draw.style.strokeDashoffset = `${len}`;
  }, [pathD]);

  // Dibujar el camino según el progreso del scroll + hito activo
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const container = containerRef.current;
      const draw = drawPathRef.current;
      const len = pathLenRef.current;
      if (!container || !draw || !len) return;

      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (vh * 0.72 - rect.top) / rect.height));
      draw.style.strokeDashoffset = `${len * (1 - progress)}`;

      let idx = 0;
      dotRefs.current.forEach((dot, i) => {
        if (!dot || dot.offsetParent === null) return;
        const r = dot.getBoundingClientRect();
        if (r.top + r.height / 2 <= vh * 0.6) idx = i;
      });
      setActiveIndex(idx);
      setRailVisible(rect.top < vh * 0.55);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathD]);

  // Revelar tarjetas al entrar en pantalla
  useEffect(() => {
    const rows = rowRefs.current.filter((r): r is HTMLDivElement => !!r);
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(en => {
          if (en.isIntersecting) en.target.classList.add('route-in');
        });
      },
      { threshold: 0.18 }
    );
    rows.forEach(r => io.observe(r));
    return () => io.disconnect();
  }, [isDesktop]);

  const jumpTo = (i: number) => {
    rowRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const goToEvent = (ev: TimelineEvent) => {
    if (ev.itemId) navigate('detalle', ev.itemId);
    else navigate('explorar');
  };

  const setRowRef = (i: number) => (el: HTMLDivElement | null) => {
    rowRefs.current[i] = el;
  };
  const setDotRef = (i: number) => (el: HTMLDivElement | null) => {
    dotRefs.current[i] = el;
  };

  const Dot = ({ ev, active }: { ev: TimelineEvent; active: boolean }) => {
    const color = typeColors[ev.type];
    return (
      <div className="relative flex items-center justify-center" style={{ width: 48, height: 48 }}>
        <div
          className="absolute inset-0 rounded-full"
          style={{ border: `1px solid ${color}55`, background: `${color}12` }}
        />
        <div
          className={`rounded-full ${active ? 'ruta-dot-active' : ''}`}
          style={{
            width: active ? 16 : 12,
            height: active ? 16 : 12,
            background: color,
            boxShadow: `0 0 12px ${color}`,
            transition: 'width .25s, height .25s',
          }}
        />
      </div>
    );
  };

  const EventCard = ({ ev }: { ev: TimelineEvent }) => (
    <article
      onClick={() => goToEvent(ev)}
      className="museum-card ruta-item rounded p-5 md:p-6 max-w-md w-full cursor-pointer group"
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider"
          style={{
            background: `${typeColors[ev.type]}14`,
            color: typeColors[ev.type],
            border: `1px solid ${typeColors[ev.type]}30`,
          }}
        >
          {typeLabels[ev.type]}
        </span>
        <span className="font-mono text-xs font-bold lg:hidden" style={{ color: typeColors[ev.type] }}>
          {ev.year}
        </span>
      </div>
      <h3
        className="font-serif text-lg md:text-xl font-bold leading-snug mb-2 transition-colors group-hover:text-[#d32f2f]"
        style={{ color: 'var(--foreground)' }}
      >
        {ev.title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
        {ev.description}
      </p>
      <span className="inline-block mt-4 text-xs font-medium transition-transform duration-300 group-hover:translate-x-1" style={{ color: '#d32f2f' }}>
        {ev.itemId ? 'Ver pieza relacionada →' : 'Explorar colecciones →'}
      </span>
    </article>
  );

  const YearBlock = ({ ev }: { ev: TimelineEvent }) => (
    <div className="ruta-item select-none">
      <div className="font-serif text-[88px] xl:text-[110px] font-black leading-none text-primary-gradient">
        {ev.year}
      </div>
      <div className="font-mono text-[11px] uppercase tracking-widest mt-2" style={{ color: 'var(--muted-foreground)' }}>
        Década de los {String(ev.year).slice(2)}0
      </div>
    </div>
  );

  return (
    <div className="relative overflow-x-hidden">
      {/* ── HERO DE LA RUTA ── */}
      <section className="relative min-h-[72vh] flex items-center justify-center overflow-hidden px-4">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(211,47,47,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(211,47,47,0.5) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at 50% 30%, rgba(211,47,47,0.14), transparent 55%)' }}
        />

        <div className="relative z-10 text-center max-w-3xl animate-fadeInUp py-24">
          <button
            onClick={() => navigate('home')}
            className="inline-flex items-center gap-2 text-xs font-mono mb-10 hover:opacity-70 transition-opacity"
            style={{ color: 'var(--muted-foreground)' }}
          >
            ← Volver al inicio
          </button>

          <div className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: '#d32f2f' }}>
            Cronología · 1975 — 2024
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-black leading-none mb-6" style={{ color: 'var(--foreground)' }}>
            La <span className="text-primary-gradient italic">Ruta</span>
          </h1>
          <p className="text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-8" style={{ color: 'var(--secondary-foreground)' }}>
            Medio siglo de historia trazado en un solo camino. Desliza y acompaña cada hito que construyó el Programa de Ingeniería de Sistemas.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-14">
            {[
              ['50', 'años'],
              ['5', 'décadas'],
              ['10', 'hitos'],
            ].map(([n, label]) => (
              <span
                key={label}
                className="px-3 py-1 rounded-full text-xs font-mono"
                style={{ background: 'rgba(211,47,47,0.08)', border: '1px solid rgba(211,47,47,0.22)', color: 'var(--secondary-foreground)' }}
              >
                <b style={{ color: '#d32f2f' }}>{n}</b> {label}
              </span>
            ))}
          </div>

          <div className="ruta-scroll-hint flex flex-col items-center gap-1" style={{ color: '#d32f2f' }}>
            <span className="text-xl">↓</span>
            <span className="text-[11px] font-mono uppercase tracking-widest">Comienza a recorrer</span>
          </div>
        </div>
      </section>

      {/* ── CAMINO + HITOS ── */}
      <div ref={containerRef} className="relative mx-auto max-w-6xl pb-16">
        {/* Camino SVG */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={viewBox}
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="rutaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff6b6b" />
              <stop offset="100%" stopColor="#d32f2f" />
            </linearGradient>
          </defs>
          {pathD && (
            <>
              <path d={pathD} stroke="rgba(211,47,47,0.15)" strokeWidth={2} strokeDasharray="1 7" strokeLinecap="round" />
              <path
                ref={drawPathRef}
                d={pathD}
                stroke="url(#rutaGrad)"
                strokeWidth={3}
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 6px rgba(211,47,47,0.45))' }}
              />
            </>
          )}
        </svg>

        {/* Hitos */}
        {timeline.map((ev, i) => {
          if (!isDesktop) {
            // Móvil: línea implícita al costado izquierdo (los nodos casi verticales guían el trazo)
            return (
              <div key={ev.year} ref={setRowRef(i)} className="relative flex items-center gap-4 py-8 pl-3 pr-4 lg:hidden">
                <div ref={setDotRef(i)} className="relative z-10 shrink-0">
                  <Dot ev={ev} active={activeIndex === i} />
                </div>
                <EventCard ev={ev} />
              </div>
            );
          }
          const left = i % 2 === 0;
          return (
            <div key={ev.year} ref={setRowRef(i)} className="relative hidden lg:flex items-center min-h-[58vh]">
              {/* Mitad izquierda */}
              <div className={`w-1/2 flex ${left ? 'justify-end pr-[13%]' : 'justify-end pr-[9%]'}`}>
                {left ? <EventCard ev={ev} /> : <YearBlock ev={ev} />}
              </div>

              {/* Nodo sobre el camino */}
              <div
                ref={setDotRef(i)}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                style={{ left: left ? '42%' : '58%', top: '50%' }}
              >
                <Dot ev={ev} active={activeIndex === i} />
              </div>

              {/* Mitad derecha */}
              <div className={`w-1/2 flex ${left ? 'justify-start pl-[9%]' : 'justify-start pl-[13%]'}`}>
                {!left ? <EventCard ev={ev} /> : <YearBlock ev={ev} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── CIERRE DE LA RUTA ── */}
      <section className="relative text-center py-28 px-4 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at 50% 60%, rgba(211,47,47,0.12), transparent 60%)' }}
        />
        <div className="relative z-10 animate-fadeInUp">
          <div className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: 'var(--muted-foreground)' }}>
            Cierre de la ruta
          </div>
          <div className="font-serif text-6xl md:text-8xl font-black text-primary-gradient leading-none mb-5">
            50 Años
          </div>
          <p className="text-sm md:text-base max-w-lg mx-auto mb-9 leading-relaxed" style={{ color: 'var(--secondary-foreground)' }}>
            De 24 graduandos a una comunidad de miles de ingenieros. La ruta continúa con cada nueva generación.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => navigate('explorar')} className="btn-primary btn-float px-6 py-3 rounded text-sm">
              Explorar Colecciones
            </button>
            <button onClick={() => navigate('hall-fama')} className="btn-outline-primary px-6 py-3 rounded text-sm">
              Hall de la Fama
            </button>
          </div>
        </div>
      </section>

      {/* ── RIEL LATERAL DE PROGRESO ── */}
      <div
        className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-2.5 transition-opacity duration-500"
        style={{ opacity: railVisible ? 1 : 0, pointerEvents: railVisible ? 'auto' : 'none' }}
      >
        <span
          className="font-mono text-xs font-bold tracking-widest mb-1"
          style={{ writingMode: 'vertical-rl', color: '#d32f2f' }}
        >
          {timeline[activeIndex]?.year}
        </span>
        {timeline.map((ev, i) => (
          <button
            key={ev.year}
            onClick={() => jumpTo(i)}
            aria-label={`Ir a ${ev.year} — ${ev.title}`}
            title={`${ev.year} · ${ev.title}`}
            className="rounded-full transition-all duration-300 hover:scale-125"
            style={{
              width: activeIndex === i ? 10 : 6,
              height: activeIndex === i ? 10 : 6,
              background: activeIndex === i ? typeColors[ev.type] : 'rgba(211,47,47,0.28)',
              boxShadow: activeIndex === i ? `0 0 8px ${typeColors[ev.type]}` : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}
