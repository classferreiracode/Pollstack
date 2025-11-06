# Pollstack — Full (Upstash + Overlay + Public Vote)

Este pacote inclui:
- Backend Express + Socket.IO com persistência Upstash (REST API)
- Front Vue 3 + Vite + Vue Router
- Features novas:
  - Link público para votação: `/vote/:pollId`
  - Link de overlay para OBS/Streamlabs: `/overlay/:pollId`
  - Resposta do backend inclui `publicUrl` e `overlayUrl`

## Deploy na Render (1 serviço)
**Build Command**
```
cd web && npm ci && npm run build && cd ../server && npm ci
```
**Start Command**
```
node index.js
```
**Env necessários (no serviço):**
```
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
CORS_ORIGIN=*
PUBLIC_URL=https://SEU_DOMINIO   # opcional; em dev use http://localhost:5173
```

## Dev local
Back:
```
cd server
cp .env.example .env
npm i
npm run dev
```
Front:
```
cd web
npm i
npm run dev
```

## Produção local (simulação)
```
cd web && npm i && npm run build
cp -r dist/* ../server/public/
cd ../server && npm i && npm start
# http://localhost:4000
```
