import { useState } from 'react';
import type { Page, Role } from '../data';
import { StepIndicator } from '../components/UI';

// ── LOGIN ────────────────────────────────────────────────────────────────────

interface LoginProps {
  navigate: (page: Page) => void;
  onLogin: (role: Role) => void;
}

export function LoginPage({ navigate, onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const demoAccounts: { email: string; password: string; role: Role; label: string }[] = [
    { email: 'estudiante@unilibre.edu.co', password: '123456', role: 'estudiante', label: 'Estudiante' },
    { email: 'docente@unilibre.edu.co', password: '123456', role: 'docente', label: 'Docente' },
    { email: 'admin@unilibre.edu.co', password: '123456', role: 'admin', label: 'Admin' },
    { email: 'egresado@unilibre.edu.co', password: '123456', role: 'egresado', label: 'Egresado' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const match = demoAccounts.find(a => a.email === email && a.password === password);
    if (match) {
      onLogin(match.role);
    } else {
      setError('Credenciales incorrectas. Usa las cuentas demo a continuación.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded mx-auto mb-3 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #d32f2f, #660000)' }}>
            <span className="font-bold text-black">UL</span>
          </div>
          <h1 className="font-serif text-2xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>Acceso al Museo</h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Ingresa con tus credenciales institucionales</p>
        </div>

        <div className="museum-card rounded-lg p-7">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--secondary-foreground)' }}>
                Correo Institucional
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="usuario@unilibre.edu.co"
                className="museum-input w-full px-4 py-2.5 rounded text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--secondary-foreground)' }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="museum-input w-full px-4 py-2.5 rounded text-sm"
                required
              />
            </div>

            {error && (
              <div className="text-xs px-3 py-2 rounded" style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-3 rounded font-semibold">
              Ingresar
            </button>
          </form>

          <div className="mt-4 text-center">
            <button onClick={() => navigate('registro')}
              className="text-sm hover:underline" style={{ color: '#d32f2f' }}>
              ¿No tienes cuenta? Regístrate
            </button>
          </div>
        </div>

        {/* Demo accounts */}
        <div className="mt-6 rounded-lg p-4" style={{ background: 'rgba(211, 47, 47,0.05)', border: '1px solid rgba(211, 47, 47,0.15)' }}>
          <div className="text-xs font-mono uppercase tracking-widest mb-3 text-center" style={{ color: 'var(--muted-foreground)' }}>
            Cuentas Demo — clic para rellenar
          </div>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map(acc => (
              <button
                key={acc.role}
                onClick={() => { setEmail(acc.email); setPassword(acc.password); setError(''); }}
                className="p-2 rounded text-center transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="text-xs font-semibold mb-0.5" style={{ color: '#d32f2f' }}>{acc.label}</div>
                <div className="text-xs" style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{acc.email.split('@')[0]}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 2FA ──────────────────────────────────────────────────────────────────────

interface TwoFAProps {
  onVerify: () => void;
  navigate: (page: Page) => void;
}

export function TwoFAPage({ onVerify, navigate }: TwoFAProps) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [resent, setResent] = useState(false);

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...digits];
    next[i] = val.slice(-1);
    setDigits(next);
    if (val && i < 5) {
      document.getElementById(`otp-${i + 1}`)?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code === '123456') {
      onVerify();
    } else {
      setError('Código incorrecto. Usa 123456 para la demo.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
            style={{ background: 'rgba(211, 47, 47,0.1)', border: '2px solid rgba(211, 47, 47,0.3)' }}>
            🔐
          </div>
          <h1 className="font-serif text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Verificación en 2 pasos</h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Ingresa el código de 6 dígitos enviado a tu correo institucional<br />
            <span style={{ color: '#d32f2f' }}>u*****@unilibre.edu.co</span>
          </p>
        </div>

        <div className="museum-card rounded-lg p-7">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex justify-center gap-2">
              {digits.map((d, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  value={d}
                  onChange={e => handleChange(i, e.target.value)}
                  maxLength={1}
                  className="museum-input w-11 h-14 text-center text-xl font-mono font-bold rounded focus:outline-none"
                  style={{ fontSize: '22px' }}
                />
              ))}
            </div>

            {error && (
              <div className="text-xs px-3 py-2 rounded text-center" style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-3 rounded font-semibold">
              Verificar Identidad
            </button>
          </form>

          <div className="mt-4 text-center">
            {!resent ? (
              <button onClick={() => setResent(true)} className="text-xs hover:underline" style={{ color: 'var(--muted-foreground)' }}>
                ¿No recibiste el código? Reenviar
              </button>
            ) : (
              <span className="text-xs" style={{ color: '#22c55e' }}>✓ Código reenviado a tu correo</span>
            )}
          </div>

          <div className="mt-3 text-center">
            <div className="text-xs px-3 py-1.5 rounded" style={{ background: 'rgba(211, 47, 47,0.06)', color: '#d32f2f', border: '1px solid rgba(211, 47, 47,0.15)' }}>
              Demo: usa el código <span className="font-mono font-bold">123456</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <button onClick={() => navigate('login')} className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            ← Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  );
}

// ── REGISTRO ─────────────────────────────────────────────────────────────────

interface RegistroProps {
  navigate: (page: Page) => void;
  onRegister: () => void;
}

export function RegistroPage({ navigate, onRegister }: RegistroProps) {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '',
    role: 'estudiante', program: '', id: ''
  });
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!form.name || !form.email || !form.role) { setError('Completa todos los campos.'); return; }
      setError(''); setStep(2);
    } else {
      if (!form.password || form.password !== form.confirm) { setError('Las contraseñas no coinciden.'); return; }
      setError('');
      onRegister();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>Crear cuenta</h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Únete al Museo Digital Interactivo UniLibreTour</p>
        </div>

        {/* Step indicator */}
        <StepIndicator steps={['Datos personales', 'Seguridad']} currentStep={step} />

        <div className="museum-card rounded-lg p-7">
          <form onSubmit={handleNext} className="flex flex-col gap-4">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--secondary-foreground)' }}>Nombre completo</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Nombre y apellidos" className="museum-input w-full px-4 py-2.5 rounded text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--secondary-foreground)' }}>Correo Institucional</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="usuario@unilibre.edu.co" className="museum-input w-full px-4 py-2.5 rounded text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--secondary-foreground)' }}>Código de Identificación</label>
                  <input type="text" value={form.id} onChange={e => setForm(f => ({ ...f, id: e.target.value }))}
                    placeholder="Código estudiantil o docente" className="museum-input w-full px-4 py-2.5 rounded text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--secondary-foreground)' }}>Rol</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="museum-input w-full px-4 py-2.5 rounded text-sm" required>
                    <option value="estudiante" style={{ background: 'var(--card)' }}>Estudiante</option>
                    <option value="docente" style={{ background: 'var(--card)' }}>Docente</option>
                    <option value="egresado" style={{ background: 'var(--card)' }}>Egresado</option>
                  </select>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--secondary-foreground)' }}>Contraseña</label>
                  <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Mínimo 8 caracteres" className="museum-input w-full px-4 py-2.5 rounded text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--secondary-foreground)' }}>Confirmar contraseña</label>
                  <input type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                    placeholder="Repite la contraseña" className="museum-input w-full px-4 py-2.5 rounded text-sm" required />
                </div>
                <div className="text-xs p-3 rounded" style={{ background: 'rgba(59,130,246,0.06)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.2)' }}>
                  ℹ Tu cuenta quedará pendiente de aprobación por un administrador.
                </div>
              </>
            )}

            {error && (
              <div className="text-xs px-3 py-2 rounded" style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            <div className="flex gap-2">
              {step === 2 && (
                <button type="button" onClick={() => setStep(1)} className="btn-outline-primary px-4 py-2.5 rounded text-sm flex-1">
                  Anterior
                </button>
              )}
              <button type="submit" className="btn-primary py-2.5 rounded font-semibold text-sm flex-1">
                {step === 1 ? 'Continuar →' : 'Crear cuenta'}
              </button>
            </div>
          </form>
          <div className="mt-4 text-center">
            <button onClick={() => navigate('login')} className="text-sm hover:underline" style={{ color: '#d32f2f' }}>
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
