import type { Page, Role, User } from '../data';
import { users, badges, getLevelInfo } from '../data';
import { SectionHeader } from '../components/UI';

interface ProgresoProps {
  role: Role;
  navigate: (page: Page, id?: string) => void;
}

const PARTICIPANT_ROLES: Role[] = ['estudiante', 'egresado', 'docente'];

// Persona demo fija por rol — misma convención que ya usan EstDashboard/DocDashboard
// (ej. "Bienvenida, Ana Lucía", "Buenos días, Dr. Casas").
const DEMO_EMAIL_BY_ROLE: Partial<Record<Role, string>> = {
  estudiante: 'ana.bermudez@unilibre.edu.co',
  egresado: 'egresado@unilibre.edu.co',
  docente: 'h.casas@unilibre.edu.co',
};

const ROLE_LABEL: Record<Role, string> = {
  visitante: 'Visitante',
  estudiante: 'Estudiante',
  docente: 'Docente',
  admin: 'Admin',
  egresado: 'Egresado',
};

const MEDALS = ['🥇', '🥈', '🥉'];

export function ProgresoPage({ role }: ProgresoProps) {
  const isParticipant = PARTICIPANT_ROLES.includes(role);
  const me = isParticipant ? users.find(u => u.email === DEMO_EMAIL_BY_ROLE[role]) : undefined;

  // Solo Estudiante/Egresado/Docente acumulan puntos y pueden aparecer aquí;
  // Admin queda excluido por construcción (FR-010), no por una validación aparte.
  const rankingEntries = users
    .filter(u => PARTICIPANT_ROLES.includes(u.role))
    .sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
    .slice(0, 10);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">
      {isParticipant && me ? (
        <SectionHeader label="Gamificación" title="Mi Progreso" subtitle="Tu avance dentro del Museo Digital Interactivo." />
      ) : (
        <SectionHeader label="Gamificación" title="Rankings" subtitle="Participación de estudiantes, egresados y docentes en el museo." />
      )}

      {isParticipant && me && (
        <ProgresoPersonal me={me} />
      )}

      <div className="museum-card rounded overflow-hidden">
        <div className="px-5 pt-5">
          <h3 className="font-serif font-semibold" style={{ color: 'var(--card-foreground)' }}>Ranking de Participación · Top 10</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm mt-4">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(211, 47, 47,0.15)' }}>
                {['#', 'Usuario', 'Rol', 'Puntos'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rankingEntries.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < rankingEntries.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <td className="px-5 py-3 text-base">{MEDALS[i] ?? i + 1}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                        style={{ background: 'rgba(211, 47, 47,0.1)', color: '#d32f2f' }}>
                        {u.name[0]}
                      </div>
                      <span style={{ color: 'var(--secondary-foreground)' }}>{u.name}{me?.id === u.id ? ' (Tú)' : ''}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: 'rgba(211, 47, 47,0.08)', color: '#d32f2f' }}>
                      {ROLE_LABEL[u.role]}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono" style={{ color: 'var(--secondary-foreground)' }}>{(u.points ?? 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProgresoPersonal({ me }: { me: User }) {
  const lvl = getLevelInfo(me.points ?? 0);
  const earnedIds = me.badgeIds ?? [];

  return (
    <>
      <div className="museum-card rounded p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-6 mb-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: 'var(--muted-foreground)' }}>Nivel actual</div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-5xl font-black" style={{ color: '#d32f2f' }}>{lvl.level}</span>
              <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>/ {lvl.maxLevel}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: 'var(--muted-foreground)' }}>Puntos totales</div>
            <div className="font-serif text-3xl font-bold" style={{ color: 'var(--foreground)' }}>{(me.points ?? 0).toLocaleString()}</div>
            {lvl.level < lvl.maxLevel && (
              <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                Faltan {Math.max(0, lvl.pointsForNextLevel - lvl.pointsIntoLevel).toLocaleString()} para Nivel {lvl.level + 1}
              </div>
            )}
          </div>
        </div>
        <div className="h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${lvl.progressPct}%`, background: 'linear-gradient(to right, #d32f2f, #ff4d4d)' }} />
        </div>
      </div>

      <div className="museum-card rounded p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif font-semibold" style={{ color: 'var(--card-foreground)' }}>Insignias</h3>
          <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(211, 47, 47,0.1)', color: '#d32f2f' }}>
            {earnedIds.length} / {badges.length}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {badges.map(b => {
            const earned = earnedIds.includes(b.id);
            return (
              <div key={b.id} className="flex flex-col items-center gap-1.5 p-3 rounded text-center"
                style={{
                  background: earned ? 'rgba(211, 47, 47,0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${earned ? 'rgba(211, 47, 47,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  opacity: earned ? 1 : 0.45,
                }}>
                <span className="text-2xl">{earned ? b.icon : '🔒'}</span>
                <span className="text-xs font-medium" style={{ color: earned ? '#d32f2f' : 'var(--muted-foreground)' }}>{b.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
