# System Rules — Rental Management System

> **System Rules** = aturan yang mengontrol perilaku *software/aplikasi* (data integrity, workflow, status, authorization).
> Ini BUKAN peraturan perilaku penyewa. Untuk itu lihat `docs/tenant-rules/tenant-regulations.md`.

---

## 1. Property Rules
- SR-P1: Satu Property hanya boleh memiliki **satu Contract berstatus `ACTIVE`** pada satu waktu.
- SR-P2: `Property.currentTenant` **tidak boleh** dibuat sebagai field statis — penyewa saat ini selalu diturunkan dari Contract `ACTIVE`.
- SR-P3: Property status (`AVAILABLE/OCCUPIED/UNDER_MAINTENANCE`) adalah konsep **terpisah** dari status Maintenance (`REPORTED/IN_PROGRESS/COMPLETED`) — tidak boleh digabung/disamakan.
- SR-P4: Penghapusan Property yang masih punya Contract/Maintenance/Expense terkait tidak diperbolehkan (data integrity) — soft-delete vs hard-delete: **[DECISION REQUIRED]**.

## 2. Tenant Rules (level sistem, bukan perilaku)
- SR-T1: Data Tenant independen dari Property — satu Tenant bisa punya banyak Contract sepanjang waktu (histori tetap tersimpan).
- SR-T2: Tenant hanya boleh melihat data miliknya sendiri (relevan untuk Tenant Portal, masa depan) — ini aturan **authorization**, bukan tenant regulation.

## 3. Contract Rules
- SR-C1: Contract baru hanya bisa dibuat jika Property tidak sedang memiliki Contract `ACTIVE`.
- SR-C2: **Contract yang sudah selesai (`EXPIRED`/`TERMINATED`) tidak boleh dihapus** — merupakan histori bisnis, wajib dipertahankan permanen.
- SR-C3: Renewal Contract **wajib** membuat record baru (`previousContractId` menunjuk ke Contract lama) — dilarang meng-update/menimpa Contract lama.
- SR-C4: Status Contract minimal: `ACTIVE`, `EXPIRED`, `TERMINATED`, `RENEWED`. Aturan transisi detail antar-status: **[DECISION REQUIRED]**.

## 4. Payment Rules
- SR-PAY1: Setiap Payment wajib terhubung ke satu Contract.
- SR-PAY2: Payment memiliki lifecycle status (`PAID/PARTIAL/LATE` — daftar final **[DECISION REQUIRED]**).
- SR-PAY3: **Deposit ≠ Rental Revenue** — deposit tidak boleh dihitung sebagai pendapatan sewa dalam laporan apa pun. Model data untuk deposit belum ada di schema saat ini: **[DECISION REQUIRED]**.
- SR-PAY4: Kebijakan denda keterlambatan, grace period: **[DECISION REQUIRED]**.

## 5. Maintenance Rules
- SR-M1: Maintenance memiliki lifecycle status: `REPORTED → IN_PROGRESS → COMPLETED`.
- SR-M2: Maintenance selalu terhubung ke Property (bukan ke Tenant/Contract langsung).
- SR-M3: Maintenance dan Expense adalah entitas terpisah (`Maintenance ≠ Expense`); Expense boleh mereferensikan Maintenance secara opsional.

## 6. Expense Rules
- SR-E1: Expense selalu terhubung ke Property (opsional juga bisa mereferensikan Maintenance).
- SR-E2: Kategori Expense final: **[DECISION REQUIRED]**.

## 7. Parking Rules
- SR-PK1: Parking adalah entitas terpisah, tidak digabung ke Tenant/Contract/Property sebagai field.
- SR-PK2: Relasi otoritatif Parking (ke Property/Tenant, wajib salah satu atau keduanya): **[DECISION REQUIRED]**.
- SR-PK3: Biaya tambahan parkir (mis. Rp300.000/bulan untuk C1–C4) adalah item terpisah dari `rentAmount` Contract.

## 8. Authentication & Authorization Rules
- SR-AUTH1: Autentikasi menggunakan JWT; password di-hash dengan bcrypt (tidak pernah disimpan plaintext).
- SR-AUTH2: Autorisasi **wajib** ditegakkan di backend (Express), tidak boleh hanya mengandalkan penyembunyian UI di frontend.
- SR-AUTH3: Admin/Owner dapat mengelola seluruh Property.
- SR-AUTH4: Tenant (via Tenant Portal, masa depan) hanya boleh mengakses data miliknya sendiri.
- SR-AUTH5: Permission matrix detail per role: **[DECISION REQUIRED]**.

## 9. General Data Integrity Rules
- SR-G1: Semua foreign key wajib valid (tidak ada orphan record).
- SR-G2: Data historis (Contract, Payment, Maintenance, Expense) tidak boleh hilang akibat perubahan kondisi saat ini.
- SR-G3: Seluruh entitas transaksional (Contract, Payment, Maintenance, Expense) memiliki timestamp `createdAt`/`updatedAt`.
- SR-G4: Soft-delete vs hard-delete per entitas: **[DECISION REQUIRED]**.
