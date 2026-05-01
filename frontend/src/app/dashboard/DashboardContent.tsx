"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDataStore } from "@/store/dataStore";
import { useDebounce } from "@/hooks/useDebounce";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Skeleton, TableSkeleton } from "@/components/ui/Skeleton";

const PAGE_SIZE = 10;

export default function DashboardContent() {
  const { datasets, fetchDatasets, deleteDataset, loading } = useDataStore();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  const filtered = datasets.filter(
    (ds) =>
      ds.fileName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      ds.rowCount.toString().includes(debouncedSearch)
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDataset(deleteTarget);
      setDeleteTarget(null);
    } catch {
      // Error handled in store
    } finally {
      setDeleting(false);
    }
  };

  if (loading && datasets.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton width="120px" height="20px" />
            <Skeleton width="80px" height="14px" className="mt-1" />
          </div>
          <Skeleton width="120px" height="36px" />
        </div>
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5">
          <Skeleton width="100px" height="18px" className="mb-4" />
          <TableSkeleton rows={4} />
        </div>
      </div>
    );
  }

  if (datasets.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-surface-800 flex items-center justify-center mb-5">
            <svg className="w-10 h-10 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">No datasets yet</h3>
          <p className="text-sm text-surface-400 mb-6 max-w-md">
            Upload your first CSV file to start analyzing data and getting AI-powered insights.
          </p>
          <Link
            href="/dashboard/upload"
            className="px-6 py-3 bg-accent hover:bg-accent-dark text-white rounded-xl font-semibold text-sm transition shadow-lg shadow-accent/20"
          >
            Upload Your First CSV
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with search */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold">Your Datasets</h3>
            <p className="text-xs text-surface-500 mt-0.5">
              {filtered.length === datasets.length
                ? `${datasets.length} dataset${datasets.length !== 1 ? "s" : ""} uploaded`
                : `${filtered.length} of ${datasets.length} datasets`}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-surface-950 border border-surface-700 rounded-xl px-3 py-2 flex-1 sm:w-64">
              <svg className="w-4 h-4 text-surface-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-sm text-surface-50 placeholder-surface-500 w-full border-none outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-surface-500 hover:text-surface-300">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <Link href="/dashboard/upload" className="px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-xl text-sm font-medium transition whitespace-nowrap">
              + Upload New
            </Link>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-surface-500">No datasets match &quot;{search}&quot;</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-800">
                    <th className="text-left py-3 px-3 text-surface-500 font-medium">Name</th>
                    <th className="text-left py-3 px-3 text-surface-500 font-medium">Rows</th>
                    <th className="text-left py-3 px-3 text-surface-500 font-medium">Columns</th>
                    <th className="text-left py-3 px-3 text-surface-500 font-medium">Size</th>
                    <th className="text-left py-3 px-3 text-surface-500 font-medium">Uploaded</th>
                    <th className="text-left py-3 px-3 text-surface-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((ds) => (
                    <tr key={ds._id} className="border-b border-surface-800/50 hover:bg-surface-800/30 transition">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M3 6h18M3 18h18" />
                            </svg>
                          </div>
                          <span className="font-medium truncate max-w-[200px]" title={ds.fileName}>{ds.fileName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-surface-300">{ds.rowCount.toLocaleString()}</td>
                      <td className="py-3 px-3 text-surface-300">{ds.columns.length}</td>
                      <td className="py-3 px-3 text-surface-300">
                        {ds.originalSize
                          ? ds.originalSize >= 1048576
                            ? (ds.originalSize / 1048576).toFixed(1) + " MB"
                            : (ds.originalSize / 1024).toFixed(0) + " KB"
                          : "—"}
                      </td>
                      <td className="py-3 px-3 text-surface-400">{new Date(ds.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-3">
                        <div className="flex gap-1">
                          <Link href={`/dashboard/analytics?id=${ds._id}`} className="px-2 py-1 rounded hover:bg-surface-700 text-surface-400 hover:text-emerald-400 transition text-xs">
                            Analyze
                          </Link>
                          <Link href={`/dashboard/insights?id=${ds._id}`} className="px-2 py-1 rounded hover:bg-surface-700 text-surface-400 hover:text-amber-400 transition text-xs">
                            Insights
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(ds._id)}
                            className="px-2 py-1 rounded hover:bg-surface-700 text-surface-400 hover:text-red-400 transition text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-800">
                <p className="text-xs text-surface-500">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 text-xs rounded-lg transition ${
                        p === page
                          ? "bg-accent text-white"
                          : "bg-surface-800 hover:bg-surface-700 text-surface-300"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-xs rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Dataset"
        message="Are you sure? This will permanently delete this dataset and all associated AI insights. This action cannot be undone."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}