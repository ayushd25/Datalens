"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useDataStore } from "@/store/dataStore";
import { dataService } from "@/services/dataService";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899", "#84cc16"];

function isValidMongoId(id: string | null): boolean {
  return !!id && /^[0-9a-fA-F]{24}$/.test(id);
}

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const datasetId = searchParams.get("id");
  const { currentDataset, fetchDataset } = useDataStore();
  const [chartType, setChartType] = useState("bar");
  const [selectedCol, setSelectedCol] = useState("");
  const [chartData, setChartData] = useState<any>(null);
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const numericCols = currentDataset?.columns?.filter((c) => c.type === "numeric").map((c) => c.name) || [];

  useEffect(() => {
    if (!datasetId) return;
    setFetchError("");
    fetchDataset(datasetId).catch(() => {
      setFetchError("Failed to load dataset");
    });
  }, [datasetId, fetchDataset]);

  useEffect(() => {
    if (!selectedCol && numericCols.length > 0) setSelectedCol(numericCols[0]);
  }, [numericCols, selectedCol]);

  useEffect(() => {
    if (!datasetId || !selectedCol) return;
    setLoadingCharts(true);
    dataService
      .getChartData(datasetId, selectedCol, chartType)
      .then((res) => setChartData(res.data.data.charts))
      .catch(() => setChartData(null))
      .finally(() => setLoadingCharts(false));
  }, [datasetId, selectedCol, chartType]);

  if (useDataStore.getState().loading) {
    return (
      <div className="p-6 flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!datasetId) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </div>
        <p className="text-surface-400 mb-4">Select a dataset from the dashboard to analyze.</p>
      </div>
    );
  }

  if (fetchError || (!currentDataset && !useDataStore.getState().loading)) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4 text-red-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <p className="text-surface-300 mb-1">Dataset not found</p>
        <p className="text-sm text-surface-500 mb-4">{fetchError || "It may have been deleted or the link is invalid."}</p>
        <a href="/dashboard" className="px-5 py-2 bg-surface-800 hover:bg-surface-700 border border-surface-700 rounded-xl text-sm font-medium transition">
          Back to Dashboard
        </a>
      </div>
    );
  }

  const histogramData = chartData?.histogram
    ? chartData.histogram.labels.map((label: string, i: number) => ({ label, count: chartData.histogram.counts[i] }))
    : [];

  const categoryData = chartData?.categories
    ? chartData.categories.labels.map((label: string, i: number) => ({ name: label, value: chartData.categories.counts[i] }))
    : [];

  const pieData = chartData?.pie
    ? chartData.pie.labels.map((label: string, i: number) => ({ name: label, value: chartData.pie.counts[i] }))
    : categoryData;

  return (
    <div className="p-6 space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={selectedCol} onChange={(e) => setSelectedCol(e.target.value)} className="bg-surface-800 border border-surface-700 rounded-xl px-3 py-2 text-sm text-surface-50">
          {numericCols.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <div className="flex gap-1 bg-surface-800 border border-surface-700 rounded-xl p-1">
          {["bar", "line", "area", "pie"].map((t) => (
            <button key={t} onClick={() => setChartType(t)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${chartType === t ? "bg-surface-700 text-surface-50" : "text-surface-400 hover:text-surface-300"}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5">
        <h3 className="text-base font-semibold mb-1">{selectedCol} — {chartType === "pie" ? "Distribution" : "Histogram"}</h3>
        <p className="text-xs text-surface-500 mb-4">{currentDataset?.rowCount?.toLocaleString()} total rows</p>
        {loadingCharts ? (
          <div className="h-80 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : histogramData.length > 0 && chartType !== "pie" ? (
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart data={histogramData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="label" tick={{ fill: "#52525b", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#52525b", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "#1a1a1e", border: "1px solid #2a2a2e", borderRadius: 8, color: "#fafafa" }} />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : chartType === "line" ? (
                <LineChart data={histogramData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="label" tick={{ fill: "#52525b", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#52525b", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "#1a1a1e", border: "1px solid #2a2a2e", borderRadius: 8, color: "#fafafa" }} />
                  <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              ) : (
                <AreaChart data={histogramData}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="label" tick={{ fill: "#52525b", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#52525b", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "#1a1a1e", border: "1px solid #2a2a2e", borderRadius: 8, color: "#fafafa" }} />
                  <Area type="monotone" dataKey="count" stroke="#10b981" fill="url(#areaGrad)" strokeWidth={2} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : pieData.length > 0 ? (
          <div style={{ width: "100%", height: 320 }} className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={2} dataKey="value" label={(entry) => entry.name}>
                  {pieData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1a1a1e", border: "1px solid #2a2a2e", borderRadius: 8, color: "#fafafa" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-surface-500">No numeric data to display</div>
        )}
      </div>

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5">
          <h3 className="text-base font-semibold mb-4">Category Breakdown</h3>
          <div style={{ width: "100%", height: Math.max(200, categoryData.length * 40) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis type="number" tick={{ fill: "#52525b", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: "#a1a1aa", fontSize: 11 }} tickLine={false} axisLine={false} width={100} />
                <Tooltip contentStyle={{ background: "#1a1a1e", border: "1px solid #2a2a2e", borderRadius: 8, color: "#fafafa" }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {categoryData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {currentDataset?.stats && Object.keys(currentDataset.stats).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(currentDataset.stats).slice(0, 4).map(([col, s]: [string, any]) => (
            <div key={col} className="bg-surface-900 border border-surface-800 rounded-2xl p-4">
              <div className="text-xs text-surface-500 font-mono mb-1">{col}</div>
              <div className="text-xl font-bold">{s.mean >= 1000 ? `${(s.mean/1000).toFixed(1)}K` : s.mean?.toFixed(1)}</div>
              <div className="text-xs text-surface-400 mt-2 grid grid-cols-2 gap-1">
                <span>Min: {s.min}</span>
                <span>Max: {s.max}</span>
                <span>Median: {s.median?.toFixed(1)}</span>
                <span>Count: {s.count?.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="p-6 flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    }>
      <AnalyticsContent />
    </Suspense>
  );
}