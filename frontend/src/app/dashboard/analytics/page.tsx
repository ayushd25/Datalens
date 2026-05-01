"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useDataStore } from "@/store/dataStore";
import { dataService } from "@/services/dataService";
import toast from "react-hot-toast";
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
  const [aiModel, setAiModel] = useState<string>("");
  
  const [chartType, setChartType] = useState<string>("bar");
  const [selectedCol, setSelectedCol] = useState<string>("");
  const [chartData, setChartData] = useState<Record<string, any> | null>(null);
  const [loadingCharts, setLoadingCharts] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string>("");

  // AI State
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  const numericCols: string[] = useMemo(() => 
    currentDataset?.columns?.filter((c: any) => c.type === "numeric").map((c: any) => c.name) || [], 
    [currentDataset]
  );

  useEffect(() => {
    if (!datasetId || !isValidMongoId(datasetId)) return;
    setFetchError("");
    fetchDataset(datasetId).catch(() => setFetchError("Failed to load dataset"));
  }, [datasetId, fetchDataset]);

  useEffect(() => {
    if (!selectedCol && numericCols.length > 0) setSelectedCol(numericCols[0]);
  }, [numericCols, selectedCol]);

  useEffect(() => {
    if (!datasetId || !selectedCol) return;
    setLoadingCharts(true);
    dataService
      .getChartData(datasetId, selectedCol, chartType)
      .then((res: any) => setChartData(res.data.data.charts))
      .catch(() => setChartData(null))
      .finally(() => setLoadingCharts(false));
  }, [datasetId, selectedCol, chartType]);

     const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res: any = await dataService.generateAIChart(datasetId as string, aiPrompt);
      const config = res.data.data.config;
      
      setAiModel(res.data.data.model);
      
      // Set chart type and column together without triggering multiple fetches
      if (config.chartType) setChartType(config.chartType);
      if (config.yAxis && numericCols.includes(config.yAxis)) setSelectedCol(config.yAxis);
      
      toast.success(`Chart configured via ${res.data.data.model}!`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "AI failed to generate chart");
    } finally {
      setAiLoading(false);
    }
  };

  if (useDataStore.getState().loading) {
    return <div className="p-6 flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!datasetId) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-24 text-center">
        <p className="text-surface-400">Select a dataset from the dashboard to analyze.</p>
      </div>
    );
  }

  if (fetchError || (!currentDataset && !useDataStore.getState().loading)) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-24 text-center">
        <p className="text-surface-300 mb-1">Dataset not found</p>
        <a href="/dashboard" className="px-5 py-2 bg-surface-800 border border-surface-700 rounded-xl text-sm font-medium transition mt-4">Back to Dashboard</a>
      </div>
    );
  }

  const histogramData: any[] = chartData?.histogram
    ? chartData.histogram.labels.map((label: string, i: number) => ({ label, count: chartData.histogram.counts[i] }))
    : [];

  const categoryData: any[] = chartData?.categories
    ? chartData.categories.labels.map((label: string, i: number) => ({ name: label, value: chartData.categories.counts[i] }))
    : [];

  const pieData: any[] = chartData?.pie
    ? chartData.pie.labels.map((label: string, i: number) => ({ name: label, value: chartData.pie.counts[i] }))
    : categoryData;

  // Separate actual data from forecast data for styling
  const actualData = histogramData.filter((d: any) => !String(d.label).includes("Future"));
  const forecastData = histogramData.filter((d: any) => String(d.label).includes("Future"));

  return (
    <div className="p-6 space-y-6">
      {/* AI Chat Input */}
      <div className="bg-surface-900 border border-purple-500/20 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
          <h3 className="text-sm font-semibold text-purple-300">AI Chart Generator</h3>
          {aiModel && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-800 text-surface-400">{aiModel}</span>
            )}
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAIGenerate()}
            placeholder="e.g. Show revenue over time as a line chart" 
            className="flex-1 bg-surface-950 border border-surface-700 rounded-xl px-4 py-2.5 text-sm text-surface-50 placeholder-surface-500 outline-none focus:border-purple-500/50 transition"
          />
          <button 
            onClick={handleAIGenerate} 
            disabled={aiLoading || !aiPrompt}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
          >
            {aiLoading ? "Thinking..." : "Generate"}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={selectedCol} onChange={(e) => setSelectedCol(e.target.value)} className="bg-surface-800 border border-surface-700 rounded-xl px-3 py-2 text-sm text-surface-50">
          {numericCols.map((c: string) => (<option key={c} value={c}>{c}</option>))}
        </select>
        <div className="flex gap-1 bg-surface-800 border border-surface-700 rounded-xl p-1">
          {["bar", "line", "area", "pie"].map((t: string) => (
            <button key={t} onClick={() => setChartType(t)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${chartType === t ? "bg-surface-700 text-surface-50" : "text-surface-400 hover:text-surface-300"}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart with Forecasting */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-base font-semibold">{selectedCol} — {chartType === "pie" ? "Distribution" : "Histogram"}</h3>
          {(chartType === "line" || chartType === "area") && forecastData.length > 0 && (
            <span className="text-[10px] px-2 py-1 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">AI Forecast Active</span>
          )}
        </div>
        <p className="text-xs text-surface-500 mb-4">{currentDataset?.rowCount?.toLocaleString()} total rows</p>
        
        {loadingCharts || aiLoading ? (
          <div className="h-80 flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
        ) : (chartType === "line" || chartType === "area") && histogramData.length > 0 ? (
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "line" ? (
                <LineChart data={histogramData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="label" tick={{ fill: "#52525b", fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: "#52525b", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "#1a1a1e", border: "1px solid #2a2a2e", borderRadius: 8, color: "#fafafa" }} />
                  <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={false} />
                  {forecastData.length > 0 && <Line type="monotone" dataKey="count" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" dot={false} />}
                </LineChart>
              ) : (
                <AreaChart data={histogramData}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.25} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                    <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a855f7" stopOpacity={0.15} /><stop offset="100%" stopColor="#a855f7" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="label" tick={{ fill: "#52525b", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#52525b", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "#1a1a1e", border: "1px solid #2a2a2e", borderRadius: 8, color: "#fafafa" }} />
                  <Area type="monotone" dataKey="count" stroke="#10b981" fill="url(#areaGrad)" strokeWidth={2} />
                  {forecastData.length > 0 && <Area type="monotone" dataKey="count" stroke="#a855f7" fill="url(#forecastGrad)" strokeWidth={2} strokeDasharray="5 5" />}
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : chartType === "bar" && histogramData.length > 0 ? (
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={actualData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill: "#52525b", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#52525b", fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#1a1a1e", border: "1px solid #2a2a2e", borderRadius: 8, color: "#fafafa" }} />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : pieData.length > 0 ? (
          <div style={{ width: "100%", height: 320 }} className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={2} dataKey="value" label={(entry: any) => entry.name}>
                {pieData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie><Tooltip contentStyle={{ background: "#1a1a1e", border: "1px solid #2a2a2e", borderRadius: 8, color: "#fafafa" }} /></PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-surface-500">No data to display</div>
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
                <span>Min: {s.min}</span><span>Max: {s.max}</span>
                <span>Median: {s.median?.toFixed(1)}</span><span>Count: {s.count?.toLocaleString()}</span>
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
    <Suspense fallback={<div className="p-6 flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" /></div>}>
      <AnalyticsContent />
    </Suspense>
  );
}