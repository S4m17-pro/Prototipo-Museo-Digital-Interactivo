import { useState } from 'react';
import type { Page, Role } from './data';
import { Header, Footer } from './components/Layout';

// Public pages
import { HomePage, ExplorarPage, BuscarPage, DetallePage, HallFamaPage, SemillerosPage, CalendarioPage } from './pages/Public';
import { CronologiaPage } from './pages/Cronologia';
import { ProgresoPage } from './pages/Progreso';
import { PerfilPage } from './pages/Perfil';
// Auth pages
import { LoginPage, TwoFAPage, RegistroPage } from './pages/Auth';
// Student pages
import { EstDashboard, EstAportes, EstFavoritos, EstContribuir } from './pages/Student';
// Teacher pages
import { DocDashboard, DocWizard, DocNotificaciones } from './pages/Teacher';
// Admin pages
import { AdminDashboard, AdminUsuarios, AdminCola, AdminValidacion, AdminConfirmacion, AdminRegistros, AdminHallRegistro, AdminAnadir } from './pages/Admin';
import { DataProvider } from './context/DataContext';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [role, setRole] = useState<Role>('visitante');
  const [detailId, setDetailId] = useState<string>('1');
  const [validacionId, setValidacionId] = useState<string>('q1');
  const [favorites, setFavorites] = useState<string[]>(['1', '3']);
  const [pendingRole, setPendingRole] = useState<Role>('visitante');
  const [registroSuccess, setRegistroSuccess] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [profileUserId, setProfileUserId] = useState<string | undefined>(undefined);
  const [profileEdits, setProfileEdits] = useState<Record<string, { bio?: string; photoUrl?: string }>>({});
  const [anadirTab, setAnadirTab] = useState<string | undefined>(undefined);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const updateProfile = (userId: string, edits: { bio?: string; photoUrl?: string }) => {
    setProfileEdits(prev => ({ ...prev, [userId]: { ...prev[userId], ...edits } }));
  };

  const navigate = (page: Page, id?: string) => {
    if (page === 'detalle' && id) setDetailId(id);
    if (page === 'admin-validacion' && id) setValidacionId(id);
    if (page === 'admin-confirmacion' && id) setValidacionId(id);
    if (page === 'perfil') setProfileUserId(id);
    if (page === 'admin-anadir') setAnadirTab(id);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (r: Role) => {
    setPendingRole(r);
    navigate('2fa');
  };

  const handleVerify = () => {
    setRole(pendingRole);
    const dashboardMap: Record<Role, Page> = {
      visitante: 'home',
      estudiante: 'est-dashboard',
      docente: 'doc-dashboard',
      admin: 'admin-dashboard',
      egresado: 'est-dashboard',
    };
    navigate(dashboardMap[pendingRole]);
  };

  const handleLogout = () => {
    setRole('visitante');
    navigate('home');
  };

  const handleRegister = () => {
    setRegistroSuccess(true);
    navigate('login');
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const handleApprove = (_id: string) => {
    // In real app: update status
  };

  const handleReturn = (_id: string, _note: string) => {
    // In real app: update status and send notification
  };

  const noFooterPages: Page[] = [
    'login', '2fa', 'registro', 'perfil',
    'est-dashboard', 'est-contribuir', 'est-favoritos', 'est-aportes',
    'doc-dashboard', 'doc-wizard', 'doc-notificaciones',
    'admin-dashboard', 'admin-usuarios', 'admin-cola', 'admin-validacion', 'admin-confirmacion',
    'admin-registros', 'admin-hall-registro', 'admin-anadir',
  ];

  const sidebarPages: Page[] = [
    'est-dashboard', 'est-aportes', 'est-favoritos', 'est-contribuir', 'progreso',
    'doc-dashboard', 'doc-wizard', 'doc-notificaciones',
    'admin-dashboard', 'admin-usuarios', 'admin-cola', 'admin-validacion', 'admin-confirmacion',
    'admin-registros', 'admin-hall-registro', 'admin-anadir',
  ];

  const renderPage = () => {
    switch (currentPage) {
      // ── PUBLIC ──
      case 'home':
        return <HomePage navigate={navigate} role={role} />;
      case 'explorar':
        return <ExplorarPage navigate={navigate} />;
      case 'buscar':
        return <BuscarPage navigate={navigate} />;
      case 'detalle':
        return (
          <DetallePage
            navigate={navigate}
            itemId={detailId}
            role={role}
            isFavorite={favorites.includes(detailId)}
            onToggleFavorite={toggleFavorite}
          />
        );
      case 'hall-fama':
        return <HallFamaPage navigate={navigate} />;
      case 'semilleros':
        return <SemillerosPage navigate={navigate} />;
      case 'calendario':
        return <CalendarioPage navigate={navigate} />;
      case 'cronologia':
        return <CronologiaPage navigate={navigate} />;
      case 'progreso':
        return <ProgresoPage role={role} navigate={navigate} />;
      case 'perfil':
        return <PerfilPage key={profileUserId ?? 'self'} role={role} navigate={navigate} viewUserId={profileUserId} profileEdits={profileEdits} onUpdateProfile={updateProfile} />;

      // ── AUTH ──
      case 'login':
        return <LoginPage navigate={navigate} onLogin={handleLogin} />;
      case '2fa':
        return <TwoFAPage onVerify={handleVerify} navigate={navigate} />;
      case 'registro':
        return <RegistroPage navigate={navigate} onRegister={handleRegister} />;

      // ── ESTUDIANTE / EGRESADO ──
      case 'est-dashboard':
        return <EstDashboard navigate={navigate} favorites={favorites} onToggleFavorite={toggleFavorite} role={role} />;
      case 'est-aportes':
        return <EstAportes navigate={navigate} role={role} />;
      case 'est-favoritos':
        return <EstFavoritos navigate={navigate} favorites={favorites} onToggleFavorite={toggleFavorite} />;
      case 'est-contribuir':
        return <EstContribuir navigate={navigate} onSubmit={() => {}} />;

      // ── DOCENTE ──
      case 'doc-dashboard':
        return <DocDashboard navigate={navigate} />;
      case 'doc-wizard':
        return <DocWizard navigate={navigate} onSubmit={() => {}} />;
      case 'doc-notificaciones':
        return <DocNotificaciones navigate={navigate} />;

      // ── ADMIN ──
      case 'admin-dashboard':
        return <AdminDashboard navigate={navigate} />;
      case 'admin-anadir':
        return <AdminAnadir key={anadirTab ?? 'default'} navigate={navigate} presetTab={anadirTab} />;
      case 'admin-usuarios':
        return <AdminUsuarios navigate={navigate} />;
      case 'admin-cola':
        return <AdminCola navigate={navigate} />;
      case 'admin-validacion':
        return <AdminValidacion navigate={navigate} itemId={validacionId} onApprove={handleApprove} onReturn={handleReturn} />;
      case 'admin-confirmacion':
        return <AdminConfirmacion navigate={navigate} itemId={validacionId} />;
      case 'admin-registros':
        return <AdminRegistros navigate={navigate} />;
      case 'admin-hall-registro':
        return <AdminHallRegistro navigate={navigate} />;

      default:
        return <HomePage navigate={navigate} role={role} />;
    }
  };

  return (
    <DataProvider>
      <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)', transition: 'background 0.3s, color 0.3s' }}>
      <Header currentPage={currentPage} role={role} navigate={navigate} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />

      {/* Registration success banner */}
      {registroSuccess && currentPage === 'login' && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded text-sm"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: 'var(--status-published, #22c55e)' }}>
            <span>✓</span>
            <span>Cuenta creada. Esperando aprobación del administrador. Puedes ingresar una vez aprobada.</span>
            <button onClick={() => setRegistroSuccess(false)} className="ml-auto text-xs opacity-60 hover:opacity-100">✕</button>
          </div>
        </div>
      )}

      <main className={sidebarPages.includes(currentPage) ? 'pb-[72px] md:pb-0' : ''}>
        {renderPage()}
      </main>

      {!noFooterPages.includes(currentPage) && (
        <Footer navigate={navigate} />
      )}
      </div>
    </DataProvider>
  );
}
