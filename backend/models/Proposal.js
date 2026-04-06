const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: false,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    title: {
      type: String,
      required: [true, 'Proposal title is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'],
      default: 'Draft',
    },

    // AI-generated content (editable)
    content: {
      intro: { type: String, default: '' },
      understanding: { type: String, default: '' },
      scope: { type: String, default: '' },
      timeline: { type: String, default: '' },
      pricing: { type: String, default: '' },
      terms: { type: String, default: '' },
      whyMe: { type: String, default: '' },
    },

    // Full HTML/text for editing
    fullContent: {
      type: String,
      default: '',
    },

    budget: Number,
    currency: { type: String, default: 'USD' },
    timeline: String,
    validUntil: Date,

    // Input used for AI generation
    generationInput: {
      structuredRequirement: mongoose.Schema.Types.Mixed,
      budget: Number,
      timeline: String,
      tone: String,
    },

    sentAt: Date,
    viewedAt: Date,
    respondedAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Proposal', ProposalSchema);
