import type { Page, Role } from '../data';
import { contentQueue } from '../data';

type SidebarLink = { label: string; page: Page; icon: string; badge?: number };

function getAdminNavLinks(): SidebarLink[] {
  const pendingCount = contentQueue.filter(i => i.status === 'pendiente').length;
  return [
    { label: 'Dashboard', page: 'admin-dashboard', icon: '⊞' },
    { label: 'Cola de Contenido', page: 'admin-cola', icon: '📋', badge: pendingCount },
    { label: 'Usuarios', page: 'admin-usuarios', icon: '👥' },
    { label: 'Registros Generales', page: 'admin-registros', icon: '🗃' },
  ];
}

interface NavProps {
  currentPage: Page;
  role: Role;
  navigate: (page: Page) => void;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

function SearchButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Buscar"
      title="Buscar"
      className="flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 flex-shrink-0"
    >
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="6.5" />
        <line x1="19" y1="19" x2="14.5" y2="14.5" />
      </svg>
    </button>
  );
}

function ThemeToggle({ theme, onToggle }: { theme: 'dark' | 'light'; onToggle: () => void }) {
  const isDark = theme === 'dark';
  return (
    <button
      onClick={onToggle}
      aria-label="Cambiar tema"
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all duration-300"
      style={{
        background: isDark ? 'rgba(211, 47, 47,0.12)' : 'rgba(0,0,0,0.08)',
        border: `1px solid ${isDark ? 'rgba(211, 47, 47,0.3)' : 'rgba(0,0,0,0.15)'}`,
      }}
    >
      <span className="text-sm leading-none select-none" style={{ transition: 'opacity 0.2s' }}>
        {isDark ? '☀️' : '🌙'}
      </span>
      {/* Track */}
      <div
        className="relative w-9 h-5 rounded-full transition-all duration-300"
        style={{ background: isDark ? 'rgba(211, 47, 47,0.25)' : 'rgba(0,0,0,0.12)' }}
      >
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300 shadow-sm"
          style={{
            left: isDark ? '18px' : '2px',
            background: isDark ? '#d32f2f' : '#111111',
          }}
        />
      </div>
    </button>
  );
}

export function Header({ currentPage, role, navigate, onLogout, theme, onToggleTheme }: NavProps) {
  const isAuth = role !== 'visitante';

  const publicLinks: { label: string; page: Page }[] = [
    { label: 'Explorar', page: 'explorar' },
    { label: 'Hall de la Fama', page: 'hall-fama' },
  ];

  const roleLinks: Record<string, { label: string; page: Page; icon?: string }[]> = {
    estudiante: [
      { label: 'Mi Espacio', page: 'est-dashboard' },
      { label: 'Favoritos', page: 'est-favoritos' },
      { label: 'Contribuir', page: 'est-contribuir' },
    ],
    docente: [
      { label: 'Mi Espacio', page: 'doc-dashboard' },
    ],
    egresado: [
      { label: 'Mi Espacio', page: 'est-dashboard' },
      { label: 'Favoritos', page: 'est-favoritos' },
      { label: 'Contribuir', page: 'est-contribuir' },
    ],
  };

  const dashboardLinks = isAuth ? (roleLinks[role] || []) : [];
  const roleBadge: Record<string, string> = {
    estudiante: 'Estudiante',
    docente: 'Docente',
    admin: 'Admin',
    egresado: 'Egresado',
  };

  return (
    <header style={{ background: 'rgba(10,10,10,0.97)', borderBottom: '1px solid rgba(211, 47, 47,0.15)' }}
      className="sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-3 flex-shrink-0 group"
        >
          <div className="w-8 h-8 rounded-sm flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #d32f2f, #660000)' }}>
            <span className="text-sm font-bold text-black">UL</span>
          </div>
          <div className="hidden sm:block">
            <div className="font-serif text-sm font-bold leading-none" style={{ color: '#d32f2f' }}>UniLibreTour</div>
            <div className="text-xs leading-none mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Museo Digital Interactivo</div>
          </div>
        </button>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {publicLinks.map(l => (
            <button
              key={l.page}
              onClick={() => navigate(l.page)}
              className="px-3 py-1.5 text-sm rounded transition-colors"
              style={{ color: currentPage === l.page ? '#d32f2f' : 'var(--secondary-foreground)', background: currentPage === l.page ? 'rgba(211, 47, 47,0.08)' : 'transparent' }}
            >
              {l.label}
            </button>
          ))}
          {dashboardLinks.map(l => (
            <button
              key={l.page}
              onClick={() => navigate(l.page)}
              className="px-3 py-1.5 text-sm rounded transition-colors flex items-center gap-1.5"
              style={{ color: currentPage === l.page ? '#d32f2f' : 'var(--secondary-foreground)', background: currentPage === l.page ? 'rgba(211, 47, 47,0.08)' : 'transparent' }}
            >
              {l.icon && <span className="relative">
                {l.icon}
                {l.page === 'doc-notificaciones' && (
                  <span className="absolute -top-1.5 -right-2 text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full"
                    style={{ background: '#d32f2f', color: '#fff', fontSize: '9px' }}>3</span>
                )}
              </span>}
              {l.label}
            </button>
          ))}
          {/* Gamificación: "Mi Progreso" para quien participa (Estudiante/Egresado/Docente), "Rankings" para el resto */}
          <button
            onClick={() => navigate('progreso')}
            className="px-3 py-1.5 text-sm rounded transition-colors"
            style={{ color: currentPage === 'progreso' ? '#d32f2f' : 'var(--secondary-foreground)', background: currentPage === 'progreso' ? 'rgba(211, 47, 47,0.08)' : 'transparent' }}
          >
            {(['estudiante', 'egresado', 'docente'] as Role[]).includes(role) ? 'Mi Progreso' : 'Rankings'}
          </button>
        </nav>

        {/* Auth section */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <SearchButton onClick={() => navigate('buscar')} />
          {isAuth ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1.5">
                <span className="text-xs px-2 py-0.5 rounded-full font-mono"
                  style={{ background: 'rgba(211, 47, 47,0.12)', color: '#d32f2f', border: '1px solid rgba(211, 47, 47,0.25)' }}>
                  {roleBadge[role]}
                </span>
              </span>
              <button
                onClick={onLogout}
                className="text-xs px-3 py-1.5 rounded btn-outline-primary"
              >
                Salir
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('login')}
              className="text-sm px-4 py-1.5 rounded btn-primary btn-float"
            >
              Ingresar
            </button>
          )}
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  );
}

interface FooterProps {
  navigate: (page: Page) => void;
}

export function Footer({ navigate }: FooterProps) {
  return (
    <footer style={{ background: '#080808', borderTop: '1px solid rgba(211, 47, 47,0.12)' }} className="mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="font-serif text-lg font-bold mb-1" style={{ color: '#d32f2f' }}>UniLibreTour</div>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Museo Digital Interactivo del Programa de Ingeniería de Sistemas — Universidad Libre, Colombia.
          </p>
          <p className="text-xs mt-3 font-mono" style={{ color: 'var(--muted-foreground)' }}>© 2025 Universidad Libre · Todos los derechos reservados</p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)' }}>Explorar</div>
          <div className="flex flex-col gap-1.5">
            {(['explorar', 'buscar', 'hall-fama'] as Page[]).map((p, i) => (
              <button key={p} onClick={() => navigate(p)}
                className="text-sm text-left w-fit transition-colors hover:text-primary"
                style={{ color: 'var(--secondary-foreground)' }}>
                {['Colecciones', 'Buscador', 'Hall de la Fama'][i]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)' }}>Institución</div>
          <div className="flex flex-col gap-1" style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>
            <span>Facultad de Ingeniería</span>
            <span>Carrera 70D #53-40, Bogotá</span>
            <span>ingeniería.sistemas@unilibre.edu.co</span>
            <span>(+57) 601 382-0327</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

interface SidebarProps {
  role: Role;
  currentPage: Page;
  navigate: (page: Page) => void;
}

export function DashboardSidebar({ role, currentPage, navigate }: SidebarProps) {
  const links: Record<string, SidebarLink[]> = {
    estudiante: [
      { label: 'Mi Dashboard', page: 'est-dashboard', icon: '⊞' },
      { label: 'Favoritos', page: 'est-favoritos', icon: '♡' },
      { label: 'Contribuir', page: 'est-contribuir', icon: '↑' },
    ],
    docente: [
      { label: 'Mi Dashboard', page: 'doc-dashboard', icon: '⊞' },
      { label: 'Registrar Evidencia', page: 'doc-wizard', icon: '✎' },
    ],
    admin: getAdminNavLinks(),
    egresado: [
      { label: 'Mi Dashboard', page: 'est-dashboard', icon: '⊞' },
      { label: 'Favoritos', page: 'est-favoritos', icon: '♡' },
      { label: 'Contribuir', page: 'est-contribuir', icon: '↑' },
    ],
  };

  return (
    <aside className="w-52 flex-shrink-0 hidden md:block">
      <div style={{ background: '#0f0f0d', border: '1px solid rgba(211, 47, 47,0.12)' }} className="rounded p-3 sticky top-20">
        <div className="text-xs font-semibold uppercase tracking-widest mb-3 px-2" style={{ color: 'var(--muted-foreground)' }}>Menú</div>
        {(links[role] || []).map(l => (
          <button
            key={l.page}
            onClick={() => navigate(l.page)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-sm mb-0.5 text-left transition-all"
            style={{
              background: currentPage === l.page ? 'rgba(211, 47, 47,0.1)' : 'transparent',
              borderLeft: currentPage === l.page ? '2px solid #d32f2f' : '2px solid transparent',
              color: currentPage === l.page ? '#d32f2f' : 'var(--secondary-foreground)',
            }}
          >
            <span>{l.icon}</span>
            <span className="flex-1">{l.label}</span>
            {l.badge && l.badge > 0 && (
              <span className="text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full"
                style={{ background: '#d32f2f', color: '#fff', fontSize: '10px' }}>
                {l.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </aside>
  );
}
