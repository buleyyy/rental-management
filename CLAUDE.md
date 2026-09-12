# CLAUDE.md

## Nama Project
Rental Management System

## Tujuan Project
Mengelola 9 rumah kontrakan keluarga (data properti, penyewa, dan pembayaran sewa) dalam satu sistem terpusat.

## Tech Stack
- Frontend: Next.js 16 + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- ORM: Prisma
- Database: MySQL

## Arsitektur Dasar
```
Next.js (Frontend) → Express API (Backend) → Prisma (ORM) → MySQL (Database)
```

## Prinsip Kerja
- Jangan membuat keputusan bisnis atau fitur yang belum disepakati dengan user.
- Tanyakan dulu jika requirement belum jelas, jangan berasumsi.
- Tidak menambahkan library/dependency yang belum diperlukan.
- Bangun bertahap: foundation → design → schema → API → UI, sesuai instruksi eksplisit di setiap tahap.

## Prinsip Domain (WAJIB, dari Phase 2 — System Design)
- Property ≠ Tenant, Tenant ≠ Contract, Contract ≠ Payment, Maintenance ≠ Expense — masing-masing entitas terpisah, tidak digabung.
- Parking adalah entitas terpisah, bukan field di Tenant/Contract.
- Satu Property hanya boleh memiliki **satu Active Contract** pada satu waktu.
- History Contract tidak boleh ditimpa saat renewal — renewal wajib membuat record baru (lihat `previousContractId`).
- Frontend tidak pernah mengakses database langsung; semua lewat Express REST API → Prisma.
- System Rules vs Tenant Rules harus tetap terpisah (lihat `docs/business-rules/` dan `docs/tenant-rules/`).
- Jika ada keputusan bisnis/teknis yang belum jelas, tandai `[DECISION REQUIRED]` — jangan mengarang.

## Backend Setup (Phase 3)
- Struktur: `src/{config,controllers,middleware,routes,services,validators,utils}` + `app.ts` + `server.ts`.
- `prisma/schema.prisma` baru berisi datasource + generator (MySQL) — **belum ada model domain**, menunggu phase database schema.
- Endpoint yang tersedia saat ini hanya `GET /api/health` — jangan tambah endpoint bisnis tanpa instruksi eksplisit.
- Validasi request pakai Zod via `validateRequest` middleware (generik, reusable) — schema per domain ditaruh di `validators/` saat fitur dibuat.
- Error handling terpusat di `errorHandler.middleware.ts` — gunakan `AppError` untuk error terkontrol.

## Dokumentasi Terkait
- Architecture: `docs/architecture/system-architecture.md`
- System Rules: `docs/business-rules/system-rules.md`
- Tenant Regulations: `docs/tenant-rules/tenant-regulations.md`
- ERD: `docs/database/erd.md`
- Decision Log: `docs/decisions/architecture-decisions.md`
