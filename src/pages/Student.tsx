import { useState } from 'react';
import { contentItems, teacherOptions } from '../data';
import type { Page } from '../data';
import { ContentCard, StatusBadge, SectionHeader, StatCard, StepIndicator, Checkbox } from '../components/UI';
import { DashboardSidebar } from '../components/Layout';

interface Props {
  navigate: (page: Page, id?: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  role?: string;
}

// ── DASHBOARD ESTUDIANTE ─────────────────────────────────────────────────────

export function EstDashboard({ navigate, favorites, role = 'estudiante' }: Props) {
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const badges = [
    { icon: '🎓', name: 'Primer Contribuidor', earned: true, description: 'Registraste tu primera contribución' },
    { icon: '💬', name: 'Voz Activa', earned: true, description: 'Publicaste 5 comentarios' },
    { icon: '⭐', name: 'Coleccionista', earned: false, description: 'Guarda 10 piezas en favoritos' },
    { icon: '🔬', name: 'Investigador', earned: false, description: 'Contribuye con una investigación' },
    { icon: '🏆', name: 'Destacado', earned: false, description: 'Obtén 50 likes en una pieza' },
  ];

  const agenda = [
    { date: '28 Jun', title: 'Semillero de Investigación GISI', time: '10:00 AM', location: 'Sala 301' },
    { date: '2 Jul', title: 'Taller: Redacción de Proyectos de Grado', time: '2:00 PM', location: 'Auditorio B' },
    { date: '10 Jul', title: 'Congreso Estudiantil de Ingeniería', time: '8:00 AM', location: 'Auditorio Principal' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="flex gap-8">
        <DashboardSidebar role="estudiante" currentPage="est-dashboard" navigate={navigate} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: '#d32f2f' }}>Panel de Control</div>
              <h1 className="font-serif text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Mi Espacio</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                {role === 'egresado' ? 'Bienvenido, egresado · Cohorte 2018' : 'Bienvenida, Ana Lucía · Ingeniería de Sistemas'}
              </p>
            </div>
            <button onClick={() => navigate('est-contribuir')} className="btn-primary px-5 py-2.5 rounded text-sm font-semibold">
              + Nueva Contribución
            </button>
          </div>

          {!bannerDismissed && (
            <div className="mb-8 rounded-lg p-4 flex items-start gap-4" style={{ background: 'linear-gradient(to right, rgba(211, 47, 47,0.15), rgba(30,58,138,0.15))', border: '1px solid rgba(211, 47, 47,0.3)' }}>
              <div className="text-2xl">📢</div>
              <div className="flex-1">
                <h4 className="font-serif font-bold text-sm mb-1" style={{ color: 'var(--foreground)' }}>Convocatoria Proyectos Destacados 2025</h4>
                <p className="text-xs" style={{ color: 'var(--secondary-foreground)' }}>Fecha límite: 31 julio. Postula tu proyecto de grado para el Hall de la Fama.</p>
              </div>
              <button onClick={() => setBannerDismissed(true)} className="text-xs px-2 py-1 opacity-50 hover:opacity-100">✕</button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Contribuciones" value={4} sub="3 publicadas" />
            <StatCard label="Favoritos" value={favorites.length || 7} sub="guardados" color="#3b82f6" />
            <StatCard label="Comentarios" value={12} sub="este semestre" color="#a855f7" />
            <StatCard label="Insignias" value={2} sub="de 5" color="#f97316" />
          </div>

          {/* Badges */}
          <div className="museum-card rounded p-5 mb-6">
            <h3 className="font-serif font-semibold mb-4" style={{ color: 'var(--card-foreground)' }}>Insignias</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {badges.map(b => (
                <div key={b.name}
                  className="flex flex-col items-center gap-1.5 p-3 rounded text-center"
                  style={{
                    background: b.earned ? 'rgba(211, 47, 47,0.08)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${b.earned ? 'rgba(211, 47, 47,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    opacity: b.earned ? 1 : 0.45,
                  }}>
                  <span className="text-2xl">{b.icon}</span>
                  <span className="text-xs font-medium" style={{ color: b.earned ? '#d32f2f' : 'var(--muted-foreground)' }}>{b.name}</span>
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{b.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contenido Reciente del Programa */}
          <div className="mb-6">
            <h3 className="font-serif font-semibold mb-4" style={{ color: 'var(--card-foreground)' }}>Contenido Reciente del Programa</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {contentItems.filter(i => i.status === 'publicado' || i.status === 'institucional').slice(0, 3).map(item => (
                <ContentCard key={item.id} item={item} navigate={navigate} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Agenda */}
            <div className="museum-card rounded p-5">
              <h3 className="font-serif font-semibold mb-4" style={{ color: 'var(--card-foreground)' }}>Agenda Académica</h3>
              <div className="flex flex-col gap-3">
                {agenda.map(ev => (
                  <div key={ev.title} className="flex gap-3 items-start">
                    <div className="w-12 flex-shrink-0 text-center rounded p-1.5"
                      style={{ background: 'rgba(211, 47, 47,0.1)', border: '1px solid rgba(211, 47, 47,0.2)' }}>
                      <div className="text-xs font-mono font-bold" style={{ color: '#d32f2f' }}>{ev.date.split(' ')[0]}</div>
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{ev.date.split(' ')[1]}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--card-foreground)' }}>{ev.title}</div>
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{ev.time} · {ev.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent contributions */}
            <div className="museum-card rounded p-5">
              <h3 className="font-serif font-semibold mb-4" style={{ color: 'var(--card-foreground)' }}>Mis Contribuciones</h3>
              <div className="flex flex-col gap-3">
                {contentItems.filter(i => i.submittedBy || i.id === '2').slice(0, 3).map(item => (
                  <div key={item.id} className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('detalle', item.id)}>
                    <img src={item.image} alt={item.title} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm line-clamp-1 group-hover:text-primary transition-colors" style={{ color: 'var(--secondary-foreground)' }}>{item.title}</div>
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                ))}
                <button onClick={() => navigate('est-contribuir')} className="text-xs btn-outline-primary px-3 py-1.5 rounded mt-1 w-full">
                  + Agregar nueva contribución
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── FAVORITOS ─────────────────────────────────────────────────────────────────

export function EstFavoritos({ navigate, favorites, onToggleFavorite }: Props) {
  const favItems = contentItems.filter(i => favorites.includes(i.id));

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="flex gap-8">
        <DashboardSidebar role="estudiante" currentPage="est-favoritos" navigate={navigate} />
        <div className="flex-1 min-w-0">
          <SectionHeader label="Mi colección" title="Favoritos" subtitle={`${favItems.length} piezas guardadas`} />
          {favItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <span className="text-5xl opacity-20">♡</span>
              <p style={{ color: 'var(--muted-foreground)' }}>Aún no tienes favoritos. Explora el archivo y guarda piezas.</p>
              <button onClick={() => navigate('explorar')} className="btn-outline-primary px-5 py-2 rounded text-sm">
                Explorar Archivo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {favItems.map(item => (
                <div key={item.id} className="relative">
                  <ContentCard item={item} navigate={navigate} />
                  <button
                    onClick={() => onToggleFavorite(item.id)}
                    className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-sm"
                    style={{ background: 'rgba(0,0,0,0.7)', color: '#d32f2f', border: '1px solid rgba(211, 47, 47,0.4)' }}>
                    ★
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── CONTRIBUIR ────────────────────────────────────────────────────────────────

interface ContribuirProps {
  navigate: (page: Page) => void;
  onSubmit: () => void;
}

export function EstContribuir({ navigate, onSubmit }: ContribuirProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ title: '', category: '', description: '', tags: '', year: '', involvedTeacher: '' });
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<string[]>([]);
  const [checklist, setChecklist] = useState({
    copyright: false, resolution: false, consent: false, description: false, teacher: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const allChecked = Object.values(checklist).every(Boolean);

  const handleNext = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (step < 4) setStep(step + 1);
    else {
      setSubmitted(true);
      onSubmit();
    }
  };

  if (submitted) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex gap-8">
          <DashboardSidebar role="estudiante" currentPage="est-contribuir" navigate={navigate} />
          <div className="flex-1 flex items-center justify-center min-h-80">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
                style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)' }}>
                ✓
              </div>
              <h2 className="font-serif text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>¡Contribución enviada!</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
                Tu contribución ha sido registrada y está en revisión. Un docente la validará antes de que un administrador la publique.
              </p>
              <div className="flex flex-col gap-2">
                <div className="text-xs px-3 py-2 rounded" style={{ background: 'rgba(249,115,22,0.08)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.2)' }}>
                  Estado: <strong>En Revisión</strong> · Recibirás una notificación al ser procesada
                </div>
                <button onClick={() => navigate('est-dashboard')} className="btn-primary px-5 py-2.5 rounded text-sm mt-2">
                  Volver a mi panel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="flex gap-8">
        <DashboardSidebar role="estudiante" currentPage="est-contribuir" navigate={navigate} />
        <div className="flex-1 min-w-0">
          <SectionHeader label="Nuevo aporte" title="Registrar Contribución" subtitle="Comparte proyectos, investigaciones o documentos con el museo." />

          {/* Progress */}
          <StepIndicator steps={['Datos Generales', 'Evidencias', 'Revisión', 'Confirmación']} currentStep={step} />

          <form onSubmit={handleNext} className="max-w-2xl flex flex-col gap-6">
            {step === 1 && (
              <div className="museum-card rounded p-6 flex flex-col gap-4">
                <h3 className="font-serif font-semibold" style={{ color: 'var(--card-foreground)' }}>Información General</h3>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--secondary-foreground)' }}>Título *</label>
                  <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Título descriptivo de la contribución"
                    className="museum-input w-full px-4 py-2.5 rounded text-sm" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--secondary-foreground)' }}>Categoría *</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="museum-input w-full px-3 py-2.5 rounded text-sm" required>
                      <option value="" style={{ background: 'var(--card)' }}>Seleccionar…</option>
                      {['historia', 'investigacion', 'proyectos', 'eventos', 'logros', 'docentes'].map(c => (
                        <option key={c} value={c} style={{ background: 'var(--card)' }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--secondary-foreground)' }}>Año</label>
                    <input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                      placeholder="2024" min="1975" max="2025"
                      className="museum-input w-full px-3 py-2.5 rounded text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--secondary-foreground)' }}>Docente Involucrado *</label>
                  <select value={form.involvedTeacher} onChange={e => setForm(f => ({ ...f, involvedTeacher: e.target.value }))}
                    className="museum-input w-full px-3 py-2.5 rounded text-sm" required>
                    <option value="" style={{ background: 'var(--card)' }}>Seleccionar docente…</option>
                    {teacherOptions.map(t => (
                      <option key={t.email} value={t.name} style={{ background: 'var(--card)' }}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--secondary-foreground)' }}>Descripción *</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Describe el contenido y relevancia de esta contribución…"
                    rows={4} className="museum-input w-full px-4 py-2.5 rounded text-sm resize-none" required />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--secondary-foreground)' }}>Etiquetas (separadas por comas)</label>
                  <input type="text" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                    placeholder="IA, Python, Educación, Datos"
                    className="museum-input w-full px-4 py-2.5 rounded text-sm" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="museum-card rounded p-6">
                <h3 className="font-serif font-semibold mb-4" style={{ color: 'var(--card-foreground)' }}>Archivos y Evidencias</h3>
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => {
                    e.preventDefault();
                    setDragOver(false);
                    const dropped = Array.from(e.dataTransfer.files).map(f => f.name);
                    setFiles(prev => [...prev, ...dropped]);
                  }}
                  className="rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-all"
                  style={{
                    borderColor: dragOver ? 'rgba(211, 47, 47,0.6)' : 'rgba(211, 47, 47,0.2)',
                    background: dragOver ? 'rgba(211, 47, 47,0.04)' : 'transparent',
                  }}
                  onClick={() => setFiles(f => [...f, `documento_${f.length + 1}.pdf`])}
                >
                  <div className="text-3xl mb-2 opacity-50">📎</div>
                  <p className="text-sm font-medium" style={{ color: 'var(--secondary-foreground)' }}>Arrastra archivos aquí o haz clic para seleccionar</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>PDF, DOCX, PPTX, imágenes (máx. 50 MB por archivo)</p>
                </div>
                {files.length > 0 && (
                  <div className="flex flex-col gap-2 mt-3">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm px-3 py-2 rounded"
                        style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
                        <span style={{ color: '#22c55e' }}>✓</span>
                        <span style={{ color: 'var(--secondary-foreground)' }}>{f}</span>
                        <button type="button" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                          className="ml-auto text-xs" style={{ color: 'var(--muted-foreground)' }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="museum-card rounded p-6">
                <h3 className="font-serif font-semibold mb-4" style={{ color: 'var(--card-foreground)' }}>Lista de Chequeo</h3>
                <div className="flex flex-col gap-3">
                  {[
                    { key: 'copyright', label: 'El contenido no infringe derechos de autor' },
                    { key: 'resolution', label: 'Las imágenes cumplen con la resolución mínima' },
                    { key: 'consent', label: 'Se incluye el consentimiento de las personas identificables' },
                    { key: 'description', label: 'La descripción es clara y tiene rigor académico' },
                    { key: 'teacher', label: 'Se especificó correctamente el docente involucrado' },
                  ].map(item => (
                    <Checkbox
                      key={item.key}
                      checked={checklist[item.key as keyof typeof checklist]}
                      onChange={() => setChecklist(c => ({ ...c, [item.key]: !c[item.key as keyof typeof checklist] }))}
                      label={item.label}
                    />
                  ))}
                </div>
                {!allChecked && (
                  <div className="text-xs px-3 py-2 rounded mt-4" style={{ background: 'rgba(249,115,22,0.06)', color: 'var(--status-pending, #fb923c)', border: '1px solid rgba(249,115,22,0.15)' }}>
                    Debes marcar todos los ítems del checklist para continuar.
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col gap-5">
                <div className="museum-card rounded p-6">
                  <h3 className="font-serif text-xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Vista Previa</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: 'rgba(211, 47, 47,0.1)', color: '#d32f2f', border: '1px solid rgba(211, 47, 47,0.3)' }}>
                      {form.category}
                    </span>
                    <span className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>{form.year}</span>
                  </div>
                  <h4 className="font-serif text-lg font-semibold mb-2" style={{ color: 'var(--card-foreground)' }}>{form.title}</h4>
                  <p className="text-sm mb-4" style={{ color: 'var(--secondary-foreground)' }}>{form.description}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}><strong>Docente Involucrado:</strong> {form.involvedTeacher}</p>
                  
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="text-xs font-semibold mb-2" style={{ color: 'var(--secondary-foreground)' }}>Archivos adjuntos:</div>
                    <div className="flex gap-2 flex-wrap">
                      {files.map(f => (
                        <div key={f} className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--muted-foreground)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          📎 {f}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button type="button" onClick={() => step > 1 ? setStep(step - 1) : navigate('est-dashboard')}
                className="btn-outline-primary px-6 py-2.5 rounded text-sm">
                {step > 1 ? '← Anterior' : 'Cancelar'}
              </button>
              <button type="submit" className="btn-primary px-8 py-2.5 rounded font-semibold text-sm flex-1">
                {step < 4 ? 'Siguiente paso →' : 'Confirmar y Enviar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
