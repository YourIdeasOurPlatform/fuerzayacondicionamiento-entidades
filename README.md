# Portal de entidades

Front del centro. Misma API que FAP (`PUBLIC_API_URL`). No usa los flags de entidades ni de tiers: si el backend tiene el dominio apagado, el login responde 404.

```bash
npm install
npm run dev
```

Puerto local `4322`. Hay que sumar ese origen a `CORS_ORIGINS` del backend.

Tema claro / oscuro, sin catálogo de paletas y sin modo offline. El render está descrito en `render.yaml` (Static Site, rama `prod` cuando el repo esté publicado).
