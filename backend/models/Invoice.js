const mongoose = require('mongoose');

const LineItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true },
});

const InvoiceSchema = new mongoose.Schema(
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
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },

    // Auto-incremented invoice number per user
    invoiceNumber: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Paid', 'Pending', 'Overdue', 'Cancelled'],
      default: 'Draft',
    },

    lineItems: [LineItemSchema],

    subtotal: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0, min: 0, max: 100 },
    taxAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },

    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    paidDate: Date,

    notes: String,
    paymentTerms: String,

    // Payment details
    paymentMethod: {
      type: String,
      enum: ['Bank Transfer', 'PayPal', 'Stripe', 'Crypto', 'Cash', 'Other'],
    },
    paymentReference: String,
  },
  {
    timestamps: true,
  }
);

// Auto-calculate totals before saving
InvoiceSchema.pre('save', function (next) {
  this.subtotal = this.lineItems.reduce((sum, item) => sum + item.amount, 0);
  this.taxAmount = (this.subtotal * this.taxRate) / 100;
  this.total = this.subtotal + this.taxAmount - this.discount;
  next();
});

// Auto-set overdue
InvoiceSchema.methods.checkOverdue = function () {
  if (this.status === 'Sent' || this.status === 'Pending') {
    if (new Date() > new Date(this.dueDate)) {
      this.status = 'Overdue';
    }
  }
};

InvoiceSchema.index({ user: 1, status: 1 });
InvoiceSchema.index({ client: 1 });

module.exports = mongoose.model('Invoice', InvoiceSchema);
