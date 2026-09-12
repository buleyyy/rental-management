"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { MonthlyReport, Property, PaginatedResponse } from "@/lib/types";

export default function AdminDashboard() {
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        const [reportData, propertiesData] = await Promise.all([
          apiFetch<MonthlyReport>("/reports/monthly", {
            params: { year, month },
          }),
          apiFetch<PaginatedResponse<Property>>("/properties", {
            params: { limit: 100 },
          }),
        ]);

        setReport(reportData);
        setProperties(propertiesData.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  const occupiedCount = properties.filter((p) => p.status === "OCCUPIED").length;
  const availableCount = properties.filter((p) => p.status === "AVAILABLE").length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Properties</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{properties.length}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Occupied</div>
          <div className="mt-2 text-3xl font-bold text-blue-600">{occupiedCount}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Available</div>
          <div className="mt-2 text-3xl font-bold text-green-600">{availableCount}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Active Contracts</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {report?.summary.activeContractsCount || 0}
          </div>
        </div>
      </div>

      {/* Monthly Report */}
      {report && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Laporan Bulan {report.period.monthName} {report.period.year}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm font-medium text-gray-500">Total Pemasukan</div>
              <div className="mt-2 text-2xl font-bold text-green-600">
                Rp {report.summary.totalIncome.toLocaleString("id-ID")}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Pembayaran Lunas</div>
              <div className="mt-2 text-2xl font-bold text-blue-600">
                {report.summary.paidPaymentsCount}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Belum Bayar</div>
              <div className="mt-2 text-2xl font-bold text-red-600">
                {report.summary.unpaidContractsCount}
              </div>
            </div>
          </div>

          {report.summary.unpaidContractsCount > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Kontrak Belum Bayar:
              </h3>
              <div className="space-y-2">
                {report.unpaidContracts.map((contract) => (
                  <div
                    key={contract.contractId}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-md"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {contract.tenant.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {contract.property.code} - {contract.property.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-red-700">
                        Rp {parseFloat(contract.rentAmount).toLocaleString("id-ID")}
                      </div>
                      <div className="text-sm text-gray-500">{contract.tenant.phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
