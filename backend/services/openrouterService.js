let cachedFreeModel = null;
let modelCacheTime = 0;
const MODEL_CACHE_DURATION = 30 * 60 * 1000;

async function getFreeModel(apiKey) {
  const now = Date.now();
  if (cachedFreeModel && (now - modelCacheTime) < MODEL_CACHE_DURATION) {
    return cachedFreeModel;
  }

  console.log('Fetching available free models from OpenRouter...');

  const response = await fetch('https://openrouter.ai/api/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.status}`);
  }

  const data = await response.json();
  const freeModels = data.data.filter(m =>
    m.id.endsWith(':free') &&
    m.architecture?.modality === 'text->text'
  );

  if (freeModels.length === 0) {
    throw new Error('No free text models available on OpenRouter right now');
  }

  const preferred = [
    'google/gemma-2-9b-it:free',
    'qwen/qwen-2.5-7b-instruct:free',
    'mistralai/mistral-7b-instruct:free',
  ];

  const picked = freeModels.find(m => preferred.includes(m.id)) || freeModels[0];
  cachedFreeModel = picked.id;
  modelCacheTime = now;

  console.log(`Selected free model: ${picked.id}`);
  return picked.id;
}

export async function generateOpenRouterInsights(dataSummary, apiKey) {
  const key = apiKey || process.env.OPENROUTER_API_KEY;

  if (!key || key === 'your-openrouter-key') {
    throw new Error('OpenRouter API key not configured');
  }

  const model = await getFreeModel(key);

  const prompt = `You are a data analyst. Analyze this dataset summary and provide actionable insights.

DATASET SCHEMA: ${dataSummary.schemaText}
STATISTICS: ${dataSummary.statsText}
SAMPLE DATA: ${dataSummary.sampleText}
Total rows: ${dataSummary.totalRows}

Respond ONLY with valid JSON:
{
  "summary": "Executive summary of the dataset.",
  "trends": ["Trend 1", "Trend 2", "Trend 3"],
  "anomalies": ["Anomaly 1", "Anomaly 2"],
  "recommendations": ["Rec 1", "Rec 2", "Rec 3"]
}

Do not include any text outside the JSON object.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
      'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000'
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1500
    })
  });

  if (!response.ok) {
    if (response.status === 404) {
      cachedFreeModel = null;
      modelCacheTime = 0;
    }
    const errText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) throw new Error('Empty response from OpenRouter');

  let jsonStr = text;
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) jsonStr = jsonMatch[1].trim();

  try {
    return JSON.parse(jsonStr);
  } catch {
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) return JSON.parse(objMatch[0]);
    throw new Error('Failed to parse OpenRouter response as JSON');
  }
}