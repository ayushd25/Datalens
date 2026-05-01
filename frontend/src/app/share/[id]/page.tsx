"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface PublicDataset {
  _id: string;
  fileName: string;
  rowCount: number;
  columns: Array<{ name: string; type: string }>;
  stats: Record<string, { mean: number; min: number; max: number }>;
}

export default function PublicSharePage() {
  const params = useParams();
  const id = params.id as string;
  
  const [data, setData] = useState<PublicDataset | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/data/public/${id}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res.data.dataset);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-surface-950 text-surface-400 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Dataset Not Found</h1>
        <p className="text-sm mb-6">It may have been deleted or the link is invalid.</p>
        <Link href="/" className="px-6 py-2 bg-accent text-white rounded-xl text-sm font-semibold">
          Go to DataLens
        </Link>
      </div>
    );
  }

  const stats = data.stats ? Object.entries(data.stats).slice(0, 4) : [];

  return (
    <div className="min-h-screen bg-surface-950 text-surface-50 p-6">
      {/* VIRAL BANNER */}
      <div className="max-w-4xl mx-auto mb-8 p-4 bg-gradient-to-r from-accent/10 to-purple-500/10 border border-accent/20 rounded-2xl text-center">
        <h2 className="text-xl font-bold text-accent">DataLens AI Analytics</h2>
        <p className="text-sm text-surface-400 mt-1">Upload your own data and get AI insights in seconds.</p>
        <Link href="/" className="inline-block mt-3 px-6 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition">
          Try DataLens Free
        </Link>
      </div>

      <div className="max-w-4xl mx-auto bg-surface-900 border border-surface-800 rounded-2xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{data.fileName}</h1>
          <p className="text-surface-500 text-sm">{data.rowCount?.toLocaleString()} rows • {data.columns?.length} columns</p>
        </div>

        {stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map(([col, s]: [string, any]) => (
              <div key={col} className="bg-surface-950 p-4 rounded-xl">
                <div className="text-xs text-surface-500 font-mono">{col}</div>
                <div className="text-lg font-bold mt-1">{s.mean?.toFixed(1)}</div>
                <div className="text-xs text-surface-400 mt-2">Min: {s.min} | Max: {s.max}</div>
              </div>
            ))}
          </div>
        )}

        <h3 className="font-semibold mb-4">Column Schema</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {data.columns?.map((c: { name: string; type: string }) => (
            <div key={c.name} className="text-xs bg-surface-950 p-2 rounded-lg flex justify-between">
              <span className="text-surface-300 truncate">{c.name}</span>
              <span className="text-accent ml-2">{c.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}