const mongoose = require('mongoose');

const AILogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['analyze', 'proposal', 'tasks', 'reply'],
      required: true,
    },
    input: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    output: {
      type: mongoose.Schema.Types.Mixed,
    },
    model: {
      type: String,
      default: 'gpt-4o',
    },
    tokensUsed: {
      prompt: { type: Number, default: 0 },
      completion: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    durationMs: Number,
    status: {
      type: String,
      enum: ['success', 'error'],
      default: 'success',
    },
    error: String,

    // Reference to related entities
    refProject: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    refClient: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  },
  {
    timestamps: true,
  }
);

AILogSchema.index({ user: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('AILog', AILogSchema);
