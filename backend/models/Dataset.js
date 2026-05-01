import mongoose from 'mongoose';

const datasetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalSize: {
    type: Number,
    default: 0
  },
  rowCount: {
    type: Number,
    default: 0
  },
  columns: [{
    name: String,
    type: {
      type: String,
      enum: ['numeric', 'categorical', 'date', 'empty']
    }
  }],
  schema: {
    type: Object,
    default: {}
  },
  stats: {
    type: Object,
    default: {}
  },
  data: {
    type: [Object],
    default: []
  },
  previewRows: {
    type: Number,
    default: 500
  },
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    version: Number,
    rowCount: Number,
    uploadedAt: Date,
    fileName: String
  }]
}, {
  timestamps: true
});

datasetSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Dataset', datasetSchema);