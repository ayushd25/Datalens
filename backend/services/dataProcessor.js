import { Readable } from 'stream';
import csv from 'csv-parser';

export function detectColumnType(values) {
  const sample = values.filter(v => v !== '' && v != null && String(v).trim() !== '').slice(0, 200);
  if (sample.length === 0) return 'empty';

  const numericCount = sample.filter(v => !isNaN(Number(v)) && String(v).trim() !== '').length;
  if (numericCount / sample.length > 0.85) return 'numeric';

  const dateCount = sample.filter(v => {
    const d = new Date(v);
    return !isNaN(d.getTime()) && String(v).length > 4;
  }).length;
  if (dateCount / sample.length > 0.7) return 'date';

  return 'categorical';
}

export function calculateStats(values, type) {
  if (type !== 'numeric') return null;

  const nums = values
    .filter(v => !isNaN(Number(v)) && String(v).trim() !== '')
    .map(Number);

  if (nums.length === 0) return null;

  nums.sort((a, b) => a - b);
  const sum = nums.reduce((acc, n) => acc + n, 0);
  const mean = sum / nums.length;
  const mid = Math.floor(nums.length / 2);
  const median = nums.length % 2 === 0
    ? (nums[mid - 1] + nums[mid]) / 2
    : nums[mid];

  return {
    count: nums.length,
    sum: Math.round(sum * 100) / 100,
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    min: nums[0],
    max: nums[nums.length - 1]
  };
}

export function processCSV(csvBuffer) {
  return new Promise((resolve, reject) => {
    const rows = [];
    const stream = Readable.from(csvBuffer.toString('utf-8'));

    stream
      .pipe(csv({
        skipEmptyLines: true,
        trim: true
      }))
      .on('data', (row) => {
        // Convert empty strings to null
        const cleaned = {};
        for (const [key, val] of Object.entries(row)) {
          cleaned[key.trim()] = (val === '' || val == null) ? null : val.trim();
        }
        rows.push(cleaned);
      })
      .on('end', () => {
        if (rows.length === 0) {
          return reject(new Error('CSV file is empty or has no valid rows'));
        }

        const columnNames = Object.keys(rows[0]);
        const schema = {};
        const stats = {};

        columnNames.forEach(col => {
          const values = rows.map(r => r[col]);
          const type = detectColumnType(values);
          schema[col] = type;

          if (type === 'numeric') {
            stats[col] = calculateStats(values, 'numeric');
          }
        });

        // Store only first 500 rows to keep DB documents manageable
        const previewData = rows.slice(0, 500);

        resolve({
          rows: previewData,
          totalRows: rows.length,
          columns: columnNames,
          schema,
          stats
        });
      })
      .on('error', reject);
  });
}

// Build histogram bins for chart data
export function buildHistogram(values, binCount = 15) {
  const nums = values.filter(v => !isNaN(Number(v))).map(Number);
  if (nums.length === 0) return { labels: [], counts: [] };

  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const range = max - min || 1;
  const binWidth = range / binCount;

  const bins = Array(binCount).fill(0);
  const labels = [];

  for (let i = 0; i < binCount; i++) {
    const lo = min + i * binWidth;
    const hi = lo + binWidth;
    labels.push(lo >= 1000 ? `${(lo/1000).toFixed(1)}K` : lo.toFixed(1));

    nums.forEach(v => {
      if (i === binCount - 1 ? (v >= lo && v <= hi) : (v >= lo && v < hi)) {
        bins[i]++;
      }
    });
  }

  return { labels, counts: bins };
}

// Build category distribution for chart data
export function buildCategoryDistribution(rows, columnName) {
  const counts = {};
  rows.forEach(r => {
    const val = r[columnName] || 'Unknown';
    counts[val] = (counts[val] || 0) + 1;
  });

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  return {
    labels: sorted.map(s => s[0]),
    counts: sorted.map(s => s[1])
  };
}