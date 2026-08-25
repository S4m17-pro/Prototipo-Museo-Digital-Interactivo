import { useState, useEffect, useLayoutEffect, useRef, type ChangeEvent } from 'react';
import { users, contentQueue, kpiData } from '../data';
import type { Page, ContentItem, TimelineEvent, EventItem } from '../data';
import { useData, PLACEHOLDER_IMAGE, PERSON_PLACEHOLDER_IMAGE } from '../context/DataContext';
import { StatusBadge, SectionHeader, StatCard, CategoryBadge, StepIndicator } from '../components/UI';
import { DashboardSidebar } from '../components/Layout';

// ── PESTAÑAS DE "AÑADIR INFORMACIÓN" ─────────────────────────────────────────

const ADD_TABS = [
  { id: 'timeline', label: 'Línea de Tiempo', icon: '📅' },
  { id: 'premio', label: 'Premios y Reconocimientos', icon: '🏆' },
  { id: 'proyecto', label: 'Proyectos Destacados', icon: '🎓' },
  { id: 'hall', label: 'Hall de la Fama', icon: '⭐' },
  { id: 'evento', label: 'Eventos del Calendario', icon: '🗓️' },
  { id: 'noticias', label: 'Noticias', icon: '📰' },
];

// ── KPI CHART (CSS bars) ─────────────────────────────────────────────────────

function BarChart() {
  const max = Math.max(...kpiData.monthlyVisits.map(d => d.visits));
  return (
    <div className="flex items-end gap-2 h-32 pt-2">
      {kpiData.monthlyVisits.map(d => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-t transition-all duration-500"
            style={{
              height: `${(d.visits / max) * 100}%`,
              background: 'linear-gradient(to top, rgba(211, 47, 47,0.6), rgba(211, 47, 47,0.9))',
              minHeight: '4px',
            }} />
          <span className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>{d.month}</span>
        </div>
      ))}
    </div>
  );
}

// ── ADMIN DASHBOARD ──────────────────────────────────────────────────────────

export function AdminDashboard({ navigate }: { navigate: (page: Page, id?: string) => void }) {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="flex gap-8">
        <DashboardSidebar role="admin" currentPage="admin-dashboard" navigate={navigate} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: '#d32f2f' }}>Administración</div>
              <h1 className="font-serif text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Dashboard</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Panel de control de Herencia Digital</p>
            </div>
            <button onClick={() => navigate('admin-cola')} className="btn-primary px-5 py-2.5 rounded text-sm font-semibold flex items-center gap-2">
              Cola de Contenido
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-mono">
                {contentQueue.filter(i => i.status === 'pendiente').length}
              </span>
            </button>
          </div>

          {/* Accesos rápidos: Añadir información */}
          <div className="museum-card rounded p-5 mb-8">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="font-serif font-semibold" style={{ color: 'var(--card-foreground)' }}>➕ Añadir Información</h3>
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Se publica de inmediato en el museo</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {ADD_TABS.map(t => (
                <button key={t.id} onClick={() => navigate('admin-anadir', t.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:translate-y-[-2px]"
                  style={{
                    background: 'rgba(211, 47, 47,0.06)',
                    border: '1px solid rgba(211, 47, 47,0.22)',
                    color: 'var(--secondary-foreground)',
                  }}>
                  <span>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <StatCard label="Total Piezas" value={kpiData.totalContent} />
            <StatCard label="Publicadas" value={kpiData.published} color="#22c55e" />
            <StatCard label="Pendientes" value={kpiData.pending} color="#f97316" />
            <StatCard label="Visitas Totales" value={kpiData.visitors} color="#3b82f6" />
            <StatCard label="Nuevas (mes)" value={kpiData.newThisMonth} color="#a855f7" />
            <StatCard label="Usuarios" value={kpiData.activeUsers} sub="activos" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart */}
            <div className="museum-card rounded p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-semibold" style={{ color: 'var(--card-foreground)' }}>Visitas Mensuales 2024</h3>
                <span className="text-xs font-mono" style={{ color: '#22c55e' }}>+18% vs período anterior</span>
              </div>
              <BarChart />
              <div className="flex justify-between mt-2 text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>
                <span>Ene</span><span>Jul</span>
              </div>
            </div>

            {/* Content by category */}
            <div className="museum-card rounded p-5">
              <h3 className="font-serif font-semibold mb-4" style={{ color: 'var(--card-foreground)' }}>Contenido por Categoría</h3>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Proyectos de Grado', count: 527, pct: 39 },
                  { label: 'Investigación', count: 318, pct: 23 },
                  { label: 'Eventos', count: 203, pct: 15 },
                  { label: 'Historia', count: 142, pct: 10 },
                  { label: 'Logros', count: 89, pct: 7 },
                  { label: 'Docentes', count: 74, pct: 6 },
                ].map(c => (
                  <div key={c.label}>
                    <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
                      <span>{c.label}</span>
                      <span className="font-mono">{c.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${c.pct}%`, background: 'linear-gradient(to right, #d32f2f, #ff4d4d)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending queue preview */}
            <div className="museum-card rounded p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-semibold" style={{ color: 'var(--card-foreground)' }}>Cola de Validación</h3>
                <button onClick={() => navigate('admin-cola')} className="text-xs" style={{ color: '#d32f2f' }}>Ver todo</button>
              </div>
              {contentQueue.filter(i => i.status === 'pendiente').map(item => (
                <div key={item.id} className="flex items-center gap-3 mb-3">
                  <img src={item.image} alt={item.title} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm line-clamp-1" style={{ color: 'var(--secondary-foreground)' }}>{item.title}</div>
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.submittedBy}</div>
                  </div>
                  <button onClick={() => navigate('admin-validacion')} className="text-xs btn-outline-primary px-2 py-1 rounded flex-shrink-0">
                    Revisar
                  </button>
                </div>
              ))}
            </div>

            {/* Recent users */}
            <div className="museum-card rounded p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-semibold" style={{ color: 'var(--card-foreground)' }}>Usuarios Recientes</h3>
                <button onClick={() => navigate('admin-usuarios')} className="text-xs" style={{ color: '#d32f2f' }}>Ver todos</button>
              </div>
              {users.slice(0, 4).map(u => (
                <div key={u.id} className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                    style={{ background: 'rgba(211, 47, 47,0.12)', color: '#d32f2f' }}>
                    {u.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm" style={{ color: 'var(--secondary-foreground)' }}>{u.name}</div>
                    <div className="text-xs capitalize" style={{ color: 'var(--muted-foreground)' }}>{u.role}</div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded font-mono"
                    style={{
                      background: u.status === 'activo' ? 'rgba(34,197,94,0.1)' : u.status === 'pendiente' ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.04)',
                      color: u.status === 'activo' ? '#22c55e' : u.status === 'pendiente' ? '#f97316' : 'var(--muted-foreground)',
                    }}>
                    {u.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN USUARIOS ───────────────────────────────────────────────────────────

export function AdminUsuarios({ navigate }: { navigate: (page: Page) => void }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const filtered = users.filter(u =>
    (!search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) &&
    (!roleFilter || u.role === roleFilter)
  );

  const roleColors: Record<string, string> = {
    admin: '#d32f2f', docente: '#3b82f6', estudiante: '#a855f7', visitante: 'var(--muted-foreground)'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="flex gap-8">
        <DashboardSidebar role="admin" currentPage="admin-usuarios" navigate={navigate} />
        <div className="flex-1 min-w-0">
          <SectionHeader label="Gestión" title="Usuarios" subtitle={`${users.length} usuarios registrados en la plataforma`} />

          <div className="flex gap-3 mb-6 flex-wrap">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o correo…"
              className="museum-input flex-1 px-4 py-2.5 rounded text-sm min-w-48" />
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="museum-input px-3 py-2.5 rounded text-sm">
              <option value="" style={{ background: 'var(--card)' }}>Todos los roles</option>
              {['admin', 'docente', 'estudiante'].map(r => (
                <option key={r} value={r} style={{ background: 'var(--card)' }}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="museum-card rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(211, 47, 47,0.15)' }}>
                    {['Usuario', 'Rol', 'Estado', 'Registro', 'Contribuciones', 'Acciones'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                      className="transition-colors hover:opacity-80">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                            style={{ background: 'rgba(211, 47, 47,0.1)', color: '#d32f2f' }}>
                            {u.name[0]}
                          </div>
                          <div>
                            <div style={{ color: 'var(--secondary-foreground)' }}>{u.name}</div>
                            <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded font-mono capitalize"
                          style={{ background: `${roleColors[u.role]}12`, color: roleColors[u.role] }}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded font-mono"
                          style={{
                            background: u.status === 'activo' ? 'rgba(34,197,94,0.1)' : u.status === 'pendiente' ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.04)',
                            color: u.status === 'activo' ? '#22c55e' : u.status === 'pendiente' ? '#f97316' : 'var(--muted-foreground)',
                          }}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>{u.joinDate}</td>
                      <td className="px-4 py-3 text-center font-mono" style={{ color: 'var(--secondary-foreground)' }}>{u.contributions}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button className="text-xs px-2.5 py-1 rounded btn-outline-primary">Editar</button>
                          {u.status === 'pendiente' && (
                            <button className="text-xs px-2.5 py-1 rounded"
                              style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
                              Aprobar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN COLA DE CONTENIDO ──────────────────────────────────────────────────

export function AdminCola({ navigate }: { navigate: (page: Page, id?: string) => void }) {
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = contentQueue.filter(i => !statusFilter || i.status === statusFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="flex gap-8">
        <DashboardSidebar role="admin" currentPage="admin-cola" navigate={navigate} />
        <div className="flex-1 min-w-0">
          <SectionHeader label="Revisión" title="Cola de Contenido" subtitle="Piezas en espera de validación y publicación." />

          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { value: '', label: 'Todo', count: contentQueue.length },
              { value: 'pendiente', label: 'Pendiente', count: contentQueue.filter(i => i.status === 'pendiente').length },
              { value: 'publicado', label: 'Publicado', count: contentQueue.filter(i => i.status === 'publicado').length },
              { value: 'devuelto', label: 'Devuelto', count: contentQueue.filter(i => i.status === 'devuelto').length },
            ].map(f => (
              <button key={f.value} onClick={() => setStatusFilter(f.value)}
                className="px-3 py-1.5 rounded text-sm transition-all"
                style={{
                  background: statusFilter === f.value ? '#d32f2f' : 'rgba(255,255,255,0.04)',
                  color: statusFilter === f.value ? 'var(--background)' : 'var(--secondary-foreground)',
                  border: `1px solid ${statusFilter === f.value ? '#d32f2f' : 'rgba(255,255,255,0.1)'}`,
                }}>
                {f.label} ({f.count})
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {filtered.map(item => (
              <div key={item.id} className="museum-card rounded p-5 flex gap-4 flex-wrap md:flex-nowrap">
                <img src={item.image} alt={item.title} className="w-24 h-20 object-cover rounded flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap mb-1">
                    <StatusBadge status={item.status} />
                    <CategoryBadge category={item.category} />
                  </div>
                  <h4 className="font-serif font-semibold text-sm mb-1" style={{ color: 'var(--card-foreground)' }}>{item.title}</h4>
                  <p className="text-xs line-clamp-2 mb-2" style={{ color: 'var(--muted-foreground)' }}>{item.description}</p>
                  <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <span>Por: <span style={{ color: 'var(--secondary-foreground)' }}>{item.submittedBy}</span></span>
                    <span className="font-mono">{item.date}</span>
                  </div>
                  {item.reviewNote && (
                    <div className="mt-2 text-xs px-3 py-2 rounded" style={{ background: 'rgba(239,68,68,0.06)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.15)' }}>
                      ↩ Nota: {item.reviewNote}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {item.status === 'pendiente' ? (
                    <button onClick={() => navigate('admin-validacion', item.id)}
                      className="btn-primary px-4 py-2 rounded text-xs font-semibold whitespace-nowrap">
                      Validar →
                    </button>
                  ) : (
                    <button onClick={() => navigate('admin-hall-registro')}
                      className="btn-primary px-4 py-2 rounded text-xs font-semibold whitespace-nowrap flex items-center justify-center gap-1">
                      <span className="text-white">⭐</span> Destacar
                    </button>
                  )}
                  <button onClick={() => navigate('detalle', item.id)} className="btn-outline-primary px-4 py-2 rounded text-xs whitespace-nowrap">
                    Ver Contenido
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN VALIDACIÓN ─────────────────────────────────────────────────────────

interface ValidacionProps {
  navigate: (page: Page, id?: string) => void;
  itemId?: string;
  onApprove: (id: string) => void;
  onReturn: (id: string, note: string) => void;
}

export function AdminValidacion({ navigate, itemId, onApprove, onReturn }: ValidacionProps) {
  const item = contentQueue.find(i => i.id === itemId) || contentQueue[0];
  const [returnNote, setReturnNote] = useState('');
  const [showReturnForm, setShowReturnForm] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="flex gap-8">
        <DashboardSidebar role="admin" currentPage="admin-cola" navigate={navigate} />
        <div className="flex-1 min-w-0">
          <button onClick={() => navigate('admin-cola')} className="flex items-center gap-2 text-sm mb-8 btn-outline-primary px-3 py-1.5 rounded">
            ← Volver a la Cola
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Content preview */}
            <div className="lg:col-span-2">
              <div className="rounded overflow-hidden mb-5" style={{ aspectRatio: '16/9', background: 'var(--card)' }}>
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <StatusBadge status={item.status} />
                <CategoryBadge category={item.category} />
                <span className="text-xs font-mono ml-auto" style={{ color: 'var(--muted-foreground)' }}>{item.date}</span>
              </div>
              <h1 className="font-serif text-2xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>{item.title}</h1>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--secondary-foreground)' }}>{item.description}</p>

              {item.reviewNote && (
                <div className="rounded p-4 mb-4 text-sm" style={{ background: 'rgba(239,68,68,0.06)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <strong>Nota anterior:</strong> {item.reviewNote}
                </div>
              )}

              {/* Files simulation */}
              <div className="museum-card rounded p-4">
                <div className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)' }}>Archivos Adjuntos</div>
                {['documento_principal.pdf', 'evidencia_fotografica.zip', 'certificado_autorizacion.pdf'].map(f => (
                  <div key={f} className="flex items-center gap-3 py-2"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-lg">📄</span>
                    <span className="text-sm flex-1" style={{ color: 'var(--secondary-foreground)' }}>{f}</span>
                    <button className="text-xs" style={{ color: '#d32f2f' }}>Descargar</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions panel */}
            <div className="flex flex-col gap-5">
              {/* Submitter info */}
              <div className="museum-card rounded p-5">
                <div className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)' }}>Enviado por</div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                    style={{ background: 'rgba(211, 47, 47,0.12)', color: '#d32f2f' }}>
                    {(item.submittedBy || 'U')[0]}
                  </div>
                  <div>
                    <div className="font-medium text-sm" style={{ color: 'var(--card-foreground)' }}>{item.submittedBy}</div>
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Docente · Ingeniería de Sistemas</div>
                  </div>
                </div>
                <div className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>Enviado: {item.date}</div>
              </div>

              {/* Checklist review */}
              <div className="museum-card rounded p-5">
                <div className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)' }}>Verificación</div>
                {[
                  'Contenido original verificado',
                  'Archivos completos y legibles',
                  'Relevancia institucional confirmada',
                  'Metadatos correctos',
                ].map(c => (
                  <div key={c} className="flex items-center gap-2 py-2 text-sm" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ color: '#22c55e' }}>✓</span>
                    <span style={{ color: 'var(--secondary-foreground)' }}>{c}</span>
                  </div>
                ))}
              </div>

              {/* Decision buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { onApprove(item.id); navigate('admin-confirmacion', item.id); }}
                  className="w-full py-3 rounded font-semibold text-sm flex items-center justify-center gap-2 btn-float"
                  style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                  ✓ Aprobar y Publicar
                </button>

                <button
                  onClick={() => setShowReturnForm(!showReturnForm)}
                  className="w-full py-3 rounded font-semibold text-sm flex items-center justify-center gap-2"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                  ↩ Devolver con Nota
                </button>

                {showReturnForm && (
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      {['Faltan firmas', 'Mala resolución', 'Datos incompletos', 'No cumple alcance'].map(chip => (
                        <button key={chip} onClick={() => setReturnNote(prev => prev ? `${prev}, ${chip}` : chip)}
                          className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--secondary-foreground)' }}>
                          + {chip}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={returnNote}
                      onChange={e => setReturnNote(e.target.value)}
                      placeholder="Explica por qué se devuelve y qué debe corregirse…"
                      rows={3}
                      className="museum-input w-full px-3 py-2 rounded text-sm resize-none"
                    />
                    <button
                      onClick={() => { if (returnNote.trim()) { onReturn(item.id, returnNote); navigate('admin-cola'); }}}
                      className="w-full py-2.5 rounded text-sm font-semibold"
                      style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                      Confirmar Devolución
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN CONFIRMACIÓN ────────────────────────────────────────────────────────

interface ConfirmacionProps {
  navigate: (page: Page) => void;
  itemId?: string;
}

export function AdminConfirmacion({ navigate, itemId }: ConfirmacionProps) {
  const item = contentQueue.find(i => i.id === itemId) || contentQueue[0];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="flex gap-8">
        <DashboardSidebar role="admin" currentPage="admin-cola" navigate={navigate} />
        <div className="flex-1 flex items-center justify-center min-h-96">
          <div className="text-center max-w-md">
            {/* Success animation */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.4)' }}>
                <span className="text-4xl">✓</span>
              </div>
              <div className="absolute -inset-2 rounded-full border-2 opacity-30 animate-ping"
                style={{ borderColor: '#22c55e' }} />
            </div>

            <h1 className="font-serif text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              ¡Contenido Publicado!
            </h1>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
              La pieza ha sido aprobada y ahora está disponible públicamente en el archivo del museo.
            </p>

            <div className="museum-card rounded p-5 text-left mb-6">
              <div className="flex items-center gap-3 mb-3">
                <img src={item.image} alt={item.title} className="w-12 h-12 rounded object-cover" />
                <div>
                  <div className="font-serif font-semibold text-sm" style={{ color: 'var(--card-foreground)' }}>{item.title}</div>
                  <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Por: {item.submittedBy}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono"
                  style={{ color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Publicado en el Archivo
                </span>
                <span className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>
                  {new Date().toLocaleDateString('es-CO')}
                </span>
              </div>
            </div>

            <div className="text-xs px-4 py-3 rounded mb-6" style={{ background: 'rgba(59,130,246,0.06)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.15)' }}>
              ℹ Se ha enviado una notificación automática al autor y a los usuarios suscritos a esta categoría.
            </div>

            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('admin-cola')} className="btn-outline-primary px-5 py-2.5 rounded text-sm">
                Volver a la Cola
              </button>
              <button onClick={() => navigate('admin-dashboard')} className="btn-primary px-5 py-2.5 rounded text-sm font-semibold">
                Ir al Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN REGISTROS ──────────────────────────────────────────────────────────

export function AdminRegistros({ navigate }: { navigate: (page: Page, id?: string) => void }) {
  const [search, setSearch] = useState('');
  const filtered = contentQueue.filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="flex gap-8">
        <DashboardSidebar role="admin" currentPage="admin-registros" navigate={navigate} />
        <div className="flex-1 min-w-0">
          <SectionHeader label="Archivo" title="Registros Generales" subtitle="Todo el contenido del museo" />
          <div className="mb-6">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar contenido..." className="museum-input w-full px-4 py-2.5 rounded text-sm" />
          </div>
          <div className="museum-card rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(211, 47, 47,0.15)' }}>
                    <th className="px-4 py-3 text-left text-xs font-mono uppercase" style={{ color: 'var(--muted-foreground)' }}>Título</th>
                    <th className="px-4 py-3 text-left text-xs font-mono uppercase" style={{ color: 'var(--muted-foreground)' }}>Autor</th>
                    <th className="px-4 py-3 text-left text-xs font-mono uppercase" style={{ color: 'var(--muted-foreground)' }}>Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-mono uppercase" style={{ color: 'var(--muted-foreground)' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td className="px-4 py-3" style={{ color: 'var(--card-foreground)' }}>{item.title}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--secondary-foreground)' }}>{item.submittedBy}</td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                      <td className="px-4 py-3">
                        <button onClick={() => navigate('detalle', item.id)} className="text-xs btn-outline-primary px-2 py-1 rounded">Ver</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN HALL REGISTRO ──────────────────────────────────────────────────────

export function AdminHallRegistro({ navigate }: { navigate: (page: Page) => void }) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  
  if (submitted) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex gap-8">
          <DashboardSidebar role="admin" currentPage="admin-dashboard" navigate={navigate} />
          <div className="flex-1 flex items-center justify-center min-h-80">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
                style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)' }}>✓</div>
              <h2 className="font-serif text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>¡Añadido al Hall de la Fama!</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>El proyecto ahora es visible en la sección principal del Hall de la Fama.</p>
              <button onClick={() => navigate('admin-dashboard')} className="btn-primary px-5 py-2.5 rounded text-sm">Volver al Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="flex gap-8">
        <DashboardSidebar role="admin" currentPage="admin-dashboard" navigate={navigate} />
        <div className="flex-1 min-w-0">
          <SectionHeader label="Hall de la Fama" title="Destacar Proyecto" />
          
          <StepIndicator steps={['Selección', 'Justificación', 'Revisión', 'Confirmación']} currentStep={step} />

          <div className="museum-card rounded p-6">
            <h3 className="font-serif text-xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Paso {step}</h3>
            {step === 1 && <p className="text-sm" style={{ color: 'var(--secondary-foreground)' }}>Selecciona el proyecto que deseas destacar en el Hall de la Fama.</p>}
            {step === 2 && (
              <div>
                <p className="text-sm mb-2" style={{ color: 'var(--secondary-foreground)' }}>Escribe la justificación institucional de por qué este proyecto merece ser destacado.</p>
                <textarea className="museum-input w-full px-4 py-2.5 rounded text-sm" rows={4} placeholder="Justificación..."></textarea>
              </div>
            )}
            {step === 3 && <p className="text-sm" style={{ color: 'var(--secondary-foreground)' }}>Revisa la información y asegúrate de que todos los metadatos estén correctos.</p>}
            {step === 4 && <p className="text-sm" style={{ color: 'var(--secondary-foreground)' }}>Confirma que deseas publicar este proyecto permanentemente en el Hall de la Fama.</p>}
            
            <div className="mt-6 flex gap-3">
              <button onClick={() => step > 1 ? setStep(step - 1) : navigate('admin-cola')} className="btn-outline-primary px-6 py-2.5 rounded text-sm">
                {step > 1 ? '← Anterior' : 'Cancelar'}
              </button>
              <button onClick={() => step < 4 ? setStep(step + 1) : setSubmitted(true)} className="btn-primary px-8 py-2.5 rounded font-semibold text-sm flex-1">
                {step < 4 ? 'Siguiente paso →' : 'Confirmar y Destacar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN AÑADIR INFORMACIÓN ─────────────────────────────────────────────────

interface AnadirProps {
  navigate: (page: Page) => void;
  presetTab?: string;
}

const inputCls = 'museum-input w-full px-3 py-2.5 rounded text-sm';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-mono uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
        {label}
      </span>
      {children}
    </label>
  );
}

export function AdminAnadir({ navigate, presetTab }: AnadirProps) {
  const { addTimelineEvent, addAchievement, addHallMember, addCalendarEvent, addNews, addFeaturedProject, resetData } = useData();
  const [tab, setTab] = useState(presetTab && ADD_TABS.some(t => t.id === presetTab) ? presetTab : 'timeline');
  const [form, setForm] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pill, setPill] = useState<{ top: number; height: number; ready: boolean }>({ top: 0, height: 0, ready: false });
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (presetTab && ADD_TABS.some(t => t.id === presetTab)) setTab(presetTab);
  }, [presetTab]);

  useLayoutEffect(() => {
    const measure = () => {
      const idx = ADD_TABS.findIndex(t => t.id === tab);
      const el = tabRefs.current[idx];
      if (!el) {
        setPill(p => (p.ready ? { ...p, ready: false } : p));
        return;
      }
      setPill({ top: el.offsetTop, height: el.offsetHeight, ready: true });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [tab]);

  const switchTab = (id: string) => {
    setTab(id);
    setForm({});
    setError('');
    setSavedMsg(null);
    setMediaFiles([]);
    setDragOver(false);
  };

  const setF = (k: string) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const requireFields = (fields: Record<string, string | undefined>): boolean => {
    for (const [label, value] of Object.entries(fields)) {
      if (!value || !String(value).trim()) {
        setError(`El campo "${label}" es obligatorio.`);
        return false;
      }
    }
    return true;
  };

  const validYear = (value: string | undefined): value is string => {
    const year = Number(value);
    if (!Number.isInteger(year) || year < 1900 || year > 2100) {
      setError('El año debe estar entre 1900 y 2100.');
      return false;
    }
    return true;
  };

  const submit = () => {
    setError('');
    switch (tab) {
      case 'timeline': {
        if (!requireFields({ Año: form.year, Título: form.title, Descripción: form.description }) || !validYear(form.year) || !form.type) return;
        if (mediaFiles.length === 0) {
          setError('Debes adjuntar al menos una evidencia multimedia.');
          return;
        }
        addTimelineEvent({
          year: Number(form.year),
          title: form.title.trim(),
          description: form.description.trim(),
          type: form.type as TimelineEvent['type'],
          media: mediaFiles,
        });
        setMediaFiles([]);
        break;
      }
      case 'premio': {
        if (!requireFields({ Año: form.year, Título: form.title, Institución: form.institution, Descripción: form.description }) || !validYear(form.year)) return;
        addAchievement({
          year: Number(form.year),
          title: form.title.trim(),
          institution: form.institution.trim(),
          category: form.category || 'premio',
          description: form.description.trim(),
          image: PLACEHOLDER_IMAGE,
        });
        break;
      }
      case 'proyecto': {
        if (!requireFields({ Título: form.title, Autor: form.author, Fecha: form.date, Descripción: form.description }) || !form.category) return;
        addFeaturedProject({
          title: form.title.trim(),
          author: form.author.trim(),
          category: form.category,
          date: form.date,
          description: form.description.trim(),
          tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
          image: form.image,
        });
        break;
      }
      case 'hall': {
        if (!requireFields({ Nombre: form.name, Título: form.title, Año: form.year, Logro: form.achievement }) || !validYear(form.year) || !form.category) return;
        addHallMember({
          name: form.name.trim(),
          title: form.title.trim(),
          year: Number(form.year),
          achievement: form.achievement.trim(),
          category: form.category,
          image: form.image?.trim() || PERSON_PLACEHOLDER_IMAGE,
          bio: form.bio?.trim() || undefined,
        });
        break;
      }
      case 'evento': {
        if (!requireFields({ Título: form.title, Fecha: form.date, Hora: form.time, Lugar: form.location }) || !form.type) return;
        addCalendarEvent({
          title: form.title.trim(),
          date: form.date,
          time: form.time,
          location: form.location.trim(),
          type: form.type as EventItem['type'],
          description: form.description?.trim() || '',
        });
        break;
      }
      case 'noticias': {
        if (!requireFields({ Título: form.title, Fecha: form.date, Contenido: form.excerpt }) || !form.category) return;
        addNews({
          title: form.title.trim(),
          category: form.category,
          date: form.date,
          excerpt: form.excerpt.trim(),
          image: form.image?.trim() || PLACEHOLDER_IMAGE,
        });
        break;
      }
    }
    const label = ADD_TABS.find(t => t.id === tab)?.label ?? '';
    setSavedMsg(`${label}: registro publicado`);
    setForm({});
  };

  if (savedMsg) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex gap-8">
          <DashboardSidebar role="admin" currentPage="admin-anadir" navigate={navigate} />
          <div className="flex-1 flex items-center justify-center min-h-80">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
                style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)' }}>✓</div>
              <h2 className="font-serif text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>¡{savedMsg}!</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
                La información ya está disponible en su sección pública del museo.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setSavedMsg(null)} className="btn-outline-primary px-5 py-2.5 rounded text-sm">
                  Añadir otro
                </button>
                <button onClick={() => navigate('admin-dashboard')} className="btn-primary px-5 py-2.5 rounded text-sm font-semibold">
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
        <DashboardSidebar role="admin" currentPage="admin-anadir" navigate={navigate} />
        <div className="flex-1 min-w-0">
          <SectionHeader label="Administración" title="Añadir Información" subtitle="Publica hitos, premios, proyectos, miembros del Hall y eventos directamente en el museo." />

          <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-6 items-start">
            {/* Selector de tipo */}
            <nav className="relative flex lg:flex-col gap-1 overflow-x-auto pb-1">
              {ADD_TABS.map((t, i) => {
                const isActive = t.id === tab;
                return (
                  <button key={t.id} onClick={() => switchTab(t.id)}
                    ref={el => {
                      tabRefs.current[i] = el;
                    }}
                    className={`sb-item group relative z-10 flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${isActive ? '' : 'hover:translate-x-1'}`}
                    style={{ color: isActive ? '#ffffff' : 'var(--secondary-foreground)', animationDelay: `${i * 50}ms` }}>
                    <span className={`sb-chip ${isActive ? 'sb-chip-on' : ''}`}>{t.icon}</span>
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
              <div
                aria-hidden="true"
                className="hidden lg:block absolute left-0 right-0 rounded-lg pointer-events-none z-0"
                style={{
                  transform: `translateY(${pill.top}px)`,
                  height: pill.height,
                  opacity: pill.ready ? 1 : 0,
                  background: 'linear-gradient(135deg, #e53935, #b71c1c)',
                  boxShadow: '0 4px 16px rgba(211, 47, 47, 0.45)',
                  transition:
                    'transform .38s cubic-bezier(0.22, 0.61, 0.36, 1), height .38s cubic-bezier(0.22, 0.61, 0.36, 1), opacity .25s ease .1s',
                }}
              />
            </nav>

            {/* Formulario */}
            <div className="museum-card rounded p-6">
              {error && (
                <div className="mb-4 text-xs px-3 py-2 rounded" style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                  ⚠ {error}
                </div>
              )}

              {tab === 'timeline' && (
                <div className="flex flex-col gap-4">
                  <h3 className="font-serif font-semibold" style={{ color: 'var(--card-foreground)' }}>📅 Nuevo hito de la línea de tiempo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Año *"><input type="number" min={1900} max={2100} value={form.year || ''} onChange={setF('year')} placeholder="2024" className={inputCls} /></Field>
                    <Field label="Tipo *">
                      <select value={form.type || ''} onChange={setF('type')} className={inputCls}>
                        <option value="">Selecciona…</option>
                        <option value="fundacion">Fundación</option>
                        <option value="logro">Logro</option>
                        <option value="evento">Evento</option>
                        <option value="investigacion">Investigación</option>
                      </select>
                    </Field>
                  </div>
                  <Field label="Título *"><input value={form.title || ''} onChange={setF('title')} placeholder="Inauguración del nuevo laboratorio…" className={inputCls} /></Field>
                  <Field label="Descripción *"><textarea rows={3} value={form.description || ''} onChange={setF('description')} placeholder="Describe el hito…" className={`${inputCls} resize-none`} /></Field>
                  <div>
                    <span className="block text-xs font-mono uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Evidencias Multimedia *</span>
                    <div
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={e => {
                        e.preventDefault();
                        setDragOver(false);
                        const dropped = Array.from(e.dataTransfer.files).map(f => f.name);
                        setMediaFiles(prev => [...prev, ...dropped]);
                      }}
                      className="rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-all"
                      style={{
                        borderColor: dragOver ? 'rgba(211, 47, 47,0.6)' : 'rgba(211, 47, 47,0.2)',
                        background: dragOver ? 'rgba(211, 47, 47,0.04)' : 'transparent',
                      }}
                      onClick={() => setMediaFiles(prev => [...prev, `evidencia_${prev.length + 1}.pdf`])}
                    >
                      <div className="text-2xl mb-1.5 opacity-50">📎</div>
                      <p className="text-sm font-medium" style={{ color: 'var(--secondary-foreground)' }}>Arrastra archivos aquí o haz clic para seleccionar</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Fotos, videos, audios o documentos que respalden el hito (máx. 50 MB por archivo)</p>
                    </div>
                    {mediaFiles.length > 0 && (
                      <div className="flex flex-col gap-2 mt-3">
                        {mediaFiles.map((f, i) => (
                          <div key={`${f}-${i}`} className="flex items-center gap-2 text-sm px-3 py-2 rounded"
                            style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
                            <span style={{ color: '#22c55e' }}>✓</span>
                            <span style={{ color: 'var(--secondary-foreground)' }}>{f}</span>
                            <button type="button" onClick={() => setMediaFiles(prev => prev.filter((_, j) => j !== i))}
                              className="ml-auto text-xs" style={{ color: 'var(--muted-foreground)' }}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <SubmitRow onSubmit={submit} />
                </div>
              )}

              {tab === 'premio' && (
                <div className="flex flex-col gap-4">
                  <h3 className="font-serif font-semibold" style={{ color: 'var(--card-foreground)' }}>🏆 Nuevo premio o reconocimiento</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Año *"><input type="number" min={1900} max={2100} value={form.year || ''} onChange={setF('year')} placeholder="2025" className={inputCls} /></Field>
                    <Field label="Categoría">
                      <select value={form.category || 'premio'} onChange={setF('category')} className={inputCls}>
                        <option value="premio">Premio</option>
                        <option value="certificacion">Certificación</option>
                        <option value="reconocimiento">Reconocimiento</option>
                      </select>
                    </Field>
                  </div>
                  <Field label="Título *"><input value={form.title || ''} onChange={setF('title')} placeholder="Premio Nacional de Ingeniería…" className={inputCls} /></Field>
                  <Field label="Institución otorgante *"><input value={form.institution || ''} onChange={setF('institution')} placeholder="Ministerio de Tecnologías de la Información…" className={inputCls} /></Field>
                  <Field label="Descripción *"><textarea rows={3} value={form.description || ''} onChange={setF('description')} placeholder="Describe el reconocimiento…" className={`${inputCls} resize-none`} /></Field>
                  <SubmitRow onSubmit={submit} />
                </div>
              )}

              {tab === 'proyecto' && (
                <div className="flex flex-col gap-4">
                  <h3 className="font-serif font-semibold" style={{ color: 'var(--card-foreground)' }}>🎓 Nuevo proyecto destacado</h3>
                  <Field label="Título *"><input value={form.title || ''} onChange={setF('title')} placeholder="Plataforma web para… " className={inputCls} /></Field>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Autor *"><input value={form.author || ''} onChange={setF('author')} placeholder="Nombre del autor…" className={inputCls} /></Field>
                    <Field label="Fecha *"><input type="date" value={form.date || ''} onChange={setF('date')} className={inputCls} /></Field>
                  </div>
                  <Field label="Categoría *">
                    <select value={form.category || ''} onChange={setF('category')} className={inputCls}>
                      <option value="">Selecciona…</option>
                      {['investigacion', 'proyectos', 'historia', 'eventos', 'logros', 'docentes'].map(c => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Descripción *"><textarea rows={3} value={form.description || ''} onChange={setF('description')} placeholder="Describe el proyecto…" className={`${inputCls} resize-none`} /></Field>
                  <Field label="Etiquetas (separadas por coma)"><input value={form.tags || ''} onChange={setF('tags')} placeholder="IA, Python, Salud" className={inputCls} /></Field>
                  <Field label="URL de imagen (opcional)"><input value={form.image || ''} onChange={setF('image')} placeholder="https://…" className={inputCls} /></Field>
                  <SubmitRow onSubmit={submit} />
                </div>
              )}

              {tab === 'hall' && (
                <div className="flex flex-col gap-4">
                  <h3 className="font-serif font-semibold" style={{ color: 'var(--card-foreground)' }}>⭐ Nuevo miembro del Hall de la Fama</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Nombre completo *"><input value={form.name || ''} onChange={setF('name')} placeholder="Ing. Nombre Apellido…" className={inputCls} /></Field>
                    <Field label="Cargo actual *"><input value={form.title || ''} onChange={setF('title')} placeholder="CTO – Empresa…" className={inputCls} /></Field>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Año de graduación *"><input type="number" min={1900} max={2100} value={form.year || ''} onChange={setF('year')} placeholder="2010" className={inputCls} /></Field>
                    <Field label="Categoría *">
                      <select value={form.category || ''} onChange={setF('category')} className={inputCls}>
                        <option value="">Selecciona…</option>
                        {['Industria Tecnológica', 'Investigación', 'Gestión Académica', 'Emprendimiento', 'Docencia', 'Sector Público'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <Field label="Logro destacado *"><textarea rows={3} value={form.achievement || ''} onChange={setF('achievement')} placeholder="Describe su logro más relevante…" className={`${inputCls} resize-none`} /></Field>
                  <Field label="URL de foto (opcional)"><input value={form.image || ''} onChange={setF('image')} placeholder="https://…" className={inputCls} /></Field>
                  <Field label="Biografía"><textarea rows={4} value={form.bio || ''} onChange={setF('bio')} placeholder="Trayectoria profesional y académica del miembro. Se mostrará en su perfil del Hall de la Fama…" className={`${inputCls} resize-none`} /></Field>
                  <SubmitRow onSubmit={submit} />
                </div>
              )}

              {tab === 'evento' && (
                <div className="flex flex-col gap-4">
                  <h3 className="font-serif font-semibold" style={{ color: 'var(--card-foreground)' }}>🗓️ Nuevo evento en el calendario</h3>
                  <Field label="Título *"><input value={form.title || ''} onChange={setF('title')} placeholder="Conferencia: …" className={inputCls} /></Field>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="Fecha *"><input type="date" value={form.date || ''} onChange={setF('date')} className={inputCls} /></Field>
                    <Field label="Hora *"><input type="time" value={form.time || ''} onChange={setF('time')} className={inputCls} /></Field>
                    <Field label="Tipo *">
                      <select value={form.type || ''} onChange={setF('type')} className={inputCls}>
                        <option value="">Selecciona…</option>
                        <option value="conferencia">Conferencia</option>
                        <option value="taller">Taller</option>
                        <option value="graduacion">Graduación</option>
                        <option value="cultural">Cultural</option>
                      </select>
                    </Field>
                  </div>
                  <Field label="Lugar *"><input value={form.location || ''} onChange={setF('location')} placeholder="Auditorio Principal…" className={inputCls} /></Field>
                  <Field label="Descripción"><textarea rows={3} value={form.description || ''} onChange={setF('description')} placeholder="Detalles del evento…" className={`${inputCls} resize-none`} /></Field>
                  <SubmitRow onSubmit={submit} />
                </div>
              )}

              {tab === 'noticias' && (
                <div className="flex flex-col gap-4">
                  <h3 className="font-serif font-semibold" style={{ color: 'var(--card-foreground)' }}>📰 Nueva noticia</h3>
                  <Field label="Título *"><input value={form.title || ''} onChange={setF('title')} placeholder="Título de la noticia…" className={inputCls} /></Field>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Categoría *">
                      <select value={form.category || ''} onChange={setF('category')} className={inputCls}>
                        <option value="">Selecciona…</option>
                        {['Institucional', 'Archivo', 'Investigación', 'Hall de la Fama', 'Convocatoria', 'Evento'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Fecha *"><input type="date" value={form.date || ''} onChange={setF('date')} className={inputCls} /></Field>
                  </div>
                  <Field label="Contenido *"><textarea rows={5} value={form.excerpt || ''} onChange={setF('excerpt')} placeholder="Escribe la noticia completa. Aparecerá en el carrusel del inicio y en la sección Noticias de Explorar…" className={`${inputCls} resize-none`} /></Field>
                  <Field label="URL de imagen (opcional)"><input value={form.image || ''} onChange={setF('image')} placeholder="https://…" className={inputCls} /></Field>
                  <SubmitRow onSubmit={submit} />
                </div>
              )}

              <div className="mt-8 pt-4" style={{ borderTop: '1px solid rgba(211,47,47,0.12)' }}>
                <button onClick={() => { if (window.confirm('¿Restaurar todos los datos demo? Se perderá la información añadida.')) resetData(); }}
                  className="text-xs btn-outline-primary px-3 py-2 rounded">
                  ↺ Restaurar datos demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubmitRow({ onSubmit }: { onSubmit: () => void }) {
  return (
    <div className="flex justify-end pt-2">
      <button onClick={onSubmit} className="btn-primary btn-float px-6 py-2.5 rounded text-sm font-semibold">
        Publicar en el museo →
      </button>
    </div>
  );
}
