# Rental Management System

Sistem sederhana untuk mengelola 9 rumah kontrakan keluarga, meliputi data properti, penyewa, dan pembayaran sewa.

## Struktur Folder
- `frontend/` — Aplikasi Next.js (UI)
- `backend/` — API Express (business logic)
- `database/` — Skema & migrasi Prisma/MySQL
- `docs/` — Dokumentasi project

## Tech Stack
Next.js 16 · TypeScript · Tailwind CSS · Node.js · Express · Prisma · MySQL

## Status
Tahap saat ini: **Phase 3 — Backend Setup** (struktur dasar Express + TypeScript + Prisma, belum ada fitur/CRUD/domain model).

## Setup Backend (Development)

```bash
cd backend
cp .env.example .env   # lalu sesuaikan DATABASE_URL dengan MySQL lokal
npm install
npm run prisma:generate
npm run dev             # jalankan server dev (tsx watch)
```

Verifikasi:
- Build TypeScript: `npm run build` (output ke `backend/dist`)
- Health check: `GET http://localhost:4000/api/health`

## Setup Frontend
Belum tersedia — akan ditambahkan pada phase berikutnya.
