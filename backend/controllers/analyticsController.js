import Dataset from '../models/Dataset.js';
import { buildHistogram, buildCategoryDistribution } from '../services/dataProcessor.js';

export async function getChartData(req, res, next) {
  try {
    const { id } = req.params;
    const { column, chartType } = req.query;

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

    const schema = dataset.schema;
    const data = dataset.data;

    const result = {
      datasetId: dataset._id,
      fileName: dataset.fileName,
      schema: schema,
      columns: dataset.columns,
      charts: {}
    };

    if (column && schema[column] === 'numeric') {
      const values = data.map(r => r[column]);
      result.charts.histogram = buildHistogram(values, chartType === 'pie' ? 8 : 15);
    } else {
      const firstNumeric = dataset.columns.find(c => c.type === 'numeric');
      if (firstNumeric) {
        const values = data.map(r => r[firstNumeric.name]);
        result.charts.histogram = buildHistogram(values, 15);
      }
    }

    const firstCategorical = dataset.columns.find(c => c.type === 'categorical');
    if (firstCategorical) {
      result.charts.categories = buildCategoryDistribution(data, firstCategorical.name);
    }

    if (chartType === 'pie' && firstCategorical) {
      result.charts.pie = buildCategoryDistribution(data, firstCategorical.name);
    }

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getDatasetStats(req, res, next) {
  try {
    const dataset = await Dataset.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!dataset) {
      return res.status(404).json({
        success: false,
        error: 'Dataset not found.'
      });
    }

    res.json({
      success: true,
      data: {
        id: dataset._id,
        fileName: dataset.fileName,
        rowCount: dataset.rowCount,
        columns: dataset.columns,
        schema: dataset.schema,
        stats: dataset.stats
      }
    });
  } catch (error) {
    next(error);
  }
}