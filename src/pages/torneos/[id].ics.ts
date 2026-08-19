import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import tienda from '../../data/tienda.json';
import { clp, fechaLarga, instanteTorneo, ruta } from '../../lib/format';

export async function getStaticPaths() {
  const torneos = await getCollection('torneos');
  return torneos.map((t) => ({ params: { id: t.id }, props: { torneo: t } }));
}

/** Formato de fecha ICS en UTC: 20260822T200000Z */
function marcaUTC(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * RFC 5545 §3.3.11: en los valores de texto van escapados la barra invertida,
 * el punto y coma y la coma; los saltos de línea se codifican como \n.
 * El orden importa: la barra invertida se escapa primero.
 */
function escapar(texto: string): string {
  return texto
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * RFC 5545 §3.1: ninguna línea puede pasar de 75 OCTETOS (no caracteres). Con
 * tildes y guiones largos la diferencia es real, así que se mide en bytes y se
 * corta por punto de código para no partir una secuencia UTF-8 por la mitad.
 */
function plegar(linea: string): string {
  const enc = new TextEncoder();
  if (enc.encode(linea).length <= 75) return linea;

  const lineas: string[] = [];
  let actual = '';
  let bytes = 0;

  for (const caracter of linea) {
    const ancho = enc.encode(caracter).length;
    if (bytes + ancho > 75) {
      lineas.push(actual);
      // Toda línea de continuación abre con un espacio, que también cuenta.
      actual = ' ' + caracter;
      bytes = 1 + ancho;
    } else {
      actual += caracter;
      bytes += ancho;
    }
  }
  if (actual) lineas.push(actual);
  return lineas.join('\r\n');
}

export const GET: APIRoute = ({ props, site }) => {
  const { torneo } = props as {
    torneo: Awaited<ReturnType<typeof getCollection<'torneos'>>>[number];
  };
  const d = torneo.data;

  const inicio = instanteTorneo(d.fecha, d.hora);
  const fin = new Date(inicio.getTime() + d.duracionHoras * 3600_000);
  // ruta() aplica el `base` del sitio; sin él el enlace apuntaría fuera del sitio.
  const url = new URL(ruta(`/torneos/${torneo.id}`), site ?? 'https://ghost4life.cl').href;

  const descripcion = [
    d.formato,
    `Entrada: ${d.entradaCLP === 0 ? 'gratis' : clp(d.entradaCLP)}`,
    `Cupos: ${d.cupos}`,
    `Más información: ${url}`,
  ].join('\n');

  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ghost4Life//Torneos//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${torneo.id}@ghost4life.cl`,
    `DTSTAMP:${marcaUTC(new Date())}`,
    `DTSTART:${marcaUTC(inicio)}`,
    `DTEND:${marcaUTC(fin)}`,
    `SUMMARY:${escapar(`${d.titulo} — ${tienda.nombre}`)}`,
    `DESCRIPTION:${escapar(descripcion)}`,
    `LOCATION:${escapar(`${tienda.direccion.calle}, ${tienda.direccion.comuna}, ${tienda.direccion.ciudad}`)}`,
    `URL:${url}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapar(`${d.titulo} empieza en 2 horas (${fechaLarga(d.fecha)})`)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return new Response(lineas.map(plegar).join('\r\n') + '\r\n', {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${torneo.id}.ics"`,
    },
  });
};
