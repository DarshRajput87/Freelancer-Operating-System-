const Client = require('../models/Client');
const Project = require('../models/Project');

/**
 * @route   GET /api/clients
 * @desc    Get all clients for user
 * @access  Private
 */
const getClients = async (req, res) => {
  const { status, search, tags, sort = '-createdAt', page = 1, limit = 20 } = req.query;

  const query = { user: req.user.id, isArchived: false };

  if (status) query.status = status;
  if (tags) query.tags = { $in: tags.split(',') };
  if (search) {
    query.$text = { $search: search };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [clients, total] = await Promise.all([
    Client.find(query).sort(sort).skip(skip).limit(parseInt(limit)).lean(),
    Client.countDocuments(query),
  ]);

  // Attach project counts
  const clientIds = clients.map((c) => c._id);
  const projectCounts = await Project.aggregate([
    { $match: { client: { $in: clientIds }, user: req.user._id } },
    { $group: { _id: '$client', count: { $sum: 1 } } },
  ]);
  const countMap = {};
  projectCounts.forEach((p) => { countMap[p._id.toString()] = p.count; });

  const enriched = clients.map((c) => ({
    ...c,
    projectCount: countMap[c._id.toString()] || 0,
  }));

  res.status(200).json({
    success: true,
    data: enriched,
    pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
  });
};

/**
 * @route   GET /api/clients/:id
 * @desc    Get single client
 * @access  Private
 */
const getClient = async (req, res) => {
  const client = await Client.findOne({ _id: req.params.id, user: req.user.id });
  if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

  const projects = await Project.find({ client: client._id, user: req.user.id })
    .select('name status budget deadline createdAt')
    .lean();

  res.status(200).json({ success: true, data: { ...client.toObject(), projects } });
};

/**
 * @route   POST /api/clients
 * @desc    Create client
 * @access  Private
 */
const createClient = async (req, res) => {
  const client = await Client.create({ ...req.body, user: req.user.id });
  res.status(201).json({ success: true, data: client });
};

/**
 * @route   PUT /api/clients/:id
 * @desc    Update client
 * @access  Private
 */
const updateClient = async (req, res) => {
  const client = await Client.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
  res.status(200).json({ success: true, data: client });
};

/**
 * @route   DELETE /api/clients/:id
 * @desc    Delete (archive) client
 * @access  Private
 */
const deleteClient = async (req, res) => {
  const client = await Client.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { isArchived: true },
    { new: true }
  );
  if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
  res.status(200).json({ success: true, message: 'Client archived' });
};

/**
 * @route   POST /api/clients/:id/notes
 * @desc    Add note to client
 * @access  Private
 */
const addNote = async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ success: false, message: 'Note content required' });

  const client = await Client.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { $push: { notes: { content, createdBy: req.user.id } } },
    { new: true }
  );
  if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
  res.status(201).json({ success: true, data: client.notes });
};

/**
 * @route   GET /api/clients/stats
 * @desc    Client pipeline stats
 * @access  Private
 */
const getStats = async (req, res) => {
  const stats = await Client.aggregate([
    { $match: { user: req.user._id, isArchived: false } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const pipeline = { Lead: 0, Contacted: 0, 'Proposal Sent': 0, Won: 0, Lost: 0 };
  stats.forEach((s) => { pipeline[s._id] = s.count; });

  const total = Object.values(pipeline).reduce((a, b) => a + b, 0);
  const conversionRate = total > 0 ? ((pipeline.Won / total) * 100).toFixed(1) : 0;

  res.status(200).json({ success: true, data: { pipeline, total, conversionRate } });
};

module.exports = { getClients, getClient, createClient, updateClient, deleteClient, addNote, getStats };
