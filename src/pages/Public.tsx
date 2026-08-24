import { useState, useEffect, useMemo, useLayoutEffect, useRef } from 'react';
import { collections, researchGroups, users } from '../data';
import type { Page, TimelineEvent } from '../data';
import { useData } from '../context/DataContext';
import { ContentCard, StatusBadge, SectionHeader, TagList, CategoryBadge } from '../components/UI';

// ── HERO TIMELINE (selector por década) ─────────────────────────────────────

const typeColors: Record<string, string> = {
  fundacion: '#d32f2f', logro: '#22c55e', evento: '#3b82f6', investigacion: '#a855f7'
};

function formatNewsDate(d: string) {
  const date = new Date(`${d}T00:00:00`);
  return isNaN(date.getTime())
    ? d
    : date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}

function HeroTimeline({ navigate }: { navigate: (page: Page) => void }) {
  const { timeline } = useData();
  const [active, setActive] = useState(0);
  const [autoOn, setAutoOn] = useState(true);
  const [hovered, setHovered] = useState(false);

  const decadeGroups = useMemo(
    () =>
      Object.entries(
        timeline.reduce<Record<number, TimelineEvent[]>>((acc, ev) => {
          const d = Math.floor(ev.year / 10) * 10;
          (acc[d] ||= []).push(ev);
          return acc;
        }, {})
      )
        .map(([decade, events]) => ({ decade: Number(decade), events }))
        .sort((a, b) => a.decade - b.decade),
    [timeline]
  );

  useEffect(() => {
    if (!autoOn || hovered) return;
    const id = setInterval(() => setActive(a => (a + 1) % decadeGroups.length), 5000);
    return () => clearInterval(id);
  }, [autoOn, hovered, decadeGroups]);

  const group = decadeGroups[active];
  const [main, ...rest] = group.events;

  return (
    <div
      className="hidden lg:block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="mb-4">
        <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: '#d32f2f' }}>Cronología</div>
        <div className="text-sm font-serif font-semibold" style={{ color: 'var(--foreground)' }}>Medio siglo de hitos</div>
      </div>

      {/* Décadas */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {decadeGroups.map((g, i) => (
          <button
            key={g.decade}
            onClick={() => { setActive(i); setAutoOn(false); }}
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${i === active ? "" : "hover:border-[rgba(211,47,47,0.55)]"}`}
            style={i === active
              ? { background: '#d32f2f', color: '#ffffff', boxShadow: '0 2px 10px rgba(211,47,47,0.35)', border: '1px solid #d32f2f' }
              : { background: 'transparent', color: 'var(--secondary-foreground)', border: '1px solid rgba(211,47,47,0.25)' }}
          >
            {"'"}{String(g.decade).slice(2)}0s
          </button>
        ))}
      </div>

      {/* Contenido flotante de la década */}
      <div key={active} className="animate-fadeInUp relative pl-6 min-h-[220px]">
        {/* Línea decorativa vertical */}
        <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full"
          style={{ background: 'linear-gradient(to bottom, #d32f2f, rgba(211,47,47,0.05))' }} />

        {/* Hito principal */}
        <button onClick={() => navigate('explorar')} className="block w-full text-left group">
          <span className="font-serif text-[64px] font-black leading-none text-primary-gradient block transition-transform duration-300 group-hover:translate-x-1">
            {main.year}
          </span>
          <span className="inline-block text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider mt-2.5"
            style={{ background: `${typeColors[main.type]}14`, color: typeColors[main.type], border: `1px solid ${typeColors[main.type]}30` }}>
            {main.type.charAt(0).toUpperCase() + main.type.slice(1)}
          </span>
          <div className="font-serif text-lg font-bold mt-2 leading-snug transition-colors" style={{ color: 'var(--foreground)' }}>
            {main.title}
          </div>
          <p className="text-sm leading-relaxed mt-1.5 max-w-md" style={{ color: 'var(--muted-foreground)' }}>
            {main.description}
          </p>
        </button>

        {/* Hitos secundarios */}
        {rest.length > 0 && (
          <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(211,47,47,0.12)' }}>
            <div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--muted-foreground)' }}>
              También en esta década
            </div>
            <div className="flex flex-col gap-2">
              {rest.map(ev => (
                <button key={ev.year} onClick={() => navigate('explorar')}
                  className="flex items-baseline gap-3 text-left w-full hover:opacity-70 transition-opacity">
                  <span className="font-mono text-xs font-bold flex-shrink-0" style={{ color: typeColors[ev.type] }}>
                    {ev.year}
                  </span>
                  <span className="text-xs truncate" style={{ color: 'var(--secondary-foreground)' }}>
                    {ev.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <button onClick={() => navigate('cronologia')} className="text-xs btn-outline-primary px-3 py-1.5 rounded mt-4">
        Ver línea completa →
      </button>
    </div>
  );
}

// ── NEWS CAROUSEL (rotación automática) ─────────────────────────────────────

function NewsCarousel({ navigate }: { navigate: (page: Page, id?: string) => void }) {
  const { news } = useData();
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (hovered || news.length === 0) return;
    const id = setInterval(() => setActive(a => (a + 1) % news.length), 5000);
    return () => clearInterval(id);
  }, [hovered, news]);

  const go = (i: number) => setActive((i + news.length) % news.length);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 pt-16">
      <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: '#d32f2f' }}>Mantente informado</div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Noticias</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => go(active - 1)} aria-label="Noticia anterior"
            className="w-9 h-9 rounded-full flex items-center justify-center text-lg transition-transform hover:-translate-x-0.5"
            style={{ border: '1px solid var(--border)', color: '#d32f2f', background: 'var(--card)' }}>
            ‹
          </button>
          <button onClick={() => go(active + 1)} aria-label="Noticia siguiente"
            className="w-9 h-9 rounded-full flex items-center justify-center text-lg transition-transform hover:translate-x-0.5"
            style={{ border: '1px solid var(--border)', color: '#d32f2f', background: 'var(--card)' }}>
            ›
          </button>
        </div>
      </div>

      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative rounded-lg overflow-hidden h-[340px] sm:h-[400px] group"
        style={{ border: '1px solid var(--border)' }}
      >
        {news.map((n, i) => (
          <article
            key={n.id}
            aria-hidden={i !== active}
            onClick={() => navigate('explorar', n.id)}
            className={`absolute inset-0 transition-opacity duration-700 cursor-pointer ${i === active ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
          >
            <img src={n.image} alt={n.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.15) 100%)' }} />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-3xl">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="text-xs font-mono px-2 py-0.5 rounded uppercase tracking-wider"
                  style={{ background: 'rgba(211, 47, 47,0.85)', color: '#ffffff' }}>
                  {n.category}
                </span>
                <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>{formatNewsDate(n.date)}</span>
              </div>
              <h3 className="font-serif text-xl md:text-3xl font-bold leading-snug mb-2" style={{ color: '#ffffff' }}>
                {n.title}
              </h3>
              <p className="text-sm leading-relaxed line-clamp-2 max-w-2xl" style={{ color: 'rgba(255,255,255,0.75)' }}>
                {n.excerpt}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-4">
        {news.map((_, i) => (
          <button key={i} onClick={() => go(i)} aria-label={`Ir a la noticia ${i + 1}`}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{ width: i === active ? 24 : 8, background: i === active ? '#d32f2f' : 'var(--border)' }} />
        ))}
      </div>
    </section>
  );
}

// ── HOME ────────────────────────────────────────────────────────────────────

interface HomeProps {
  navigate: (page: Page, id?: string) => void;
  role: string;
}

export function HomePage({ navigate, role }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { contentItems, achievements } = useData();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('buscar');
  };

  const published = contentItems.filter(i => i.status === 'publicado' || i.status === 'institucional');

  return (
    <div>
      {/* Hero — Two-column: left content + right compact timeline */}
      <section className="relative min-h-[82vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1562774053-701939374585?w=1400&h=900&fit=crop&auto=format"
            alt="Campus universitario"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="hero-overlay absolute inset-0" />
        </div>

        {/* Decorative grid lines */}
        <div className="absolute inset-0 z-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(211, 47, 47,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(211, 47, 47,0.5) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Title, description, CTAs */}
            <div className="animate-fadeInUp">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-mono"
                style={{ background: 'rgba(211, 47, 47,0.1)', border: '1px solid rgba(211, 47, 47,0.25)', color: '#d32f2f' }}>
                ✦ 50 Años de Excelencia Académica · 1975–2025
              </div>

              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-black leading-none mb-5" style={{ color: 'var(--foreground)' }}>
                Museo Digital<br />
                <span className="text-primary-gradient italic">Interactivo</span>
              </h1>
              <p className="text-base md:text-lg max-w-lg mb-8 leading-relaxed" style={{ color: 'var(--secondary-foreground)' }}>
                Archivo vivo del Programa de Ingeniería de Sistemas — Universidad Libre. Historia, investigación y logros que inspiran generaciones.
              </p>

              {/* Search bar */}
              <form onSubmit={handleSearch} className="flex gap-2 max-w-md mb-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar proyectos, investigaciones…"
                  className="museum-input flex-1 px-4 py-3 rounded text-sm"
                />
                <button type="submit" className="btn-primary px-5 py-3 rounded text-sm whitespace-nowrap">
                  Buscar
                </button>
              </form>

              <div className="flex flex-wrap gap-3">
                <button onClick={() => navigate('explorar')} className="btn-outline-primary btn-float px-5 py-2.5 rounded text-sm">
                  Explorar Colecciones
                </button>
                <button onClick={() => navigate('hall-fama')} className="btn-outline-primary px-5 py-2.5 rounded text-sm">
                  Hall de la Fama
                </button>
                {role === 'visitante' && (
                  <button onClick={() => navigate('login')}
                    className="px-5 py-2.5 rounded text-sm font-medium transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--card-foreground)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    ¿Eres parte del programa? →
                  </button>
                )}
              </div>
            </div>

            {/* Right — Timeline por décadas */}
            <HeroTimeline navigate={navigate} />
          </div>
        </div>
      </section>

      {/* Noticias */}
      <NewsCarousel navigate={navigate} />

      {/* Collections */}
      <section id="colecciones" className="max-w-7xl mx-auto px-4 md:px-8 py-16 scroll-mt-24">
        <SectionHeader label="Archivo" title="Colecciones" subtitle="Seis colecciones temáticas que documentan la trayectoria del programa." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map(col => (
            <button key={col.id} onClick={() => navigate('explorar')}
              className="museum-card rounded overflow-hidden text-left group">
              <div className="relative h-40 overflow-hidden bg-gray-900">
                <img src={col.image} alt={col.title} className="w-full h-full object-cover opacity-70 transition-all duration-500 group-hover:opacity-90 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 70%)' }} />
                <span className="absolute bottom-3 left-3 text-2xl">{col.icon}</span>
                <span className="absolute top-3 right-3 text-xs font-mono px-2 py-0.5 rounded"
                  style={{ background: 'rgba(0,0,0,0.6)', color: '#d32f2f', border: '1px solid rgba(211, 47, 47,0.3)' }}>
                  {col.count} piezas
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-serif font-semibold text-base mb-1" style={{ color: 'var(--card-foreground)' }}>{col.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{col.description}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <hr className="section-divider max-w-7xl mx-auto px-8" />

      {/* Logros Destacados */}
      <section id="logros" className="max-w-7xl mx-auto px-4 md:px-8 py-16 scroll-mt-24">
        <SectionHeader label="Premios" title="Logros Destacados" subtitle="Reconocimientos que avalan la excelencia del programa." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {achievements.slice(0, 3).map(ach => (
            <div key={ach.id} className="museum-card rounded overflow-hidden flex flex-col group">
              <div className="h-32 bg-gray-900 relative">
                 <img src={ach.image} alt={ach.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                 <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center border border-primary/30">🏆</div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                 <div className="text-xs font-mono mb-1" style={{ color: '#d32f2f' }}>{ach.year} · {ach.institution}</div>
                 <h4 className="font-serif font-semibold text-sm mb-2" style={{ color: 'var(--card-foreground)' }}>{ach.title}</h4>
                 <p className="text-xs line-clamp-2 mt-auto" style={{ color: 'var(--muted-foreground)' }}>{ach.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="section-divider max-w-7xl mx-auto px-8" />

      {/* Investigación + Eventos (combined lightweight section) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <SectionHeader label="Comunidad" title="Investigación y Eventos" subtitle="La actividad académica que mantiene vivo el programa." />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left — Research groups */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-xs font-mono uppercase tracking-widest" style={{ color: '#d32f2f' }}>Grupos y Semilleros</div>
            </div>
            <div className="flex flex-col">
              {researchGroups.map((g, i) => (
                <div key={g.id}
                  className="flex items-center gap-3 py-3 group cursor-pointer"
                  style={{ borderBottom: i < researchGroups.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div className="w-8 h-8 rounded flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: 'rgba(211, 47, 47,0.08)' }}>
                    {g.category === 'semillero' ? '🔬' : '🧪'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-serif font-semibold group-hover:text-primary transition-colors" style={{ color: 'var(--card-foreground)' }}>
                      {g.name}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {g.lead}
                    </div>
                  </div>
                  <div className="text-xs font-mono px-2 py-0.5 rounded flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--muted-foreground)' }}>
                    {g.members} miembros
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('semilleros')} className="text-xs btn-outline-primary px-3 py-1.5 rounded mt-4">
              Ver todos los grupos →
            </button>
          </div>

          {/* Right — Upcoming events */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-xs font-mono uppercase tracking-widest" style={{ color: '#d32f2f' }}>Agenda</div>
            </div>
            <div className="flex flex-col">
              {contentItems.filter(i => i.category === 'eventos').slice(0, 3).map((ev, i, arr) => (
                <div key={ev.id}
                  className="flex gap-3 py-3 group cursor-pointer"
                  style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div className="w-10 flex-shrink-0 text-center rounded p-1"
                    style={{ background: 'rgba(211, 47, 47,0.08)', border: '1px solid rgba(211, 47, 47,0.15)' }}>
                    <div className="text-xs font-mono font-bold leading-none" style={{ color: '#d32f2f' }}>
                      {new Date(ev.date).toLocaleDateString('es-CO', { day: 'numeric' })}
                    </div>
                    <div className="text-[10px] leading-none mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                      {new Date(ev.date).toLocaleDateString('es-CO', { month: 'short' })}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-serif font-semibold leading-tight group-hover:text-primary transition-colors" style={{ color: 'var(--card-foreground)' }}>
                      {ev.title}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                      📍 Auditorio Principal
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('calendario')} className="text-xs btn-outline-primary px-3 py-1.5 rounded mt-4">
              Ver todos los eventos →
            </button>
          </div>
        </div>
      </section>

      <hr className="section-divider max-w-7xl mx-auto px-8" />

      {/* Stats */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Piezas en el Archivo', value: '1.353' },
              { label: 'Años de Historia', value: '50' },
              { label: 'Egresados Destacados', value: '2.400+' },
              { label: 'Proyectos Laureados', value: '84' },
            ].map(s => (
              <div key={s.label}>
                <div className="font-serif text-4xl font-black mb-1 text-primary-gradient">{s.value}</div>
                <div className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ── EXPLORAR ─────────────────────────────────────────────────────────────────

export function ExplorarPage({ navigate, presetNewsId }: { navigate: (page: Page, id?: string) => void; presetNewsId?: string }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const { contentItems, news } = useData();
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pill, setPill] = useState<{ left: number; top: number; width: number; height: number; ready: boolean }>({
    left: 0, top: 0, width: 0, height: 0, ready: false,
  });

  useEffect(() => {
    if (presetNewsId) {
      setActiveCategory('noticias');
      setSelectedNewsId(presetNewsId);
    }
  }, [presetNewsId]);

  const categories = [
    { id: null, label: 'Todo', icon: '📋', count: contentItems.length },
    { id: 'noticias', label: 'Noticias', icon: '📰', count: news.length },
    { id: 'historia', label: 'Historia', icon: '🏛️', count: 142 },
    { id: 'investigacion', label: 'Investigación', icon: '🔬', count: 318 },
    { id: 'proyectos', label: 'Proyectos', icon: '🎓', count: 527 },
    { id: 'eventos', label: 'Eventos', icon: '📅', count: 203 },
    { id: 'logros', label: 'Logros', icon: '🏆', count: 89 },
    { id: 'docentes', label: 'Docentes', icon: '👨‍🏫', count: 74 },
    { id: 'galeria', label: 'Galería Histórica', icon: '🖼️', count: 120 },
    { id: 'egresados', label: 'Egresados Destacados', icon: '🎓', count: 6 },
    { id: 'premios', label: 'Premios', icon: '🥇', count: 5 },
  ];

  const filtered = activeCategory
    ? contentItems.filter(i => i.category === activeCategory)
    : contentItems;
  const visible = filtered.filter(i => i.status === 'publicado' || i.status === 'institucional');

  const selectedNews = news.find(n => n.id === selectedNewsId);
  const activeLabel = categories.find(c => c.id === activeCategory)?.label || 'Todo';
  const activeIdx = categories.findIndex(c => c.id === activeCategory);

  const handleCategoryClick = (id: string | null) => {
    setActiveCategory(id);
    setSelectedNewsId(null);
  };

  useLayoutEffect(() => {
    const measure = () => {
      const el = itemRefs.current[activeIdx];
      if (!el) {
        setPill(p => (p.ready ? { ...p, ready: false } : p));
        return;
      }
      setPill({ left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight, ready: true });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [activeIdx]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <SectionHeader label="Colecciones" title="Descubrir Contenido" subtitle="Navega por las colecciones temáticas del museo." />

      <div className="grid grid-cols-1 lg:grid-cols-[224px_1fr] gap-8">
        {/* Left — Category sidebar */}
        <nav className="relative flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
          <div
            aria-hidden="true"
            className="absolute rounded-lg pointer-events-none z-0"
            style={{
              transform: `translate(${pill.left}px, ${pill.top}px)`,
              width: pill.width,
              height: pill.height,
              opacity: pill.ready && activeIdx >= 0 ? 1 : 0,
              background: 'linear-gradient(135deg, #e53935, #b71c1c)',
              boxShadow: '0 4px 16px rgba(211, 47, 47, 0.45)',
              transition:
                'transform .38s cubic-bezier(0.22, 0.61, 0.36, 1), width .38s cubic-bezier(0.22, 0.61, 0.36, 1), height .38s cubic-bezier(0.22, 0.61, 0.36, 1), opacity .25s ease .1s',
            }}
          />
          {categories.map((c, i) => {
            const isActive = i === activeIdx;
            return (
              <button
                key={String(c.id)}
                ref={el => {
                  itemRefs.current[i] = el;
                }}
                onClick={() => handleCategoryClick(c.id)}
                className={`sb-item group relative z-10 flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap lg:whitespace-normal text-left w-auto lg:w-full ${isActive ? '' : 'hover:translate-x-1'}`}
                style={{ color: isActive ? '#ffffff' : 'var(--secondary-foreground)', animationDelay: `${Math.min(i * 50, 400)}ms` }}
              >
                <span className={`sb-chip ${isActive ? 'sb-chip-on' : ''}`}>{c.icon}</span>
                <span className="flex-1 truncate">{c.label}</span>
                <span className="text-xs font-mono flex-shrink-0" style={{ color: isActive ? 'rgba(255,255,255,0.85)' : 'var(--muted-foreground)' }}>
                  {c.count}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Right — Content grid */}
        <div>
          {activeCategory === 'noticias' && selectedNews ? (
            <div className="fade-up-delayed">
              <button onClick={() => setSelectedNewsId(null)} className="text-xs btn-outline-primary px-4 py-2 rounded mb-5">
                ← Volver a las noticias
              </button>
              <article className="museum-card rounded overflow-hidden">
                <div className="relative h-[280px] md:h-[380px]">
                  <img src={selectedNews.image} alt={selectedNews.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)' }} />
                  <div className="absolute bottom-4 left-5 right-5 flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-mono px-2 py-0.5 rounded uppercase tracking-wider"
                      style={{ background: 'rgba(211, 47, 47,0.85)', color: '#ffffff' }}>
                      {selectedNews.category}
                    </span>
                    <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.75)' }}>{formatNewsDate(selectedNews.date)}</span>
                  </div>
                </div>
                <div className="p-6 md:p-8 max-w-3xl">
                  <h2 className="font-serif text-2xl md:text-3xl font-bold leading-snug mb-4" style={{ color: 'var(--foreground)' }}>{selectedNews.title}</h2>
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-line" style={{ color: 'var(--secondary-foreground)' }}>{selectedNews.excerpt}</p>
                </div>
              </article>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-5">
                <h3 className="font-serif font-semibold text-lg" style={{ color: 'var(--foreground)' }}>
                  {activeLabel}
                </h3>
                <span key={`${activeCategory}-${activeCategory === 'noticias' ? news.length : visible.length}`} className="fade-up-delayed text-xs font-mono px-2 py-0.5 rounded"
                  style={{ background: 'rgba(211, 47, 47,0.08)', color: '#d32f2f' }}>
                  {(activeCategory === 'noticias' ? news : visible).length} resultado{(activeCategory === 'noticias' ? news : visible).length !== 1 ? 's' : ''}
                </span>
              </div>

              {activeCategory === 'noticias' ? (
                <div key="noticias" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {news.map((n, i) => (
                    <button key={n.id} onClick={() => setSelectedNewsId(n.id)}
                      className="museum-card rounded overflow-hidden text-left group fade-up-delayed flex flex-col"
                      style={{ animationDelay: `${Math.min(i * 50, 450)}ms` }}>
                      <div className="relative h-40 overflow-hidden">
                        <img src={n.image} alt={n.title} className="w-full h-full object-cover opacity-80 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105" />
                        <span className="absolute top-3 left-3 text-xs font-mono px-2 py-0.5 rounded uppercase tracking-wider"
                          style={{ background: 'rgba(211, 47, 47,0.85)', color: '#ffffff' }}>
                          {n.category}
                        </span>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <div className="text-xs font-mono mb-1" style={{ color: 'var(--muted-foreground)' }}>{formatNewsDate(n.date)}</div>
                        <h4 className="font-serif font-semibold text-sm leading-snug mb-2 group-hover:text-primary transition-colors" style={{ color: 'var(--card-foreground)' }}>{n.title}</h4>
                        <p className="text-xs leading-relaxed line-clamp-3 mt-auto" style={{ color: 'var(--muted-foreground)' }}>{n.excerpt}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : visible.length > 0 ? (
                <div key={String(activeCategory)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {visible.map((item, i) => (
                    <div key={item.id} className="fade-up-delayed h-full" style={{ animationDelay: `${Math.min(i * 50, 450)}ms` }}>
                      <ContentCard item={item} navigate={navigate} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="museum-card rounded py-16 px-6 flex flex-col items-center justify-center text-center gap-3">
                  <span className="empty-float text-5xl">📂</span>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No hay contenido en esta categoría aún.</p>
                  <button onClick={() => handleCategoryClick(null)} className="text-xs btn-outline-primary px-4 py-2 rounded mt-1">
                    Ver todas las colecciones
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── BUSCAR ───────────────────────────────────────────────────────────────────

export function BuscarPage({ navigate }: { navigate: (page: Page, id?: string) => void }) {
  const [query, setQuery] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [year, setYear] = useState('');
  const { contentItems } = useData();

  const results = contentItems.filter(i => {
    const matchQ = !query || i.title.toLowerCase().includes(query.toLowerCase()) ||
      i.description.toLowerCase().includes(query.toLowerCase()) ||
      i.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));
    const matchA = !author || i.author.toLowerCase().includes(author.toLowerCase());
    const matchC = !category || i.category === category;
    const matchY = !year || i.date.startsWith(year);
    return matchQ && matchA && matchC && matchY && (i.status === 'publicado' || i.status === 'institucional');
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <SectionHeader label="Búsqueda" title="Buscador" subtitle="Encuentra proyectos, investigaciones y eventos del programa." />

      {/* Search controls */}
      <div className="museum-card rounded p-5 mb-8 flex flex-col md:flex-row gap-3">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por título, descripción o etiqueta…"
          className="museum-input flex-1 px-4 py-2.5 rounded text-sm"
        />
        <input
          type="text"
          value={author}
          onChange={e => setAuthor(e.target.value)}
          placeholder="Por persona (autor)…"
          className="museum-input flex-1 px-4 py-2.5 rounded text-sm md:max-w-[200px]"
        />
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="museum-input px-3 py-2.5 rounded text-sm md:w-44">
          <option value="">Categoría</option>
          {['historia', 'investigacion', 'proyectos', 'eventos', 'logros', 'docentes', 'fotografías', 'videos', 'documentos'].map(c => (
            <option key={c} value={c} style={{ background: 'var(--card)' }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
        <select value={year} onChange={e => setYear(e.target.value)}
          className="museum-input px-3 py-2.5 rounded text-sm md:w-32">
          <option value="">Año</option>
          {['2024', '2023', '2022', '2021', '2020', '2019'].map(y => (
            <option key={y} value={y} style={{ background: 'var(--card)' }}>{y}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-sm font-mono mr-2" style={{ color: 'var(--muted-foreground)' }}>
          {results.length} resultado{results.length !== 1 ? 's' : ''}
        </span>
        {query && <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(211, 47, 47,0.1)', color: '#d32f2f', border: '1px solid rgba(211, 47, 47,0.3)' }}>Busqueda: {query}</span>}
        {author && <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(211, 47, 47,0.1)', color: '#d32f2f', border: '1px solid rgba(211, 47, 47,0.3)' }}>Persona: {author}</span>}
        {category && <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(211, 47, 47,0.1)', color: '#d32f2f', border: '1px solid rgba(211, 47, 47,0.3)' }}>Categoría: {category}</span>}
        {year && <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(211, 47, 47,0.1)', color: '#d32f2f', border: '1px solid rgba(211, 47, 47,0.3)' }}>Año: {year}</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {results.map(item => (
          <ContentCard key={item.id} item={item} navigate={navigate} />
        ))}
      </div>
      {results.length === 0 && (
        <div className="text-center py-20 flex flex-col items-center gap-2">
          <span className="text-5xl opacity-20">🔍</span>
          <p style={{ color: 'var(--muted-foreground)' }}>No se encontraron resultados. Intenta con otros términos.</p>
        </div>
      )}
    </div>
  );
}

// ── DETALLE ──────────────────────────────────────────────────────────────────

interface DetalleProps {
  navigate: (page: Page, id?: string) => void;
  itemId: string;
  role: string;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export function DetallePage({ navigate, itemId, role, isFavorite, onToggleFavorite }: DetalleProps) {
  const { contentItems } = useData();
  const item = contentItems.find(i => i.id === itemId) || contentItems[0];
  const authorUser = users.find(u => u.name === item.author && u.role !== 'admin');
  const related = contentItems.filter(i => i.id !== item.id && i.category === item.category).slice(0, 3);
  const [comment, setComment] = useState('');
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState([
    { author: 'Prof. Luis Castro', text: 'Trabajo excepcional. La metodología aplicada es un referente para futuros proyectos.', date: '2024-04-10' },
    { author: 'Ana Bermúdez', text: 'Los resultados obtenidos superan expectativas. Felicitaciones al equipo.', date: '2024-04-12' },
  ]);

  const handleShare = () => {
    navigator.clipboard.writeText('https://museo-unilibre.edu.co/detalle/' + item.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>
        <button onClick={() => navigate('home')} className="hover:text-primary transition-colors">Inicio</button>
        <span>/</span>
        <button onClick={() => navigate('explorar')} className="hover:text-primary transition-colors">Explorar</button>
        <span>/</span>
        <span className="line-clamp-1" style={{ color: 'var(--secondary-foreground)' }}>{item.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Hero image */}
          <div className="relative rounded overflow-hidden mb-6 bg-gray-900" style={{ aspectRatio: '16/9' }}>
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <StatusBadge status={item.status} />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <CategoryBadge category={item.category} />
            <span className="text-sm font-mono" style={{ color: 'var(--muted-foreground)' }}>
              {new Date(item.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-4" style={{ color: 'var(--foreground)' }}>
            {item.title}
          </h1>

          <div className="flex items-center gap-3 mb-6">
            {authorUser ? (
              <button onClick={() => navigate('perfil', authorUser.id)} className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold flex-shrink-0"
                  style={{ background: 'rgba(211, 47, 47,0.15)', color: '#d32f2f' }}>
                  {item.author[0]}
                </div>
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--card-foreground)' }}>{item.author}</div>
                  <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Autor</div>
                </div>
              </button>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold"
                  style={{ background: 'rgba(211, 47, 47,0.15)', color: '#d32f2f' }}>
                  {item.author[0]}
                </div>
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--card-foreground)' }}>{item.author}</div>
                  <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Autor</div>
                </div>
              </>
            )}
            {role !== 'visitante' && (
              <button onClick={() => onToggleFavorite(item.id)}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded text-sm btn-outline-primary"
                style={{ color: isFavorite ? '#d32f2f' : 'var(--muted-foreground)' }}>
                {isFavorite ? '★ Guardado' : '☆ Guardar'}
              </button>
            )}
            <button onClick={handleShare}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${role === 'visitante' ? 'ml-auto' : ''}`}
              style={{ background: copied ? '#22c55e' : 'rgba(255,255,255,0.06)', color: copied ? '#fff' : 'var(--secondary-foreground)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {copied ? '✓ ¡Copiado!' : '🔗 Compartir'}
            </button>
          </div>

          <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--secondary-foreground)' }}>{item.description}</p>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--muted-foreground)' }}>
            Este trabajo representa una contribución significativa al campo de la ingeniería de sistemas, demostrando la capacidad innovadora de los miembros del programa para abordar problemáticas reales con soluciones tecnológicas de alto impacto. La metodología empleada sigue los estándares internacionales de investigación aplicada.
          </p>

          <TagList tags={item.tags} />

          {/* Comments */}
          <div className="mt-10">
            <h3 className="font-serif text-xl font-semibold mb-5" style={{ color: 'var(--card-foreground)' }}>
              Comentarios ({comments.length})
            </h3>
            {role === 'visitante' && (
              <div className="museum-card rounded p-4 mb-5 text-sm text-center" style={{ color: 'var(--muted-foreground)' }}>
                <button onClick={() => navigate('login')} className="text-primary hover:underline">Inicia sesión</button> para dejar un comentario.
              </div>
            )}
            {role !== 'visitante' && (
              <form onSubmit={e => { e.preventDefault(); if(comment.trim()) { setComments(prev => [...prev, { author: 'Tú', text: comment, date: new Date().toISOString().split('T')[0] }]); setComment(''); }}}
                className="flex gap-2 mb-6">
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Escribe un comentario académico…"
                  rows={2}
                  className="museum-input flex-1 px-3 py-2 rounded text-sm resize-none"
                />
                <button type="submit" className="btn-primary px-4 py-2 rounded text-sm self-end">Publicar</button>
              </form>
            )}
            <div className="flex flex-col gap-4">
              {comments.map((c, i) => (
                <div key={i} className="museum-card rounded p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                      style={{ background: 'rgba(211, 47, 47,0.15)', color: '#d32f2f' }}>
                      {c.author[0]}
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--card-foreground)' }}>{c.author}</span>
                    <span className="text-xs font-mono ml-auto" style={{ color: 'var(--muted-foreground)' }}>{c.date}</span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--secondary-foreground)' }}>{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-5">
          {/* Ficha técnica */}
          <div className="museum-card rounded p-5">
            <h4 className="font-serif font-semibold mb-4" style={{ color: 'var(--card-foreground)' }}>Ficha Técnica</h4>
            <div className="flex flex-col gap-3 text-sm">
              {[
                { label: 'Categoría', value: item.category },
                { label: 'Estado', value: <StatusBadge status={item.status} /> },
                { label: 'Fecha', value: item.date },
                { label: 'Autor', value: item.author },
                ...(item.involvedTeacher ? [{ label: 'Docente Responsable', value: item.involvedTeacher }] : []),
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--muted-foreground)' }}>{row.label}</span>
                  <span style={{ color: 'var(--secondary-foreground)' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Evidencias (Archivos adjuntos) */}
          <div className="museum-card rounded p-5">
             <h4 className="font-serif font-semibold mb-4" style={{ color: 'var(--card-foreground)' }}>Evidencias y Archivos</h4>
             <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 rounded" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="text-xl">📄</div>
                  <div className="flex-1 min-w-0">
                     <div className="text-sm line-clamp-1" style={{ color: 'var(--card-foreground)' }}>documento_investigacion.pdf</div>
                     <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>PDF · 2.4 MB</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="text-xl">🖼️</div>
                  <div className="flex-1 min-w-0">
                     <div className="text-sm line-clamp-1" style={{ color: 'var(--card-foreground)' }}>diagrama_arquitectura.png</div>
                     <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>PNG · 850 KB</div>
                  </div>
                </div>
             </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div>
              <h4 className="font-serif font-semibold mb-3" style={{ color: 'var(--card-foreground)' }}>Contenido Relacionado</h4>
              <div className="flex flex-col gap-3">
                {related.map(r => (
                  <button key={r.id} onClick={() => navigate('detalle', r.id)}
                    className="museum-card rounded p-3 text-left flex gap-3 hover:border-primary/40">
                    <img src={r.image} alt={r.title} className="w-14 h-14 object-cover rounded flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold line-clamp-2" style={{ color: 'var(--secondary-foreground)' }}>{r.title}</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{r.author}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          {role === 'visitante' && (
            <div className="rounded p-5 text-center" style={{ background: 'rgba(211, 47, 47,0.06)', border: '1px solid rgba(211, 47, 47,0.2)' }}>
              <p className="text-sm mb-3" style={{ color: 'var(--secondary-foreground)' }}>¿Tienes una contribución para el museo?</p>
              <button onClick={() => navigate('login')} className="btn-primary px-4 py-2 rounded text-sm w-full">
                Registrarse
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── HALL DE LA FAMA ──────────────────────────────────────────────────────────

export function HallFamaPage({ navigate }: { navigate: (page: Page) => void }) {
  const { hallMembers } = useData();
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const member = selected ? hallMembers.find(m => m.id === selected) : null;
  const filtered = hallMembers.filter(m =>
    !filter || m.category === filter || m.name.toLowerCase().includes(filter.toLowerCase())
  );

  const categories = [...new Set(hallMembers.map(m => m.category))];

  if (member) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm mb-8 btn-outline-primary px-3 py-1.5 rounded">
          ← Volver al Hall
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="rounded overflow-hidden mb-4" style={{ aspectRatio: '1/1', background: 'var(--card)' }}>
              <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="flex flex-col justify-center gap-4">
            <div>
              <span className="text-xs px-2 py-1 rounded font-mono" style={{ background: 'rgba(211, 47, 47,0.1)', color: '#d32f2f', border: '1px solid rgba(211, 47, 47,0.25)' }}>
                {member.category} · Graduado {member.year}
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold" style={{ color: 'var(--foreground)' }}>{member.name}</h1>
            <p className="font-semibold" style={{ color: '#d32f2f' }}>{member.title}</p>
            <p className="text-base leading-relaxed" style={{ color: 'var(--secondary-foreground)' }}>{member.achievement}</p>
            <div className="museum-card rounded p-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Egresado del Programa de Ingeniería de Sistemas de la Universidad Libre, cohorte {member.year}. Su trayectoria profesional ha sido un referente para las nuevas generaciones de ingenieros formados en la institución.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="relative rounded overflow-hidden mb-10 p-10" style={{ background: 'linear-gradient(135deg, #0f0f0d, #1a1400)' }}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #d32f2f 0, #d32f2f 1px, transparent 0, transparent 50%)', backgroundSize: '16px 16px' }} />
        <div className="relative">
          <div className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: '#d32f2f' }}>Reconocimiento</div>
          <h1 className="font-serif text-4xl md:text-5xl font-black mb-2" style={{ color: 'var(--foreground)' }}>Hall de la Fama</h1>
          <p className="text-base" style={{ color: 'var(--muted-foreground)' }}>Egresados y docentes cuya excelencia ha trascendido las aulas.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => setFilter('')}
          className="px-3 py-1.5 rounded text-sm"
          style={{ background: !filter ? '#d32f2f' : 'rgba(255,255,255,0.04)', color: !filter ? 'var(--background)' : 'var(--secondary-foreground)', border: `1px solid ${!filter ? '#d32f2f' : 'rgba(255,255,255,0.1)'}` }}>
          Todos
        </button>
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className="px-3 py-1.5 rounded text-sm"
            style={{ background: filter === c ? '#d32f2f' : 'rgba(255,255,255,0.04)', color: filter === c ? 'var(--background)' : 'var(--secondary-foreground)', border: `1px solid ${filter === c ? '#d32f2f' : 'rgba(255,255,255,0.1)'}` }}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(m => (
          <button key={m.id} onClick={() => setSelected(m.id)}
            className="museum-card rounded overflow-hidden text-left group">
            <div className="relative overflow-hidden bg-gray-900" style={{ aspectRatio: '4/3' }}>
              <img src={m.image} alt={m.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)' }} />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="font-serif font-bold text-base leading-tight mb-0.5" style={{ color: 'var(--foreground)' }}>{m.name}</div>
                <div className="text-xs" style={{ color: '#d32f2f' }}>{m.title}</div>
              </div>
              <div className="absolute top-3 right-3 font-mono text-xs px-2 py-0.5 rounded"
                style={{ background: 'rgba(0,0,0,0.7)', color: '#d32f2f', border: '1px solid rgba(211, 47, 47,0.3)' }}>
                {m.year}
              </div>
            </div>
            <div className="p-4">
              <div className="text-xs mb-1 font-mono" style={{ color: 'var(--muted-foreground)' }}>{m.category}</div>
              <p className="text-sm line-clamp-2" style={{ color: 'var(--secondary-foreground)' }}>{m.achievement}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── SEMILLEROS Y GRUPOS ─────────────────────────────────────────────────────

export function SemillerosPage({ navigate }: { navigate: (page: Page) => void }) {
  const semilleros = researchGroups.filter(g => g.category === 'semillero');
  const grupos = researchGroups.filter(g => g.category === 'grupo');

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">
      <button onClick={() => navigate('home')} className="flex items-center gap-2 text-sm mb-8 btn-outline-primary px-3 py-1.5 rounded">
        ← Volver al Inicio
      </button>

      <div className="mb-10">
        <div className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: '#d32f2f' }}>Investigación</div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-2" style={{ color: 'var(--foreground)' }}>
          Semilleros y Grupos
        </h1>
        <p className="text-base" style={{ color: 'var(--muted-foreground)' }}>
          La fuerza investigativa que impulsa la innovación en el Programa de Ingeniería de Sistemas.
        </p>
      </div>

      <div className="mb-10">
        <h2 className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: 'var(--muted-foreground)' }}>Semilleros</h2>
        <div className="flex flex-col gap-3">
          {semilleros.map(g => (
            <div key={g.id} className="museum-card rounded p-5 flex gap-4 items-start">
              <div className="w-10 h-10 rounded flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: 'rgba(211, 47, 47,0.08)' }}>
                🔬
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-serif font-semibold text-base" style={{ color: 'var(--card-foreground)' }}>{g.name}</h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded"
                    style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--muted-foreground)' }}>
                    {g.members} miembros
                  </span>
                </div>
                <div className="text-sm mb-1" style={{ color: '#d32f2f' }}>{g.lead}</div>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{g.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: 'var(--muted-foreground)' }}>Grupos de Investigación</h2>
        <div className="flex flex-col gap-3">
          {grupos.map(g => (
            <div key={g.id} className="museum-card rounded p-5 flex gap-4 items-start">
              <div className="w-10 h-10 rounded flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: 'rgba(211, 47, 47,0.08)' }}>
                🧪
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-serif font-semibold text-base" style={{ color: 'var(--card-foreground)' }}>{g.name}</h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded"
                    style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--muted-foreground)' }}>
                    {g.members} miembros
                  </span>
                </div>
                <div className="text-sm mb-1" style={{ color: '#d32f2f' }}>{g.lead}</div>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{g.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CALENDARIO DE ACTIVIDADES ───────────────────────────────────────────────

const eventTypeColors: Record<string, string> = {
  conferencia: '#d32f2f', taller: '#3b82f6', graduacion: '#22c55e', cultural: '#a855f7'
};

/** Fecha local a ISO YYYY-MM-DD (evita desfase UTC de toISOString) */
function isoOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function CalendarioPage({ navigate }: { navigate: (page: Page) => void }) {
  const { events } = useData();
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selectedDate, setSelectedDate] = useState(isoOf(now));

  const byDate: Record<string, typeof events> = {};
  for (const ev of events) (byDate[ev.date] ||= []).push(ev);

  // Celdas del mes (semanas de lunes a domingo), con días vecinos atenuados
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const lead = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
  const cells: { date: Date; dim: boolean }[] = [];
  for (let i = lead; i > 0; i--) cells.push({ date: new Date(view.y, view.m, 1 - i), dim: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(view.y, view.m, d), dim: false });
  let trail = 1;
  while (cells.length % 7 !== 0) cells.push({ date: new Date(view.y, view.m + 1, trail++), dim: true });

  const moveMonth = (delta: number) => setView(v => {
    const d = new Date(v.y, v.m + delta, 1);
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  const dayEvents = byDate[selectedDate] ?? [];
  const monthLabel = new Date(view.y, view.m, 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  const dayLabel = new Date(`${selectedDate}T12:00:00`).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
      <SectionHeader label="Comunidad" title="Calendario de Actividades" subtitle="Conferencias, talleres y vida universitaria del programa, mes a mes." />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-6 items-start">
        {/* Cuadrícula mensual */}
        <div className="museum-card rounded-lg p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => moveMonth(-1)}
              className="w-8 h-8 rounded flex items-center justify-center transition-colors hover:bg-white/[0.06]"
              style={{ border: '1px solid rgba(211,47,47,0.25)', color: 'var(--secondary-foreground)' }} aria-label="Mes anterior">
              ‹
            </button>
            <div className="font-serif text-lg font-bold capitalize" style={{ color: 'var(--foreground)' }}>{monthLabel}</div>
            <button onClick={() => moveMonth(1)}
              className="w-8 h-8 rounded flex items-center justify-center transition-colors hover:bg-white/[0.06]"
              style={{ border: '1px solid rgba(211,47,47,0.25)', color: 'var(--secondary-foreground)' }} aria-label="Mes siguiente">
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
              <div key={d} className="text-center text-[10px] font-mono uppercase tracking-wider py-1" style={{ color: 'var(--muted-foreground)' }}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((c, i) => {
              const iso = isoOf(c.date);
              const evs = byDate[iso] ?? [];
              const isSelected = iso === selectedDate;
              const isToday = iso === isoOf(now);
              return (
                <button key={i} onClick={() => setSelectedDate(iso)}
                  className={`relative min-h-[52px] md:min-h-[62px] rounded-md p-1.5 text-left transition-all ${c.dim ? "opacity-30" : "hover:bg-white/[0.04]"}`}
                  style={{
                    background: isSelected ? 'rgba(211,47,47,0.14)' : 'transparent',
                    border: isSelected ? '1px solid rgba(211,47,47,0.55)' : '1px solid transparent',
                  }}>
                  <span className={`text-xs font-mono ${isToday ? "font-bold" : ""}`} style={{ color: isToday ? '#d32f2f' : 'var(--card-foreground)' }}>
                    {c.date.getDate()}
                  </span>
                  {evs.length > 0 && (
                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {evs.slice(0, 3).map(ev => (
                        <span key={ev.id} className="w-1.5 h-1.5 rounded-full" style={{ background: eventTypeColors[ev.type] }} />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Columna derecha: leyenda + agenda del día */}
        <div className="flex flex-col gap-5">
          <div className="museum-card rounded-lg p-4">
            <div className="text-[10px] font-mono uppercase tracking-widest mb-2.5" style={{ color: '#d32f2f' }}>Tipos de actividad</div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {Object.entries(eventTypeColors).map(([t, c]) => (
                <div key={t} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--secondary-foreground)' }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c }} />
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </div>
              ))}
            </div>
          </div>

          <div className="museum-card rounded-lg p-4">
            <div className="text-sm font-serif font-bold mb-3 capitalize" style={{ color: 'var(--foreground)' }}>{dayLabel}</div>
            {dayEvents.length === 0 ? (
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                Sin actividades programadas para este día. Selecciona un día con puntos de color en el calendario.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {dayEvents.map(ev => (
                  <div key={ev.id} className="border-l-2 pl-3" style={{ borderColor: eventTypeColors[ev.type] }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold" style={{ color: eventTypeColors[ev.type] }}>{ev.time}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider"
                        style={{ background: `${eventTypeColors[ev.type]}14`, color: eventTypeColors[ev.type], border: `1px solid ${eventTypeColors[ev.type]}30` }}>
                        {ev.type}
                      </span>
                    </div>
                    <div className="text-sm font-serif font-semibold leading-snug" style={{ color: 'var(--card-foreground)' }}>{ev.title}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>📍 {ev.location}</div>
                    <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{ev.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => navigate('explorar')} className="text-xs btn-outline-primary px-3 py-1.5 rounded self-start">
            Ver archivo de eventos →
          </button>
        </div>
      </div>
    </div>
  );
}
