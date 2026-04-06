const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const User = require('../models/User');
const { generateInvoicePDF } = require('../services/pdfService');

/**
 * @route   GET /api/invoices
 */
const getInvoices = async (req, res) => {
  const { status, client, sort = '-createdAt', page = 1, limit = 20 } = req.query;
  const query = { user: req.user.id };
  if (status) query.status = status;
  if (client) query.client = client;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [invoices, total] = await Promise.all([
    Invoice.find(query)
      .populate('client', 'name company email')
      .populate('project', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Invoice.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: invoices,
    pagination: { total, page: parseInt(page), limit: parseInt(limit) },
  });
};

/**
 * @route   GET /api/invoices/stats
 */
const getStats = async (req, res) => {
  const stats = await Invoice.aggregate([
    { $match: { user: req.user._id } },
    {
      $group: {
        _id: '$status',
        total: { $sum: '$total' },
        count: { $sum: 1 },
      },
    },
  ]);

  const result = { Paid: { total: 0, count: 0 }, Pending: { total: 0, count: 0 }, Overdue: { total: 0, count: 0 } };
  stats.forEach((s) => { if (result[s._id]) result[s._id] = { total: s.total, count: s.count }; });

  // Monthly revenue (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthly = await Invoice.aggregate([
    { $match: { user: req.user._id, status: 'Paid', paidDate: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$paidDate' }, month: { $month: '$paidDate' } },
        revenue: { $sum: '$total' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.status(200).json({ success: true, data: { ...result, monthly } });
};

/**
 * @route   GET /api/invoices/:id
 */
const getInvoice = async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user.id })
    .populate('client', 'name company email phone address')
    .populate('project', 'name');
  if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
  res.status(200).json({ success: true, data: invoice });
};

/**
 * @route   POST /api/invoices
 */
const createInvoice = async (req, res) => {
  // Generate invoice number
  const count = await Invoice.countDocuments({ user: req.user.id });
  const invoiceNumber = `INV-${String(count + 1).padStart(4, '0')}`;

  // Calculate line item amounts
  const lineItems = (req.body.lineItems || []).map((item) => ({
    ...item,
    amount: item.quantity * item.unitPrice,
  }));

  const invoice = await Invoice.create({
    ...req.body,
    lineItems,
    invoiceNumber,
    user: req.user.id,
  });

  await invoice.populate('client', 'name company email');
  res.status(201).json({ success: true, data: invoice });
};

/**
 * @route   PUT /api/invoices/:id
 */
const updateInvoice = async (req, res) => {
  if (req.body.lineItems) {
    req.body.lineItems = req.body.lineItems.map((item) => ({
      ...item,
      amount: item.quantity * item.unitPrice,
    }));
  }
  if (req.body.status === 'Paid' && !req.body.paidDate) {
    req.body.paidDate = new Date();
  }

  const invoice = await Invoice.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    { new: true, runValidators: true }
  ).populate('client', 'name company email').populate('project', 'name');

  if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

  // Update client total revenue if marked paid
  if (req.body.status === 'Paid') {
    await Client.findByIdAndUpdate(invoice.client._id, { $inc: { totalRevenue: invoice.total } });
  }

  res.status(200).json({ success: true, data: invoice });
};

/**
 * @route   DELETE /api/invoices/:id
 */
const deleteInvoice = async (req, res) => {
  const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
  res.status(200).json({ success: true, message: 'Invoice deleted' });
};

/**
 * @route   GET /api/invoices/:id/pdf
 */
const downloadPDF = async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user.id })
    .populate('client', 'name company email phone address')
    .populate('project', 'name');
  if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

  const user = await User.findById(req.user.id);
  const pdfBuffer = await generateInvoicePDF(invoice, invoice.client, user);

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.pdf"`,
    'Content-Length': pdfBuffer.length,
  });
  res.send(pdfBuffer);
};

module.exports = { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, getStats, downloadPDF };
