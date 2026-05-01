import mongoose from 'mongoose';

const insightSchema = new mongoose.Schema({
  datasetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dataset',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  summary: {
    type: String,
    required: true
  },
  trends: [{
    type: String
  }],
  anomalies: [{
    type: String
  }],
  recommendations: [{
    type: String
  }],
  rawResponse: {
    type: String,
    default: ''
  },
  model: {
    type: String,
    default: 'gemini'
  }
}, {
  timestamps: true
});

export default mongoose.model('Insight', insightSchema);