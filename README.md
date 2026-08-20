# Ghost4Life — sitio web

Propuesta de reconstrucción del sitio de **Ghost4Life**, tienda de cartas
coleccionables en Providencia, Santiago. Sitio estático hecho con
[Astro](https://astro.build), pensado para dos cosas: **vender desde un catálogo
real** y **llenar los torneos**.

> **Aviso sobre los datos.** El contenido de `src/data/` y `src/content/` es una
> **semilla de demostración**, no el inventario ni el calendario reales. Los
> campos marcados `TODO` (teléfono, correo, coordenadas) son marcadores de
> posición y hay que reemplazarlos antes de publicar. Ver *Antes de publicar*.

## Poner en marcha

```bash
npm install
npm run dev      # http://localhost:4321/ghost4life
npm run build    # genera dist/
npm run preview  # sirve dist/ localmente
npx astro check  # tipos y validación de los esquemas de contenido
```

Node 22 o superior.

## Cómo se edita el contenido

Todo el contenido vive en archivos de datos. No hay que tocar plantillas para
cambiar precios, stock o torneos.

### Catálogo — `src/data/productos.json`

Un arreglo de productos. Cada uno necesita al menos esto:

```json
{
  "id": "ygo-ash-blossom-ultra",
  "nombre": "Ash Blossom & Joyous Spring",
  "juego": "yugioh",
  "categoria": "single",
  "precioCLP": 12990,
  "stock": 6,
  "destacado": true,
  "descripcion": "Mano-trampa esencial en el formato actual."
}
```

| Campo | Valores | Notas |
|---|---|---|
| `id` | texto sin espacios | Define la URL: `/catalogo/<id>`. No cambiarlo una vez publicado. |
| `juego` | `yugioh` · `pokemon` · `onepiece` · `otros` | |
| `categoria` | `single` · `sellado` · `deck` · `accesorio` · `juego-mesa` | |
| `precioCLP` | entero | Sin puntos ni símbolo: `12990`. El formato lo pone el sitio. |
| `stock` | entero | `0` marca el producto como agotado automáticamente. |
| `destacado` | `true`/`false` | Los destacados con stock salen en la portada. |
| `condicion`, `rareza`, `setCode` | texto | Opcionales, pensados para singles. |
| `imagen` | ruta bajo `public/` | Opcional. Sin imagen se dibuja un marcador con identidad. |

### Torneos — `src/content/torneos/*.md`

Un archivo por fecha. El nombre del archivo define la URL.

```markdown
---
titulo: "Local Yu-Gi-Oh! — Torneo semanal"
fecha: 2026-08-22
hora: "16:00"
duracionHoras: 4
juego: yugioh
formato: "Advanced — Banlist TCG vigente"
entradaCLP: 5000
cupos: 32
inscritos: 21
premios:
  - "1.º lugar: 10 sobres"
destacado: true
---

Texto libre que aparece en la ficha del torneo.
```

**El estado no se escribe a mano.** El sitio lo deduce de la fecha y los cupos:
pasada la hora de inicio queda *finalizado* y baja a «fechas anteriores»; con
`inscritos >= cupos` queda *cupos llenos*; si no, *inscripciones abiertas*. Así
no queda nunca un torneo viejo anunciado como abierto.

Las fechas se interpretan como fecha de calendario y las horas en horario de
Santiago; el `.ics` y el JSON-LD convierten a UTC leyendo el huso real, así que
el cambio de horario de verano de Chile se resuelve solo.

### Datos de la tienda — `src/data/tienda.json`

Dirección, horario, WhatsApp y redes. **Es la única fuente de verdad**: alimenta
el pie de página, la página de tienda, los enlaces de WhatsApp y el JSON-LD de
`Store` que ve Google. Cambiar el horario acá lo cambia en todas partes.

## Qué trae el sitio

- **Catálogo filtrable** por juego, categoría, stock y precio, con búsqueda de
  texto y orden. Se resuelve en el cliente sobre HTML ya renderizado, así que
  sirve sin esperar a ninguna API.
- **Reserva por WhatsApp con el mensaje escrito**: el enlace de cada producto
  lleva nombre, código y precio precargados.
- **Torneos con estado derivado**, cupos restantes y descarga `.ics`
  (RFC 5545, con recordatorio dos horas antes).
- **SEO local**: JSON-LD de `Store` con dirección y horario en todas las
  páginas, `Product` en cada ficha y `Event` en cada torneo, más `sitemap.xml`,
  `robots.txt`, canónicas y tarjetas Open Graph.
- **Insignia de abierto/cerrado** calculada en el navegador según el huso de
  Santiago.
- **Accesibilidad**: contraste AA verificado en los 10 pares de color del
  sistema, foco visible, enlace de salto al contenido, objetivos táctiles de
  44 px y respeto por `prefers-reduced-motion`.
- **Cero JavaScript** salvo el filtro del catálogo y la insignia de horario.

## Publicar

`.github/workflows/deploy.yml` construye y publica en GitHub Pages con cada
push a `main`.

**Falta un paso manual:** en *Settings → Pages → Source*, elegir **GitHub
Actions**. Hecho eso, el sitio queda en `https://raileteliers.github.io/ghost4life/`.

Para servirlo desde el dominio propio, no hay que tocar ningún enlace — basta
con construir así:

```bash
SITE_URL=https://ghost4life.cl BASE_PATH=/ npm run build
```

## Antes de publicar

- [ ] Reemplazar el número de WhatsApp (`whatsapp`, `whatsappLegible`) y el
      correo en `src/data/tienda.json`.
- [ ] Confirmar dirección y horario reales.
- [ ] Reemplazar la semilla de `productos.json` por el inventario real.
- [ ] Reemplazar los torneos de ejemplo por el calendario real.
- [ ] Agregar fotos de producto en `public/` y referenciarlas en `imagen`.
- [ ] Sustituir el logotipo provisional de `src/components/Logo.astro` y
      `public/favicon.svg` por la marca real de la tienda.
- [ ] Actualizar la URL del sitemap en `public/robots.txt` si cambia el dominio.
- [ ] Si se quiere el pin exacto en Google, agregar `geo` al JSON-LD de
      `src/layouts/Base.astro` (se omitió a propósito: unas coordenadas
      equivocadas hacen más daño que no ponerlas).

## Estructura

```
src/
├── content.config.ts        esquemas Zod de productos y torneos
├── data/
│   ├── tienda.json          NAP, horario, redes
│   └── productos.json       catálogo
├── content/torneos/         un .md por torneo
├── lib/format.ts            precios en CLP, fechas, husos, estado, WhatsApp
├── layouts/Base.astro       <head>, SEO, JSON-LD
├── components/
└── pages/                   /, /catalogo, /torneos, /tienda, /contacto, 404
```

## Marcas

Yu-Gi-Oh!, Pokémon y One Piece son marcas de sus respectivos titulares. En este
sitio se usan de forma nominativa, solo para identificar los productos a la
venta y las categorías del catálogo.
