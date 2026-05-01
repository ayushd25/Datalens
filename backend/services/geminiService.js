export async function generateGeminiInsights(dataSummary, apiKey) {
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error('Gemini API key not configured');
  }

  const prompt = `You are a data analyst. Analyze this dataset summary and provide actionable insights.

DATASET SCHEMA (column -> type):
 ${dataSummary.schemaText}

STATISTICS:
 ${dataSummary.statsText}

SAMPLE DATA (first 10 rows):
 ${dataSummary.sampleText}

Total rows: ${dataSummary.totalRows}

Respond ONLY with valid JSON in this exact format, no extra text:
{
  "summary": "A 2-3 sentence executive summary of the dataset.",
  "trends": ["Trend 1", "Trend 2", "Trend 3", "Trend 4"],
  "anomalies": ["Anomaly 1", "Anomaly 2", "Anomaly 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3", "Recommendation 4", "Recommendation 5"]
}

Rules:
- Trends should identify patterns in the data
- Anomalies should flag unusual values or patterns
- Recommendations must be specific and actionable
- Use simple, clear language a business person would understand
- Base everything ONLY on the data provided`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048
      }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Empty response from Gemini');
  }

  let jsonStr = text;
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  try {
    return JSON.parse(jsonStr);
  } catch {
    throw new Error('Failed to parse Gemini response as JSON');
  }
}