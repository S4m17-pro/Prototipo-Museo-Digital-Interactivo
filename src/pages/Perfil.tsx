import { useRef, useState } from 'react';
import type { Page, Role, User } from '../data';
import { users, researchGroups, getLevelInfo, getDemoUserForRole, getContributionsFor } from '../data';
import { ContentCard, EmptyState, SectionHeader } from '../components/UI';

interface PerfilProps {
  role: Role;
  navigate: (page: Page, id?: string) => void;
  viewUserId?: string;
  profileEdits: Record<string, { bio?: string; photoUrl?: string }>;
  onUpdateProfile: (userId: string, edits: { bio?: string; photoUrl?: string }) => void;
}

const PARTICIPANT_ROLES: Role[] = ['estudiante', 'egresado', 'docente'];

const ROLE_LABEL: Record<Role, string> = {
  visitante: 'Visitante',
  estudiante: 'Estudiante',
  docente: 'Docente',
  admin: 'Admin',
  egresado: 'Egresado',
};

function formatJoinDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('es-CO', { year: 'numeric', month: 'long' });
}

const STATUS_LABEL: Record<'activo' | 'inactivo' | 'pendiente', { label: string; color: string; bg: string }> = {
  activo: { label: 'Activo', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  pendiente: { label: 'Pendiente de aprobación', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  inactivo: { label: 'Inactivo', color: 'var(--muted-foreground)', bg: 'rgba(255,255,255,0.04)' },
};

export function PerfilPage({ role, navigate, viewUserId, profileEdits, onUpdateProfile }: PerfilProps) {
  const selfUser = getDemoUserForRole(role);
  const baseUser = viewUserId ? users.find(u => u.id === viewUserId) : selfUser;
  const isOwner = !!baseUser && !!selfUser && baseUser.id === selfUser.id;

  // Admin nunca tiene perfil público — solo puede verse a sí mismo (FR-002).
  if (!baseUser || (baseUser.role === 'admin' && !isOwner)) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">
        <SectionHeader label="Identidad" title="Perfil" />
        <EmptyState message="Este perfil no está disponible." icon="👤" />
      </div>
    );
  }

  const me: User = { ...baseUser, ...profileEdits[baseUser.id] };
  const title = isOwner ? 'Mi Perfil' : `Perfil de ${me.name}`;
  const isParticipant = PARTICIPANT_ROLES.includes(me.role);
  const status = STATUS_LABEL[me.status];
  const myGroup = me.researchGroupId ? researchGroups.find(g => g.id === me.researchGroupId) : undefined;
  const isGroupLeader = !!myGroup && myGroup.lead === me.name;
  // El perfil es una vitrina pública: solo se muestran contribuciones publicadas.
  // Las pendientes/devueltas siguen viéndose en el Dashboard ("Necesitan tu Atención").
  const myContent = getContributionsFor(me).filter(i => i.status === 'publicado' || i.status === 'institucional');

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
      <SectionHeader
        label="Identidad"
        title={title}
        subtitle={isOwner ? 'Tu información dentro del Museo Digital Interactivo.' : 'Información pública dentro del Museo Digital Interactivo.'}
      />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Columna izquierda — tarjeta fija */}
        <div className="lg:w-80 flex-shrink-0 flex flex-col gap-6">
          <div className="museum-card rounded p-6 text-center">
            <Avatar me={me} isOwner={isOwner} onUpdateProfile={onUpdateProfile} />
            <h2 className="font-serif text-xl font-bold mt-3" style={{ color: 'var(--foreground)' }}>{me.name}</h2>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: 'rgba(211, 47, 47,0.1)', color: '#d32f2f', border: '1px solid rgba(211, 47, 47,0.25)' }}>
                {ROLE_LABEL[me.role]}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: status.bg, color: status.color }}>
                {status.label}
              </span>
            </div>
            <div className="text-sm mt-3" style={{ color: 'var(--muted-foreground)' }}>
              <div>{me.email}</div>
              <div className="text-xs mt-1">Miembro desde {formatJoinDate(me.joinDate)}</div>
            </div>
          </div>

          <BioCard me={me} isOwner={isOwner} onUpdateProfile={onUpdateProfile} />

          {isParticipant && (
            <PerfilProgreso me={me} navigate={navigate} />
          )}

          {(me.role === 'estudiante' || me.role === 'docente') && (
            <div className="museum-card rounded p-5">
              <h3 className="font-serif font-semibold mb-3" style={{ color: 'var(--card-foreground)' }}>Grupo de Investigación / Semillero</h3>
              {myGroup ? (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'rgba(211, 47, 47,0.08)' }}>
                    {myGroup.category === 'semillero' ? '🔬' : '🧪'}
                  </div>
                  <div>
                    <div className="text-sm font-serif font-semibold" style={{ color: 'var(--card-foreground)' }}>{myGroup.name}</div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded"
                      style={{
                        background: isGroupLeader ? 'rgba(211, 47, 47,0.12)' : 'rgba(255,255,255,0.04)',
                        color: isGroupLeader ? '#d32f2f' : 'var(--muted-foreground)',
                      }}>
                      {isGroupLeader ? 'Líder del grupo' : 'Miembro'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No pertenece a ningún grupo de investigación o semillero todavía.</p>
              )}
            </div>
          )}

          {me.role === 'egresado' && (
            <div className="museum-card rounded p-5">
              <h3 className="font-serif font-semibold mb-3" style={{ color: 'var(--card-foreground)' }}>Trayectoria de Egresado</h3>
              <div className="flex flex-col gap-2 text-sm">
                {me.graduationYear && (
                  <div className="flex justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--muted-foreground)' }}>Año de grado</span>
                    <span style={{ color: 'var(--secondary-foreground)' }}>{me.graduationYear}</span>
                  </div>
                )}
                {me.currentPosition && (
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--muted-foreground)' }}>Cargo actual</span>
                    <span style={{ color: 'var(--secondary-foreground)' }}>{me.currentPosition}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha — galería de contribuciones */}
        <div className="flex-1 min-w-0">
          <h3 className="font-serif font-semibold mb-4" style={{ color: 'var(--card-foreground)' }}>Contribuciones ({myContent.length})</h3>
          {myContent.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {myContent.map(item => (
                <ContentCard key={item.id} item={item} navigate={navigate} showStatus />
              ))}
            </div>
          ) : (
            <EmptyState message="Todavía no hay contribuciones registradas." icon="📂" />
          )}
        </div>
      </div>
    </div>
  );
}

function Avatar({ me, isOwner, onUpdateProfile }: { me: User; isOwner: boolean; onUpdateProfile: (userId: string, edits: { photoUrl?: string }) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Ese archivo no es una imagen válida.');
      return;
    }
    setError('');
    onUpdateProfile(me.id, { photoUrl: URL.createObjectURL(file) });
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24 mx-auto">
        {me.photoUrl ? (
          <img src={me.photoUrl} alt={me.name} className="w-24 h-24 rounded-full object-cover" />
        ) : (
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold"
            style={{ background: 'rgba(211, 47, 47,0.15)', color: '#d32f2f' }}>
            {me.name[0]}
          </div>
        )}
        {isOwner && (
          <>
            <button onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-sm"
              style={{ background: '#d32f2f', color: '#fff', border: '2px solid var(--card)' }}
              title="Cambiar foto de perfil">
              📷
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
          </>
        )}
      </div>
      {error && <p className="text-xs mt-2" style={{ color: '#ef4444' }}>{error}</p>}
    </div>
  );
}

function BioCard({ me, isOwner, onUpdateProfile }: { me: User; isOwner: boolean; onUpdateProfile: (userId: string, edits: { bio?: string }) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(me.bio ?? '');

  if (!isOwner && !me.bio) return null;

  return (
    <div className="museum-card rounded p-5">
      <h3 className="font-serif font-semibold mb-3" style={{ color: 'var(--card-foreground)' }}>Biografía</h3>
      {isOwner && editing ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={4}
            placeholder="Cuéntale al resto del museo quién eres…"
            className="museum-input w-full px-3 py-2 rounded text-sm resize-none"
          />
          <div className="flex gap-2">
            <button onClick={() => { onUpdateProfile(me.id, { bio: draft }); setEditing(false); }} className="btn-primary px-4 py-1.5 rounded text-xs">
              Guardar
            </button>
            <button onClick={() => { setDraft(me.bio ?? ''); setEditing(false); }} className="btn-outline-primary px-4 py-1.5 rounded text-xs">
              Cancelar
            </button>
          </div>
        </div>
      ) : me.bio ? (
        <div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--secondary-foreground)' }}>{me.bio}</p>
          {isOwner && (
            <button onClick={() => setEditing(true)} className="text-xs btn-outline-primary px-3 py-1 rounded mt-3">
              Editar
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-3">
          <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>Todavía no has escrito tu biografía.</p>
          <button onClick={() => setEditing(true)} className="text-xs btn-primary px-4 py-1.5 rounded">
            Escribir biografía
          </button>
        </div>
      )}
    </div>
  );
}

function PerfilProgreso({ me, navigate }: { me: User; navigate: (page: Page, id?: string) => void }) {
  const lvl = getLevelInfo(me.points ?? 0);

  return (
    <div className="museum-card rounded p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-serif font-semibold" style={{ color: 'var(--card-foreground)' }}>Progreso</h3>
        <button onClick={() => navigate('progreso')} className="text-xs btn-outline-primary px-3 py-1.5 rounded">
          Ver progreso →
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: 'var(--muted-foreground)' }}>Nivel</div>
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-3xl font-black" style={{ color: '#d32f2f' }}>{lvl.level}</span>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>/ {lvl.maxLevel}</span>
          </div>
        </div>
        <div>
          <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: 'var(--muted-foreground)' }}>Puntos</div>
          <div className="font-serif text-xl font-bold" style={{ color: 'var(--foreground)' }}>{(me.points ?? 0).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
