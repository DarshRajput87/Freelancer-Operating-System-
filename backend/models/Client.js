const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const ClientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
      maxlength: [150, 'Name too long'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Lead', 'Contacted', 'Proposal Sent', 'Won', 'Lost'],
      default: 'Lead',
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    notes: [NoteSchema],
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zip: String,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    source: {
      type: String,
      enum: ['Referral', 'LinkedIn', 'Upwork', 'Website', 'Cold Outreach', 'Other'],
      default: 'Other',
    },
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

// Virtual: projects count
ClientSchema.virtual('projects', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'client',
  count: true,
});

// Text search index
ClientSchema.index({ name: 'text', company: 'text', email: 'text' });

module.exports = mongoose.model('Client', ClientSchema);
