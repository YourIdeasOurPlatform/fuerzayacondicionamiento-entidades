/** Prefijo de Astro (`base`). En GitHub Pages es `/fuerzayacondicionamiento-entidades/`. */
export const BASE_URL = import.meta.env.BASE_URL || '/';

/** Asset bajo `public/` respetando el base path. */
export function asset(path: string): string {
  const clean = path.replace(/^\/+/, '');
  return `${BASE_URL}${clean}`;
}

/** Home del portal con query opcional (ej. demo). */
export function appUrl(query = ''): string {
  const q = query.startsWith('?') || query === '' ? query : `?${query}`;
  return `${BASE_URL}${q}`;
}
