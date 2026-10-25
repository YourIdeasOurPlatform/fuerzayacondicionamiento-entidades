/** Datos mock para `?demo=1` (sin backend). */

import { asset } from '../lib/paths';

export const DEMO_TOKEN = 'demo';

export const demoMe = {
  id: '11111111-1111-1111-1111-111111111111',
  nombre_fantasia: 'Fuerza Norte',
  razon_social: 'Fuerza Norte SA',
  cuit: '30712345678',
  mail: 'centro@fuerzanorte.demo',
  telefono: '11 5555-0101',
  tipo: 'centro',
  estado: true,
  /** Foto del centro (gimnasio), distinta al logo FA de marca. */
  logo_url: asset('demo-centro.jpg') as string | null,
  /** Avatar de cuenta en topbar (persona), distinto a FA y al logo del centro. */
  cuenta_foto_url: asset('demo-cuenta.jpg') as string | null,
  sitio_web: 'https://fuerzanorte.demo',
  descripcion: 'Centro de fuerza y acondicionamiento en Palermo.',
  profesionales_usados: 3,
  max_profesionales: 5,
  datos_cobro: [
    { id: 'a1', tipo: 'alias', valor: 'FUERZA.NORTE', etiqueta: null },
    { id: 'a2', tipo: 'cbu', valor: '0170099120000001234567', etiqueta: 'Cuenta principal' },
  ],
  contratacion: {
    id: '22222222-2222-2222-2222-222222222222',
    estado: 'active',
    motivo_estado: null as string | null,
    codigo_plan: 'growth_challenger',
    nombre_plan: 'Growth · Challenger',
  },
};

export const demoPlanesEntidad = [
  {
    id: 'pl1',
    codigo: 'starter_rookie',
    nombre: 'Starter · Rookie',
    nivel: 1,
    max_profesionales: 2,
    precio_centavos: 9000000,
    moneda: 'ARS',
    incluye_saas: true,
  },
  {
    id: 'pl2',
    codigo: 'growth_challenger',
    nombre: 'Growth · Challenger',
    nivel: 2,
    max_profesionales: 5,
    precio_centavos: 18000000,
    moneda: 'ARS',
    incluye_saas: true,
  },
  {
    id: 'pl3',
    codigo: 'scale_elite',
    nombre: 'Scale · Elite',
    nivel: 3,
    max_profesionales: 12,
    precio_centavos: 32000000,
    moneda: 'ARS',
    incluye_saas: true,
  },
];

export const demoTiers = [
  { id: 't1', codigo: 'rookie', nombre: 'Rookie', nivel: 1 },
  { id: 't2', codigo: 'challenger', nombre: 'Challenger', nivel: 2 },
];

export const demoProfesionales = [
  {
    id_usuario: 'p1',
    nombre: 'Lucía',
    apellido: 'Martínez',
    mail: 'lucia@fuerzanorte.demo',
    estado: true,
    codigo_tier: 'challenger',
    motivo_estado: 'incluido_entidad',
    vitrina_visible: true,
    tiene_perfil: true,
  },
  {
    id_usuario: 'p2',
    nombre: 'Tomás',
    apellido: 'Gómez',
    mail: 'tomas@fuerzanorte.demo',
    estado: true,
    codigo_tier: 'rookie',
    motivo_estado: 'incluido_entidad',
    vitrina_visible: true,
    tiene_perfil: true,
  },
  {
    id_usuario: 'p3',
    nombre: 'Sofía',
    apellido: 'Ríos',
    mail: 'sofia@fuerzanorte.demo',
    estado: true,
    codigo_tier: 'rookie',
    motivo_estado: 'incluido_entidad',
    vitrina_visible: false,
    tiene_perfil: true,
  },
  {
    id_usuario: 'p4',
    nombre: 'Martín',
    apellido: 'Vega',
    mail: 'martin@fuerzanorte.demo',
    estado: false,
    codigo_tier: 'rookie',
    motivo_estado: 'pendiente_alta',
    vitrina_visible: false,
    tiene_perfil: false,
  },
];

/** Planes de suscripción por profesional (cards de vitrina pública). `activo` = visible en vitrina. */
export const demoPlanesVitrina: Record<
  string,
  Array<{
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    duracion_cantidad: number;
    duracion_unidad: 'dias' | 'meses' | 'anos';
    observaciones: string[];
    activo: boolean;
  }>
> = {
  p1: [
    {
      id: 'vp1a',
      nombre: 'Mensual fuerza',
      descripcion: 'Entrenamiento 3× semana con seguimiento.',
      precio: 45000,
      duracion_cantidad: 1,
      duracion_unidad: 'meses',
      observaciones: ['Chat con la pro', 'Plan personalizado'],
      activo: true,
    },
    {
      id: 'vp1b',
      nombre: 'Trimestral elite',
      descripcion: 'Pack intensivo con evaluaciones.',
      precio: 120000,
      duracion_cantidad: 3,
      duracion_unidad: 'meses',
      observaciones: ['Evaluación inicial', 'Ajustes quincenales'],
      activo: true,
    },
    {
      id: 'vp1c',
      nombre: 'Prueba 15 días',
      descripcion: 'Para conocer la metodología.',
      precio: 15000,
      duracion_cantidad: 15,
      duracion_unidad: 'dias',
      observaciones: [],
      activo: false,
    },
    {
      id: 'vp1d',
      nombre: 'Híbrido gym + online',
      descripcion: 'Dos sesiones presenciales y una remota.',
      precio: 52000,
      duracion_cantidad: 1,
      duracion_unidad: 'meses',
      observaciones: ['Acceso a sala', 'Videos semanales'],
      activo: true,
    },
    {
      id: 'vp1e',
      nombre: 'Anual fuerza',
      descripcion: 'Mejor precio por mes a largo plazo.',
      precio: 420000,
      duracion_cantidad: 1,
      duracion_unidad: 'anos',
      observaciones: ['2 evaluaciones', 'Prioridad de agenda'],
      activo: false,
    },
    {
      id: 'vp1f',
      nombre: 'Solo consulta',
      descripcion: 'Una sesión de diagnóstico sin plan continuo.',
      precio: 18000,
      duracion_cantidad: 7,
      duracion_unidad: 'dias',
      observaciones: ['Informe PDF'],
      activo: false,
    },
    {
      id: 'vp1g',
      nombre: 'Duo amigos',
      descripcion: 'Entrenan de a dos con la misma pro.',
      precio: 70000,
      duracion_cantidad: 1,
      duracion_unidad: 'meses',
      observaciones: ['Cupo 2 alumnos'],
      activo: true,
    },
    {
      id: 'vp1h',
      nombre: 'Rehab suave',
      descripcion: 'Vuelta progresiva post-lesión.',
      precio: 48000,
      duracion_cantidad: 1,
      duracion_unidad: 'meses',
      observaciones: ['Coordinación con kinesio'],
      activo: true,
    },
  ],
  p2: [
    {
      id: 'vp2a',
      nombre: 'Inicio Rookie',
      descripcion: 'Plan base para nuevos alumnos.',
      precio: 32000,
      duracion_cantidad: 1,
      duracion_unidad: 'meses',
      observaciones: ['Rutina en app'],
      activo: true,
    },
    {
      id: 'vp2b',
      nombre: 'Semestral',
      descripcion: 'Compromiso largo con descuento.',
      precio: 160000,
      duracion_cantidad: 6,
      duracion_unidad: 'meses',
      observaciones: ['Check-in mensual'],
      activo: false,
    },
  ],
  p3: [
    {
      id: 'vp3a',
      nombre: 'Online plus',
      descripcion: '100% remoto con videollamadas.',
      precio: 38000,
      duracion_cantidad: 1,
      duracion_unidad: 'meses',
      observaciones: ['Zoom semanal'],
      activo: true,
    },
  ],
  p4: [],
};

function buildDemoVitrina() {
  return demoProfesionales.map((pro) => ({
    id_usuario: pro.id_usuario,
    nombre: pro.nombre,
    apellido: pro.apellido,
    mail: pro.mail,
    estado: pro.estado,
    vitrina_visible: pro.vitrina_visible,
    tiene_perfil: pro.tiene_perfil,
    planes: [...(demoPlanesVitrina[pro.id_usuario] || [])],
  }));
}

export const demoSocios = [
  {
    id_usuario: 's1',
    nombre: 'Ana',
    apellido: 'Pérez',
    mail: 'ana@mail.demo',
    estado: true,
    profesional_nombre: 'Lucía Martínez',
    tipo: 'socio',
  },
  {
    id_usuario: 's2',
    nombre: 'Bruno',
    apellido: 'López',
    mail: 'bruno@mail.demo',
    estado: true,
    profesional_nombre: 'Tomás Gómez',
    tipo: 'entrenado',
  },
  {
    id_usuario: 's3',
    nombre: 'Carla',
    apellido: 'Díaz',
    mail: 'carla@mail.demo',
    estado: true,
    profesional_nombre: 'Lucía Martínez',
    tipo: 'socio',
  },
  {
    id_usuario: 's4',
    nombre: 'Diego',
    apellido: 'Suárez',
    mail: 'diego@mail.demo',
    estado: false,
    profesional_nombre: 'Sofía Ríos',
    tipo: 'entrenado',
  },
];

export const demoRanking = [
  { id_usuario: 'p1', nombre: 'Lucía', apellido: 'Martínez', promedio: 4.8 },
  { id_usuario: 'p2', nombre: 'Tomás', apellido: 'Gómez', promedio: 4.5 },
  { id_usuario: 'p3', nombre: 'Sofía', apellido: 'Ríos', promedio: 4.1 },
];

export const demoPagos = [
  {
    id: 'pay1',
    origen: 'pagos_cobranzas',
    estado: 'validado',
    monto: 180000,
    moneda: 'ARS',
    medio_pago: 'TRANSFERENCIA',
    fecha_pago: '2026-10-01',
    nota: '[pago_validado] Pack entidad growth_challenger | destino_centro=ALIAS:FUERZA.NORTE; CBU:0170099120000001234567',
    datos_cobro_resumen: 'ALIAS:FUERZA.NORTE; CBU:0170099120000001234567',
  },
  {
    id: 'pay0',
    origen: 'contratacion_entidad',
    estado: 'pago_declarado',
    monto: 180000,
    moneda: 'ARS',
    medio_pago: 'TRANSFERENCIA',
    fecha_pago: null,
    nota: 'transferencia-septiembre.pdf | destino_centro=ALIAS:FUERZA.NORTE',
    datos_cobro_resumen: 'ALIAS:FUERZA.NORTE; CBU:0170099120000001234567',
  },
];

type DemoSesion = {
  id: string;
  id_profesional: string;
  profesional_nombre: string;
  profesional_apellido: string;
  profesional_display: string;
  titulo: string;
  descripcion: string | null;
  fecha: string;
  estado: 'borrador' | 'abierta' | 'cerrada';
  permite_autoreporte: boolean;
  ventana_autoreporte_horas: number | null;
  total_registros: number;
  total_presente: number;
  total_ausente: number;
  total_tardanza: number;
  total_justificado: number;
  total_autoreportado: number;
  total_pendiente: number;
  created_date: string;
};

type DemoRegistro = {
  id: string;
  id_sesion: string;
  tipo: 'app_user' | 'externo';
  id_usuario: string | null;
  nombre_display: string;
  apellido_display: string;
  email_display: string | null;
  dni_display: string | null;
  edad: number | null;
  telefono: string | null;
  estado: 'pendiente' | 'presente' | 'presente_autoreportado' | 'ausente' | 'tardanza' | 'justificado';
  metodo: string | null;
  otp_verificado: boolean;
  marcado_por_id: string | null;
  marcado_por_nombre: string | null;
  fecha_marcado: string | null;
  nota: string | null;
  historial_cambios: unknown[];
  created_date: string;
};

function recountSesion(sesion: DemoSesion, registros: DemoRegistro[]) {
  const ofSesion = registros.filter((r) => r.id_sesion === sesion.id);
  sesion.total_registros = ofSesion.length;
  sesion.total_presente = ofSesion.filter((r) => r.estado === 'presente').length;
  sesion.total_ausente = ofSesion.filter((r) => r.estado === 'ausente').length;
  sesion.total_tardanza = ofSesion.filter((r) => r.estado === 'tardanza').length;
  sesion.total_justificado = ofSesion.filter((r) => r.estado === 'justificado').length;
  sesion.total_autoreportado = ofSesion.filter((r) => r.estado === 'presente_autoreportado').length;
  sesion.total_pendiente = ofSesion.filter((r) => r.estado === 'pendiente').length;
}

export const demoAsistenciasSesiones: DemoSesion[] = [
  {
    id: 'as1',
    id_profesional: 'p1',
    profesional_nombre: 'Lucía',
    profesional_apellido: 'Martínez',
    profesional_display: 'Martínez, Lucía',
    titulo: 'Fuerza — turno mañana',
    descripcion: 'Sala principal',
    fecha: '2026-10-22',
    estado: 'abierta',
    permite_autoreporte: true,
    ventana_autoreporte_horas: 2,
    total_registros: 0,
    total_presente: 0,
    total_ausente: 0,
    total_tardanza: 0,
    total_justificado: 0,
    total_autoreportado: 0,
    total_pendiente: 0,
    created_date: '2026-10-22T08:00:00.000Z',
  },
  {
    id: 'as2',
    id_profesional: 'p2',
    profesional_nombre: 'Tomás',
    profesional_apellido: 'Gómez',
    profesional_display: 'Gómez, Tomás',
    titulo: 'Movilidad — group class',
    descripcion: null,
    fecha: '2026-10-21',
    estado: 'cerrada',
    permite_autoreporte: true,
    ventana_autoreporte_horas: null,
    total_registros: 0,
    total_presente: 0,
    total_ausente: 0,
    total_tardanza: 0,
    total_justificado: 0,
    total_autoreportado: 0,
    total_pendiente: 0,
    created_date: '2026-10-21T18:00:00.000Z',
  },
  {
    id: 'as3',
    id_profesional: 'p1',
    profesional_nombre: 'Lucía',
    profesional_apellido: 'Martínez',
    profesional_display: 'Martínez, Lucía',
    titulo: 'Evaluación inicial',
    descripcion: 'Borrador para mañana',
    fecha: '2026-10-20',
    estado: 'borrador',
    permite_autoreporte: false,
    ventana_autoreporte_horas: null,
    total_registros: 0,
    total_presente: 0,
    total_ausente: 0,
    total_tardanza: 0,
    total_justificado: 0,
    total_autoreportado: 0,
    total_pendiente: 0,
    created_date: '2026-10-20T12:00:00.000Z',
  },
];

export const demoAsistenciasRegistros: DemoRegistro[] = [
  {
    id: 'ar1',
    id_sesion: 'as1',
    tipo: 'app_user',
    id_usuario: 's1',
    nombre_display: 'Carla',
    apellido_display: 'Suárez',
    email_display: 'carla@demo.local',
    dni_display: '30111001',
    edad: null,
    telefono: null,
    estado: 'presente',
    metodo: 'lista_profesional',
    otp_verificado: false,
    marcado_por_id: null,
    marcado_por_nombre: null,
    fecha_marcado: '2026-10-22T09:10:00.000Z',
    nota: null,
    historial_cambios: [],
    created_date: '2026-10-22T08:05:00.000Z',
  },
  {
    id: 'ar2',
    id_sesion: 'as1',
    tipo: 'app_user',
    id_usuario: 's2',
    nombre_display: 'Diego',
    apellido_display: 'Núñez',
    email_display: 'diego@demo.local',
    dni_display: '30111002',
    edad: null,
    telefono: null,
    estado: 'pendiente',
    metodo: null,
    otp_verificado: false,
    marcado_por_id: null,
    marcado_por_nombre: null,
    fecha_marcado: null,
    nota: null,
    historial_cambios: [],
    created_date: '2026-10-22T08:05:00.000Z',
  },
  {
    id: 'ar3',
    id_sesion: 'as1',
    tipo: 'externo',
    id_usuario: null,
    nombre_display: 'Marcos',
    apellido_display: 'López',
    email_display: null,
    dni_display: '28999111',
    edad: 34,
    telefono: null,
    estado: 'ausente',
    metodo: 'lista_profesional',
    otp_verificado: false,
    marcado_por_id: null,
    marcado_por_nombre: null,
    fecha_marcado: '2026-10-22T09:20:00.000Z',
    nota: null,
    historial_cambios: [],
    created_date: '2026-10-22T08:06:00.000Z',
  },
  {
    id: 'ar4',
    id_sesion: 'as2',
    tipo: 'app_user',
    id_usuario: 's3',
    nombre_display: 'Elena',
    apellido_display: 'Ruiz',
    email_display: 'elena@demo.local',
    dni_display: '30111003',
    edad: null,
    telefono: null,
    estado: 'presente',
    metodo: 'otp',
    otp_verificado: true,
    marcado_por_id: null,
    marcado_por_nombre: null,
    fecha_marcado: '2026-10-21T19:05:00.000Z',
    nota: null,
    historial_cambios: [],
    created_date: '2026-10-21T18:05:00.000Z',
  },
  {
    id: 'ar5',
    id_sesion: 'as2',
    tipo: 'externo',
    id_usuario: null,
    nombre_display: 'Paula',
    apellido_display: 'Mena',
    email_display: null,
    dni_display: null,
    edad: 28,
    telefono: null,
    estado: 'justificado',
    metodo: 'lista_profesional',
    otp_verificado: false,
    marcado_por_id: null,
    marcado_por_nombre: null,
    fecha_marcado: '2026-10-21T19:10:00.000Z',
    nota: 'Viaje',
    historial_cambios: [],
    created_date: '2026-10-21T18:06:00.000Z',
  },
  {
    id: 'ar6',
    id_sesion: 'as3',
    tipo: 'externo',
    id_usuario: null,
    nombre_display: 'Invitado',
    apellido_display: 'Demo',
    email_display: null,
    dni_display: null,
    edad: null,
    telefono: null,
    estado: 'pendiente',
    metodo: null,
    otp_verificado: false,
    marcado_por_id: null,
    marcado_por_nombre: null,
    fecha_marcado: null,
    nota: null,
    historial_cambios: [],
    created_date: '2026-10-20T12:10:00.000Z',
  },
];

for (const s of demoAsistenciasSesiones) {
  recountSesion(s, demoAsistenciasRegistros);
}

function parseBody(init?: RequestInit): Record<string, unknown> {
  if (!init?.body || typeof init.body !== 'string') return {};
  try {
    return JSON.parse(init.body) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function demoApi<T>(path: string, init?: RequestInit): T {
  const method = (init?.method || 'GET').toUpperCase();
  const body = parseBody(init);

  if (path === '/entidades/me' && method === 'GET') {
    return {
      ...demoMe,
      profesionales_usados: demoProfesionales.filter((p) => p.estado).length,
    } as T;
  }
  if (path === '/entidades/me' && method === 'PATCH') {
    if (typeof body.nombre_fantasia === 'string') demoMe.nombre_fantasia = body.nombre_fantasia.trim();
    if ('telefono' in body) demoMe.telefono = (body.telefono as string) || null as unknown as string;
    if ('descripcion' in body) demoMe.descripcion = (body.descripcion as string) || '';
    if ('sitio_web' in body) demoMe.sitio_web = (body.sitio_web as string) || '';
    if ('logo_url' in body) demoMe.logo_url = (body.logo_url as string) || null;
    return { ...demoMe, profesionales_usados: demoProfesionales.filter((p) => p.estado).length } as T;
  }
  if (path === '/planes-entidad' && method === 'GET') return demoPlanesEntidad as T;
  if (path === '/entidades/me/tiers' && method === 'GET') return demoTiers as T;
  if (path === '/entidades/me/profesionales' && method === 'GET') return [...demoProfesionales] as T;
  if (path === '/entidades/me/socios' && method === 'GET') return demoSocios as T;
  if (path === '/entidades/me/ranking' && method === 'GET') return demoRanking as T;
  if (path === '/entidades/me/pagos' && method === 'GET') return demoPagos as T;
  if (path === '/entidades/me/contratacion/datos-cobro-plataforma' && method === 'GET') {
    return {
      items: [
        { tipo: 'alias', valor: 'FA.PLATAFORMA', etiqueta: 'Pack centros' },
        { tipo: 'cbu', valor: '0170099120000001234567' },
      ],
    } as T;
  }
  if (path === '/entidades/me/datos-cobro' && method === 'GET') {    return { items: demoMe.datos_cobro } as T;
  }
  if (path === '/entidades/me/datos-cobro' && method === 'PUT') {
    const items = Array.isArray(body.items) ? body.items : demoMe.datos_cobro;
    demoMe.datos_cobro = items as typeof demoMe.datos_cobro;
    return { items: demoMe.datos_cobro } as T;
  }
  if (path === '/entidades/me/contratacion/declarar-pago' && method === 'POST') {
    demoMe.contratacion.estado = 'pending';
    demoMe.contratacion.motivo_estado = 'pago_declarado';
    const formBody = init?.body;
    const nombreArchivo =
      typeof FormData !== 'undefined' && formBody instanceof FormData
        ? (formBody.get('comprobante') as File | null)?.name || 'comprobante-demo.pdf'
        : 'comprobante-demo.pdf';
    demoPagos.unshift({
      id: `pay-${Date.now()}`,
      origen: 'contratacion_entidad',
      estado: 'pago_declarado',
      monto: 180000,
      moneda: 'ARS',
      medio_pago: 'TRANSFERENCIA',
      fecha_pago: null,
      nota: nombreArchivo,
      datos_cobro_resumen: null,
    });
    return {
      id: demoMe.contratacion.id,
      estado: 'pending',
      motivo_estado: 'pago_declarado',
      comprobante_nombre: nombreArchivo,
      tiene_comprobante: true,
    } as T;
  }
  if (path.startsWith('/entidades/me/invitaciones/profesional') && method === 'POST') {
    const token = `demo-${Date.now().toString(36)}`;
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    return {
      signup_url: `https://app.fuerzayacondicionamiento.demo/registro-profesional?token=${token}`,
      expires_at: expires,
    } as T;
  }
  if (path === '/entidades/me/profesionales' && method === 'POST') {
    const id = `p${demoProfesionales.length + 1}`;
    const codigoTier = String(body.codigo_tier || 'rookie');
    const tierMeta = demoTiers.find((t) => t.codigo === codigoTier);
    demoProfesionales.push({
      id_usuario: id,
      nombre: String(body.nombre || 'Nuevo'),
      apellido: String(body.apellido || 'Pro'),
      mail: String(body.mail || `${id}@demo.local`),
      estado: true,
      codigo_tier: codigoTier,
      motivo_estado: 'incluido_entidad',
      vitrina_visible: false,
      tiene_perfil: false,
    });
    const hoy = new Date().toISOString().slice(0, 10);
    demoPagos.unshift({
      id: `pay-alta-${id}`,
      origen: 'alta_profesional',
      estado: 'validado',
      monto: 15000,
      moneda: 'ARS',
      medio_pago: 'TRANSFERENCIA',
      fecha_pago: hoy,
      nota: `[pago_validado] [alta_profesional_entidad:${id}] Alta profesional plan ${codigoTier}${
        tierMeta ? ` (${tierMeta.nombre})` : ''
      }`,
      datos_cobro_resumen: 'ALIAS:FUERZA.NORTE; CBU:0170099120000001234567',
    });
    return { id_usuario: id, mail: body.mail, codigo_tier: codigoTier } as T;
  }

  const tierMatch = path.match(/^\/entidades\/me\/profesionales\/([^/]+)\/tier$/);
  if (tierMatch && method === 'PATCH') {
    const row = demoProfesionales.find((p) => p.id_usuario === tierMatch[1]);
    if (row) row.codigo_tier = String(body.codigo_tier || row.codigo_tier);
    return { ok: true } as T;
  }
  if (path === '/entidades/me/vitrina' && method === 'GET') {
    return buildDemoVitrina() as T;
  }
  const vitrinaMatch = path.match(/^\/entidades\/me\/profesionales\/([^/]+)\/vitrina$/);
  if (vitrinaMatch && method === 'PATCH') {
    const row = demoProfesionales.find((p) => p.id_usuario === vitrinaMatch[1]);
    if (row) {
      if (!row.tiene_perfil) throw new Error('El profesional todavía no tiene vitrina');
      row.vitrina_visible = Boolean(body.visible ?? body.vitrina_visible ?? !row.vitrina_visible);
      return { id_usuario: row.id_usuario, vitrina_visible: row.vitrina_visible } as T;
    }
    return { ok: false } as T;
  }
  const planVitrinaMatch = path.match(/^\/entidades\/me\/vitrina\/planes\/([^/]+)$/);
  if (planVitrinaMatch && method === 'PATCH') {
    const planId = planVitrinaMatch[1];
    for (const planes of Object.values(demoPlanesVitrina)) {
      const plan = planes.find((p) => p.id === planId);
      if (plan) {
        plan.activo = Boolean(body.activo ?? body.visible ?? !plan.activo);
        return { id: plan.id, activo: plan.activo } as T;
      }
    }
    throw new Error('Plan no encontrado');
  }
  const activarMatch = path.match(/^\/entidades\/me\/profesionales\/([^/]+)\/activar$/);
  if (activarMatch && method === 'POST') {
    const row = demoProfesionales.find((p) => p.id_usuario === activarMatch[1]);
    if (!row) throw new Error('Profesional no encontrado');
    row.estado = true;
    row.tiene_perfil = true;
    row.motivo_estado = 'incluido_entidad';
    return {
      id_usuario: row.id_usuario,
      estado: true,
      tiene_perfil: true,
      motivo_estado: row.motivo_estado,
    } as T;
  }
  const desactivarMatch = path.match(/^\/entidades\/me\/profesionales\/([^/]+)\/desactivar$/);
  if (desactivarMatch && method === 'POST') {
    const row = demoProfesionales.find((p) => p.id_usuario === desactivarMatch[1]);
    if (!row) throw new Error('Profesional no encontrado');
    row.estado = false;
    row.motivo_estado = 'desactivado_entidad';
    return {
      id_usuario: row.id_usuario,
      estado: false,
      motivo_estado: row.motivo_estado,
    } as T;
  }
  const desvincularMatch = path.match(/^\/entidades\/me\/profesionales\/([^/]+)\/desvincular$/);
  if (desvincularMatch && method === 'POST') {
    const idx = demoProfesionales.findIndex((p) => p.id_usuario === desvincularMatch[1]);
    if (idx >= 0) demoProfesionales.splice(idx, 1);
    return { ok: true } as T;
  }

  const asistenciasListPath = path.split('?')[0];
  const asistenciasQs = path.includes('?') ? path.slice(path.indexOf('?') + 1) : '';

  if (asistenciasListPath === '/entidades/me/asistencias/sesiones' && method === 'GET') {
    const params = new URLSearchParams(asistenciasQs);
    const q = (params.get('q') || '').trim().toLowerCase();
    const estado = params.get('estado_sesion') || '';
    const idPro = params.get('id_profesional') || '';
    const desde = params.get('desde') || '';
    const hasta = params.get('hasta') || '';
    let rows = [...demoAsistenciasSesiones];
    if (q) {
      rows = rows.filter(
        (s) =>
          s.titulo.toLowerCase().includes(q) ||
          s.profesional_display.toLowerCase().includes(q) ||
          `${s.profesional_nombre} ${s.profesional_apellido}`.toLowerCase().includes(q),
      );
    }
    if (estado) {
      const wanted = new Set(estado.split(',').map((x) => x.trim()).filter(Boolean));
      rows = rows.filter((s) => wanted.has(s.estado));
    }
    if (idPro) rows = rows.filter((s) => s.id_profesional === idPro);
    if (desde) rows = rows.filter((s) => s.fecha >= desde);
    if (hasta) rows = rows.filter((s) => s.fecha <= hasta);
    return rows as T;
  }

  if (asistenciasListPath === '/entidades/me/asistencias/sesiones' && method === 'POST') {
    const pro = demoProfesionales.find((p) => p.id_usuario === String(body.id_profesional || ''));
    if (!pro) throw new Error('El profesional no pertenece a este centro');
    const id = `as${Date.now().toString(36)}`;
    const fecha = String(body.fecha || new Date().toISOString().slice(0, 10));
    const sesion: DemoSesion = {
      id,
      id_profesional: pro.id_usuario,
      profesional_nombre: pro.nombre,
      profesional_apellido: pro.apellido,
      profesional_display: `${pro.apellido}, ${pro.nombre}`,
      titulo: String(body.titulo || 'Nueva planilla').trim(),
      descripcion: (body.descripcion as string) || null,
      fecha,
      estado: 'borrador',
      permite_autoreporte: body.permite_autoreporte !== false,
      ventana_autoreporte_horas:
        typeof body.ventana_autoreporte_horas === 'number' ? body.ventana_autoreporte_horas : null,
      total_registros: 0,
      total_presente: 0,
      total_ausente: 0,
      total_tardanza: 0,
      total_justificado: 0,
      total_autoreportado: 0,
      total_pendiente: 0,
      created_date: new Date().toISOString(),
    };
    demoAsistenciasSesiones.unshift(sesion);
    return sesion as T;
  }

  const sesionMatch = asistenciasListPath.match(/^\/entidades\/me\/asistencias\/sesiones\/([^/]+)$/);
  if (sesionMatch && method === 'GET') {
    const sesion = demoAsistenciasSesiones.find((s) => s.id === sesionMatch[1]);
    if (!sesion) throw new Error('Sesión no encontrada');
    const registros = demoAsistenciasRegistros.filter((r) => r.id_sesion === sesion.id);
    return { sesion, registros, total_registros: registros.length } as T;
  }
  if (sesionMatch && method === 'PATCH') {
    const sesion = demoAsistenciasSesiones.find((s) => s.id === sesionMatch[1]);
    if (!sesion) throw new Error('Sesión no encontrada');
    if (typeof body.titulo === 'string' && body.titulo.trim()) sesion.titulo = body.titulo.trim();
    if ('descripcion' in body) sesion.descripcion = (body.descripcion as string) || null;
    if (typeof body.estado === 'string') {
      sesion.estado = body.estado as DemoSesion['estado'];
    }
    if (typeof body.permite_autoreporte === 'boolean') {
      sesion.permite_autoreporte = body.permite_autoreporte;
    }
    return sesion as T;
  }

  const regPostMatch = asistenciasListPath.match(
    /^\/entidades\/me\/asistencias\/sesiones\/([^/]+)\/registros$/,
  );
  if (regPostMatch && method === 'POST') {
    const sesion = demoAsistenciasSesiones.find((s) => s.id === regPostMatch[1]);
    if (!sesion) throw new Error('Sesión no encontrada');
    if (sesion.estado === 'cerrada') throw new Error('No se pueden agregar registros a una sesión cerrada');
    const id = `ar${Date.now().toString(36)}`;
    const estado = (body.estado as DemoRegistro['estado']) || 'pendiente';
    const registro: DemoRegistro = {
      id,
      id_sesion: sesion.id,
      tipo: 'externo',
      id_usuario: null,
      nombre_display: String(body.nombre || '').trim(),
      apellido_display: String(body.apellido || '').trim(),
      email_display: null,
      dni_display: (body.dni_externo as string) || null,
      edad: typeof body.edad === 'number' ? body.edad : null,
      telefono: null,
      estado,
      metodo: estado === 'pendiente' ? null : 'lista_profesional',
      otp_verificado: false,
      marcado_por_id: null,
      marcado_por_nombre: null,
      fecha_marcado: estado === 'pendiente' ? null : new Date().toISOString(),
      nota: null,
      historial_cambios: [],
      created_date: new Date().toISOString(),
    };
    if (!registro.nombre_display || !registro.apellido_display) {
      throw new Error('Nombre y apellido son obligatorios');
    }
    demoAsistenciasRegistros.push(registro);
    recountSesion(sesion, demoAsistenciasRegistros);
    return registro as T;
  }

  const regPatchMatch = asistenciasListPath.match(
    /^\/entidades\/me\/asistencias\/sesiones\/([^/]+)\/registros\/([^/]+)$/,
  );
  if (regPatchMatch && method === 'PATCH') {
    const sesion = demoAsistenciasSesiones.find((s) => s.id === regPatchMatch[1]);
    const registro = demoAsistenciasRegistros.find((r) => r.id === regPatchMatch[2]);
    if (!sesion || !registro || registro.id_sesion !== sesion.id) {
      throw new Error('Registro no encontrado');
    }
    if (typeof body.estado === 'string') {
      registro.estado = body.estado as DemoRegistro['estado'];
      registro.metodo = 'lista_profesional';
      registro.fecha_marcado = new Date().toISOString();
    }
    if ('nota' in body) registro.nota = (body.nota as string) || null;
    recountSesion(sesion, demoAsistenciasRegistros);
    return registro as T;
  }

  throw new Error(`Demo: ruta no mockeada ${method} ${path}`);
}
