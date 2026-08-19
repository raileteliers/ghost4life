import tienda from '../data/tienda.json';

export const TZ = 'America/Santiago';

/** $12.990 — CLP no usa decimales. */
export function clp(monto: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(monto);
}

/**
 * Las fechas del frontmatter son fechas de calendario y se parsean como
 * medianoche UTC. Hay que formatearlas EN UTC: hacerlo en horario de Santiago
 * las correría al día anterior.
 */
export function fechaLarga(fecha: Date): string {
  return new Intl.DateTimeFormat('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(fecha);
}

export function fechaCorta(fecha: Date): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  }).format(fecha);
}

/** '2026-08-22' — para los atributos datetime de <time>. */
export function fechaISO(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}

/**
 * Desplazamiento real de Santiago en esa fecha, leído del ICU en vez de
 * asumirlo: Chile cambia de -04:00 a -03:00 con el horario de verano.
 */
function offsetSantiago(fecha: Date): string {
  const parte = new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'longOffset' })
    .formatToParts(fecha)
    .find((p) => p.type === 'timeZoneName')?.value;
  return parte?.replace('GMT', '') || '-04:00';
}

/** Instante exacto del torneo, como Date en UTC. */
export function instanteTorneo(fecha: Date, hora: string): Date {
  const dia = fechaISO(fecha);
  const offset = offsetSantiago(new Date(`${dia}T12:00:00Z`));
  return new Date(`${dia}T${hora}:00${offset}`);
}

export type EstadoTorneo = 'abierto' | 'lleno' | 'finalizado';

/**
 * El estado se DERIVA de la fecha y los cupos en vez de guardarse a mano, para
 * que no quede un torneo del año pasado anunciado como "inscripciones abiertas".
 */
export function estadoTorneo(
  fecha: Date,
  hora: string,
  cupos: number,
  inscritos: number,
  ahora: Date = new Date(),
): EstadoTorneo {
  const inicio = instanteTorneo(fecha, hora);
  if (inicio.getTime() < ahora.getTime()) return 'finalizado';
  return inscritos >= cupos ? 'lleno' : 'abierto';
}

/** Enlace de WhatsApp con el mensaje ya escrito: menos fricción para reservar. */
export function whatsapp(mensaje: string): string {
  return `https://wa.me/${tienda.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

/** Une una ruta con el `base` del sitio (necesario en GitHub Pages de proyecto). */
export function ruta(camino: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const limpio = camino.startsWith('/') ? camino : `/${camino}`;
  return `${base}${limpio}` || '/';
}

export const ETIQUETA_JUEGO: Record<string, string> = {
  yugioh: 'Yu-Gi-Oh!',
  pokemon: 'Pokémon',
  onepiece: 'One Piece',
  otros: 'Tienda',
};

export const ETIQUETA_CATEGORIA: Record<string, string> = {
  single: 'Singles',
  sellado: 'Sellado',
  deck: 'Mazos',
  accesorio: 'Accesorios',
  'juego-mesa': 'Juegos de mesa',
};
