import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { appUrl, asset } from '../lib/paths';
import { DEMO_TOKEN, demoApi } from '../mock/demoData';

/** Ancho mínimo del contenedor (no del viewport) para mostrar tabla vs cards. */
const LIST_TABLE_MIN_PX = 720;
const LIST_PAGE_SIZE = 10;

function useListLayout(minTableWidth = LIST_TABLE_MIN_PX) {
  const ref = useRef<HTMLDivElement>(null);
  const [asTable, setAsTable] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = (width: number) => setAsTable(width >= minTableWidth);
    update(el.getBoundingClientRect().width);

    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const box = entry.contentBoxSize?.[0];
      update(box ? box.inlineSize : entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [minTableWidth]);

  return [ref, asTable] as const;
}

function usePagedItems<T>(items: T[], resetKey: string, pageSize = LIST_PAGE_SIZE) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [resetKey, pageSize]);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const pageItems = items.slice((safePage - 1) * pageSize, safePage * pageSize);

  return { page: safePage, setPage, totalPages, total, pageItems, pageSize };
}

function ListPaginator({
  page,
  totalPages,
  total,
  pageSize,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div className="list-pager" role="navigation" aria-label="Paginación">
      <span className="list-pager-meta">
        {total === 0 ? '0 resultados' : `${from}–${to} de ${total}`}
      </span>
      <div className="list-pager-actions">
        <button
          type="button"
          className="btn ghost list-pager-btn"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          Anterior
        </button>
        <span className="list-pager-page">
          Pág. {page} / {totalPages}
        </span>
        <button
          type="button"
          className="btn ghost list-pager-btn"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

function ResponsiveList({
  table,
  cards,
  footer,
}: {
  table: ReactNode;
  cards: ReactNode;
  footer?: ReactNode;
}) {
  const [ref, asTable] = useListLayout();
  return (
    <div ref={ref} className="list-responsive">
      {asTable ? (
        <div className="table-wrap list-panel">
          {table}
          {footer}
        </div>
      ) : (
        <div className="list-panel list-panel-cards">
          {cards}
          {footer}
        </div>
      )}
    </div>
  );
}

type View =
  | 'dashboard'
  | 'pros'
  | 'vitrina'
  | 'socios'
  | 'asistencias'
  | 'contrataciones'
  | 'pack'
  | 'perfil'
  | 'ranking'
  | 'pagos';

type Session = { token: string; nombre: string };
type NavIconName =
  | 'inicio'
  | 'pros'
  | 'vitrina'
  | 'socios'
  | 'asistencias'
  | 'contrataciones'
  | 'pack'
  | 'perfil'
  | 'ranking'
  | 'pagos'
  | 'logout'
  | 'search';

const API = import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8000';

const NAV_ITEMS: Array<{ id: View; label: string; icon: NavIconName }> = [
  { id: 'dashboard', label: 'Inicio', icon: 'inicio' },
  { id: 'pros', label: 'Profesionales', icon: 'pros' },
  { id: 'vitrina', label: 'Vitrina', icon: 'vitrina' },
  { id: 'contrataciones', label: 'Contrataciones', icon: 'contrataciones' },
  { id: 'socios', label: 'Socios', icon: 'socios' },
  { id: 'asistencias', label: 'Asistencias', icon: 'asistencias' },
  { id: 'pack', label: 'Mi pack', icon: 'pack' },
  { id: 'ranking', label: 'Ranking', icon: 'ranking' },
  { id: 'pagos', label: 'Pagos', icon: 'pagos' },
  { id: 'perfil', label: 'Perfil', icon: 'perfil' },
];

/** Sin pack activo solo se operan pago / pack / perfil (el resto es “modo demo” hasta activar). */
const NAV_UNTIL_PACK_ACTIVE: View[] = ['pack', 'pagos', 'perfil'];

function packIsActive(estado: string | null | undefined): boolean {
  return String(estado || '').toLowerCase() === 'active';
}

function NavIcon({ name }: { name: NavIconName }) {
  const props = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.75,
    'aria-hidden': true as const,
  };
  if (name === 'inicio') {
    return (
      <svg {...props}>
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === 'pros') {
    return (
      <svg {...props}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" />
        <circle cx="9" cy="7" r="3.25" />
        <path d="M22 21v-2a3.5 3.5 0 0 0-2.5-3.35M16.5 3.7a3.25 3.25 0 0 1 0 6.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === 'vitrina') {
    return (
      <svg {...props}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18M8 14h3M14 14h4" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === 'socios') {
    return (
      <svg {...props}>
        <circle cx="9" cy="8" r="3.25" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M2.5 20a5.5 5.5 0 0 1 11 0M13.5 20a4.5 4.5 0 0 1 8 0" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === 'asistencias') {
    return (
      <svg {...props}>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
        <path d="m15.5 15.5 1.5 1.5 3-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === 'contrataciones') {
    return (
      <svg {...props}>
        <path d="M8 7h8M8 12h8M8 17h5" strokeLinecap="round" />
        <rect x="4" y="3" width="16" height="18" rx="2" />
      </svg>
    );
  }
  if (name === 'pack') {
    return (
      <svg {...props}>
        <path d="M12 3 4.5 7.5v9L12 21l7.5-4.5v-9L12 3Z" strokeLinejoin="round" />
        <path d="M12 12 4.5 7.5M12 12l7.5-4.5M12 12v9" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === 'perfil') {
    return (
      <svg {...props}>
        <circle cx="12" cy="8" r="3.25" />
        <path d="M5 20a7 7 0 0 1 14 0" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === 'ranking') {
    return (
      <svg {...props}>
        <path d="M5 20V11M12 20V4M19 20v-6" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === 'pagos') {
    return (
      <svg {...props}>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18M7 15h3" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === 'search') {
    return (
      <svg {...props}>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16.5 16.5 4 4" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return <NavIcon name="search" />;
}

function tipoPill(tipo: string | null | undefined) {
  const t = (tipo || 'socio').toLowerCase();
  if (t === 'entrenado' || t === 'alumno') return <span className="pill tipo-entrenado">Entrenado</span>;
  if (t === 'profesional') return <span className="pill tipo-profesional">Profesional</span>;
  return <span className="pill tipo-socio">Socio</span>;
}

function IconEye() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function IconEyeOff() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-4.4M9.9 5.1A11 11 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-4.2 4.8M6.1 6.1A18 18 0 0 0 2 12s3.5 7 10 7a11 11 0 0 0 4.2-.8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSun() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

async function api<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  if (token === DEMO_TOKEN) {
    await new Promise((r) => setTimeout(r, 120));
    return demoApi<T>(path, init);
  }
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const detail = typeof body.detail === 'string' ? body.detail : null;
    throw new Error(detail || 'No se pudo completar');
  }
  return response.json();
}

function friendlyError(err: unknown, fallback = 'No se pudo completar'): string {
  const raw = err instanceof Error ? err.message : '';
  const lower = raw.trim().toLowerCase();
  if (
    lower === 'failed to fetch' ||
    lower.includes('load failed') ||
    lower.includes('networkerror') ||
    lower.includes('network request failed')
  ) {
    return 'No se pudo conectar. Revisá tu conexión e intentá de nuevo.';
  }
  return raw || fallback;
}

function PageHead({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="page-head">
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
    </header>
  );
}

function Empty({ title, description }: { title: string; description: string }) {
  return (
    <div className="empty">
      <strong>{title}</strong>
      <p className="muted">{description}</p>
    </div>
  );
}

function estadoPill(estado: string | null | undefined) {
  const value = (estado || '').toLowerCase();
  if (value === 'active') return <span className="pill ok">Activo</span>;
  if (value === 'pending' || value === 'pago_declarado') return <span className="pill warn">Pendiente</span>;
  if (!value) return <span className="pill">—</span>;
  return <span className="pill">{estado}</span>;
}

function CentroAvatar({ logoUrl, nombre }: { logoUrl: string | null; nombre: string }) {
  if (logoUrl) {
    return (
      <img
        className="sidebar-avatar"
        src={logoUrl}
        alt={`Logo de ${nombre}`}
        width={40}
        height={40}
      />
    );
  }
  return (
    <span className="sidebar-avatar sidebar-avatar-placeholder" role="img" aria-label="Subí la foto del centro">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 7.5A2.5 2.5 0 0 1 6.5 5h2.1l.7-1.2A1.5 1.5 0 0 1 10.6 3h2.8a1.5 1.5 0 0 1 1.3.8L15.4 5h2.1A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <circle cx="12" cy="12.5" r="3.25" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 10.5v4M10 12.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export default function PortalApp() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [session, setSession] = useState<Session | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [centroNombre, setCentroNombre] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [packEstado, setPackEstado] = useState<string | null>(null);

  useEffect(() => {
    // Misma convención que FAP login: dark por defecto si no hay `theme=light`.
    const saved = localStorage.getItem('theme') || localStorage.getItem('portal-theme');
    const next = saved === 'light' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      const params = new URLSearchParams(window.location.search);
      const onPages = /\.github\.io$/i.test(window.location.hostname);
      const demo = params.get('demo') === '1' || (onPages && params.get('demo') !== '0');
      if (demo) {
        const demoSession = { token: DEMO_TOKEN, nombre: 'Fuerza Norte' };
        localStorage.setItem('portal-session', JSON.stringify(demoSession));
        setSession(demoSession);
        return;
      }

      // Handoff desde /login de FAP: `#fap_handoff=<jwt>` (fragmento, no llega al server).
      const hash = window.location.hash.replace(/^#/, '');
      const handoffMatch = /(?:^|&)fap_handoff=([^&]+)/.exec(hash);
      if (handoffMatch?.[1]) {
        const token = decodeURIComponent(handoffMatch[1]).trim();
        const nombreParam = (params.get('nombre') || '').trim() || 'Centro';
        if (token) {
          const handoffSession = { token, nombre: nombreParam };
          localStorage.setItem('portal-session', JSON.stringify(handoffSession));
          setSession(handoffSession);
          setView('pack');
          try {
            const clean = new URL(window.location.href);
            clean.hash = '';
            clean.searchParams.delete('nombre');
            window.history.replaceState({}, '', clean.pathname + clean.search);
          } catch {
            /* ignore */
          }
          return;
        }
      }
    } catch {
      /* ignore */
    }
    const raw = localStorage.getItem('portal-session');
    if (raw) setSession(JSON.parse(raw) as Session);
  }, []);

  useEffect(() => {
    if (!session) {
      setCentroNombre('');
      setLogoUrl(null);
      setPackEstado(null);
      return;
    }
    setCentroNombre(session.nombre);
    let cancel = false;
    api<{
      nombre_fantasia?: string;
      logo_url?: string | null;
      contratacion?: { estado?: string | null } | null;
    }>('/entidades/me', session.token)
      .then((me) => {
        if (cancel) return;
        const nombre = String(me.nombre_fantasia || session.nombre || '').trim();
        if (nombre) {
          setCentroNombre(nombre);
          const nextSession = { ...session, nombre };
          localStorage.setItem('portal-session', JSON.stringify(nextSession));
        }
        setLogoUrl(typeof me.logo_url === 'string' && me.logo_url ? me.logo_url : null);
        const est = me.contratacion?.estado;
        setPackEstado(typeof est === 'string' ? est : null);
      })
      .catch(() => {
        /* keep session.nombre */
      });
    return () => {
      cancel = true;
    };
    // Relee al cambiar de vista pack/pagos por si el admin activó el pack.
  }, [session?.token, view]);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    localStorage.setItem('portal-theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  }

  function logout() {
    localStorage.removeItem('portal-session');
    setSession(null);
    setMenuOpen(false);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('demo');
      window.history.replaceState({}, '', url.pathname);
    } catch {
      /* ignore */
    }
  }

  const isDemo = Boolean(session && session.token === DEMO_TOKEN);
  const unlocked = !session || isDemo || packIsActive(packEstado);
  const navItems = unlocked
    ? NAV_ITEMS
    : NAV_ITEMS.filter((item) => NAV_UNTIL_PACK_ACTIVE.includes(item.id));

  useEffect(() => {
    if (!session || unlocked) return;
    if (!NAV_UNTIL_PACK_ACTIVE.includes(view)) {
      setView('pack');
    }
  }, [session, unlocked, view]);

  if (!session) {
    return (
      <Login
        theme={theme}
        onTheme={toggleTheme}
        onSession={(next) => {
          localStorage.setItem('portal-session', JSON.stringify(next));
          setSession(next);
          setView('pack');
        }}
      />
    );
  }

  return (
    <div
      className={`shell shell-app${menuOpen ? ' menu-open' : ''}${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}
    >
      {menuOpen ? (
        <button
          type="button"
          className="sidebar-scrim"
          aria-label="Cerrar menú"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <aside className="sidebar" aria-label="Menú">
        <div className="sidebar-brand">
          <img
            className="brand-logo brand-logo-light"
            src={asset('FAP.jpg')}
            alt="Fuerza y Acondicionamiento"
            width={40}
            height={40}
            decoding="async"
          />
          <img
            className="brand-logo brand-logo-dark"
            src={asset('FA.png')}
            alt="Fuerza y Acondicionamiento"
            width={44}
            height={44}
            decoding="async"
          />
          <div className="sidebar-brand-text">
            <strong>Fuerza y Acondicionamiento</strong>
            <span>power by ELJ</span>
          </div>
          <button
            type="button"
            className="sidebar-close md-only-hide"
            aria-label="Cerrar menú"
            onClick={() => setMenuOpen(false)}
          >
            ✕
          </button>
        </div>
        <div className="sidebar-workspace">
          <CentroAvatar logoUrl={logoUrl} nombre={centroNombre || session.nombre} />
          <div className="sidebar-workspace-text">
            <span className="workspace-label">Centro</span>
            <strong title={centroNombre || session.nombre}>{centroNombre || session.nombre}</strong>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="sidebar-link"
              aria-current={view === item.id ? 'page' : undefined}
              onClick={() => {
                setView(item.id);
                setMenuOpen(false);
              }}
            >
              <span className="nav-ico">
                <NavIcon name={item.icon} />
              </span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          {isDemo ? <p className="sidebar-demo-badge">Modo demo</p> : null}
          {!unlocked && !isDemo ? <p className="sidebar-demo-badge">Pack pendiente</p> : null}
          <button type="button" className="sidebar-link logout" onClick={logout}>
            <span className="nav-ico">
              <NavIcon name="logout" />
            </span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="shell-main">
        <header className="topbar">
          <button
            type="button"
            className="btn icon menu-toggle"
            aria-label={sidebarCollapsed || !menuOpen ? 'Abrir menú' : 'Cerrar menú'}
            aria-expanded={menuOpen || !sidebarCollapsed}
            onClick={() => {
              const desktop =
                typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;
              if (desktop) {
                setSidebarCollapsed((v) => !v);
                setMenuOpen(false);
                return;
              }
              setMenuOpen((v) => !v);
            }}
          >
            <IconMenu />
          </button>
          <div className="topbar-title">{navItems.find((i) => i.id === view)?.label || 'Inicio'}</div>
          <div className="topbar-user">
            <button
              className="btn icon"
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            >
              {theme === 'dark' ? <IconSun /> : <IconMoon />}
            </button>
            <button
              type="button"
              className="topbar-account"
              onClick={() => {
                setView('perfil');
                setMenuOpen(false);
              }}
              aria-label="Mi cuenta"
            >
              <div className="topbar-account-text">
                <span className="topbar-account-name">{centroNombre || session.nombre}</span>
                <span className="topbar-account-meta">Centro</span>
              </div>
              <span className="topbar-account-avatar">
                <CentroAvatar logoUrl={logoUrl} nombre={centroNombre || session.nombre} />
              </span>
            </button>
          </div>
        </header>
        <main className="main">
          {view === 'dashboard' ? (
            <Dashboard
              token={session.token}
              nombre={centroNombre || session.nombre}
              onGoPros={() => setView('pros')}
            />
          ) : null}
          {view === 'pros' ? <Profesionales token={session.token} /> : null}
          {view === 'vitrina' ? <VitrinaPlanes token={session.token} /> : null}
          {view === 'contrataciones' ? <ContratacionesPros token={session.token} /> : null}
          {view === 'socios' ? <Socios token={session.token} /> : null}
          {view === 'asistencias' ? <Asistencias token={session.token} /> : null}
          {view === 'pack' ? <MiPack token={session.token} onGoPagos={() => setView('pagos')} /> : null}
          {view === 'perfil' ? (
            <Perfil
              token={session.token}
              onUpdated={(nombre, logo) => {
                if (nombre) setCentroNombre(nombre);
                setLogoUrl(logo);
              }}
            />
          ) : null}
          {view === 'ranking' ? <Ranking token={session.token} /> : null}
          {view === 'pagos' ? <Pagos token={session.token} /> : null}
        </main>
      </div>

      <PortalFloatingActions centroNombre={centroNombre || session.nombre} />
    </div>
  );
}

type FabPanel = 'none' | 'menu' | 'help' | 'notifications' | 'chat';

type PortalNotif = {
  id: string;
  titulo: string;
  cuerpo: string;
  cuando: string;
  unread: boolean;
};

const DEMO_PORTAL_NOTIFS: PortalNotif[] = [
  {
    id: 'n1',
    titulo: 'Pack activo',
    cuerpo: 'Tu pack 10 pros · SaaS Challenger está listo para operar.',
    cuando: 'Hoy',
    unread: false,
  },
  {
    id: 'n2',
    titulo: 'Profesional pendiente',
    cuerpo: 'Martín Vega sigue inactivo. Podés activarlo desde Profesionales.',
    cuando: 'Ayer',
    unread: true,
  },
  {
    id: 'n3',
    titulo: 'Cupo del centro',
    cuerpo: 'Tenés 2 lugares libres para sumar profesionales.',
    cuando: 'Esta semana',
    unread: true,
  },
];

function PortalFloatingActions({ centroNombre }: { centroNombre: string }) {
  const [panel, setPanel] = useState<FabPanel>('none');
  const [notifs, setNotifs] = useState<PortalNotif[]>(DEMO_PORTAL_NOTIFS);
  const [helpMsg, setHelpMsg] = useState('');
  const [helpSent, setHelpSent] = useState(false);
  const [chatDraft, setChatDraft] = useState('');
  const [chatLines, setChatLines] = useState<Array<{ id: string; from: 'yo' | 'soporte'; text: string }>>([
    {
      id: 'c0',
      from: 'soporte',
      text: `Hola ${centroNombre || 'centro'}. Escribínos y te respondemos por acá.`,
    },
  ]);

  const unread = notifs.filter((n) => n.unread).length;
  const menuOpen = panel === 'menu';
  const fabActive = panel !== 'none';

  function closeAll() {
    setPanel('none');
    setHelpSent(false);
  }

  function handleFabClick() {
    if (panel === 'help' || panel === 'notifications' || panel === 'chat') {
      closeAll();
      return;
    }
    setPanel((prev) => (prev === 'menu' ? 'none' : 'menu'));
  }

  function markAllRead() {
    setNotifs((rows) => rows.map((n) => ({ ...n, unread: false })));
  }

  function sendHelp(e: FormEvent) {
    e.preventDefault();
    if (!helpMsg.trim()) return;
    setHelpSent(true);
    setHelpMsg('');
  }

  function sendChat(e: FormEvent) {
    e.preventDefault();
    const text = chatDraft.trim();
    if (!text) return;
    const id = `c${Date.now()}`;
    setChatLines((rows) => [...rows, { id, from: 'yo', text }]);
    setChatDraft('');
    window.setTimeout(() => {
      setChatLines((rows) => [
        ...rows,
        {
          id: `${id}-r`,
          from: 'soporte',
          text: 'Recibimos tu mensaje. En demo la respuesta es automática.',
        },
      ]);
    }, 600);
  }

  return (
    <>
      {panel === 'help' || panel === 'notifications' || panel === 'chat' ? (
        <button type="button" className="portal-fab-scrim" aria-label="Cerrar" onClick={closeAll} />
      ) : null}

      {panel === 'help' ? (
        <div className="portal-fab-panel" role="dialog" aria-labelledby="portal-fab-help-title">
          <header className="portal-fab-panel-head">
            <h3 id="portal-fab-help-title">Ayuda</h3>
            <button type="button" className="btn icon" aria-label="Cerrar" onClick={closeAll}>
              ✕
            </button>
          </header>
          <p className="muted portal-fab-panel-lead">
            Contanos en qué podemos ayudarte con el portal del centro.
          </p>
          {helpSent ? (
            <p className="ok-msg">Mensaje enviado. Te respondemos a la brevedad.</p>
          ) : (
            <form className="portal-fab-form" onSubmit={sendHelp}>
              <label>
                Mensaje
                <textarea
                  value={helpMsg}
                  onChange={(e) => setHelpMsg(e.target.value)}
                  rows={4}
                  placeholder="Escribí tu consulta…"
                  required
                />
              </label>
              <button type="submit" className="fap-btn-primary" disabled={!helpMsg.trim()}>
                Enviar
              </button>
            </form>
          )}
        </div>
      ) : null}

      {panel === 'notifications' ? (
        <div className="portal-fab-panel" role="dialog" aria-labelledby="portal-fab-notif-title">
          <header className="portal-fab-panel-head">
            <h3 id="portal-fab-notif-title">Notificaciones</h3>
            <div className="portal-fab-panel-actions">
              {unread > 0 ? (
                <button type="button" className="btn ghost" onClick={markAllRead}>
                  Marcar leídas
                </button>
              ) : null}
              <button type="button" className="btn icon" aria-label="Cerrar" onClick={closeAll}>
                ✕
              </button>
            </div>
          </header>
          <ul className="portal-fab-notif-list">
            {notifs.map((n) => (
              <li key={n.id} className={`portal-fab-notif${n.unread ? ' is-unread' : ''}`}>
                <div>
                  <strong>{n.titulo}</strong>
                  <p>{n.cuerpo}</p>
                </div>
                <span>{n.cuando}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {panel === 'chat' ? (
        <div className="portal-fab-panel portal-fab-panel-chat" role="dialog" aria-labelledby="portal-fab-chat-title">
          <header className="portal-fab-panel-head">
            <h3 id="portal-fab-chat-title">Chat</h3>
            <button type="button" className="btn icon" aria-label="Cerrar" onClick={closeAll}>
              ✕
            </button>
          </header>
          <p className="muted portal-fab-panel-lead">Soporte del portal · {centroNombre}</p>
          <div className="portal-fab-chat-thread">
            {chatLines.map((line) => (
              <div
                key={line.id}
                className={`portal-fab-chat-bubble${line.from === 'yo' ? ' is-mine' : ''}`}
              >
                {line.text}
              </div>
            ))}
          </div>
          <form className="portal-fab-chat-compose" onSubmit={sendChat}>
            <input
              value={chatDraft}
              onChange={(e) => setChatDraft(e.target.value)}
              placeholder="Escribí un mensaje…"
              aria-label="Mensaje de chat"
            />
            <button type="submit" className="fap-btn-primary" disabled={!chatDraft.trim()}>
              Enviar
            </button>
          </form>
        </div>
      ) : null}

      <div
        className={`portal-fab-menu${menuOpen ? ' is-open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <button type="button" className="portal-fab-chip" onClick={() => setPanel('help')}>
          <span>Ayuda</span>
          <span className="portal-fab-chip-ico" aria-hidden="true">
            <FabIconHelp />
          </span>
        </button>
        <button type="button" className="portal-fab-chip" onClick={() => setPanel('notifications')}>
          <span>Notificaciones</span>
          <span className="portal-fab-chip-ico portal-fab-chip-ico-ink" aria-hidden="true">
            <FabIconBell />
            {unread > 0 ? <em className="portal-fab-badge">{unread > 9 ? '9+' : unread}</em> : null}
          </span>
        </button>
        <button type="button" className="portal-fab-chip" onClick={() => setPanel('chat')}>
          <span>Chat</span>
          <span className="portal-fab-chip-ico portal-fab-chip-ico-accent" aria-hidden="true">
            <FabIconChat />
          </span>
        </button>
      </div>

      <button
        type="button"
        className={`portal-fab${fabActive ? ' is-active' : ''}`}
        onClick={handleFabClick}
        aria-label={fabActive ? 'Cerrar' : 'Mensajes y notificaciones'}
        aria-expanded={fabActive}
      >
        {fabActive ? <FabIconClose /> : <FabIconChat />}
        {!fabActive && unread > 0 ? (
          <span className="portal-fab-badge portal-fab-badge-main">{unread > 9 ? '9+' : unread}</span>
        ) : null}
      </button>
    </>
  );
}

function FabIconChat() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 12c0 4.4-3.6 8-8 8-1.4 0-2.7-.3-3.9-.9L4 20l.9-4c-.6-1.2-1-2.6-1-4 0-4.4 3.6-8 8-8s8 3.6 8 8Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FabIconBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 9a6 6 0 1 1 12 0c0 3.5 1.2 5 2 6H4c.8-1 2-2.5 2-6Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function FabIconHelp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M9.6 9.2a2.4 2.4 0 1 1 3.7 2c-.7.5-1.3 1-1.3 2v.3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

function FabIconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function Login({
  theme,
  onTheme,
  onSession,
}: {
  theme: 'light' | 'dark';
  onTheme: () => void;
  onSession: (session: Session) => void;
}) {
  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const mailTrim = mail.trim();
    if (!mailTrim || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    if (!mailTrim.includes('@') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mailTrim)) {
      setError('Ingresá un mail válido.');
      return;
    }
    setBusy(true);
    try {
      const data = await fetch(`${API}/entidades/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_mail: mailTrim,
          user_pass: password,
        }),
      }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        let detail: string | null = null;
        if (typeof body.detail === 'string') detail = body.detail;
        else if (Array.isArray(body.detail)) detail = 'Credenciales incorrectas';
        if (!response.ok) throw new Error(detail || 'Credenciales incorrectas');
        return body as { access_token: string; usuario: { nombre: string } };
      });
      onSession({ token: data.access_token, nombre: data.usuario.nombre });
    } catch (err) {
      const raw = err instanceof Error ? err.message : '';
      const lower = raw.trim().toLowerCase();
      if (
        lower === 'failed to fetch' ||
        lower.includes('load failed') ||
        lower.includes('networkerror') ||
        lower.includes('network request failed')
      ) {
        setError('No se pudo conectar. Revisá tu conexión e intentá de nuevo.');
      } else {
        setError(raw || 'Credenciales incorrectas');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-body">
      <div className="login-wrap">
        <div className="login-card" aria-busy={busy}>
          <button
            type="button"
            className="login-theme-btn"
            onClick={onTheme}
            aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          >
            {theme === 'dark' ? <IconSun /> : <IconMoon />}
          </button>
          {busy ? (
            <div className="login-busy" role="status">
              Iniciando sesión…
            </div>
          ) : null}
          <img
            className="brand brand-logo-light"
            src={asset('FAP.jpg')}
            alt="Fuerza y Acondicionamiento"
            width={120}
            height={120}
            decoding="async"
          />
          <img
            className="brand brand-logo-dark"
            src={asset('FA.png')}
            alt="Fuerza y Acondicionamiento"
            width={120}
            height={120}
            decoding="async"
          />
          <h1>Bienvenido</h1>
          <p className="lead">Ingresá tus credenciales para continuar</p>
          <p className="login-tool-chip">Herramienta centros</p>
          <form onSubmit={onSubmit} noValidate>
            <div className="login-field">
              <label htmlFor="portal-mail">Mail</label>
              <input
                id="portal-mail"
                name="mail"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                inputMode="email"
                disabled={busy}
                value={mail}
                onChange={(event) => {
                  setMail(event.target.value);
                  if (error) setError('');
                }}
              />
            </div>
            <div className="login-field">
              <label htmlFor="portal-pass">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="portal-pass"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={busy}
                  value={password}
                  style={{ paddingRight: '2.75rem' }}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (error) setError('');
                  }}
                />
                <button
                  type="button"
                  className="login-eye"
                  disabled={busy}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>
            {error ? <p className="login-error">{error}</p> : null}
            <button className="fap-btn-primary" type="submit" disabled={busy}>
              {busy ? 'Entrando…' : 'Entrar'}
            </button>
            <p className="muted" style={{ marginTop: '0.75rem', textAlign: 'center' }}>
              <a href={appUrl('?demo=1')} style={{ color: 'var(--fap-accent)', fontWeight: 700 }}>
                Ver interior (demo)
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function saludoDelDia(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

type ProRow = {
  id_usuario: string;
  nombre: string;
  apellido: string;
  mail?: string;
  estado?: boolean;
  codigo_tier: string | null;
  motivo_estado?: string | null;
  vitrina_visible: boolean;
  tiene_perfil: boolean;
};

function necesitaActivacion(row: ProRow): boolean {
  const motivo = (row.motivo_estado || '').toLowerCase();
  return row.estado === false || motivo.includes('pendiente') || !row.tiene_perfil;
}

function estadoProPill(row: ProRow) {
  const motivo = (row.motivo_estado || '').toLowerCase();
  if (row.estado === false) return <span className="pill warn">Inactivo</span>;
  if (motivo.includes('pendiente') || !row.tiene_perfil) {
    return <span className="pill warn">Pendiente de alta</span>;
  }
  return <span className="pill ok">Activo</span>;
}

function tierLabel(codigo: string | null | undefined) {
  if (!codigo) return 'Sin tier';
  return codigo
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

const DASH_PRO_PREVIEW = 5;

function Dashboard({
  token,
  nombre,
  onGoPros,
}: {
  token: string;
  nombre: string;
  onGoPros: () => void;
}) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [pros, setPros] = useState<ProRow[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api<Record<string, unknown>>('/entidades/me', token)
      .then(setData)
      .catch((err) => setError(friendlyError(err)));
    api<ProRow[]>('/entidades/me/profesionales', token)
      .then(setPros)
      .catch(() => setPros([]));
  }, [token]);

  const centro = String(data?.nombre_fantasia || nombre || 'tu centro').trim();
  const contratacion = (data?.contratacion || null) as {
    estado?: string;
    nombre_plan?: string;
  } | null;
  const planNombre = contratacion?.nombre_plan || null;
  const usados = Number(data?.profesionales_usados);
  const maxPro = data?.max_profesionales == null ? null : Number(data.max_profesionales);
  const cupoOk = Number.isFinite(usados);
  const libres =
    cupoOk && maxPro != null && Number.isFinite(maxPro) ? Math.max(0, maxPro - usados) : null;

  let packCopy = 'Todavía no vimos un pack asociado a tu cuenta.';
  if (planNombre) {
    const est = (contratacion?.estado || '').toLowerCase();
    if (est === 'active') {
      packCopy = `Tu pack ${planNombre} está activo y listo para operar.`;
    } else if (est === 'pending' || est === 'pago_declarado') {
      packCopy = `Tu pack ${planNombre} está pendiente de validación.`;
    } else {
      packCopy = `Pack actual: ${planNombre}.`;
    }
  }

  let cupoCopy = 'Cargando cupo de profesionales…';
  if (cupoOk && maxPro != null) {
    cupoCopy =
      libres === 0
        ? `Equipo completo: ${usados} de ${maxPro} profesionales.`
        : `Tenés ${usados} profesional${usados === 1 ? '' : 'es'} y ${libres} lugar${libres === 1 ? '' : 'es'} libre${libres === 1 ? '' : 's'} (${usados} / ${maxPro}).`;
  } else if (cupoOk) {
    cupoCopy = `${usados} profesional${usados === 1 ? '' : 'es'} en el centro.`;
  }

  const activos = pros?.filter((p) => p.estado !== false && !necesitaActivacion(p)).length ?? 0;
  const inactivos = pros?.filter((p) => p.estado === false).length ?? 0;
  const pendientes = pros?.filter((p) => p.estado !== false && necesitaActivacion(p)).length ?? 0;
  const tierCounts = (() => {
    if (!pros?.length) return [] as Array<{ codigo: string; n: number }>;
    const map = new Map<string, number>();
    for (const p of pros) {
      const key = p.codigo_tier || 'sin_tier';
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([codigo, n]) => ({ codigo, n }))
      .sort((a, b) => b.n - a.n || a.codigo.localeCompare(b.codigo, 'es'));
  })();
  const preview = (() => {
    if (!pros?.length) return [] as ProRow[];
    const rank = (p: ProRow) => {
      if (p.estado === false) return 2;
      if (necesitaActivacion(p)) return 0;
      return 1;
    };
    return [...pros].sort((a, b) => rank(a) - rank(b)).slice(0, DASH_PRO_PREVIEW);
  })();
  const ocultos = pros ? Math.max(0, pros.length - preview.length) : 0;

  return (
    <section className="grid dash-home">
      <header className="card dash-welcome">
        <p className="dash-eyebrow">{saludoDelDia()}</p>
        <h1>{centro}</h1>
        <p className="dash-lead">
          Qué bueno tenerte. Este es el pulso de tu centro: cómo está el pack y el espacio para sumar
          profesionales.
        </p>
      </header>

      {error ? <p className="error">{error}</p> : null}

      <div className="card dash-pulse" aria-label="Resumen del centro">
        <div className="dash-pulse-row">
          <span className="dash-pulse-label">Pack</span>
          <div className="dash-pulse-body">
            <strong>{planNombre || 'Sin pack'}</strong>
            {contratacion?.estado ? estadoPill(contratacion.estado) : null}
            <p>{packCopy}</p>
          </div>
        </div>
        <div className="dash-pulse-row">
          <span className="dash-pulse-label">Equipo</span>
          <div className="dash-pulse-body">
            <strong>
              {cupoOk ? usados : '…'}
              {maxPro == null ? '' : ` / ${maxPro}`}
            </strong>
            <p>{cupoCopy}</p>
          </div>
        </div>
      </div>

      <div className="card dash-pros" aria-label="Profesionales del centro">
        <div className="dash-pros-head">
          <span className="dash-pulse-label">Profesionales</span>
          {pros && pros.length > 0 ? (
            <p className="dash-pros-summary">
              {activos} activo{activos === 1 ? '' : 's'}
              {pendientes > 0 ? ` · ${pendientes} pendiente${pendientes === 1 ? '' : 's'}` : ''}
              {inactivos > 0 ? ` · ${inactivos} inactivo${inactivos === 1 ? '' : 's'}` : ''}
            </p>
          ) : null}
        </div>
        {pros === null ? (
          <p className="dash-pros-empty muted">Cargando profesionales…</p>
        ) : pros.length === 0 ? (
          <p className="dash-pros-empty muted">Todavía no hay profesionales en el centro.</p>
        ) : (
          <>
            {tierCounts.length > 0 ? (
              <div className="dash-pros-tiers" aria-label="Distribución por tier">
                {tierCounts.map(({ codigo, n }) => (
                  <span key={codigo} className="dash-pros-tier-chip">
                    {tierLabel(codigo === 'sin_tier' ? null : codigo)} · {n}
                  </span>
                ))}
              </div>
            ) : null}
            <ul className="dash-pros-list">
              {preview.map((pro) => (
                <li key={pro.id_usuario} className="dash-pros-row">
                  <div className="dash-pros-who">
                    <strong>
                      {pro.nombre} {pro.apellido}
                    </strong>
                    <span className="dash-pros-tier">{tierLabel(pro.codigo_tier)}</span>
                  </div>
                  <div className="dash-pros-meta">{estadoProPill(pro)}</div>
                </li>
              ))}
            </ul>
            <div className="dash-pros-foot">
              {ocultos > 0 ? (
                <p className="muted">
                  +{ocultos} más. El listado completo está en Profesionales.
                </p>
              ) : null}
              <button type="button" className="btn ghost" onClick={onGoPros}>
                Ver todos{pros.length > DASH_PRO_PREVIEW ? ` (${pros.length})` : ''}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

type TierOpt = { codigo: string; nombre: string };

const ALTA_PRO_STEPS = [1, 2, 3] as const;
const ALTA_PRO_LABELS = ['Identidad', 'Contacto', 'Tier'] as const;

type AltaProForm = {
  nombre: string;
  apellido: string;
  dni: string;
  mail: string;
  celular: string;
  fecha_nacimiento: string;
  genero: string;
  codigo_tier: string;
};

const ALTA_PRO_EMPTY: AltaProForm = {
  nombre: '',
  apellido: '',
  dni: '',
  mail: '',
  celular: '',
  fecha_nacimiento: '',
  genero: '',
  codigo_tier: '',
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function capitalizeName(s: string): string {
  const t = s.trim();
  if (!t) return '';
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

/** Alta de profesional desde el centro: Identidad → Contacto → Tier. */
function AltaProfesionalModal({
  token,
  open,
  onClose,
  onSuccess,
  tiers,
}: {
  token: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tiers: TierOpt[];
}) {
  const [step, setStep] = useState(1);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [okMsg, setOkMsg] = useState('');
  const [form, setForm] = useState<AltaProForm>(ALTA_PRO_EMPTY);
  const [dialCode] = useState('54');

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setTouched(false);
    setSaving(false);
    setError('');
    setOkMsg('');
    setForm({
      ...ALTA_PRO_EMPTY,
      codigo_tier: tiers[0]?.codigo || '',
    });
  }, [open, tiers]);

  function patch(partial: Partial<AltaProForm>) {
    setForm((prev) => ({ ...prev, ...partial }));
  }

  function stepValid(n: number): boolean {
    if (n === 1) {
      return (
        form.nombre.trim() !== '' &&
        form.apellido.trim() !== '' &&
        form.dni.replace(/\D/g, '').length === 8 &&
        isValidEmail(form.mail)
      );
    }
    if (n === 2) return true;
    if (n === 3) {
      if (tiers.length === 0) return true;
      return form.codigo_tier.trim() !== '';
    }
    return true;
  }

  function goNext() {
    setTouched(true);
    if (!stepValid(step)) {
      setError('Completá los campos obligatorios del paso');
      return;
    }
    setError('');
    setTouched(false);
    setStep((s) => Math.min(3, s + 1));
  }

  function goPrev() {
    setError('');
    setTouched(false);
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleSubmit() {
    setTouched(true);
    if (!stepValid(1) || !stepValid(3)) {
      setError('Completá los campos obligatorios');
      return;
    }
    setSaving(true);
    setError('');
    setOkMsg('');
    try {
      const celularRaw = form.celular.trim();
      const celular = celularRaw
        ? celularRaw.startsWith(`+${dialCode}`)
          ? celularRaw
          : `+${dialCode}${celularRaw.replace(/^\+/, '')}`
        : undefined;
      await api('/entidades/me/profesionales', token, {
        method: 'POST',
        body: JSON.stringify({
          nombre: capitalizeName(form.nombre),
          apellido: capitalizeName(form.apellido),
          dni: form.dni.replace(/\D/g, '').slice(0, 8),
          mail: form.mail.trim().toLowerCase(),
          codigo_tier: form.codigo_tier.trim() || undefined,
          celular,
          fecha_nacimiento: form.fecha_nacimiento || undefined,
          genero: form.genero.trim() || undefined,
        }),
      });
      setOkMsg('Profesional dado de alta.');
      onSuccess();
      onClose();
    } catch (err) {
      setError(friendlyError(err, 'No se pudo dar de alta al profesional'));
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  const fieldInvalid = (invalid: boolean) =>
    `alta-pro-input${touched && invalid ? ' is-invalid' : ''}`;

  return (
    <div className="modal-scrim" role="presentation" onClick={onClose}>
      <div
        className="modal-panel alta-pro-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="alta-pro-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="alta-pro-head">
          <button
            type="button"
            className="alta-pro-close"
            onClick={onClose}
            disabled={saving}
            aria-label="Cerrar"
          >
            ✕
          </button>
          <h3 id="alta-pro-title">Agregar profesional</h3>
          <p className="muted alta-pro-lead">
            Completá los datos del profesional.
          </p>
          <div className="alta-pro-stepper" aria-label="Pasos del alta">
            {ALTA_PRO_STEPS.map((n) => (
              <div key={n} className={`alta-pro-step ${step >= n ? 'is-active' : ''} ${step > n ? 'is-done' : ''}`}>
                <span className="alta-pro-step-dot">{step > n ? '✓' : n}</span>
                <span className="alta-pro-step-label">{ALTA_PRO_LABELS[n - 1]}</span>
              </div>
            ))}
            <div className="alta-pro-stepper-line" aria-hidden="true" />
          </div>
        </div>

        <div className="alta-pro-body">
          {step === 1 ? (
            <div className="alta-pro-pane">
              <h4 className="alta-pro-pane-title">Identidad</h4>
              <p className="muted">Nombre, documento y mail de acceso.</p>
              <div className="alta-pro-grid-2">
                <label className="alta-pro-field">
                  <span>Nombre</span>
                  <input
                    value={form.nombre}
                    disabled={saving}
                    onChange={(e) => patch({ nombre: e.target.value })}
                    className={fieldInvalid(!form.nombre.trim())}
                    autoComplete="given-name"
                  />
                </label>
                <label className="alta-pro-field">
                  <span>Apellido</span>
                  <input
                    value={form.apellido}
                    disabled={saving}
                    onChange={(e) => patch({ apellido: e.target.value })}
                    className={fieldInvalid(!form.apellido.trim())}
                    autoComplete="family-name"
                  />
                </label>
              </div>
              <label className="alta-pro-field">
                <span>DNI</span>
                <input
                  value={form.dni}
                  disabled={saving}
                  inputMode="numeric"
                  maxLength={8}
                  onChange={(e) => patch({ dni: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                  className={fieldInvalid(form.dni.replace(/\D/g, '').length !== 8)}
                />
                <em className="alta-pro-hint">8 dígitos.</em>
              </label>
              <label className="alta-pro-field">
                <span>Mail</span>
                <input
                  type="email"
                  value={form.mail}
                  disabled={saving}
                  onChange={(e) => patch({ mail: e.target.value })}
                  className={fieldInvalid(!isValidEmail(form.mail))}
                  autoComplete="email"
                />
              </label>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="alta-pro-pane">
              <h4 className="alta-pro-pane-title">Contacto</h4>
              <p className="muted">Opcional. Podés completarlos después.</p>
              <label className="alta-pro-field">
                <span>Fecha de nacimiento</span>
                <input
                  type="date"
                  value={form.fecha_nacimiento}
                  disabled={saving}
                  onChange={(e) => patch({ fecha_nacimiento: e.target.value })}
                  className="alta-pro-input"
                />
              </label>
              <label className="alta-pro-field">
                <span>Celular</span>
                <div className="alta-pro-phone-row">
                  <span className="invite-dial">+{dialCode}</span>
                  <input
                    type="tel"
                    value={form.celular}
                    disabled={saving}
                    onChange={(e) => patch({ celular: e.target.value })}
                    className="alta-pro-input"
                    placeholder="11 2345 6789"
                    autoComplete="tel"
                  />
                </div>
              </label>
              <label className="alta-pro-field">
                <span>Género</span>
                <select
                  value={form.genero}
                  disabled={saving}
                  onChange={(e) => patch({ genero: e.target.value })}
                  className="alta-pro-input"
                >
                  <option value="">Prefiero no decir</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="No binario">No binario</option>
                  <option value="Otro">Otro</option>
                </select>
              </label>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="alta-pro-pane">
              <h4 className="alta-pro-pane-title">Tier incluido</h4>
              <p className="muted">
                Elegí qué nivel de la app va a tener este profesional. Empieza a usarlo de inmediato.
              </p>
              {tiers.length === 0 ? (
                <p className="muted">Este pack no incluye tiers SaaS para asignar.</p>
              ) : (
                <div className="alta-pro-tier-list" role="radiogroup" aria-label="Tier">
                  {tiers.map((tier) => {
                    const selected = form.codigo_tier === tier.codigo;
                    return (
                      <button
                        key={tier.codigo}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={`alta-pro-tier-opt${selected ? ' is-selected' : ''}`}
                        disabled={saving}
                        onClick={() => patch({ codigo_tier: tier.codigo })}
                      >
                        <strong>{tier.nombre}</strong>
                        <span>{tier.codigo}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}

          {error ? <p className="error">{error}</p> : null}
          {okMsg ? <p className="ok-msg">{okMsg}</p> : null}
        </div>

        <div className="invite-modal-foot alta-pro-foot">
          {step > 1 ? (
            <button type="button" className="btn ghost" onClick={goPrev} disabled={saving}>
              Atrás
            </button>
          ) : (
            <button type="button" className="btn ghost" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
          )}
          {step < 3 ? (
            <button type="button" className="fap-btn-primary" onClick={goNext} disabled={saving}>
              Siguiente
            </button>
          ) : (
            <button type="button" className="fap-btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Guardando…' : 'Dar de alta'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Profesionales({ token }: { token: string }) {
  const [rows, setRows] = useState<ProRow[]>([]);
  const [tiers, setTiers] = useState<TierOpt[]>([]);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);
  const [search, setSearch] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    api<ProRow[]>('/entidades/me/profesionales', token)
      .then(setRows)
      .catch((err) => setError(friendlyError(err)));
    api<TierOpt[]>('/entidades/me/tiers', token).then(setTiers).catch(() => setTiers([]));
  }, [token, tick]);

  const filtered = rows.filter((row) => {
    const q = search.trim().toLowerCase();
    return (
      !q || `${row.nombre} ${row.apellido} ${row.mail || ''}`.toLowerCase().includes(q)
    );
  });
  const pager = usePagedItems(filtered, search);

  async function cambiarTier(id: string, codigo: string) {
    setError('');
    try {
      await api(`/entidades/me/profesionales/${id}/tier`, token, {
        method: 'PATCH',
        body: JSON.stringify({ codigo_tier: codigo }),
      });
      setTick((n) => n + 1);
    } catch (err) {
      setError(friendlyError(err, 'No se pudo cambiar el tier'));
    }
  }

  async function desvincular(id: string) {
    setError('');
    try {
      await api(`/entidades/me/profesionales/${id}/desvincular`, token, { method: 'POST' });
      setTick((n) => n + 1);
    } catch (err) {
      setError(friendlyError(err, 'No se pudo desvincular'));
    }
  }

  async function activar(id: string) {
    setError('');
    try {
      await api(`/entidades/me/profesionales/${id}/activar`, token, { method: 'POST' });
      setTick((n) => n + 1);
    } catch (err) {
      setError(friendlyError(err, 'No se pudo activar'));
    }
  }

  async function desactivar(id: string) {
    setError('');
    try {
      await api(`/entidades/me/profesionales/${id}/desactivar`, token, { method: 'POST' });
      setTick((n) => n + 1);
    } catch (err) {
      setError(friendlyError(err, 'No se pudo desactivar'));
    }
  }

  function tierSelect(row: ProRow) {
    if (tiers.length === 0) {
      return <span className="tier-fallback">{row.codigo_tier || 'sin plan'}</span>;
    }
    return (
      <select
        className="tier-select"
        aria-label="Tier del profesional"
        value={row.codigo_tier || ''}
        onChange={(event) => cambiarTier(row.id_usuario, event.target.value)}
      >
        <option value="" disabled>
          Elegir
        </option>
        {tiers.map((tier) => (
          <option key={tier.codigo} value={tier.codigo}>
            {tier.nombre}
          </option>
        ))}
      </select>
    );
  }

  function actions(row: ProRow) {
    return (
      <div className="row-actions">
        {row.estado === false ? (
          <button className="btn ghost" type="button" onClick={() => activar(row.id_usuario)}>
            Activar
          </button>
        ) : (
          <button className="btn ghost" type="button" onClick={() => desactivar(row.id_usuario)}>
            Desactivar
          </button>
        )}
        <button className="btn ghost" type="button" onClick={() => desvincular(row.id_usuario)}>
          Desvincular
        </button>
      </div>
    );
  }

  return (
    <section className="grid">
      <PageHead
        title="Profesionales"
        subtitle="Dá de alta profesionales del centro y asigná tier. La vitrina pública se administra en Vitrina."
      />

      <div className="card list-toolbar">
        <div className="search-field">
          <span className="search-ico">
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o mail"
            aria-label="Buscar profesionales"
          />
        </div>
        <button className="fap-btn-primary toolbar-cta" type="button" onClick={() => setInviteOpen(true)}>
          + Agregar Profesional
        </button>
      </div>

      <AltaProfesionalModal
        token={token}
        open={inviteOpen}
        tiers={tiers}
        onClose={() => setInviteOpen(false)}
        onSuccess={() => setTick((n) => n + 1)}
      />

      {error ? <p className="error">{error}</p> : null}

      {filtered.length === 0 ? (
        <Empty title="Sin profesionales" description="Cuando sumes al primero, aparece acá." />
      ) : (
        <ResponsiveList
          footer={
            <ListPaginator
              page={pager.page}
              totalPages={pager.totalPages}
              total={pager.total}
              pageSize={pager.pageSize}
              onPage={pager.setPage}
            />
          }
          table={
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Mail</th>
                  <th>Tier</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pager.pageItems.map((row) => (
                  <tr key={row.id_usuario}>
                    <td>
                      <strong>
                        {row.apellido}, {row.nombre}
                      </strong>
                    </td>
                    <td className="mail-cell">{row.mail || '—'}</td>
                    <td>{tierSelect(row)}</td>
                    <td>
                      <span className={`dot-status ${row.estado === false ? 'off' : 'on'}`}>
                        {row.estado === false ? 'Inactivo' : 'Activo'}
                      </span>
                    </td>
                    <td>{actions(row)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
          cards={
            <div className="card-list">
              {pager.pageItems.map((row) => (
                <article key={row.id_usuario} className="card row-card">
                  <div className="row-card-head">
                    <strong>
                      {row.apellido}, {row.nombre}
                    </strong>
                    <span className={`dot-status ${row.estado === false ? 'off' : 'on'}`}>
                      {row.estado === false ? 'Inactivo' : 'Activo'}
                    </span>
                  </div>
                  <div className="row-card-meta">
                    <span>{row.mail || '—'}</span>
                    <label className="tier-field">
                      <span className="tier-field-label">Tier</span>
                      {tierSelect(row)}
                    </label>
                  </div>
                  <div className="row-card-foot">{actions(row)}</div>
                </article>
              ))}
            </div>
          }
        />
      )}
    </section>
  );
}

type PlanVitrinaCard = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion_cantidad: number;
  duracion_unidad: 'dias' | 'meses' | 'anos';
  observaciones: string[];
  activo: boolean;
};

type VitrinaProRow = {
  id_usuario: string;
  nombre: string;
  apellido: string;
  mail: string | null;
  estado?: boolean;
  vitrina_visible: boolean;
  tiene_perfil: boolean;
  planes: PlanVitrinaCard[];
};

function formatPlanPrecio(valor: number): string {
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(valor);
  } catch {
    return `$${valor}`;
  }
}

function formatPlanPeriodo(cantidad: number, unidad: PlanVitrinaCard['duracion_unidad']): string {
  const n = Math.max(1, Math.floor(cantidad));
  if (unidad === 'dias') return n === 1 ? '1 día' : `${n} días`;
  if (unidad === 'anos') return n === 1 ? '1 año' : `${n} años`;
  return n === 1 ? '1 mes' : `${n} meses`;
}

function PlanCardsCarousel({
  planes,
  busyPlan,
  onToggle,
}: {
  planes: PlanVitrinaCard[];
  busyPlan: string | null;
  onToggle: (plan: PlanVitrinaCard) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateEdges = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateEdges();
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => updateEdges();
    el.addEventListener('scroll', onScroll, { passive: true });
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateEdges);
    ro?.observe(el);
    return () => {
      el.removeEventListener('scroll', onScroll);
      ro?.disconnect();
    };
  }, [planes.length]);

  function scrollByDir(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.min(300, Math.max(220, el.clientWidth * 0.8));
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  }

  const visibles = planes.filter((p) => p.activo).length;

  return (
    <div className="vitrina-carousel">
      <div className="vitrina-carousel-bar">
        <span className="vitrina-carousel-meta">
          {visibles} visibles · {planes.length - visibles} ocultas · deslizá o usá las flechas
        </span>
        <div className="vitrina-carousel-nav">
          <button
            type="button"
            className="btn icon"
            disabled={!canPrev}
            onClick={() => scrollByDir(-1)}
            aria-label="Ver cards anteriores"
          >
            ‹
          </button>
          <button
            type="button"
            className="btn icon"
            disabled={!canNext}
            onClick={() => scrollByDir(1)}
            aria-label="Ver cards siguientes"
          >
            ›
          </button>
        </div>
      </div>
      <div
        ref={scrollerRef}
        className="vitrina-carousel-track"
        tabIndex={0}
        role="list"
        aria-label="Cards de suscripción"
      >
        {planes.map((plan) => (
          <div
            key={plan.id}
            role="listitem"
            className={`vitrina-plan-card${plan.activo ? '' : ' is-off'}`}
          >
            <div className="vitrina-plan-top">
              <strong>{plan.nombre}</strong>
              <span className={`pill ${plan.activo ? 'ok' : 'warn'}`}>
                {plan.activo ? 'Visible' : 'Oculta'}
              </span>
            </div>
            {plan.descripcion ? <p className="muted">{plan.descripcion}</p> : null}
            <p className="vitrina-plan-price">
              {formatPlanPrecio(plan.precio)} ·{' '}
              {formatPlanPeriodo(plan.duracion_cantidad, plan.duracion_unidad)}
            </p>
            {plan.observaciones.length > 0 ? (
              <ul className="vitrina-plan-obs">
                {plan.observaciones.map((obs, idx) => (
                  <li key={`${plan.id}-o-${idx}`}>{obs}</li>
                ))}
              </ul>
            ) : null}
            <button
              type="button"
              className="btn ghost"
              disabled={busyPlan === plan.id}
              onClick={() => onToggle(plan)}
            >
              {plan.activo ? 'Ocultar card' : 'Mostrar card'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function VitrinaPlanes({ token }: { token: string }) {
  const [rows, setRows] = useState<VitrinaProRow[]>([]);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);
  const [search, setSearch] = useState('');
  const [filtro, setFiltro] = useState<'todos' | 'visible' | 'oculta'>('todos');
  const [busyPro, setBusyPro] = useState<string | null>(null);
  const [busyPlan, setBusyPlan] = useState<string | null>(null);

  useEffect(() => {
    api<VitrinaProRow[]>('/entidades/me/vitrina', token)
      .then(setRows)
      .catch((err) => {
        setError(friendlyError(err, 'No se pudo cargar la vitrina'));
        setRows([]);
      });
  }, [token, tick]);

  const filtered = rows.filter((row) => {
    const q = search.trim().toLowerCase();
    const hay =
      !q ||
      `${row.nombre} ${row.apellido} ${row.mail || ''}`.toLowerCase().includes(q) ||
      row.planes.some((p) => p.nombre.toLowerCase().includes(q));
    if (!hay) return false;
    if (filtro === 'visible') return row.tiene_perfil && row.vitrina_visible;
    if (filtro === 'oculta') return !row.tiene_perfil || !row.vitrina_visible;
    return true;
  });
  const pager = usePagedItems(filtered, `${search}|${filtro}`);

  async function togglePro(row: VitrinaProRow) {
    if (!row.tiene_perfil) return;
    setError('');
    setBusyPro(row.id_usuario);
    try {
      await api(`/entidades/me/profesionales/${row.id_usuario}/vitrina`, token, {
        method: 'PATCH',
        body: JSON.stringify({ visible: !row.vitrina_visible }),
      });
      setTick((n) => n + 1);
    } catch (err) {
      setError(friendlyError(err, 'No se pudo cambiar la vitrina del profesional'));
    } finally {
      setBusyPro(null);
    }
  }

  async function togglePlan(plan: PlanVitrinaCard) {
    setError('');
    setBusyPlan(plan.id);
    try {
      await api(`/entidades/me/vitrina/planes/${plan.id}`, token, {
        method: 'PATCH',
        body: JSON.stringify({ activo: !plan.activo }),
      });
      setTick((n) => n + 1);
    } catch (err) {
      setError(friendlyError(err, 'No se pudo cambiar la card del plan'));
    } finally {
      setBusyPlan(null);
    }
  }

  return (
    <section className="grid">
      <PageHead
        title="Vitrina"
        subtitle="Decidí qué profesionales aparecen en la vitrina pública y qué cards de suscripción muestra cada uno."
      />

      <div className="card list-toolbar">
        <div className="search-field">
          <span className="search-ico">
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar profesional o plan"
            aria-label="Buscar en vitrina"
          />
        </div>
        <div className="seg-track" role="group" aria-label="Filtro presencia en vitrina">
          {(
            [
              ['todos', 'Todos'],
              ['visible', 'En vitrina'],
              ['oculta', 'Fuera de vitrina'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className="seg-btn"
              aria-pressed={filtro === id}
              onClick={() => setFiltro(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error ? <p className="error">{error}</p> : null}

      {filtered.length === 0 ? (
        <Empty
          title="Sin profesionales para vitrina"
          description="Cuando tengas profesionales con planes de suscripción, los administrás acá."
        />
      ) : (
        <>
          <div className="vitrina-stack">
            {pager.pageItems.map((row) => {
              const proLabel = `${row.apellido}, ${row.nombre}`;
              const planesActivos = row.planes.filter((p) => p.activo).length;
              return (
                <article key={row.id_usuario} className="card vitrina-pro">
                  <div className="vitrina-pro-head">
                    <div className="vitrina-pro-title">
                      <strong>{proLabel}</strong>
                      <span className="mail-cell">{row.mail || '—'}</span>
                      {!row.tiene_perfil ? (
                        <span className="pill">Sin perfil de vitrina</span>
                      ) : row.vitrina_visible ? (
                        <span className="pill ok">Visible en vitrina</span>
                      ) : (
                        <span className="pill warn">Oculta en vitrina</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn ghost"
                      disabled={!row.tiene_perfil || busyPro === row.id_usuario}
                      onClick={() => togglePro(row)}
                    >
                      {!row.tiene_perfil
                        ? 'Sin vitrina'
                        : row.vitrina_visible
                          ? 'Ocultar profesional'
                          : 'Mostrar profesional'}
                    </button>
                  </div>

                  <p className="vitrina-pro-meta muted">
                    {row.planes.length === 0
                      ? 'Todavía no cargó planes de suscripción.'
                      : `${planesActivos} de ${row.planes.length} cards visibles`}
                  </p>

                  {row.planes.length === 0 ? null : (
                    <PlanCardsCarousel
                      planes={row.planes}
                      busyPlan={busyPlan}
                      onToggle={togglePlan}
                    />
                  )}
                </article>
              );
            })}
          </div>
          <ListPaginator
            page={pager.page}
            totalPages={pager.totalPages}
            total={pager.total}
            pageSize={pager.pageSize}
            onPage={pager.setPage}
          />
        </>
      )}
    </section>
  );
}

type CobroItem = { id?: string; tipo: string; valor: string; etiqueta?: string | null };
type PagoRow = {
  id: string;
  origen: string;
  estado: string;
  monto: number | null;
  moneda: string | null;
  medio_pago: string;
  fecha_pago: string | null;
  nota: string | null;
  datos_cobro_resumen: string | null;
};

function Pagos({ token }: { token: string }) {
  const [estado, setEstado] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [alias, setAlias] = useState('');
  const [cbu, setCbu] = useState('');
  const [cvu, setCvu] = useState('');
  const [historial, setHistorial] = useState<PagoRow[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    api<Record<string, unknown>>('/entidades/me', token)
      .then((data) => {
        const contratacion = data.contratacion as { estado?: string } | null;
        setEstado(contratacion?.estado || '');
        const cobro = (data.datos_cobro || []) as CobroItem[];
        setAlias(cobro.find((i) => i.tipo === 'alias')?.valor || '');
        setCbu(cobro.find((i) => i.tipo === 'cbu')?.valor || '');
        setCvu(cobro.find((i) => i.tipo === 'cvu')?.valor || '');
      })
      .catch((err) => setError(friendlyError(err)));
    api<PagoRow[]>('/entidades/me/pagos', token).then(setHistorial).catch(() => setHistorial([]));
  }, [token, tick]);

  async function guardarCobro(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setOk('');
    const items: CobroItem[] = [];
    if (alias.trim()) items.push({ tipo: 'alias', valor: alias.trim() });
    if (cbu.trim()) items.push({ tipo: 'cbu', valor: cbu.trim() });
    else if (cvu.trim()) items.push({ tipo: 'cvu', valor: cvu.trim() });
    try {
      await api('/entidades/me/datos-cobro', token, {
        method: 'PUT',
        body: JSON.stringify({ items }),
      });
      setOk('Datos de cobro guardados.');
      setTick((n) => n + 1);
    } catch (err) {
      setError(friendlyError(err, 'No se pudieron guardar'));
    }
  }

  async function declarar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError('');
    setOk('');
    try {
      await api('/entidades/me/contratacion/declarar-pago', token, {
        method: 'POST',
        body: JSON.stringify({ comprobante_nombre: String(form.get('comprobante') || '') || null }),
      });
      setOk('Declaraste el pago. Sigue pendiente hasta que la plataforma lo valide.');
      setEstado('pending');
      setTick((n) => n + 1);
    } catch (err) {
      setError(friendlyError(err, 'No se pudo declarar'));
    }
  }

  const pagosPager = usePagedItems(historial, `${historial.length}|${tick}`);

  return (
    <section className="grid pagos-page">
      <PageHead
        title="Pagos"
        subtitle="Medios para recibir transferencias, declaración del pack e historial."
      />
      <form className="card grid" onSubmit={guardarCobro}>
        <h2>Datos para recibir transferencias</h2>
        <p className="muted">Alias y CBU o CVU del centro (máximo dos medios). Quedan asociados al historial.</p>
        <div className="grid cols-2 pagos-medios-grid">
          <label>
            Alias
            <input value={alias} onChange={(e) => setAlias(e.target.value.toUpperCase())} maxLength={20} />
          </label>
          <label>
            CBU
            <input
              value={cbu}
              onChange={(e) => setCbu(e.target.value.replace(/\D/g, '').slice(0, 22))}
              inputMode="numeric"
              maxLength={22}
            />
          </label>
          <label className="pagos-span-2">
            CVU
            <input
              value={cvu}
              onChange={(e) => setCvu(e.target.value.replace(/\D/g, '').slice(0, 22))}
              inputMode="numeric"
              maxLength={22}
            />
          </label>
        </div>
        <button className="fap-btn-primary pagos-action" type="submit">
          Guardar medios
        </button>
      </form>
      <form className="card grid" onSubmit={declarar}>
        <h2>Pago del pack</h2>
        <div className="pagos-estado-row">
          <p className="muted" style={{ margin: 0 }}>
            Estado actual del pack:
          </p>
          {estadoPill(estado)}
        </div>
        <label>
          Nombre del comprobante
          <input name="comprobante" placeholder="transferencia.pdf" />
        </label>
        {error ? <p className="error">{error}</p> : null}
        {ok ? <p className="ok-msg">{ok}</p> : null}
        <button className="fap-btn-primary pagos-action" type="submit">
          Declarar transferencia
        </button>
      </form>
      <section className="card pagos-historial">
        <h2>Historial de pagos</h2>
        {historial.length === 0 ? (
          <Empty title="Sin movimientos" description="Cuando declares o se valide un pago, aparece acá." />
        ) : (
          <ResponsiveList
            footer={
              <ListPaginator
                page={pagosPager.page}
                totalPages={pagosPager.totalPages}
                total={pagosPager.total}
                pageSize={pagosPager.pageSize}
                onPage={pagosPager.setPage}
              />
            }
            table={
              <table>
                <thead>
                  <tr>
                    <th>Estado</th>
                    <th>Monto</th>
                    <th>Medio</th>
                    <th>Fecha</th>
                    <th>Cuenta</th>
                    <th>Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {pagosPager.pageItems.map((row) => (
                    <tr key={`${row.origen}-${row.id}`}>
                      <td>{estadoPill(row.estado)}</td>
                      <td>{row.monto == null ? '—' : `${row.moneda || 'ARS'} ${row.monto}`}</td>
                      <td>{row.medio_pago}</td>
                      <td>{row.fecha_pago || '—'}</td>
                      <td>{row.datos_cobro_resumen || '—'}</td>
                      <td className="pagos-nota-cell">{row.nota || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
            cards={
              <div className="card-list">
                {pagosPager.pageItems.map((row) => (
                  <article key={`${row.origen}-${row.id}-m`} className="card row-card">
                    <div className="row-card-head">
                      <strong>
                        {row.monto == null ? 'Sin monto' : `${row.moneda || 'ARS'} ${row.monto}`}
                      </strong>
                      {estadoPill(row.estado)}
                    </div>
                    <div className="row-card-meta">
                      <span>{row.medio_pago}</span>
                      <span>Fecha: {row.fecha_pago || '—'}</span>
                      <span className="pagos-break">{row.datos_cobro_resumen || '—'}</span>
                      {row.nota ? <span className="pagos-break">{row.nota}</span> : null}
                    </div>
                  </article>
                ))}
              </div>
            }
          />
        )}
      </section>
    </section>
  );
}

type SocioRow = {
  id_usuario: string;
  nombre: string;
  apellido: string;
  mail?: string;
  estado?: boolean;
  profesional_nombre?: string | null;
  tipo?: string | null;
};

type AsistenciaSesionRow = {
  id: string;
  id_profesional: string;
  profesional_nombre?: string | null;
  profesional_apellido?: string | null;
  profesional_display?: string | null;
  titulo: string;
  descripcion?: string | null;
  fecha: string;
  estado: 'borrador' | 'abierta' | 'cerrada' | string;
  total_registros: number;
  total_presente: number;
  total_ausente: number;
  total_pendiente: number;
  total_tardanza?: number;
  total_justificado?: number;
  total_autoreportado?: number;
};

type AsistenciaRegistroRow = {
  id: string;
  id_sesion: string;
  nombre_display: string;
  apellido_display: string;
  email_display?: string | null;
  estado: string;
  tipo?: string;
  nota?: string | null;
};

type AsistenciaDetalle = {
  sesion: AsistenciaSesionRow;
  registros: AsistenciaRegistroRow[];
  total_registros: number;
};

function sesionEstadoPill(estado: string) {
  const value = (estado || '').toLowerCase();
  if (value === 'abierta') return <span className="pill ok">Abierta</span>;
  if (value === 'borrador') return <span className="pill warn">Borrador</span>;
  if (value === 'cerrada') return <span className="pill">Cerrada</span>;
  return <span className="pill">{estado || '—'}</span>;
}

function registroEstadoPill(estado: string) {
  const value = (estado || '').toLowerCase();
  if (value === 'presente') return <span className="pill ok">Presente</span>;
  if (value === 'presente_autoreportado') return <span className="pill warn">Autoreporte</span>;
  if (value === 'ausente') return <span className="pill">Ausente</span>;
  if (value === 'tardanza') return <span className="pill warn">Tardanza</span>;
  if (value === 'justificado') return <span className="pill ok">Justificado</span>;
  if (value === 'pendiente') return <span className="pill warn">Pendiente</span>;
  return <span className="pill">{estado || '—'}</span>;
}

function profesionalDisplay(row: AsistenciaSesionRow) {
  if (row.profesional_display) return row.profesional_display;
  if (row.profesional_apellido || row.profesional_nombre) {
    return `${row.profesional_apellido || ''}, ${row.profesional_nombre || ''}`
      .replace(/^,\s*|,\s*$/g, '')
      .trim();
  }
  return '—';
}

function Asistencias({ token }: { token: string }) {
  const [rows, setRows] = useState<AsistenciaSesionRow[]>([]);
  const [pros, setPros] = useState<ProRow[]>([]);
  const [search, setSearch] = useState('');
  const [proFiltro, setProFiltro] = useState('todos');
  const [estadoFiltro, setEstadoFiltro] = useState<'todos' | 'borrador' | 'abierta' | 'cerrada'>('todos');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [tick, setTick] = useState(0);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [detalleId, setDetalleId] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<AsistenciaDetalle | null>(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoApellido, setNuevoApellido] = useState('');

  useEffect(() => {
    api<ProRow[]>('/entidades/me/profesionales', token)
      .then(setPros)
      .catch(() => setPros([]));
  }, [token]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (estadoFiltro !== 'todos') params.set('estado_sesion', estadoFiltro);
    if (proFiltro !== 'todos') params.set('id_profesional', proFiltro);
    if (desde) params.set('desde', desde);
    if (hasta) params.set('hasta', hasta);
    params.set('limit', '100');
    const qs = params.toString();
    api<AsistenciaSesionRow[]>(`/entidades/me/asistencias/sesiones${qs ? `?${qs}` : ''}`, token)
      .then(setRows)
      .catch(() => setRows([]));
  }, [token, tick, search, estadoFiltro, proFiltro, desde, hasta]);

  useEffect(() => {
    if (!detalleId) {
      setDetalle(null);
      return;
    }
    setDetalleLoading(true);
    api<AsistenciaDetalle>(`/entidades/me/asistencias/sesiones/${detalleId}`, token)
      .then(setDetalle)
      .catch(() => setDetalle(null))
      .finally(() => setDetalleLoading(false));
  }, [token, detalleId, tick]);

  const pager = usePagedItems(rows, `${search}|${estadoFiltro}|${proFiltro}|${desde}|${hasta}|${tick}`);

  async function crearPlanilla(payload: {
    titulo: string;
    fecha: string;
    id_profesional: string;
    descripcion?: string;
  }) {
    setError('');
    setBusy(true);
    try {
      await api('/entidades/me/asistencias/sesiones', token, {
        method: 'POST',
        body: JSON.stringify({
          titulo: payload.titulo,
          fecha: payload.fecha,
          id_profesional: payload.id_profesional,
          descripcion: payload.descripcion || null,
          permite_autoreporte: true,
        }),
      });
      setCreateOpen(false);
      setTick((n) => n + 1);
    } catch (err) {
      setError(friendlyError(err, 'No se pudo crear la planilla'));
    } finally {
      setBusy(false);
    }
  }

  async function cambiarEstadoSesion(id: string, estado: 'borrador' | 'abierta' | 'cerrada') {
    setError('');
    setBusy(true);
    try {
      await api(`/entidades/me/asistencias/sesiones/${id}`, token, {
        method: 'PATCH',
        body: JSON.stringify({ estado }),
      });
      setTick((n) => n + 1);
    } catch (err) {
      setError(friendlyError(err, 'No se pudo actualizar la planilla'));
    } finally {
      setBusy(false);
    }
  }

  async function marcarRegistro(idSesion: string, idRegistro: string, estado: string) {
    setError('');
    setBusy(true);
    try {
      await api(`/entidades/me/asistencias/sesiones/${idSesion}/registros/${idRegistro}`, token, {
        method: 'PATCH',
        body: JSON.stringify({ estado }),
      });
      setTick((n) => n + 1);
    } catch (err) {
      setError(friendlyError(err, 'No se pudo marcar la asistencia'));
    } finally {
      setBusy(false);
    }
  }

  async function agregarAsistente(idSesion: string) {
    setError('');
    if (!nuevoNombre.trim() || !nuevoApellido.trim()) {
      setError('Completá nombre y apellido');
      return;
    }
    setBusy(true);
    try {
      await api(`/entidades/me/asistencias/sesiones/${idSesion}/registros`, token, {
        method: 'POST',
        body: JSON.stringify({
          nombre: nuevoNombre.trim(),
          apellido: nuevoApellido.trim(),
          estado: 'pendiente',
        }),
      });
      setNuevoNombre('');
      setNuevoApellido('');
      setTick((n) => n + 1);
    } catch (err) {
      setError(friendlyError(err, 'No se pudo agregar a la lista'));
    } finally {
      setBusy(false);
    }
  }

  const prosActivos = pros.filter((p) => p.estado !== false);

  return (
    <section className="grid">
      <PageHead
        title="Asistencias"
        subtitle="Planillas de asistencia de los profesionales del centro."
      />

      <div className="card list-toolbar">
        <div className="search-field">
          <span className="search-ico">
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título o profesional"
            aria-label="Buscar asistencias"
          />
        </div>
        <label className="toolbar-filter">
          <span className="toolbar-filter-label">Profesional</span>
          <select
            className="tier-select"
            value={proFiltro}
            onChange={(e) => setProFiltro(e.target.value)}
            aria-label="Filtrar por profesional"
          >
            <option value="todos">Todos</option>
            {pros.map((p) => (
              <option key={p.id_usuario} value={p.id_usuario}>
                {p.apellido}, {p.nombre}
              </option>
            ))}
          </select>
        </label>
        <div className="seg-track" role="group" aria-label="Estado de planilla">
          {(
            [
              ['todos', 'Todas'],
              ['abierta', 'Abiertas'],
              ['borrador', 'Borrador'],
              ['cerrada', 'Cerradas'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className="seg-btn"
              aria-pressed={estadoFiltro === id}
              onClick={() => setEstadoFiltro(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="toolbar-filter">
          <span className="toolbar-filter-label">Desde</span>
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </label>
        <label className="toolbar-filter">
          <span className="toolbar-filter-label">Hasta</span>
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </label>
        <button className="fap-btn-primary toolbar-cta" type="button" onClick={() => setCreateOpen(true)}>
          + Nueva planilla
        </button>
      </div>

      {error ? <p className="error">{error}</p> : null}

      {createOpen ? (
        <NuevaPlanillaModal
          pros={prosActivos}
          busy={busy}
          onClose={() => setCreateOpen(false)}
          onSubmit={crearPlanilla}
        />
      ) : null}

      {detalleId ? (
        <div className="card">
          <div className="row-card-head">
            <strong>
              {detalleLoading ? 'Cargando planilla…' : detalle?.sesion.titulo || 'Planilla'}
            </strong>
            <button type="button" className="btn ghost" onClick={() => setDetalleId(null)}>
              Cerrar
            </button>
          </div>
          {detalle ? (
            <>
              <div className="row-card-meta">
                <span>{profesionalDisplay(detalle.sesion)}</span>
                <span>{detalle.sesion.fecha}</span>
                {sesionEstadoPill(detalle.sesion.estado)}
              </div>
              <div className="row-actions" style={{ marginTop: '0.75rem' }}>
                {detalle.sesion.estado === 'borrador' ? (
                  <button
                    type="button"
                    className="btn ghost"
                    disabled={busy}
                    onClick={() => cambiarEstadoSesion(detalle.sesion.id, 'abierta')}
                  >
                    Abrir planilla
                  </button>
                ) : null}
                {detalle.sesion.estado === 'abierta' ? (
                  <button
                    type="button"
                    className="btn ghost"
                    disabled={busy}
                    onClick={() => cambiarEstadoSesion(detalle.sesion.id, 'cerrada')}
                  >
                    Cerrar planilla
                  </button>
                ) : null}
                {detalle.sesion.estado === 'cerrada' ? (
                  <button
                    type="button"
                    className="btn ghost"
                    disabled={busy}
                    onClick={() => cambiarEstadoSesion(detalle.sesion.id, 'abierta')}
                  >
                    Reabrir
                  </button>
                ) : null}
              </div>

              {detalle.sesion.estado !== 'cerrada' ? (
                <div className="list-toolbar" style={{ marginTop: '1rem' }}>
                  <input
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    placeholder="Nombre"
                    aria-label="Nombre asistente"
                  />
                  <input
                    value={nuevoApellido}
                    onChange={(e) => setNuevoApellido(e.target.value)}
                    placeholder="Apellido"
                    aria-label="Apellido asistente"
                  />
                  <button
                    type="button"
                    className="btn ghost"
                    disabled={busy}
                    onClick={() => agregarAsistente(detalle.sesion.id)}
                  >
                    Agregar a la lista
                  </button>
                </div>
              ) : null}

              {detalle.registros.length === 0 ? (
                <Empty title="Lista vacía" description="Agregá asistentes para marcar asistencia." />
              ) : (
                <div className="table-wrap" style={{ marginTop: '0.75rem' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Asistente</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalle.registros.map((reg) => (
                        <tr key={reg.id}>
                          <td>
                            <strong>
                              {reg.apellido_display}, {reg.nombre_display}
                            </strong>
                            {reg.email_display ? (
                              <div className="muted mail-cell">{reg.email_display}</div>
                            ) : null}
                          </td>
                          <td>{registroEstadoPill(reg.estado)}</td>
                          <td>
                            <div className="row-actions">
                              <button
                                type="button"
                                className="btn ghost"
                                disabled={busy || detalle.sesion.estado === 'cerrada'}
                                onClick={() => marcarRegistro(detalle.sesion.id, reg.id, 'presente')}
                              >
                                Presente
                              </button>
                              <button
                                type="button"
                                className="btn ghost"
                                disabled={busy || detalle.sesion.estado === 'cerrada'}
                                onClick={() => marcarRegistro(detalle.sesion.id, reg.id, 'ausente')}
                              >
                                Ausente
                              </button>
                              <button
                                type="button"
                                className="btn ghost"
                                disabled={busy || detalle.sesion.estado === 'cerrada'}
                                onClick={() => marcarRegistro(detalle.sesion.id, reg.id, 'justificado')}
                              >
                                Justificado
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : !detalleLoading ? (
            <Empty title="No se pudo cargar" description="Probá de nuevo o elegí otra planilla." />
          ) : null}
        </div>
      ) : null}

      {rows.length === 0 ? (
        <Empty
          title="Sin planillas todavía"
          description="Creá una planilla para un profesional del centro y marcá asistencia."
        />
      ) : (
        <ResponsiveList
          footer={
            <ListPaginator
              page={pager.page}
              totalPages={pager.totalPages}
              total={pager.total}
              pageSize={pager.pageSize}
              onPage={pager.setPage}
            />
          }
          table={
            <table>
              <thead>
                <tr>
                  <th>Planilla</th>
                  <th>Profesional</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Asistencia</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pager.pageItems.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.titulo}</strong>
                    </td>
                    <td>{profesionalDisplay(row)}</td>
                    <td>{row.fecha}</td>
                    <td>{sesionEstadoPill(row.estado)}</td>
                    <td>
                      {row.total_presente}/{row.total_registros}
                      {row.total_pendiente ? (
                        <span className="muted"> · {row.total_pendiente} pend.</span>
                      ) : null}
                    </td>
                    <td>
                      <button type="button" className="btn ghost" onClick={() => setDetalleId(row.id)}>
                        Abrir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
          cards={
            <div className="card-list">
              {pager.pageItems.map((row) => (
                <article key={row.id} className="card row-card">
                  <div className="row-card-head">
                    <strong>{row.titulo}</strong>
                    {sesionEstadoPill(row.estado)}
                  </div>
                  <div className="row-card-meta">
                    <span>{profesionalDisplay(row)}</span>
                    <span>{row.fecha}</span>
                    <span>
                      {row.total_presente}/{row.total_registros} presentes
                    </span>
                  </div>
                  <div className="row-card-foot">
                    <button type="button" className="btn ghost" onClick={() => setDetalleId(row.id)}>
                      Abrir
                    </button>
                  </div>
                </article>
              ))}
            </div>
          }
        />
      )}
    </section>
  );
}

function NuevaPlanillaModal({
  pros,
  busy,
  onClose,
  onSubmit,
}: {
  pros: ProRow[];
  busy: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    titulo: string;
    fecha: string;
    id_profesional: string;
    descripcion?: string;
  }) => void | Promise<void>;
}) {
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [idProfesional, setIdProfesional] = useState(pros[0]?.id_usuario || '');
  const [descripcion, setDescripcion] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!idProfesional && pros[0]) setIdProfesional(pros[0].id_usuario);
  }, [pros, idProfesional]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || !fecha || !idProfesional) {
      setLocalError('Completá título, fecha y profesional');
      return;
    }
    setLocalError('');
    await onSubmit({
      titulo: titulo.trim(),
      fecha,
      id_profesional: idProfesional,
      descripcion: descripcion.trim() || undefined,
    });
  }

  return (
    <div className="modal-scrim" role="presentation" onClick={onClose}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nueva-planilla-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="alta-pro-head">
          <button type="button" className="alta-pro-close" onClick={onClose} disabled={busy} aria-label="Cerrar">
            ✕
          </button>
          <h3 id="nueva-planilla-title">Nueva planilla</h3>
          <p className="muted">Asigná la planilla a un profesional del centro.</p>
        </div>
        <form className="alta-pro-body" onSubmit={handleSubmit}>
          <label className="alta-pro-field">
            <span>Título</span>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
          </label>
          <label className="alta-pro-field">
            <span>Profesional</span>
            <select
              className="tier-select"
              value={idProfesional}
              onChange={(e) => setIdProfesional(e.target.value)}
              required
            >
              {pros.length === 0 ? <option value="">Sin profesionales activos</option> : null}
              {pros.map((p) => (
                <option key={p.id_usuario} value={p.id_usuario}>
                  {p.apellido}, {p.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="alta-pro-field">
            <span>Fecha</span>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          </label>
          <label className="alta-pro-field">
            <span>Descripción (opcional)</span>
            <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </label>
          {localError ? <p className="error">{localError}</p> : null}
          <div className="row-actions">
            <button type="button" className="btn ghost" onClick={onClose} disabled={busy}>
              Cancelar
            </button>
            <button type="submit" className="fap-btn-primary" disabled={busy || pros.length === 0}>
              {busy ? 'Creando…' : 'Crear planilla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Socios({ token }: { token: string }) {
  const [rows, setRows] = useState<SocioRow[]>([]);
  const [search, setSearch] = useState('');
  const [filtro, setFiltro] = useState<'todos' | 'activo' | 'inactivo' | 'socio' | 'entrenado'>('todos');

  useEffect(() => {
    api<SocioRow[]>('/entidades/me/socios', token)
      .then(setRows)
      .catch(() => setRows([]));
  }, [token]);

  const filtered = rows.filter((row) => {
    const q = search.trim().toLowerCase();
    const hay =
      !q ||
      `${row.nombre} ${row.apellido} ${row.mail || ''} ${row.profesional_nombre || ''}`
        .toLowerCase()
        .includes(q);
    if (!hay) return false;
    if (filtro === 'activo') return row.estado !== false;
    if (filtro === 'inactivo') return row.estado === false;
    if (filtro === 'socio') return (row.tipo || 'socio').toLowerCase() === 'socio';
    if (filtro === 'entrenado') {
      const t = (row.tipo || '').toLowerCase();
      return t === 'entrenado' || t === 'alumno';
    }
    return true;
  });
  const pager = usePagedItems(filtered, `${search}|${filtro}`);

  return (
    <section className="grid">
      <PageHead title="Socios" subtitle="Personas vinculadas a los profesionales del centro." />
      <div className="card list-toolbar">
        <div className="search-field">
          <span className="search-ico">
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, mail o profesional"
            aria-label="Buscar socios"
          />
        </div>
        <div className="seg-track" role="group" aria-label="Filtro socios">
          {(
            [
              ['todos', 'Todos'],
              ['activo', 'Activos'],
              ['inactivo', 'Inactivos'],
              ['socio', 'Socio'],
              ['entrenado', 'Entrenado'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className="seg-btn"
              aria-pressed={filtro === id}
              onClick={() => setFiltro(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty
          title="Sin socios todavía"
          description="Aparecen cuando están vinculados a un profesional del centro."
        />
      ) : (
        <ResponsiveList
          footer={
            <ListPaginator
              page={pager.page}
              totalPages={pager.totalPages}
              total={pager.total}
              pageSize={pager.pageSize}
              onPage={pager.setPage}
            />
          }
          table={
            <table>
              <thead>
                <tr>
                  <th>Nombre completo</th>
                  <th>Mail</th>
                  <th>Tipo</th>
                  <th>Profesional</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {pager.pageItems.map((row) => (
                  <tr key={row.id_usuario}>
                    <td>
                      <strong>
                        {row.apellido}, {row.nombre}
                      </strong>
                    </td>
                    <td className="mail-cell">{row.mail || '—'}</td>
                    <td>{tipoPill(row.tipo)}</td>
                    <td>{row.profesional_nombre || '—'}</td>
                    <td>
                      <span className={`dot-status ${row.estado === false ? 'off' : 'on'}`}>
                        {row.estado === false ? 'Inactivo' : 'Activo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
          cards={
            <div className="card-list">
              {pager.pageItems.map((row) => (
                <article key={row.id_usuario} className="card row-card">
                  <div className="row-card-head">
                    <strong>
                      {row.apellido}, {row.nombre}
                    </strong>
                    {tipoPill(row.tipo)}
                  </div>
                  <div className="row-card-meta">
                    <span>{row.mail || '—'}</span>
                    <span>Profesional: {row.profesional_nombre || '—'}</span>
                  </div>
                  <div className="row-card-foot">
                    <span className={`dot-status ${row.estado === false ? 'off' : 'on'}`}>
                      {row.estado === false ? 'Inactivo' : 'Activo'}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          }
        />
      )}
    </section>
  );
}

function ContratacionesPros({ token }: { token: string }) {
  const [rows, setRows] = useState<ProRow[]>([]);
  const [search, setSearch] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<'todos' | 'activo' | 'pendiente' | 'inactivo'>('todos');
  const [tierFiltro, setTierFiltro] = useState('todos');
  const [tick, setTick] = useState(0);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    api<ProRow[]>('/entidades/me/profesionales', token)
      .then(setRows)
      .catch(() => setRows([]));
  }, [token, tick]);

  const tiers = Array.from(new Set(rows.map((r) => r.codigo_tier).filter(Boolean))) as string[];

  const filtered = rows.filter((row) => {
    const q = search.trim().toLowerCase();
    const hay = !q || `${row.nombre} ${row.apellido} ${row.mail || ''}`.toLowerCase().includes(q);
    if (!hay) return false;
    if (tierFiltro !== 'todos' && row.codigo_tier !== tierFiltro) return false;
    const pendiente = necesitaActivacion(row) && row.estado !== false;
    if (estadoFiltro === 'activo') return row.estado !== false && !necesitaActivacion(row);
    if (estadoFiltro === 'inactivo') return row.estado === false;
    if (estadoFiltro === 'pendiente') return pendiente || necesitaActivacion(row);
    return true;
  });
  const pager = usePagedItems(filtered, `${search}|${estadoFiltro}|${tierFiltro}`);

  async function activar(row: ProRow) {
    setError('');
    setBusyId(row.id_usuario);
    try {
      await api(`/entidades/me/profesionales/${row.id_usuario}/activar`, token, { method: 'POST' });
      setTick((n) => n + 1);
    } catch (err) {
      setError(friendlyError(err, 'No se pudo activar al profesional'));
    } finally {
      setBusyId(null);
    }
  }

  async function desactivar(row: ProRow) {
    setError('');
    setBusyId(row.id_usuario);
    try {
      await api(`/entidades/me/profesionales/${row.id_usuario}/desactivar`, token, { method: 'POST' });
      setTick((n) => n + 1);
    } catch (err) {
      setError(friendlyError(err, 'No se pudo desactivar al profesional'));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="grid">
      <PageHead
        title="Contrataciones"
        subtitle="Tier incluido y estado de la vinculación. Si está pendiente, el profesional aún no terminó el alta o podés activarlo acá."
      />
      <div className="card list-toolbar">
        <div className="search-field">
          <span className="search-ico">
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar profesional"
            aria-label="Buscar contrataciones"
          />
        </div>
        <div className="seg-track" role="group" aria-label="Estado">
          {(
            [
              ['todos', 'Todos'],
              ['activo', 'Activo'],
              ['pendiente', 'Pendiente'],
              ['inactivo', 'Inactivo'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className="seg-btn"
              aria-pressed={estadoFiltro === id}
              onClick={() => setEstadoFiltro(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="toolbar-filter">
          <span className="toolbar-filter-label">Tier</span>
          <select
            className="tier-select"
            value={tierFiltro}
            onChange={(e) => setTierFiltro(e.target.value)}
            aria-label="Filtrar por tier"
          >
            <option value="todos">Todos</option>
            {tiers.map((t) => (
              <option key={t} value={t}>
                {tierLabel(t)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? <p className="error">{error}</p> : null}

      {filtered.length === 0 ? (
        <Empty title="Sin contrataciones" description="Cuando des de alta profesionales, aparecen acá." />
      ) : (
        <ResponsiveList
          footer={
            <ListPaginator
              page={pager.page}
              totalPages={pager.totalPages}
              total={pager.total}
              pageSize={pager.pageSize}
              onPage={pager.setPage}
            />
          }
          table={
            <table>
              <thead>
                <tr>
                  <th>Profesional</th>
                  <th>Mail</th>
                  <th>Tier</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pager.pageItems.map((row) => (
                  <tr key={row.id_usuario}>
                    <td>
                      <strong>
                        {row.apellido}, {row.nombre}
                      </strong>
                    </td>
                    <td className="mail-cell">{row.mail || '—'}</td>
                    <td>
                      <span className="pill">{row.codigo_tier || 'sin tier'}</span>
                    </td>
                    <td>{estadoProPill(row)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn ghost"
                        disabled={busyId === row.id_usuario}
                        onClick={() => (row.estado === false ? activar(row) : desactivar(row))}
                      >
                        {row.estado === false ? 'Activar' : 'Desactivar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
          cards={
            <div className="card-list">
              {pager.pageItems.map((row) => (
                <article key={row.id_usuario} className="card row-card">
                  <div className="row-card-head">
                    <strong>
                      {row.apellido}, {row.nombre}
                    </strong>
                    {estadoProPill(row)}
                  </div>
                  <div className="row-card-meta">
                    <span>{row.mail || '—'}</span>
                    <span>Tier: {row.codigo_tier || 'sin tier'}</span>
                  </div>
                  <div className="row-card-foot">
                    <button
                      type="button"
                      className="btn ghost"
                      disabled={busyId === row.id_usuario}
                      onClick={() => (row.estado === false ? activar(row) : desactivar(row))}
                    >
                      {row.estado === false ? 'Activar' : 'Desactivar'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          }
        />
      )}
    </section>
  );
}

function MiPack({ token, onGoPagos }: { token: string; onGoPagos: () => void }) {
  const [me, setMe] = useState<Record<string, unknown> | null>(null);
  const [planes, setPlanes] = useState<
    Array<{
      codigo: string;
      nombre: string;
      max_profesionales: number | null;
      precio_centavos: number;
      moneda: string;
    }>
  >([]);

  useEffect(() => {
    api<Record<string, unknown>>('/entidades/me', token).then(setMe).catch(() => setMe(null));
    api<typeof planes>('/planes-entidad', token).then(setPlanes).catch(() => setPlanes([]));
  }, [token]);

  const contratacion = (me?.contratacion || null) as {
    estado?: string;
    nombre_plan?: string;
    codigo_plan?: string;
    motivo_estado?: string | null;
  } | null;

  return (
    <section className="grid">
      <PageHead title="Mi pack" subtitle="Tier contratado por el centro y cupo de profesionales." />
      <div className="pack-hero">
        <article className="card pack-main">
          <h2>Pack actual</h2>
          <strong className="pack-main-title">{contratacion?.nombre_plan || 'Sin pack'}</strong>
          {estadoPill(contratacion?.estado)}
          {contratacion?.motivo_estado ? <p className="muted">Motivo: {contratacion.motivo_estado}</p> : null}
          <p className="muted pack-cupo">
            Cupo:{' '}
            <strong>
              {String(me?.profesionales_usados ?? '—')}
              {me?.max_profesionales == null ? '' : ` / ${me.max_profesionales}`}
            </strong>{' '}
            profesionales
          </p>
          <button className="fap-btn-primary pack-cta" type="button" onClick={onGoPagos}>
            Ir a pagos / declarar
          </button>
        </article>
        <article className="card pack-aside">
          <div className="pack-aside-block">
            <span className="kpi-label">Código</span>
            <code className="pack-code">{contratacion?.codigo_plan || '—'}</code>
          </div>
          <div className="pack-aside-block">
            <span className="kpi-label">Centro</span>
            <strong className="pack-aside-name">{String(me?.nombre_fantasia || '—')}</strong>
          </div>
        </article>
      </div>

      <h2 style={{ margin: 0, fontFamily: 'var(--fap-font-ui)', fontSize: '1rem' }}>Catálogo disponible</h2>
      <div className="plan-grid">
        {planes.map((plan) => {
          const current = plan.codigo === contratacion?.codigo_plan;
          return (
            <article key={plan.codigo} className={`plan-card${current ? ' current' : ''}`}>
              {current ? <span className="pill ok">Plan actual</span> : <span className="pill">Disponible</span>}
              <strong style={{ fontFamily: 'var(--fap-font-ui)', fontSize: '1.05rem' }}>{plan.nombre}</strong>
              <p className="muted" style={{ margin: 0 }}>
                Hasta {plan.max_profesionales ?? '—'} profesionales
              </p>
              <div className="price">
                {(plan.precio_centavos / 100).toLocaleString('es-AR', {
                  style: 'currency',
                  currency: plan.moneda || 'ARS',
                  maximumFractionDigits: 0,
                })}
                <span>por mes</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Perfil({
  token,
  onUpdated,
}: {
  token: string;
  onUpdated: (nombre: string, logo: string | null) => void;
}) {
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [nombre, setNombre] = useState('');
  const [razon, setRazon] = useState('');
  const [cuit, setCuit] = useState('');
  const [mail, setMail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [sitio, setSitio] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    api<Record<string, unknown>>('/entidades/me', token)
      .then((me) => {
        setNombre(String(me.nombre_fantasia || ''));
        setRazon(String(me.razon_social || ''));
        setCuit(String(me.cuit || ''));
        setMail(String(me.mail || ''));
        setTelefono(String(me.telefono || ''));
        setDescripcion(String(me.descripcion || ''));
        setSitio(String(me.sitio_web || ''));
        setLogoUrl(typeof me.logo_url === 'string' && me.logo_url ? me.logo_url : null);
      })
      .catch((err) => setError(friendlyError(err)));
  }, [token]);

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setOk('');
    try {
      const me = await api<Record<string, unknown>>('/entidades/me', token, {
        method: 'PATCH',
        body: JSON.stringify({
          nombre_fantasia: nombre,
          telefono,
          descripcion,
          sitio_web: sitio || null,
          logo_url: logoUrl,
        }),
      });
      const nextNombre = String(me.nombre_fantasia || nombre);
      const nextLogo = typeof me.logo_url === 'string' && me.logo_url ? me.logo_url : null;
      onUpdated(nextNombre, nextLogo);
      setOk('Perfil actualizado.');
    } catch (err) {
      setError(friendlyError(err, 'No se pudo guardar el perfil'));
    }
  }

  return (
    <section className="grid">
      <PageHead title="Perfil del centro" subtitle="Datos visibles y de contacto del centro." />
      <form className="card grid" onSubmit={guardar}>
        <div className="profile-hero">
          <CentroAvatar logoUrl={logoUrl} nombre={nombre || 'Centro'} />
          <div>
            <strong style={{ fontFamily: 'var(--fap-font-ui)', fontSize: '1.15rem' }}>{nombre || '—'}</strong>
            <p className="muted" style={{ margin: '0.25rem 0 0' }}>
              Subí o pegá la URL del logo del centro.
            </p>
          </div>
        </div>
        <div className="grid cols-2">
          <label>
            Nombre de fantasía
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} required minLength={2} />
          </label>
          <label>
            Razón social
            <input value={razon} disabled />
          </label>
          <label>
            CUIT
            <input value={cuit} disabled />
          </label>
          <label>
            Mail
            <input value={mail} disabled />
          </label>
          <label>
            Teléfono
            <input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </label>
          <label>
            Sitio web
            <input value={sitio} onChange={(e) => setSitio(e.target.value)} placeholder="https://" />
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            URL del logo
            <input
              value={logoUrl || ''}
              onChange={(e) => setLogoUrl(e.target.value.trim() || null)}
              placeholder="https://…/logo.png"
            />
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            Descripción
            <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={4} />
          </label>
        </div>
        {error ? <p className="error">{error}</p> : null}
        {ok ? <p className="ok-msg">{ok}</p> : null}
        <button className="fap-btn-primary" type="submit" style={{ width: 'fit-content' }}>
          Guardar perfil
        </button>
      </form>
    </section>
  );
}

function Ranking({ token }: { token: string }) {
  const [rows, setRows] = useState<Array<{ id_usuario: string; nombre: string; apellido: string; promedio: number }>>([]);
  useEffect(() => {
    api<Array<{ id_usuario: string; nombre: string; apellido: string; promedio: number }>>('/entidades/me/ranking', token)
      .then(setRows)
      .catch(() => setRows([]));
  }, [token]);
  const pager = usePagedItems(rows, String(rows.length));
  return (
    <section className="grid">
      <PageHead title="Ranking" subtitle="Promedio de calificaciones de los profesionales del centro." />
      <section className="card">
        {rows.length === 0 ? (
          <Empty title="Sin ranking" description="Cuando haya calificaciones, el orden aparece acá." />
        ) : (
          <>
            <ol className="rank-list">
              {pager.pageItems.map((row, index) => (
                <li key={row.id_usuario}>
                  <span className="pos">{(pager.page - 1) * pager.pageSize + index + 1}</span>
                  <span style={{ flex: 1 }}>
                    {row.apellido}, {row.nombre}
                  </span>
                  <span className="score">{row.promedio}</span>
                </li>
              ))}
            </ol>
            <ListPaginator
              page={pager.page}
              totalPages={pager.totalPages}
              total={pager.total}
              pageSize={pager.pageSize}
              onPage={pager.setPage}
            />
          </>
        )}
      </section>
    </section>
  );
}
