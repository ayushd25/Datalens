"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDataStore } from "@/store/dataStore";
import toast from "react-hot-toast";

function formatFileSize(bytes: number): string {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
  return bytes + " B";
}

function formatNumber(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

export default function UploadPage() {
  const router = useRouter();
  const { uploadDataset, fetchDatasets } = useDataStore();
  const [dragover, setDragover] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // 🔥 FIX: Store the actual File object here
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewCols, setPreviewCols] = useState<string[]>([]);
  const [previewSchema, setPreviewSchema] = useState<Record<string, string>>({});
  const [previewStats, setPreviewStats] = useState<Record<string, any>>({});
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const typeColors: Record<string, string> = {
    numeric: "bg-blue-500/10 text-blue-400",
    categorical: "bg-emerald-500/10 text-emerald-400",
    date: "bg-amber-500/10 text-amber-400",
    empty: "bg-surface-700 text-surface-400",
  };

  const parseLocalFile = (file: File) => {
    setFileName(file.name);
    setFileSize(file.size);

    import("papaparse").then((Papa) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        preview: 50,
        complete: (results) => {
          const rows = results.data.filter((r: any) => Object.values(r).some((v: any) => v !== "" && v != null));
          if (rows.length === 0) {
            toast.error("No valid data found in CSV");
            return;
          }
          const cols = Object.keys(rows[0] as any);
          const schema: Record<string, string> = {};
          const stats: Record<string, any> = {};

          cols.forEach((col: string) => {
            const vals = rows.map((r: any) => r[col]);
            const sample = vals.filter((v: any) => v !== "" && v != null).slice(0, 100);
            if (sample.length === 0) { schema[col] = "empty"; return; }
            const numCount = sample.filter((v: any) => !isNaN(Number(v)) && String(v).trim() !== "").length;
            if (numCount / sample.length > 0.85) {
              schema[col] = "numeric";
              const nums = sample.filter((v: any) => !isNaN(Number(v))).map(Number);
              if (nums.length > 0) {
                nums.sort((a: number, b: number) => a - b);
                const sum = nums.reduce((a: number, b: number) => a + b, 0);
                stats[col] = {
                  count: nums.length,
                  mean: Math.round((sum / nums.length) * 100) / 100,
                  median: nums.length % 2 === 0 ? Math.round(((nums[nums.length/2-1]+nums[nums.length/2])/2)*100)/100 : nums[Math.floor(nums.length/2)],
                  min: nums[0],
                  max: nums[nums.length - 1],
                };
              }
            } else {
              const dateCount = sample.filter((v: any) => !isNaN(Date.parse(v))).length;
              schema[col] = dateCount / sample.length > 0.7 ? "date" : "categorical";
            }
          });

          setPreviewData(rows.slice(0, 50));
          setPreviewCols(cols);
          setPreviewSchema(schema);
          setPreviewStats(stats);
          toast.success(`Parsed ${results.data.length} rows and ${cols.length} columns`);
        },
        error: () => toast.error("Failed to parse CSV file"),
      });
    });
  };

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".csv")) { toast.error("Only CSV files are supported"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("File must be under 10MB"); return; }
    
    // 🔥 FIX: Save the File object to state!
    setSelectedFile(file);
    
    parseLocalFile(file);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragover(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleConfirmUpload = async () => {
    // 🔥 FIX: Read from state, NOT from fileRef.current.files
    const file = selectedFile; 
    
    if (!file) {
      toast.error("File reference lost. Please re-select the file.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      await uploadDataset(file, (percent) => {
        setUploadProgress(percent);
      });
      
      await fetchDatasets();
      toast.success(`Uploaded ${file.name}`);
      router.push("/dashboard");
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || "Upload failed";
      toast.error(errorMsg);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const hasPreview = previewData.length > 0;

  // Helper to clear everything
  const clearPreview = () => {
    setSelectedFile(null); 
    setPreviewData([]); 
    setPreviewCols([]); 
    setPreviewSchema({}); 
    setPreviewStats({}); 
    setFileName("");
    setFileSize(0);
    if(fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="p-6 space-y-6">
      {!hasPreview ? (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
            onDragLeave={() => setDragover(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-20 text-center cursor-pointer transition-all ${
              dragover ? "border-accent bg-accent/5" : "border-surface-700 hover:border-surface-500 bg-surface-900"
            }`}
          >
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5 text-accent">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Drop your CSV file here</h3>
            <p className="text-sm text-surface-400 mb-6">or click to browse. Supports .csv up to 10MB</p>
            <div className="flex items-center gap-6 text-xs text-surface-500 justify-center">
              <span>Auto-detects schema</span>
              <span>Computes statistics</span>
              <span>Secure processing</span>
            </div>
          </div>

          <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6">
            <h3 className="text-base font-semibold mb-2">No CSV handy?</h3>
            <p className="text-sm text-surface-400 mb-4">Try with a built-in sample dataset.</p>
            <a href="/dashboard" className="inline-block px-4 py-2.5 bg-surface-800 hover:bg-surface-700 border border-surface-700 rounded-xl text-sm text-surface-200 transition">
              Back to Dashboard
            </a>
          </div>
        </>
      ) : (
        <>
          {/* File info & Upload Action */}
          <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">{fileName}</p>
                  <p className="text-xs text-surface-500">{formatFileSize(fileSize)} • {previewData.length} rows shown • {previewCols.length} columns</p>
                </div>
              </div>
              <button onClick={clearPreview} className="px-3 py-1.5 bg-surface-800 hover:bg-surface-700 border border-surface-700 rounded-lg text-xs text-surface-300 transition">
                Clear
              </button>
            </div>

            {/* Upload Progress Slider */}
            {uploading && (
              <div className="mb-4 p-4 bg-surface-950 rounded-xl border border-surface-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-surface-300">Uploading to server...</span>
                  <span className="text-xs font-bold text-accent">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-surface-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-accent to-teal-400 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                {uploadProgress === 100 && (
                  <p className="text-[11px] text-surface-500 mt-2 animate-pulse">Processing & saving to database...</p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button 
                onClick={handleConfirmUpload} 
                disabled={uploading} 
                className="px-5 py-2.5 bg-accent hover:bg-accent-dark text-white rounded-xl text-sm font-medium transition disabled:cursor-not-allowed disabled:bg-accent/50"
              >
                {uploading ? "Uploading..." : "Confirm Upload"}
              </button>
              <button 
                onClick={() => router.push("/dashboard")} 
                disabled={uploading}
                className="px-5 py-2.5 bg-surface-800 hover:bg-surface-700 border border-surface-700 rounded-xl text-sm text-surface-200 transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Stats cards */}
          {Object.keys(previewStats).length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(previewStats).slice(0, 4).map(([col, s]) => (
                <div key={col} className="bg-surface-900 border border-surface-800 rounded-2xl p-4">
                  <div className="text-xs text-surface-500 font-mono mb-1 truncate" title={col}>{col}</div>
                  <div className="text-xl font-bold">{s.mean >= 1000 ? formatNumber(s.mean) : s.mean?.toFixed(1)}</div>
                  <div className="text-xs text-surface-400 mt-2 grid grid-cols-2 gap-1">
                    <span>Min: {formatNumber(Math.round(s.min))}</span>
                    <span>Max: {formatNumber(Math.round(s.max))}</span>
                    <span>Median: {formatNumber(Math.round(s.median))}</span>
                    <span>Count: {s.count.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Data preview table */}
          <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5">
            <h3 className="text-base font-semibold mb-4">Data Preview</h3>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto rounded-xl border border-surface-800">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-surface-800 z-10">
                  <tr>
                    <th className="py-2.5 px-2 text-left text-surface-500 font-medium w-10">#</th>
                    {previewCols.map((col) => (
                      <th key={col} className="py-2.5 px-3 text-left text-surface-400 font-medium whitespace-nowrap">
                        {col}
                        <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded ${typeColors[previewSchema[col]] || typeColors.empty}`}>
                          {previewSchema[col]}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, i) => (
                    <tr key={i} className={`${i % 2 === 0 ? "bg-transparent" : "bg-surface-950/30"} hover:bg-surface-800/40 transition`}>
                      <td className="py-2 px-2 text-surface-500">{i + 1}</td>
                      {previewCols.map((col) => (
                        <td key={col} className="py-2 px-3 text-surface-300 whitespace-nowrap max-w-[200px] truncate" title={row[col]}>
                          {row[col] != null ? row[col] : "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}