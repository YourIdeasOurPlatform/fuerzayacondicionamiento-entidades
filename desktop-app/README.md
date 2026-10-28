# App de escritorio

Ventana de Electron con el mismo portal de entidades. El backend sigue en la nube: el login y la API son los de la web. `PUBLIC_API_URL` se hornea al sincronizar el front (Astro lo deja fijo en el build).

En esta carpeta: `npm install`, sync del front y el instalador de la plataforma donde corrés el build.

## Requisitos

- Node 20+
- Dependencias del portal ya instaladas en la raíz del repo (`npm install` ahí)

## Desarrollo

Terminal 1, en la raíz:

```bash
npm run dev
```

Terminal 2:

```bash
cd desktop-app
npm install
npm run dev
```

Si al abrir la ventana Electron dice que no se instaló, bajá el binario a mano: `node node_modules/electron/install.js`.

Abre `http://127.0.0.1:4322` dentro de la ventana. Los cambios del front se ven al recargar.

## Build empaquetado

```bash
cd desktop-app
npm install
npm run dist
```

Eso hace el sync (`astro build` con `base: '/'`, sin el prefijo de GitHub Pages) y deja los archivos en `desktop-app/release/`:

| Sistema | Comando | Qué subís al Release |
|---------|---------|----------------------|
| Linux | `npm run dist:linux` | `.tar.gz`: se descomprime y se ejecuta `fuerza-entidades` |
| Windows | `npm run dist:win` | En Linux sale el `.zip` (adentro está `fuerza-entidades.exe`). El instalador `.exe` se arma corriendo el mismo comando en Windows. |
| macOS | `npm run dist:mac` | En Linux salen dos zip, Apple Silicon (`mac-arm64`) e Intel (`mac-x64`). El `.dmg` se arma corriendo el mismo comando en una Mac. |

`npm run dist` es el de la plataforma actual.

Para apuntar a un API distinto del `.env` de la raíz:

```bash
PUBLIC_API_URL=https://tu-api.ejemplo.com npm run dist
```

Sin `?demo=1` la ventana pide el mismo usuario que la web. `?demo=1` sigue funcionando si lo abrís a mano.

## Probar el build sin instalador

```bash
npm run sync
npm start
```
