const mongoose = require('mongoose');

const RequirementVersionSchema = new mongoose.Schema(
  {
    raw: String,
    structured: mongoose.Schema.Types.Mixed,
    version: Number,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const ProjectSchema = new mongoose.Schema(
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
      required: [true, 'Client is required'],
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [200, 'Name too long'],
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Planning', 'In Progress', 'Review', 'Completed', 'On Hold', 'Cancelled'],
      default: 'Planning',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    budget: {
      type: Number,
      default: 0,
      min: [0, 'Budget cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
    },
    startDate: Date,
    deadline: Date,
    completedDate: Date,

    // Requirements
    rawRequirement: {
      type: String,
      trim: true,
    },
    structuredRequirement: {
      features: [String],
      missing: [String],
      risks: [String],
      modules: [String],
      analyzedAt: Date,
    },
    requirementHistory: [RequirementVersionSchema],

    // Tech stack
    techStack: [String],

    tags: [String],

    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
ProjectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
});

ProjectSchema.virtual('invoices', {
  ref: 'Invoice',
  localField: '_id',
  foreignField: 'project',
});

ProjectSchema.index({ user: 1, status: 1 });
ProjectSchema.index({ client: 1 });

module.exports = mongoose.model('Project', ProjectSchema);
