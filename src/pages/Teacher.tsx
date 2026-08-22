import { useState } from 'react';
import type { Page } from '../data';
import { contentItems, getDemoUserForRole, getContributionsFor } from '../data';
import { StatusBadge, SectionHeader, StepIndicator, Checkbox, EmptyState } from '../components/UI';
import { DashboardSidebar } from '../components/Layout';

// ── DASHBOARD DOCENTE ────────────────────────────────────────────────────────

export function DocDashboard({ navigate }: { navigate: (page: Page, id?: string) => void }) {
  const [activeTab, setActiveTab] = useState<'mio' | 'involucrado'>('mio');
  const me = getDemoUserForRole('docente');
  const myAllContent = me ? getContributionsFor(me) : [];
  const myContent = myAllContent.filter(i => i.status === 'pendiente' || i.status === 'devuelto');
  const involucradoContent = contentItems.filter(i => i.involvedTeacher?.includes('Casas'));
  const pendingInvolucrado = involucradoContent.filter(i => i.status === 'pendiente');

  const notifications = [
    { type: 'aprobado', message: 'Tu contribución "Sistema de Predicción..." fue aprobada', time: 'Hace 2h', icon: '✓', color: '#22c55e' },
    { type: 'pendiente', message: 'Tienes 1 pieza pendiente de revisión', time: 'Hace 5h', icon: '⏳', color: '#f97316' },
    { type: 'sistema', message: 'Convocatoria de investigación 2025-1 abierta', time: 'Ayer', icon: 'ℹ', color: '#3b82f6' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="flex gap-8">
        <DashboardSidebar role="docente" currentPage="doc-dashboard" navigate={navigate} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(211, 47, 47,0.1)', color: '#d32f2f', border: '1px solid rgba(211, 47, 47,0.25)' }}>
                  Docente
                </span>
                <span className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>Grupo GISI</span>
              </div>
              <h1 className="font-serif text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Buenos días, Dr. Casas</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Cat. Investigador Asociado · 2 contribuciones pendientes de revisión</p>
            </div>
            <button onClick={() => navigate('doc-wizard')} className="btn-primary px-5 py-2.5 rounded text-sm font-semibold flex items-center gap-2">
              <span className="text-lg leading-none">+</span> Registrar Evidencia
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Contribuciones', value: myAllContent.length, sub: 'Total registradas', color: '#d32f2f', icon: '📝', bg: 'rgba(211, 47, 47, 0.06)' },
              { label: 'Publicadas', value: 15, sub: 'En el archivo', color: '#22c55e', icon: '✓', bg: 'rgba(34, 197, 94, 0.06)' },
              { label: 'En Revisión', value: 2, sub: 'Pendientes', color: '#f97316', icon: '⏳', bg: 'rgba(249, 115, 22, 0.06)' },
              { label: 'Estudiantes', value: 34, sub: 'Proyectos activos', color: '#a855f7', icon: '🎓', bg: 'rgba(168, 85, 247, 0.06)' },
            ].map(s => (
              <div key={s.label} className="museum-card rounded p-5 transition-all duration-200 hover:scale-[1.02] cursor-default"
                style={{ borderLeft: `3px solid ${s.color}` }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded flex items-center justify-center text-sm" style={{ background: s.bg, color: s.color }}>
                    {s.icon}
                  </div>
                  <div className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>{s.label}</div>
                </div>
                <div className="font-serif text-3xl font-bold" style={{ color: s.color }}>{s.value.toLocaleString()}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-0 border-b mb-6" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => setActiveTab('mio')}
              className="py-3 px-4 border-b-2 text-sm font-medium transition-all duration-200"
              style={{
                borderColor: activeTab === 'mio' ? '#d32f2f' : 'transparent',
                color: activeTab === 'mio' ? '#d32f2f' : 'var(--muted-foreground)',
                background: activeTab === 'mio' ? 'rgba(211, 47, 47, 0.04)' : 'transparent',
              }}
            >
              📄 Mi Contenido
            </button>
            <button
              onClick={() => setActiveTab('involucrado')}
              className="py-3 px-4 border-b-2 text-sm font-medium flex items-center gap-2 transition-all duration-200"
              style={{
                borderColor: activeTab === 'involucrado' ? '#d32f2f' : 'transparent',
                color: activeTab === 'involucrado' ? '#d32f2f' : 'var(--muted-foreground)',
                background: activeTab === 'involucrado' ? 'rgba(211, 47, 47, 0.04)' : 'transparent',
              }}
            >
              👥 Me Involucran
              {pendingInvolucrado.length > 0 && (
                <span className="text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full"
                  style={{ background: 'var(--status-pending, #f97316)', color: '#000' }}>
                  {pendingInvolucrado.length}
                </span>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* My content / Me involucran */}
            {activeTab === 'mio' ? (
              <div className="museum-card rounded p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif font-semibold" style={{ color: 'var(--card-foreground)' }}>Necesitan tu Atención</h3>
                  <button onClick={() => navigate('doc-wizard')} className="text-xs btn-outline-primary px-2 py-1 rounded">+ Nueva</button>
                </div>
                <div className="flex flex-col gap-3">
                  {myContent.length === 0 && (
                    <EmptyState message="No tienes contribuciones pendientes de revisión." icon="✓" />
                  )}
                  {myContent.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img src={item.image} alt={item.title} className="w-10 h-10 object-cover rounded flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm line-clamp-1" style={{ color: 'var(--secondary-foreground)' }}>{item.title}</div>
                        <StatusBadge status={item.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="museum-card rounded p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif font-semibold" style={{ color: 'var(--card-foreground)' }}>Proyectos donde te involucran</h3>
                </div>
                <div className="flex flex-col gap-3">
                  {involucradoContent.length === 0 ? (
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No hay proyectos que te involucren aún.</p>
                  ) : (
                    involucradoContent.map(item => (
                      <div key={item.id} className="flex items-center justify-between gap-3 p-3 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm line-clamp-1" style={{ color: 'var(--card-foreground)' }}>{item.title}</div>
                          <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Enviado por: {item.author}</div>
                          <div className="mt-1"><StatusBadge status={item.status} /></div>
                        </div>
                        <button onClick={() => navigate('detalle', item.id)} className="text-xs btn-outline-primary px-3 py-1.5 rounded flex-shrink-0">
                          Ver detalle
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Notifications */}
            <div className="museum-card rounded p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-semibold" style={{ color: 'var(--card-foreground)' }}>🔔 Notificaciones</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(211, 47, 47, 0.12)', color: '#d32f2f' }}>3</span>
                </div>
                <button onClick={() => navigate('doc-notificaciones')} className="text-xs" style={{ color: '#d32f2f' }}>Ver todas</button>
              </div>
              <div className="flex flex-col gap-2">
                {notifications.map((n, i) => (
                  <div key={i} className="flex gap-3 items-start p-3 rounded transition-colors hover:bg-white/[0.02]"
                    style={{ borderLeft: `3px solid ${n.color}` }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                      style={{ background: `${n.color}15`, color: n.color }}>
                      {n.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm" style={{ color: 'var(--secondary-foreground)' }}>{n.message}</p>
                      <span className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── WIZARD DOCENTE (4 pasos) ─────────────────────────────────────────────────

interface WizardProps {
  navigate: (page: Page) => void;
  onSubmit: () => void;
}

export function DocWizard({ navigate, onSubmit }: WizardProps) {
  const [step, setStep] = useState(1);
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<string[]>([]);
  const [checklist, setChecklist] = useState({
    original: false, rights: false, quality: false, institutional: false, reviewed: false,
  });
  const [form, setForm] = useState({
    title: '', category: '', description: '', year: '', tags: '',
    researchGroup: '', coauthors: '', institution: 'Universidad Libre',
  });
  const [submitted, setSubmitted] = useState(false);

  const steps = ['Datos Generales', 'Evidencias', 'Revisión', 'Confirmación'];
  const allChecked = Object.values(checklist).every(Boolean);

  if (submitted) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex gap-8">
          <DashboardSidebar role="docente" currentPage="doc-wizard" navigate={navigate} />
          <div className="flex-1 flex items-center justify-center min-h-80">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
                style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)' }}>
                ✓
              </div>
              <h2 className="font-serif text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>¡Evidencia registrada!</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
                Tu evidencia fue enviada a la cola de validación del administrador. Recibirás una notificación con el resultado.
              </p>
              <div className="text-xs px-3 py-2 rounded mb-4" style={{ background: 'rgba(249,115,22,0.08)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.2)' }}>
                Estado: <strong>En Cola de Validación</strong>
              </div>
              <div className="flex gap-2 justify-center">
                <button onClick={() => navigate('doc-notificaciones')} className="btn-outline-primary px-4 py-2 rounded text-sm">
                  Ver Notificaciones
                </button>
                <button onClick={() => navigate('doc-dashboard')} className="btn-primary px-4 py-2 rounded text-sm">
                  Ir al Dashboard
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
        <DashboardSidebar role="docente" currentPage="doc-wizard" navigate={navigate} />
        <div className="flex-1 min-w-0">
          <SectionHeader label="Nuevo registro" title="Registrar Evidencia" />

          {/* Step indicator */}
          <StepIndicator steps={steps} currentStep={step} completedStep={step > 1 ? step - 1 : undefined} />

          <div className="max-w-2xl">
            {/* Step 1: General data */}
            {step === 1 && (
              <div className="museum-card rounded p-6 flex flex-col gap-4">
                <h3 className="font-serif font-semibold" style={{ color: 'var(--card-foreground)' }}>Datos Generales</h3>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--secondary-foreground)' }}>Título *</label>
                  <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Título de la evidencia o pieza" className="museum-input w-full px-4 py-2.5 rounded text-sm" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--secondary-foreground)' }}>Categoría *</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="museum-input w-full px-3 py-2.5 rounded text-sm">
                      <option value="" style={{ background: 'var(--card)' }}>Seleccionar…</option>
                      {['historia', 'investigacion', 'proyectos', 'eventos', 'logros', 'docentes'].map(c => (
                        <option key={c} value={c} style={{ background: 'var(--card)' }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--secondary-foreground)' }}>Año *</label>
                    <input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                      placeholder="2024" className="museum-input w-full px-3 py-2.5 rounded text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--secondary-foreground)' }}>Grupo de Investigación</label>
                  <input type="text" value={form.researchGroup} onChange={e => setForm(f => ({ ...f, researchGroup: e.target.value }))}
                    placeholder="Ej: GISI, SISDIS, CIETI" className="museum-input w-full px-4 py-2.5 rounded text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--secondary-foreground)' }}>Co-autores</label>
                  <input type="text" value={form.coauthors} onChange={e => setForm(f => ({ ...f, coauthors: e.target.value }))}
                    placeholder="Nombres de co-autores separados por comas" className="museum-input w-full px-4 py-2.5 rounded text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--secondary-foreground)' }}>Descripción *</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Describe el contenido, alcance y relevancia institucional…"
                    rows={4} className="museum-input w-full px-4 py-2.5 rounded text-sm resize-none" />
                </div>
                <button onClick={() => setStep(2)} className="btn-primary py-2.5 rounded font-semibold text-sm">
                  Continuar: Evidencias →
                </button>
              </div>
            )}

            {/* Step 2: Files */}
            {step === 2 && (
              <div className="museum-card rounded p-6 flex flex-col gap-4">
                <h3 className="font-serif font-semibold" style={{ color: 'var(--card-foreground)' }}>Carga de Evidencias</h3>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Adjunta los documentos, imágenes o archivos que respaldan esta evidencia.</p>
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files).map(f => f.name)]); }}
                  className="rounded-lg border-2 border-dashed p-10 text-center cursor-pointer transition-all"
                  style={{ borderColor: dragOver ? 'rgba(211, 47, 47,0.6)' : 'rgba(211, 47, 47,0.2)', background: dragOver ? 'rgba(211, 47, 47,0.04)' : 'transparent' }}
                  onClick={() => setFiles(f => [...f, `evidencia_${f.length + 1}.pdf`])}
                >
                  <div className="text-4xl mb-3 opacity-40">📂</div>
                  <p className="font-medium text-sm" style={{ color: 'var(--secondary-foreground)' }}>Arrastrar y soltar o clic para cargar</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>PDF, DOCX, XLSX, JPG, PNG — máx. 100 MB</p>
                </div>
                {files.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2 rounded"
                        style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
                        <span className="text-lg">📄</span>
                        <span className="text-sm flex-1" style={{ color: 'var(--secondary-foreground)' }}>{f}</span>
                        <span className="text-xs font-mono" style={{ color: '#22c55e' }}>Cargado</span>
                        <button type="button" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                          className="text-xs ml-2" style={{ color: 'var(--muted-foreground)' }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setStep(1)} className="btn-outline-primary px-5 py-2.5 rounded text-sm flex-1">← Anterior</button>
                  <button onClick={() => setStep(3)} className="btn-primary px-5 py-2.5 rounded font-semibold text-sm flex-1">Continuar: Revisión →</button>
                </div>
              </div>
            )}

            {/* Step 3: Checklist */}
            {step === 3 && (
              <div className="museum-card rounded p-6 flex flex-col gap-4">
                <h3 className="font-serif font-semibold" style={{ color: 'var(--card-foreground)' }}>Lista de Verificación</h3>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Confirma que la evidencia cumple con los criterios de calidad del museo antes de enviar.</p>
                <div className="flex flex-col gap-3">
                  {[
                    { key: 'original', label: 'El contenido es original y no está publicado previamente en el museo' },
                    { key: 'rights', label: 'Tengo los derechos o autorizaciones necesarias para publicar este contenido' },
                    { key: 'quality', label: 'Los archivos adjuntos son legibles y tienen la resolución mínima requerida' },
                    { key: 'institutional', label: 'El contenido tiene relevancia institucional y contribuye al legado del programa' },
                    { key: 'reviewed', label: 'He revisado la información y confirmo que es correcta y completa' },
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
                  <div className="text-xs px-3 py-2 rounded" style={{ background: 'rgba(249,115,22,0.06)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.15)' }}>
                    Debes marcar todos los ítems del checklist para continuar.
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setStep(2)} className="btn-outline-primary px-5 py-2.5 rounded text-sm flex-1">← Anterior</button>
                  <button onClick={() => allChecked && setStep(4)}
                    className="px-5 py-2.5 rounded font-semibold text-sm flex-1 transition-opacity"
                    style={{ background: allChecked ? '#d32f2f' : 'rgba(211, 47, 47,0.3)', color: allChecked ? 'var(--background)' : 'var(--muted-foreground)', cursor: allChecked ? 'pointer' : 'not-allowed' }}>
                    Continuar: Vista Previa →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Preview + submit */}
            {step === 4 && (
              <div className="flex flex-col gap-5">
                <div className="museum-card rounded p-6">
                  <h3 className="font-serif font-semibold mb-4" style={{ color: 'var(--card-foreground)' }}>Vista Previa de la Evidencia</h3>
                  <div className="flex flex-col gap-3 text-sm">
                    {[
                      ['Título', form.title || 'Sistema de Predicción de Deserción…'],
                      ['Categoría', form.category || 'investigacion'],
                      ['Año', form.year || '2024'],
                      ['Archivos adjuntos', `${files.length} archivo(s)`],
                      ['Checklist', '5/5 ítems verificados ✓'],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between items-center gap-4 py-2"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                        <span style={{ color: 'var(--secondary-foreground)' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-xs p-4 rounded" style={{ background: 'rgba(59,130,246,0.06)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.2)' }}>
                  Al enviar, esta evidencia pasará a la cola de validación administrativa. Recibirás una notificación con el resultado.
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setStep(3)} className="btn-outline-primary px-5 py-2.5 rounded text-sm flex-1">← Revisar</button>
                  <button onClick={() => { setSubmitted(true); onSubmit(); }}
                    className="btn-primary px-5 py-3 rounded font-semibold text-sm flex-1">
                    Enviar Evidencia ✓
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── NOTIFICACIONES DOCENTE ────────────────────────────────────────────────────

export function DocNotificaciones({ navigate }: { navigate: (page: Page) => void }) {
  const notifications = [
    { id: 1, type: 'aprobado', title: 'Contribución aprobada y publicada', body: '"Sistema de Predicción de Deserción Estudiantil" fue aprobada por el administrador y está disponible en el archivo.', time: '28 Jun 2024, 10:45', color: '#22c55e', icon: '✓' },
    { id: 2, type: 'pendiente', title: 'Evidencia en revisión', body: '"Blockchain para Trazabilidad de Cadena de Suministro en PyMEs" está siendo revisada por el equipo administrativo.', time: '25 Jun 2024, 15:30', color: '#f97316', icon: '⏳' },
    { id: 3, type: 'sistema', title: 'Convocatoria de investigación abierta', body: 'La Vicerrectoría de Investigaciones anuncia la convocatoria interna 2025-1. Fecha límite: 31 julio.', time: '22 Jun 2024, 9:00', color: '#3b82f6', icon: 'ℹ' },
    { id: 4, type: 'devuelto', title: 'Evidencia devuelta para corrección', body: '"Análisis de Vulnerabilidades en Aplicaciones Web Universitarias" fue devuelta. Ver nota del revisor.', time: '20 Jun 2024, 14:15', color: '#ef4444', icon: '↩' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="flex gap-8">
        <DashboardSidebar role="docente" currentPage="doc-notificaciones" navigate={navigate} />
        <div className="flex-1 min-w-0">
          <SectionHeader label="Actualizaciones" title="Notificaciones" subtitle="Historial de actividad sobre tus contribuciones." />
          <div className="flex flex-col gap-4">
            {notifications.map((n, i) => (
              <div key={n.id}
                className="museum-card rounded p-5 flex gap-4 transition-all duration-300 hover:scale-[1.005]"
                style={{ borderLeft: `4px solid ${n.color}`, animation: `fadeInUp 0.4s ease-out ${i * 0.08}s both` }}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: `${n.color}12`, color: n.color, border: `1.5px solid ${n.color}30` }}>
                  {n.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <h4 className="font-semibold text-sm" style={{ color: 'var(--card-foreground)' }}>{n.title}</h4>
                    <span className="text-xs font-mono flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}>{n.time}</span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>{n.body}</p>
                  {n.type === 'devuelto' && (
                    <button className="text-xs mt-2 btn-outline-primary px-3 py-1 rounded">Ver nota del revisor</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
