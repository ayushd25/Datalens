// backend/controllers/dataController.js
import Dataset from '../models/Dataset.js';

// --- Bulletproof CSV Parser ---
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSVString(csvString) {
  const lines = csvString.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && values[0] === '')) continue;
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] !== undefined ? values[index] : '';
    });
    rows.push(row);
  }
  return rows;
}

// --- Schema & Stats ---
function detectSchema(rows) {
  const schema = {};
  const cols = Object.keys(rows[0]);
  cols.forEach(col => {
    const sample = rows.slice(0, 100).map(r => r[col]).filter(v => v !== "" && v != null);
    if (sample.length === 0) { schema[col] = "empty"; return; }
    const numCount = sample.filter(v => !isNaN(Number(v)) && String(v).trim() !== "").length;
    if (numCount / sample.length > 0.85) {
      schema[col] = "numeric";
    } else {
      const dateCount = sample.filter(v => !isNaN(Date.parse(v))).length;
      schema[col] = dateCount / sample.length > 0.7 ? "date" : "categorical";
    }
  });
  return schema;
}

function generateStats(rows, schema) {
  const stats = {};
  for (const [col, type] of Object.entries(schema)) {
    if (type !== "numeric") continue;
    const nums = rows.map(r => Number(r[col])).filter(n => !isNaN(n));
    if (nums.length === 0) continue;
    nums.sort((a, b) => a - b);
    const sum = nums.reduce((a, b) => a + b, 0);
    stats[col] = {
      count: nums.length,
      mean: Math.round((sum / nums.length) * 100) / 100,
      min: nums[0],
      max: nums[nums.length - 1],
      median: nums.length % 2 === 0 
        ? Math.round(((nums[nums.length/2-1] + nums[nums.length/2]) / 2) * 100) / 100 
        : nums[Math.floor(nums.length/2)]
    };
  }
  return stats;
}

// --- Controllers ---
export async function uploadFile(req, res, next) {
  try {
    console.log('--- UPLOAD START ---');
    
    // 1. Check if file exists
    if (!req.file) {
      console.log('❌ FAIL: No file in request');
      return res.status(400).json({ success: false, error: "No file uploaded." });
    }
    console.log('✅ File received:', req.file.originalname, 'Size:', req.file.size);

    // 2. Check if user exists (from authenticate middleware)
    if (!req.user) {
      console.log('❌ FAIL: No user authenticated');
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }
    console.log('✅ User ID:', req.user._id);

    // 3. Parse CSV
    const csvString = req.file.buffer.toString('utf-8');
    const rows = parseCSVString(csvString);

    if (rows.length === 0) {
      console.log('❌ FAIL: Parsed 0 rows');
      return res.status(400).json({ success: false, error: "CSV is empty or invalid." });
    }
    console.log('✅ Parsed rows:', rows.length);

    // 4. Detect schema and stats
    const schemaObj = detectSchema(rows);
    const statsObj = generateStats(rows, schemaObj);

    // 5. Format data EXACTLY to match your Dataset.js Mongoose Schema
    // Your model expects `columns` to be an array of objects: [{ name: "col", type: "numeric" }]
    const columnsArray = Object.entries(schemaObj).map(([name, type]) => ({
      name,
      type // "numeric", "categorical", "date", or "empty"
    }));

    const datasetPayload = {
      userId: req.user._id,
      fileName: req.file.originalname,
      originalSize: req.file.size,
      rowCount: rows.length,
      columns: columnsArray, // Matches your Schema: [{ name, type }]
      schema: schemaObj,     // Matches your Schema: { col: "type" }
      stats: statsObj,       // Matches your Schema: { col: { count, mean... }}
      data: rows             // Matches your Schema: [Object]
    };

    console.log('💾 Saving to MongoDB...');

    // 6. Save to Database
    const dataset = await Dataset.create(datasetPayload);
    
    console.log('🎉 SUCCESS! Saved Dataset ID:', dataset._id);
    
    res.status(201).json({ 
      success: true, 
      data: { dataset } 
    });

  } catch (error) {
    console.log('💥 MONGOOSE/SERVER ERROR:', error.message);
    // If it's a Mongoose validation error, send back the specific fields that failed
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    next(error);
  }
}

export async function getDatasets(req, res, next) {
  try {
    const datasets = await Dataset.find({ userId: req.user._id })
      .select('-data') // Don't send raw data array on list view
      .sort({ createdAt: -1 });
    res.json({ success: true, data: { datasets } });
  } catch (error) { next(error); }
}

export async function getDataset(req, res, next) {
  try {
    const dataset = await Dataset.findOne({ _id: req.params.id, userId: req.user._id });
    if (!dataset) return res.status(404).json({ success: false, error: "Dataset not found." });
    res.json({ success: true, data: { dataset } });
  } catch (error) { next(error); }
}

export async function deleteDataset(req, res, next) {
  try {
    const dataset = await Dataset.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!dataset) return res.status(404).json({ success: false, error: "Dataset not found." });
    res.json({ success: true, message: "Dataset deleted." });
  } catch (error) { next(error); }
}

export async function getChartData(req, res, next) {
  try {
    const { id } = req.params;
    const { column, chartType } = req.query;

    const dataset = await Dataset.findOne({ _id: id, userId: req.user._id });
    if (!dataset) return res.status(404).json({ success: false, error: "Dataset not found" });

    // Extract raw values for the selected column
    const colData = dataset.data.map(row => row[column]).filter(v => v !== "" && v != null);
    
    let histogram = null;
    let categories = null;
    let pie = null;

    // 1. Generate Histogram (For Bar, Line, Area charts)
    if (dataset.schema[column] === 'numeric') {
      const nums = colData.map(Number).filter(n => !isNaN(n));
      if (nums.length > 0) {
        const min = Math.min(...nums);
        const max = Math.max(...nums);
        const binCount = 10;
        const binSize = (max - min) / binCount || 1; // prevent division by 0
        
        const bins = Array(binCount).fill(0);
        const labels = [];
        
        for (let i = 0; i < binCount; i++) {
          const lower = min + i * binSize;
          const upper = lower + binSize;
          labels.push(`${Math.round(lower)}-${Math.round(upper)}`);
        }
        
        nums.forEach(num => {
          let binIndex = Math.floor((num - min) / binSize);
          if (binIndex >= binCount) binIndex = binCount - 1; // handle exact max value
          bins[binIndex]++;
        });

        histogram = { labels, counts: bins };
      }
    }

    // 2. Generate Category Breakdown & Pie Chart Data
    // Find the first categorical column to use for pie/category charts
    const catColObj = dataset.columns.find(c => c.type === 'categorical');
    
    if (catColObj) {
      const catCounts = {};
      dataset.data.forEach(row => {
        const val = row[catColObj.name];
        if (val && val !== "") {
          catCounts[val] = (catCounts[val] || 0) + 1;
        }
      });
      
      // Sort descending and take top 8 for clean visualization
      const sorted = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
      categories = {
        labels: sorted.map(e => e[0]),
        counts: sorted.map(e => e[1])
      };
      
      pie = categories; // Use same data for pie chart
    } else if (dataset.schema[column] === 'categorical') {
      // Fallback: If selected column itself is categorical, use it for the pie
      const catCounts = {};
      colData.forEach(val => {
        if (val) catCounts[val] = (catCounts[val] || 0) + 1;
      });
      const sorted = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
      pie = {
        labels: sorted.map(e => e[0]),
        counts: sorted.map(e => e[1])
      };
    }

    res.json({
      success: true,
      data: {
        charts: { histogram, categories, pie }
      }
    });
  } catch (error) {
    next(error);
  }
}