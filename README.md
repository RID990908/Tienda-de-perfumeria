# VainyBliss Workspace

## Desarrollo local sin bloqueos

- Usa `npm run dev` desde la raiz.
- El script ahora ejecuta una limpieza previa automatica:
  - cierra procesos ocupando puertos `3000`, `3001` y `3002`,
  - elimina locks temporales de Next en `frontend/.next/dev/lock` y `backend/.next/dev/lock`.

## Scripts utiles

- `npm run dev`: limpieza previa + frontend/backend concurrente.
- `npm run dev:clean`: solo limpieza de puertos y locks.
- `npm run dev:fresh`: limpieza y luego arranque completo.
