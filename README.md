# SecuroPOP — Android 14+ Application Security Framework

Minimal plain-JavaScript MVP for **SecuroPOP**, an Android 14+ application security hardening, policy, and audit framework.

## Project Structure

- `web/` — React.js (Vite, plain JS) security dashboard
- `mobile/` — Expo (React Native, plain JS) mobile app named **SecuroPOP** targeting Android 14+
- `server/` — Node.js + Express backend (port `4000`) using local JSON files

## Running Locally

### 1. Backend (`server/`)
```bash
cd server
npm install
npm start
```
Health check: `GET http://localhost:4000/api/health` -> `{"app":"SecuroPOP","status":"ok"}`

### 2. Web Dashboard (`web/`)
```bash
cd web
npm install
npm run dev
```
Production build:
```bash
cd web
npm run build
```

### 3. Mobile App (`mobile/`)
```bash
cd mobile
npm install
npx expo start
```
