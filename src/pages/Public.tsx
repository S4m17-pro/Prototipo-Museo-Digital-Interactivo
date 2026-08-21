import { useState, useEffect } from 'react';
import { collections, timeline, contentItems, hallMembers, achievements, researchGroups } from '../data';
import type { Page } from '../data';
import { ContentCard, StatusBadge, SectionHeader, TagList, CategoryBadge } from '../components/UI';

// ── HOME ────────────────────────────────────────────────────────────────────

interface HomeProps {
  navigate: (page: Page, id?: string) => void;
  role: string;
}

export function HomePage({ navigate, role }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState('hero');

  const sections = [
    { id: 'hero',          label: 'Inicio',        icon: '⌂', preview: 'Presentación del museo y búsqueda rápida.' },
    { id: 'colecciones',   label: 'Colecciones',   icon: '◫', preview: '6 colecciones temáticas del programa.' },
    { id: 'cronologia',    label: 'Historia',      icon: '◌', preview: 'Línea del tiempo de 50 años de excelencia.' },
    { id: 'logros',        label: 'Logros',        icon: '✦', preview: 'Premios y reconocimientos institucionales.' },
    { id: 'investigacion', label: 'Investigación', icon: '◈', preview: 'Semilleros y grupos de investigación activos.' },
    { id: 'agenda',        label: 'Agenda',        icon: '◷', preview: 'Próximos eventos del programa.' },
    { id: 'reciente',      label: 'Reciente',      icon: '◉', preview: 'Últimas incorporaciones al archivo digital.' },
  ];

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: '-40% 0px -50% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('buscar');
  };

  const published = contentItems.filter(i => i.status === 'publicado' || i.status === 'institucional');

  return (
    <div className="relative">
      {/* ─── Right ScrollSpy Nav ─────────────────────────────── */}
      <nav
        aria-label="Navegación de secciones"
        className="hidden xl:flex flex-col gap-3 fixed right-5 z-40"
        style={{ top: '50%', transform: 'translateY(-50%)' }}
      >
        {sections.map(sec => {
          const isActive = activeSection === sec.id;
          return (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              title={sec.label}
              className="group flex items-center justify-end gap-3"
              style={{ textDecoration: 'none' }}
            >
              {/* Preview tooltip (left side, appears on hover) */}
              <div
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none"
                style={{ transform: isActive ? 'translateX(0)' : undefined }}
              >
                <div
                  className="text-right rounded-lg px-3 py-2 shadow-xl"
                  style={{
                    background: 'rgba(15,12,12,0.95)',
                    border: '1px solid rgba(211,47,47,0.25)',
                    backdropFilter: 'blur(8px)',
                    minWidth: '160px',
                  }}
                >
                  <div className="text-xs font-semibold mb-0.5" style={{ color: '#d32f2f' }}>{sec.label}</div>
                  <div className="text-xs leading-relaxed" style={{ color: 'var(--secondary-foreground)' }}>{sec.preview}</div>
                </div>
              </div>
              {/* Dot indicator */}
              <div
                className="flex-shrink-0 rounded-full transition-all duration-300"
                style={{
                  width: isActive ? '12px' : '7px',
                  height: isActive ? '12px' : '7px',
                  background: isActive ? '#d32f2f' : 'rgba(211,47,47,0.3)',
                  boxShadow: isActive ? '0 0 10px rgba(211,47,47,0.6)' : 'none',
                  border: isActive ? '2px solid rgba(211,47,47,0.4)' : '1px solid rgba(211,47,47,0.2)',
                }}
              />
            </a>
          );
        })}
      </nav>

      {/* Hero */}
      <section id="hero" className="relative py-20 md:py-28 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1562774053-701939374585?w=1400&h=900&fit=crop&auto=format"
            alt="Campus universitario"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="hero-overlay absolute inset-0" />
        </div>

        {/* Decorative grid lines */}
        <div className="absolute inset-0 z-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(rgba(211, 47, 47,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(211, 47, 47,0.5) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 animate-fadeInUp">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-mono"
            style={{ background: 'rgba(211, 47, 47,0.1)', border: '1px solid rgba(211, 47, 47,0.25)', color: '#d32f2f' }}>
            ✦ 50 Años de Excelencia Académica · 1975–2025
          </div>

          <h1 className="font-serif text-5xl md:text-7xl font-black leading-none mb-4" style={{ color: 'var(--foreground)' }}>
            Museo Digital<br />
            <span className="text-gold-gradient italic">Interactivo</span>
          </h1>
          <p className="text-base md:text-lg max-w-xl mx-auto mb-8" style={{ color: 'var(--secondary-foreground)' }}>
            Archivo vivo del Programa de Ingeniería de Sistemas — Universidad Libre. Historia, investigación y logros que inspiran generaciones.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto mb-8">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar proyectos, investigaciones, eventos…"
              className="museum-input flex-1 px-4 py-3 rounded text-sm"
            />
            <button type="submit" className="btn-gold px-5 py-3 rounded text-sm whitespace-nowrap">
              Buscar
            </button>
          </form>

          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={() => navigate('explorar')} className="btn-outline-gold btn-float px-5 py-2.5 rounded text-sm">
              Explorar Colecciones
            </button>
            <button onClick={() => navigate('hall-fama')} className="btn-outline-gold px-5 py-2.5 rounded text-sm">
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
      </section>

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

      {/* Timeline */}
      <section id="cronologia" className="max-w-7xl mx-auto px-4 md:px-8 py-16 scroll-mt-24">
        <SectionHeader label="Cronología" title="Línea del Tiempo" subtitle="Los hitos que definen medio siglo de formación de ingenieros." />
        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px timeline-line transform md:-translate-x-px" />
          <div className="flex flex-col gap-8">
            {timeline.map((ev, i) => {
              const isRight = i % 2 === 0;
              const typeColors: Record<string, string> = {
                fundacion: '#d32f2f', logro: '#22c55e', evento: '#3b82f6', investigacion: '#a855f7'
              };
              const isExpanded = expandedYear === ev.year;
              return (
                <div key={ev.year} className={`relative flex items-start gap-4 md:gap-0 ${isRight ? 'md:flex-row' : 'md:flex-row-reverse'} pl-10 md:pl-0`}>
                  {/* Dot */}
                  <div className="absolute left-3 md:left-1/2 w-3 h-3 rounded-full border-2 transform -translate-x-1.5 mt-1"
                    style={{ background: typeColors[ev.type], borderColor: typeColors[ev.type], boxShadow: `0 0 8px ${typeColors[ev.type]}60` }} />
                  {/* Content */}
                  <div className={`md:w-5/12 ${isRight ? 'md:pr-10' : 'md:pl-10 md:ml-auto'}`}>
                    <button onClick={() => setExpandedYear(isExpanded ? null : ev.year)} className="museum-card rounded p-4 text-left w-full hover:border-yellow-600/40 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-bold" style={{ color: typeColors[ev.type] }}>{ev.year}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${typeColors[ev.type]}15`, color: typeColors[ev.type] }}>
                          {ev.type.charAt(0).toUpperCase() + ev.type.slice(1)}
                        </span>
                      </div>
                      <h4 className="font-serif font-semibold text-sm mb-1" style={{ color: 'var(--card-foreground)' }}>{ev.title}</h4>
                      {isExpanded ? (
                        <div className="mt-3 border-t border-gray-800 pt-3">
                          <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--secondary-foreground)' }}>
                            {ev.description}
                            <br /><br />
                            Aquí se detalla más información histórica sobre este evento fundamental. Esta es una vista ampliada que permite explorar en profundidad cada hito en el archivo digital.
                          </p>
                          <div className="h-32 bg-gray-900 rounded mb-3 overflow-hidden">
                             <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=200&fit=crop" alt="Foto referencial" className="w-full h-full object-cover opacity-60" />
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); navigate('explorar'); }} className="text-xs btn-outline-gold px-3 py-1.5 rounded">Ver en el archivo →</button>
                        </div>
                      ) : (
                        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>{ev.description}</p>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
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
                 <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-yellow-500 border border-yellow-500/30">🏆</div>
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

      {/* Semilleros y Grupos de Investigación */}
      <section id="investigacion" className="max-w-7xl mx-auto px-4 md:px-8 py-16 scroll-mt-24">
        <SectionHeader label="Investigación" title="Semilleros y Grupos" subtitle="La fuerza investigativa que impulsa la innovación." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
           {researchGroups.filter(g => g.category === 'semillero').map(g => (
             <div key={g.id} className="museum-card rounded p-4 flex gap-4 items-center group">
               <img src={g.image} alt={g.name} className="w-16 h-16 rounded object-cover" />
               <div className="flex-1">
                 <div className="text-xs font-mono mb-0.5" style={{ color: '#d32f2f' }}>Semillero</div>
                 <h4 className="font-serif font-bold text-base" style={{ color: 'var(--card-foreground)' }}>{g.name}</h4>
                 <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Líder: {g.lead} · {g.members} miembros</div>
               </div>
             </div>
           ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
           {researchGroups.filter(g => g.category === 'grupo').map(g => (
             <div key={g.id} className="museum-card rounded p-4 flex gap-4 items-center group">
               <img src={g.image} alt={g.name} className="w-16 h-16 rounded object-cover" />
               <div className="flex-1">
                 <div className="text-xs font-mono mb-0.5" style={{ color: '#d32f2f' }}>Grupo de Investigación</div>
                 <h4 className="font-serif font-bold text-base" style={{ color: 'var(--card-foreground)' }}>{g.name}</h4>
                 <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Director: {g.lead} · {g.members} miembros</div>
               </div>
             </div>
           ))}
        </div>
      </section>

      <hr className="section-divider max-w-7xl mx-auto px-8" />

      {/* Eventos Próximos */}
      <section id="agenda" className="max-w-7xl mx-auto px-4 md:px-8 py-16 scroll-mt-24">
        <SectionHeader label="Agenda" title="Eventos Próximos" subtitle="Actividades destacadas de nuestra comunidad." />
        <div className="flex flex-col md:flex-row gap-5">
           {contentItems.filter(i => i.category === 'eventos').slice(0, 3).map((ev, i) => (
             <div key={ev.id} className="museum-card rounded p-5 flex-1 border-l-2" style={{ borderLeftColor: i === 0 ? '#d32f2f' : 'rgba(255,255,255,0.1)' }}>
                <div className="text-sm font-mono mb-2" style={{ color: '#d32f2f' }}>{new Date(ev.date).toLocaleDateString('es-CO', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                <h4 className="font-serif font-semibold text-sm mb-1" style={{ color: 'var(--card-foreground)' }}>{ev.title}</h4>
                <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>📍 Auditorio Principal</div>
             </div>
           ))}
        </div>
      </section>

      <hr className="section-divider max-w-7xl mx-auto px-8" />

      {/* Recent content */}
      <section id="reciente" className="max-w-7xl mx-auto px-4 md:px-8 py-16 scroll-mt-24">
        <div className="flex items-center justify-between mb-8">
          <SectionHeader label="Reciente" title="Últimas Incorporaciones" />
          <button onClick={() => navigate('explorar')} className="text-sm btn-outline-gold px-4 py-2 rounded flex-shrink-0">
            Ver todo →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {published.slice(0, 3).map(item => (
            <ContentCard key={item.id} item={item} navigate={navigate} />
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ background: '#0f0f0d', borderTop: '1px solid rgba(211, 47, 47,0.12)', borderBottom: '1px solid rgba(211, 47, 47,0.12)' }}
        className="py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: 'Piezas en el Archivo', value: '1.353' },
            { label: 'Años de Historia', value: '50' },
            { label: 'Egresados Destacados', value: '2.400+' },
            { label: 'Proyectos Laureados', value: '84' },
          ].map(s => (
            <div key={s.label}>
              <div className="font-serif text-4xl font-black mb-1 text-gold-gradient">{s.value}</div>
              <div className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          Sé parte de la historia
        </h2>
        <p className="text-base mb-8" style={{ color: 'var(--muted-foreground)' }}>
          Registra tus proyectos, investigaciones y logros. Contribuye al legado del programa para las próximas generaciones.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={() => navigate(role === 'visitante' ? 'registro' : 'est-contribuir')}
            className="btn-gold btn-float px-8 py-3 rounded text-sm font-semibold">
            Registrar Contribución
          </button>
          <button onClick={() => navigate('explorar')} className="btn-outline-gold px-8 py-3 rounded text-sm">
            Explorar Archivo
          </button>
        </div>
      </section>
    </div>
  );
}

// ── EXPLORAR ─────────────────────────────────────────────────────────────────

export function ExplorarPage({ navigate }: { navigate: (page: Page, id?: string) => void }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = [
    { id: null, label: 'Todo', count: contentItems.length },
    { id: 'historia', label: 'Historia', count: 142 },
    { id: 'investigacion', label: 'Investigación', count: 318 },
    { id: 'proyectos', label: 'Proyectos', count: 527 },
    { id: 'eventos', label: 'Eventos', count: 203 },
    { id: 'logros', label: 'Logros', count: 89 },
    { id: 'docentes', label: 'Docentes', count: 74 },
    { id: 'galeria', label: 'Galería Histórica', count: 120 },
    { id: 'egresados', label: 'Egresados Destacados', count: 6 },
    { id: 'premios', label: 'Premios y Reconocimientos', count: 5 },
  ];

  const filtered = activeCategory
    ? contentItems.filter(i => i.category === activeCategory)
    : contentItems;
  const visible = filtered.filter(i => i.status === 'publicado' || i.status === 'institucional');

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <SectionHeader label="Colecciones" title="Descubrir Contenido" subtitle="Navega por las colecciones temáticas del museo." />

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(c => (
          <button
            key={String(c.id)}
            onClick={() => setActiveCategory(c.id)}
            className="px-4 py-2 rounded text-sm font-medium transition-all"
            style={{
              background: activeCategory === c.id ? '#d32f2f' : 'rgba(255,255,255,0.04)',
              color: activeCategory === c.id ? 'var(--background)' : 'var(--secondary-foreground)',
              border: `1px solid ${activeCategory === c.id ? '#d32f2f' : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            {c.label} <span className="text-xs opacity-70 ml-1">({c.count})</span>
          </button>
        ))}
      </div>

      {/* Collection showcase */}
      {!activeCategory && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[...collections, 
            { id: 'galeria', title: 'Galería Histórica', count: 120, icon: '🖼️', description: '' }, 
            { id: 'egresados', title: 'Egresados Destacados', count: 6, icon: '🎓', description: '' }
          ].map(col => (
            <button key={col.id} onClick={() => setActiveCategory(col.id)}
              className="museum-card rounded p-4 text-left group hover:border-yellow-600/40">
              <div className="text-2xl mb-2">{col.icon}</div>
              <div className="font-serif font-semibold text-sm mb-1" style={{ color: 'var(--card-foreground)' }}>{col.title}</div>
              <div className="text-xs font-mono" style={{ color: '#d32f2f' }}>{col.count} piezas</div>
            </button>
          ))}
        </div>
      )}

      {/* Content grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visible.map(item => (
          <ContentCard key={item.id} item={item} navigate={navigate} />
        ))}
      </div>
      {visible.length === 0 && (
        <div className="text-center py-20" style={{ color: 'var(--muted-foreground)' }}>
          No hay contenido en esta categoría aún.
        </div>
      )}
    </div>
  );
}

// ── BUSCAR ───────────────────────────────────────────────────────────────────

export function BuscarPage({ navigate }: { navigate: (page: Page, id?: string) => void }) {
  const [query, setQuery] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [year, setYear] = useState('');

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
  const item = contentItems.find(i => i.id === itemId) || contentItems[0];
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
        <button onClick={() => navigate('home')} className="hover:text-yellow-400 transition-colors">Inicio</button>
        <span>/</span>
        <button onClick={() => navigate('explorar')} className="hover:text-yellow-400 transition-colors">Explorar</button>
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
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold"
              style={{ background: 'rgba(211, 47, 47,0.15)', color: '#d32f2f' }}>
              {item.author[0]}
            </div>
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--card-foreground)' }}>{item.author}</div>
              <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Autor</div>
            </div>
            {role !== 'visitante' && (
              <button onClick={() => onToggleFavorite(item.id)}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded text-sm btn-outline-gold"
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
                <button onClick={() => navigate('login')} className="text-yellow-400 hover:underline">Inicia sesión</button> para dejar un comentario.
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
                <button type="submit" className="btn-gold px-4 py-2 rounded text-sm self-end">Publicar</button>
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
                    className="museum-card rounded p-3 text-left flex gap-3 hover:border-yellow-600/40">
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
              <button onClick={() => navigate('login')} className="btn-gold px-4 py-2 rounded text-sm w-full">
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
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm mb-8 btn-outline-gold px-3 py-1.5 rounded">
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
      {/* Hero strip */}
      <div className="relative rounded overflow-hidden mb-10 p-10" style={{ background: 'linear-gradient(135deg, #0f0f0d, #1a1400)' }}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #d32f2f 0, #d32f2f 1px, transparent 0, transparent 50%)', backgroundSize: '16px 16px' }} />
        <div className="relative">
          <div className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: '#d32f2f' }}>Reconocimiento</div>
          <h1 className="font-serif text-4xl md:text-5xl font-black mb-2" style={{ color: 'var(--foreground)' }}>Hall de la Fama</h1>
          <p className="text-base" style={{ color: 'var(--muted-foreground)' }}>Egresados y docentes cuya excelencia ha trascendido las aulas.</p>
        </div>
      </div>

      {/* Filters */}
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

      {/* Grid */}
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
