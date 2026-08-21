import type { Status, ContentItem, Page } from '../data';

// Status badge
export function StatusBadge({ status }: { status: Status }) {
  const config: Record<Status, { label: string; color: string; bg: string }> = {
    publicado: { label: 'Publicado', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    pendiente: { label: 'En Revisión', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
    institucional: { label: 'Institucional', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    devuelto: { label: 'Devuelto', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  };
  const c = config[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-medium"
      style={{ color: c.color, background: c.bg, border: `1px solid ${c.color}30` }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
      {c.label}
    </span>
  );
}

// Category badge
export function CategoryBadge({ category }: { category: string }) {
  const labels: Record<string, string> = {
    historia: 'Historia', investigacion: 'Investigación', proyectos: 'Proyectos',
    eventos: 'Eventos', logros: 'Logros', docentes: 'Docentes',
  };
  return (
    <span className="text-xs px-2 py-0.5 rounded font-mono"
      style={{ background: 'rgba(211, 47, 47,0.1)', color: '#d32f2f', border: '1px solid rgba(211, 47, 47,0.2)' }}>
      {labels[category] || category}
    </span>
  );
}

// Content card
interface CardProps {
  item: ContentItem;
  navigate: (page: Page, id?: string) => void;
  showStatus?: boolean;
}

export function ContentCard({ item, navigate, showStatus = false }: CardProps) {
  return (
    <article
      className="museum-card rounded overflow-hidden cursor-pointer group flex flex-col"
      onClick={() => navigate('detalle', item.id)}
    >
      <div className="relative overflow-hidden h-44 bg-gray-900">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
        {showStatus && (
          <div className="absolute top-3 left-3">
            <StatusBadge status={item.status} />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex items-start justify-between gap-2">
          <CategoryBadge category={item.category} />
          <span className="text-xs font-mono flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}>
            {new Date(item.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'short' })}
          </span>
        </div>
        <h3 className="font-serif text-base font-semibold leading-snug line-clamp-2" style={{ color: 'var(--card-foreground)' }}>
          {item.title}
        </h3>
        <p className="text-sm leading-relaxed line-clamp-2 flex-1" style={{ color: 'var(--muted-foreground)' }}>
          {item.description}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs"
            style={{ background: 'rgba(211, 47, 47,0.15)', color: '#d32f2f' }}>
            {item.author[0]}
          </div>
          <span className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{item.author}</span>
        </div>
      </div>
    </article>
  );
}

// Empty state
export function EmptyState({ message, icon = '📂' }: { message: string; icon?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
      <span className="text-4xl opacity-30">{icon}</span>
      <p style={{ color: 'var(--muted-foreground)' }}>{message}</p>
    </div>
  );
}

// Loading skeleton
export function CardSkeleton() {
  return (
    <div className="museum-card rounded overflow-hidden animate-pulse">
      <div className="h-44" style={{ background: 'rgba(255,255,255,0.04)' }} />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-3 w-20 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="h-5 w-full rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="h-4 w-3/4 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
      </div>
    </div>
  );
}

// Section header
export function SectionHeader({ label, title, subtitle }: { label?: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      {label && (
        <div className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: '#d32f2f' }}>{label}</div>
      )}
      <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight" style={{ color: 'var(--foreground)' }}>{title}</h2>
      {subtitle && <p className="mt-2 text-base" style={{ color: 'var(--muted-foreground)' }}>{subtitle}</p>}
    </div>
  );
}

// Stat card for dashboards
export function StatCard({ label, value, sub, color = '#d32f2f' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="museum-card rounded p-5">
      <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
      <div className="font-serif text-3xl font-bold" style={{ color }}>{value.toLocaleString()}</div>
      {sub && <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{sub}</div>}
    </div>
  );
}

// Tag list
export function TagList({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map(t => (
        <span key={t} className="text-xs px-2 py-0.5 rounded font-mono"
          style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--muted-foreground)', border: '1px solid rgba(255,255,255,0.08)' }}>
          #{t}
        </span>
      ))}
    </div>
  );
}

// Step indicator (reusable for wizards)
interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  completedStep?: number;
}

export function StepIndicator({ steps, currentStep, completedStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => {
        const num = i + 1;
        const isCompleted = completedStep !== undefined ? completedStep > num : currentStep > num;
        const isActive = currentStep >= num;
        return (
          <div key={num} className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all"
              style={{
                background: isCompleted ? '#22c55e' : isActive ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                color: isActive ? 'var(--background)' : 'var(--muted-foreground)',
                border: isActive ? 'none' : '1px solid rgba(255,255,255,0.1)',
              }}>
              {isCompleted ? '✓' : num}
            </div>
            <span className="text-xs hidden md:inline" style={{ color: isActive ? 'var(--secondary-foreground)' : 'var(--muted-foreground)' }}>
              {label}
            </span>
            {num < steps.length && (
              <div className="h-px flex-1 mx-2" style={{ background: isCompleted ? '#22c55e' : isActive ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Checkbox (unified)
interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

export function Checkbox({ checked, onChange, label }: CheckboxProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div
        className="w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center transition-all"
        style={{
          background: checked ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${checked ? 'var(--primary)' : 'rgba(255,255,255,0.15)'}`,
        }}
        onClick={onChange}
      >
        {checked && <span className="text-xs text-black font-bold">✓</span>}
      </div>
      <span className="text-sm" style={{ color: 'var(--secondary-foreground)' }}>{label}</span>
    </label>
  );
}
