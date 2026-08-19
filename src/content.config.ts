import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob, file } from 'astro/loaders';

/**
 * Los datos de este repo son una SEMILLA DE DEMOSTRACIÓN, no el inventario real
 * de la tienda. Sirven para que el sitio sea navegable y para mostrar la forma
 * que deben tener los datos. Ver README.md para reemplazarlos.
 */

export const JUEGOS = ['yugioh', 'pokemon', 'onepiece', 'otros'] as const;
export const CATEGORIAS = ['single', 'sellado', 'deck', 'accesorio', 'juego-mesa'] as const;

const productos = defineCollection({
  // Un solo archivo JSON en vez de un archivo por producto: un catálogo real
  // tiene cientos de SKUs y el dueño necesita poder editarlos de corrido.
  loader: file('src/data/productos.json'),
  schema: z.object({
    nombre: z.string(),
    juego: z.enum(JUEGOS),
    categoria: z.enum(CATEGORIAS),
    precioCLP: z.number().int().nonnegative(),
    stock: z.number().int().nonnegative(),
    destacado: z.boolean().default(false),
    descripcion: z.string(),
    /** Solo para singles: estado físico de la carta. */
    condicion: z.string().optional(),
    rareza: z.string().optional(),
    setCode: z.string().optional(),
    /** Ruta bajo /public. Si falta, la ficha usa un marcador visual. */
    imagen: z.string().optional(),
  }),
});

const torneos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/torneos' }),
  schema: z.object({
    titulo: z.string(),
    fecha: z.date(),
    hora: z.string().regex(/^\d{2}:\d{2}$/, 'Usa formato HH:MM en 24 horas'),
    duracionHoras: z.number().positive().default(3),
    juego: z.enum(JUEGOS),
    formato: z.string(),
    entradaCLP: z.number().int().nonnegative(),
    cupos: z.number().int().positive(),
    inscritos: z.number().int().nonnegative().default(0),
    premios: z.array(z.string()).default([]),
    destacado: z.boolean().default(false),
  }),
});

export const collections = { productos, torneos };
