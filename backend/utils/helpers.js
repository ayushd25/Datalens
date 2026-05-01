export function formatNumber(num) {
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
}

export function formatCurrency(num) {
  return '$' + Number(num).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function buildDataSummary(dataset) {
  const schemaObj = dataset.schema;
  const statsObj = dataset.stats;

  const schemaText = Object.entries(schemaObj)
    .map(([col, type]) => `  ${col}: ${type}`)
    .join('\n');

  const statsText = Object.entries(statsObj)
    .map(([col, s]) => `  ${col}: count=${s.count}, mean=${s.mean}, min=${s.min}, max=${s.max}`)
    .join('\n');

  const sampleRows = dataset.data.slice(0, 10);
  const sampleText = sampleRows
    .map((row, i) => `  Row ${i + 1}: ${JSON.stringify(row)}`)
    .join('\n');

  return {
    schemaText,
    statsText,
    sampleText,
    totalRows: dataset.rowCount
  };
}