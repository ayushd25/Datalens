import Dataset from '../models/Dataset.js';
import Insight from '../models/Insight.js';
import { generateGeminiInsights } from '../services/geminiService.js';
import { generateOpenRouterInsights } from '../services/openrouterService.js';
import { buildDataSummary } from '../utils/helpers.js';
import { getCached, setCache, insightCacheKey, hashSchema } from '../services/cacheService.js';

export async function generateInsights(req, res, next) {
  try {
    const { id } = req.params;

    const dataset = await Dataset.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!dataset) {
      return res.status(404).json({
        success: false,
        error: 'Dataset not found.'
      });
    }

    const schemaHash = hashSchema(JSON.stringify(dataset.schema));
    const cacheKey = insightCacheKey(dataset._id.toString(), schemaHash);
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, fromCache: true });
    }

    const dataSummary = buildDataSummary(dataset);

    let insights;
    let model = 'gemini';

    // Try Gemini FIRST (new key has fresh quota)
    try {
      insights = await generateGeminiInsights(
        dataSummary,
        req.user.apiKeyGemini || null
      );
    } catch (geminiError) {
      console.warn('Gemini failed, trying OpenRouter fallback:', geminiError.message);
      // Fallback to OpenRouter
      try {
        insights = await generateOpenRouterInsights(
          dataSummary,
          req.user.apiKeyOpenRouter || null
        );
        model = 'openrouter';
      } catch (orError) {
        return res.status(503).json({
          success: false,
          error: 'AI services are currently unavailable. Please try again in a few minutes.'
        });
      }
    }

    const insight = await Insight.create({
      datasetId: dataset._id,
      userId: req.user._id,
      summary: insights.summary,
      trends: insights.trends || [],
      anomalies: insights.anomalies || [],
      recommendations: insights.recommendations || [],
      rawResponse: JSON.stringify(insights),
      model
    });

    setCache(cacheKey, {
      id: insight._id,
      ...insights,
      model,
      createdAt: insight.createdAt
    });

    res.json({
      success: true,
      data: {
        id: insight._id,
        ...insights,
        model,
        createdAt: insight.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function listInsights(req, res, next) {
  try {
    const { datasetId } = req.query;
    const filter = { userId: req.user._id };
    if (datasetId) filter.datasetId = datasetId;

    const insights = await Insight.find(filter)
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, data: insights });
  } catch (error) {
    next(error);
  }
}

export async function getInsight(req, res, next) {
  try {
    const insight = await Insight.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!insight) {
      return res.status(404).json({
        success: false,
        error: 'Insight not found.'
      });
    }

    res.json({ success: true, data: insight });
  } catch (error) {
    next(error);
  }
}

export async function deleteInsight(req, res, next) {
  try {
    const insight = await Insight.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!insight) {
      return res.status(404).json({
        success: false,
        error: 'Insight not found.'
      });
    }

    res.json({ success: true, message: 'Insight deleted.' });
  } catch (error) {
    next(error);
  }
}