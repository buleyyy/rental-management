"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  MonthlyReport,
  Property,
  Contract,
  Maintenance,
  Expense,
  Parking,
  PaginatedResponse,
} from "@rental/types";
import { Badge, Skeleton, EmptyState, StatCard } from "@rental/ui";

/* --------------------------------------------------------------------- */
/* Icons                                                                  */
/* --------------------------------------------------------------------- */

type IconProps = { className?: string };
const ic = "h-4 w-4";

const BuildingIcon = ({ className = ic }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
    <rect x="4" y="3" width="16" height="18" rx="1" />
    <path d="M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M10 21v-3.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V21" />
  </svg>
);
const FileSignatureIcon = ({ className = ic }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
    <path d="M13 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V8l-4-5Z" />
    <path d="M13 3v5h4" />
  </svg>
);
const WalletIcon = ({ className = ic }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
    <rect x="3" y="6" width="18" height="13" rx="1.5" />
    <path d="M3 10h18" />
    <path d="M15 14.5h3" />
  </svg>
);
const ReceiptIcon = ({ className = ic }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
    <path d="M6 3h12v18l-2.5-1.5L13 21l-1.5-1.5L10 21l-2.5-1.5L6 21V3Z" />
    <path d="M9 8h6M9 12h6" />
  </svg>
);
const CarIcon = ({ className = ic }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
    <path d="M4 16V11l1.8-4.2A1.5 1.5 0 0 1 7.2 6h9.6a1.5 1.5 0 0 1 1.4.8L20 11v5" />
    <rect x="3" y="13" width="18" height="5" rx="1.2" />
    <circle cx="7.5" cy="18.5" r="1.4" />
    <circle cx="16.5" cy="18.5" r="1.4" />
  </svg>
);
const InboxIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
    <path d="M4 12h4l1.5 2.5h5L16 12h4" />
    <path d="M4 12 5.6 5.4A1 1 0 0 1 6.6 4.6h10.8a1 1 0 0 1 1 .8L20 12v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6Z" />
  </svg>
);
const AlertIcon = ({ className = "h-5 w-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5" />
    <circle cx="12" cy="16" r="0.5" fill="currentColor" />
  </svg>
);

/* --------------------------------------------------------------------- */
/* Helpers                                                                */
/* --------------------------------------------------------------------- */

function formatIDR(value: number | string) {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return `Rp${Math.round(n).toLocaleString("id-ID")}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

const PROPERTY_STATUS_META: Record<Property["status"], { label: string; dot: string }> = {
  AVAILABLE: { label: "Tersedia", dot: "bg-success" },
  OCCUPIED: { label: "Terisi", dot: "bg-ink" },
  UNDER_MAINTENANCE: { label: "Pemeliharaan", dot: "bg-warning" },
  RESERVED: { label: "Dipesan", dot: "bg-info" },
  INACTIVE: { label: "Nonaktif", dot: "bg-ink-faint" },
};

const PROPERTY_BADGE: Record<Property["status"], "success" | "neutral" | "warning" | "info"> = {
  AVAILABLE: "success",
  OCCUPIED: "neutral",
  UNDER_MAINTENANCE: "warning",
  RESERVED: "info",
  INACTIVE: "neutral",
};

const CONTRACT_BADGE: Record<Contract["status"], "success" | "neutral" | "danger" | "info"> = {
  ACTIVE: "success",
  EXPIRED: "neutral",
  TERMINATED: "danger",
  RENEWED: "info",
};

const MAINTENANCE_BADGE: Record<Maintenance["status"], "warning" | "info" | "success"> = {
  REPORTED: "warning",
  IN_PROGRESS: "info",
  COMPLETED: "success",
};

function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
        <div>
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {subtitle && <p className="text-xs text-ink-muted mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function PanelEmpty({ text }: { text: string }) {
  return <EmptyState title="Belum ada data" description={text} icon={<InboxIcon />} />;
}

/* --------------------------------------------------------------------- */
/* Page                                                                   */
/* --------------------------------------------------------------------- */

export default function AdminDashboard() {
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const [reportData, propertiesData, contractsData, maintenancesData, expensesData, parkingsData] =
        await Promise.all([
          apiFetch<MonthlyReport>("/reports/monthly", { params: { year, month } }),
          apiFetch<PaginatedResponse<Property>>("/properties", { params: { limit: 100 } }),
          apiFetch<PaginatedResponse<Contract>>("/contracts", { params: { limit: 100 } }),
          apiFetch<PaginatedResponse<Maintenance>>("/maintenances", { params: { limit: 5 } }),
          apiFetch<PaginatedResponse<Expense>>("/expenses", { params: { limit: 100 } }),
          apiFetch<PaginatedResponse<Parking>>("/parkings", { params: { limit: 100 } }),
        ]);

      setReport(reportData);
      setProperties(propertiesData.data);
      setContracts(contractsData.data);
      setMaintenances(maintenancesData.data);
      setExpenses(expensesData.data);
      setParkings(parkingsData.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ----------------------------- Loading ------------------------------ */

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-80 mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-5 space-y-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-16" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-6 space-y-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ------------------------------ Error -------------------------------- */

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Ringkasan Operasional</h1>
        <div className="mt-6 flex flex-col items-center text-center gap-3 bg-surface border border-error-border rounded-xl p-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error-bg text-error">
            <AlertIcon />
          </div>
          <div>
            <p className="text-sm font-medium text-ink">Gagal memuat data dashboard</p>
            <p className="text-sm text-ink-muted mt-1">{error}</p>
          </div>
          <button
            onClick={fetchData}
            className="mt-2 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-ink transition-colors"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  /* ------------------------------ Derived ------------------------------ */

  const totalProperties = properties.length;
  const occupiedCount = properties.filter((p) => p.status === "OCCUPIED").length;
  const occupancyPct = totalProperties > 0 ? Math.round((occupiedCount / totalProperties) * 100) : 0;

  const statusCounts = (Object.keys(PROPERTY_STATUS_META) as Property["status"][]).map((status) => ({
    status,
    count: properties.filter((p) => p.status === status).length,
  }));

  const activeContractsCount = report?.summary.activeContractsCount ?? 0;
  const unpaidContractsCount = report?.summary.unpaidContractsCount ?? 0;
  const totalIncome = report?.summary.totalIncome ?? 0;

  const now = new Date();
  const in30Days = new Date(now);
  in30Days.setDate(now.getDate() + 30);
  const endingSoonCount = contracts.filter(
    (c) => c.status === "ACTIVE" && new Date(c.endDate) <= in30Days
  ).length;

  const thisMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.expenseDate);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const totalExpenses = thisMonthExpenses.reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0);
  const netCashflow = totalIncome - totalExpenses;

  const parkingAssigned = parkings.filter((p) => p.tenantId).length;

  const endingSoon = contracts
    .filter((c) => c.status === "ACTIVE" && new Date(c.endDate) <= in30Days)
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 5);

  const recentPayments = (report?.payments ?? [])
    .slice()
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
    .slice(0, 6);

  // Property roster: active contract per property, for a quick unit-level glance.
  const activeContractByProperty = new Map<number, Contract>();
  contracts
    .filter((c) => c.status === "ACTIVE")
    .forEach((c) => activeContractByProperty.set(c.propertyId, c));
  const roster = properties.slice(0, 6);

  /* ------------------------------- View --------------------------------- */

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Ringkasan Operasional</h1>
          <p className="text-sm text-ink-muted mt-1">
            Periode {report?.period.monthName} {report?.period.year} · {totalProperties} unit terkelola
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/expenses"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface-muted text-ink rounded-lg text-sm font-medium hover:bg-surface-strong transition-colors"
          >
            <ReceiptIcon className="h-4 w-4" />
            Catat Pengeluaran
          </Link>
          <Link
            href="/admin/payments"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-ink transition-colors"
          >
            <WalletIcon className="h-4 w-4" />
            Catat Pembayaran
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard
          label="Unit terisi"
          value={`${occupiedCount}/${totalProperties}`}
          unit="unit"
          secondary={`${occupancyPct}% okupansi`}
          icon={<BuildingIcon />}
        />
        <StatCard
          label="Kontrak aktif"
          value={activeContractsCount}
          unit="kontrak"
          secondary={endingSoonCount > 0 ? `${endingSoonCount} berakhir dalam 30 hari` : "Belum ada yang segera berakhir"}
          icon={<FileSignatureIcon />}
        />
        <StatCard
          label="Sewa diterima bulan ini"
          value={formatIDR(totalIncome)}
          secondary={unpaidContractsCount > 0 ? `${unpaidContractsCount} kontrak belum bayar` : "Semua sudah bayar"}
          icon={<WalletIcon />}
        />
        <StatCard
          label="Pengeluaran bulan ini"
          value={formatIDR(totalExpenses)}
          secondary={
            <span className={netCashflow >= 0 ? "text-success" : "text-error"}>
              Arus kas bersih {netCashflow >= 0 ? "+" : ""}
              {formatIDR(netCashflow)}
            </span>
          }
          icon={<ReceiptIcon />}
        />
        <StatCard
          label="Slot parkir terisi"
          value={`${parkingAssigned}/${parkings.length}`}
          unit="slot"
          secondary={parkings.length === 0 ? "Belum ada slot terdaftar" : "Slot yang sudah punya penghuni"}
          icon={<CarIcon />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Overview */}
        <Panel title="Status Unit" subtitle={`${totalProperties} unit terdaftar`}>
          {totalProperties === 0 ? (
            <PanelEmpty text="Belum ada unit yang terdaftar." />
          ) : (
            <div className="space-y-5">
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                {statusCounts
                  .filter((s) => s.count > 0)
                  .map((s) => (
                    <div
                      key={s.status}
                      className={PROPERTY_STATUS_META[s.status].dot}
                      style={{ width: `${(s.count / totalProperties) * 100}%` }}
                      title={`${PROPERTY_STATUS_META[s.status].label}: ${s.count}`}
                    />
                  ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {statusCounts.map((s) => (
                  <div key={s.status} className="flex items-center gap-2 text-sm">
                    <span className={`h-2 w-2 rounded-full ${PROPERTY_STATUS_META[s.status].dot}`} />
                    <span className="text-ink-muted">{PROPERTY_STATUS_META[s.status].label}</span>
                    <span className="ml-auto font-semibold text-ink">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>

        {/* Contract Overview */}
        <Panel title="Kontrak Mendekati Berakhir" subtitle="Dalam 30 hari ke depan">
          {contracts.length === 0 ? (
            <PanelEmpty text="Belum ada kontrak yang tercatat." />
          ) : endingSoon.length === 0 ? (
            <p className="text-sm text-ink-muted">Tidak ada kontrak yang akan berakhir dalam 30 hari.</p>
          ) : (
            <div className="divide-y divide-border">
              {endingSoon.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <div className="font-medium text-ink">{c.property?.code ?? "-"}</div>
                    <div className="text-xs text-ink-muted truncate">{c.tenant?.fullName ?? "-"}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="warning">Segera berakhir</Badge>
                    <span className="text-xs text-ink-muted w-24 text-right">{formatDate(c.endDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Recent Payments */}
        <Panel
          title="Riwayat Pembayaran Terbaru"
          subtitle={report ? `Periode ${report.period.monthName} ${report.period.year}` : undefined}
        >
          {recentPayments.length === 0 ? (
            <PanelEmpty text="Belum ada pembayaran tercatat bulan ini." />
          ) : (
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-left" style={{ fontFeatureSettings: '"tnum" 1' }}>
                <thead>
                  <tr className="bg-surface-muted text-ink-muted text-xs">
                    <th className="py-2 px-5 font-medium">Unit / Penyewa</th>
                    <th className="py-2 px-5 font-medium text-right">Nominal</th>
                    <th className="py-2 px-5 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-muted/60 transition-colors">
                      <td className="py-3 px-5">
                        <div className="font-medium text-ink text-sm">{p.contract.property.code}</div>
                        <div className="text-xs text-ink-muted">{p.contract.tenant.fullName}</div>
                      </td>
                      <td className="py-3 px-5 text-right text-sm font-semibold text-ink">
                        {formatIDR(p.amount)}
                      </td>
                      <td className="py-3 px-5 text-center">
                        <Badge variant={p.status === "PAID" ? "success" : p.status === "PARTIAL" ? "warning" : "danger"}>
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {/* Maintenance */}
        <Panel title="Laporan Servis & Maintenance" subtitle="5 laporan terbaru">
          {maintenances.length === 0 ? (
            <PanelEmpty text="Belum ada laporan maintenance." />
          ) : (
            <div className="flex flex-col gap-2.5">
              {maintenances.map((m) => (
                <div key={m.id} className="p-3 rounded-lg bg-surface-muted flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-ink line-clamp-1">{m.description}</span>
                    <Badge variant={MAINTENANCE_BADGE[m.status]}>{m.status.replace("_", " ")}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-ink-muted">
                    <span>{m.property?.code ?? "-"}</span>
                    <span>{formatDate(m.reportedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* Property Roster */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-ink">Katalog Unit & Status Penghuni</h2>
            <p className="text-xs text-ink-muted mt-0.5">Ringkasan cepat unit, penyewa, dan tarif bulanan</p>
          </div>
          <Link href="/admin/properties" className="text-sm font-medium text-ink-muted hover:text-ink">
            Lihat Semua
          </Link>
        </div>
        {roster.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl">
            <PanelEmpty text="Belum ada unit yang terdaftar." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roster.map((p) => {
              const contract = activeContractByProperty.get(p.id);
              return (
                <div key={p.id} className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-ink-muted">{p.code}</div>
                      <div className="text-sm font-semibold text-ink truncate">{p.name}</div>
                      <div className="text-xs text-ink-muted truncate">{p.address}</div>
                    </div>
                    <div className="shrink-0">
                      <Badge variant={PROPERTY_BADGE[p.status]}>{PROPERTY_STATUS_META[p.status].label}</Badge>
                    </div>
                  </div>
                  <div className="bg-surface-muted rounded-lg p-3 flex items-center justify-between gap-3">
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs text-ink-muted">{contract ? "Penyewa" : "Status"}</span>
                      <span className="text-sm font-medium text-ink truncate">
                        {contract ? contract.tenant?.fullName ?? "-" : PROPERTY_STATUS_META[p.status].label}
                      </span>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-xs text-ink-muted">Tarif sewa</span>
                      <span className="text-sm font-semibold text-ink">
                        {contract ? formatIDR(contract.rentAmount) : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Unpaid contracts detail */}
      {report && report.unpaidContracts.length > 0 && (
        <Panel title="Belum Dibayar" subtitle={`${report.unpaidContracts.length} kontrak belum membayar`}>
          <div className="divide-y divide-border">
            {report.unpaidContracts.map((contract) => (
              <div key={contract.contractId} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium text-ink">{contract.tenant.fullName}</div>
                  <div className="text-ink-muted text-xs mt-0.5">
                    {contract.property.code} — {contract.property.name} ({contract.tenant.phone})
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-ink">{formatIDR(contract.rentAmount)}</div>
                  {contract.estimatedLateFee > 0 && (
                    <div className="text-xs text-error mt-0.5">+ denda {formatIDR(contract.estimatedLateFee)}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
