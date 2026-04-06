const Project = require('../models/Project');
const Client = require('../models/Client');
const Task = require('../models/Task');

/**
 * @route   GET /api/projects
 */
const getProjects = async (req, res) => {
  const { status, client, sort = '-createdAt', page = 1, limit = 20 } = req.query;
  const query = { user: req.user.id, isArchived: false };
  if (status) query.status = status;
  if (client) query.client = client;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [projects, total] = await Promise.all([
    Project.find(query)
      .populate('client', 'name company email avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Project.countDocuments(query),
  ]);

  // Attach task stats
  const projectIds = projects.map((p) => p._id);
  const taskStats = await Task.aggregate([
    { $match: { project: { $in: projectIds } } },
    { $group: { _id: { project: '$project', status: '$status' }, count: { $sum: 1 } } },
  ]);

  const taskMap = {};
  taskStats.forEach((t) => {
    const pid = t._id.project.toString();
    if (!taskMap[pid]) taskMap[pid] = { total: 0, done: 0 };
    taskMap[pid].total += t.count;
    if (t._id.status === 'Done') taskMap[pid].done += t.count;
  });

  const enriched = projects.map((p) => ({
    ...p,
    taskStats: taskMap[p._id.toString()] || { total: 0, done: 0 },
    progress: taskMap[p._id.toString()]
      ? Math.round((taskMap[p._id.toString()].done / taskMap[p._id.toString()].total) * 100)
      : 0,
  }));

  res.status(200).json({
    success: true,
    data: enriched,
    pagination: { total, page: parseInt(page), limit: parseInt(limit) },
  });
};

/**
 * @route   GET /api/projects/:id
 */
const getProject = async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, user: req.user.id })
    .populate('client', 'name company email phone avatar');
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

  const tasks = await Task.find({ project: project._id }).sort('position status');
  res.status(200).json({ success: true, data: { ...project.toObject(), tasks } });
};

/**
 * @route   POST /api/projects
 */
const createProject = async (req, res) => {
  // Verify client belongs to user
  const client = await Client.findOne({ _id: req.body.client, user: req.user.id });
  if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

  const project = await Project.create({ ...req.body, user: req.user.id });
  await project.populate('client', 'name company email avatar');
  res.status(201).json({ success: true, data: project });
};

/**
 * @route   PUT /api/projects/:id
 */
const updateProject = async (req, res) => {
  // If updating requirements, save version history
  const existing = await Project.findOne({ _id: req.params.id, user: req.user.id });
  if (!existing) return res.status(404).json({ success: false, message: 'Project not found' });

  if (req.body.rawRequirement && req.body.rawRequirement !== existing.rawRequirement) {
    req.body.$push = {
      requirementHistory: {
        raw: existing.rawRequirement,
        structured: existing.structuredRequirement,
        version: existing.requirementHistory.length + 1,
        createdBy: req.user.id,
      },
    };
  }

  const { $push, ...updateData } = req.body;
  const updateOps = { ...updateData };
  if ($push) updateOps.$push = $push;

  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    updateOps,
    { new: true, runValidators: true }
  ).populate('client', 'name company email avatar');

  res.status(200).json({ success: true, data: project });
};

/**
 * @route   DELETE /api/projects/:id
 */
const deleteProject = async (req, res) => {
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { isArchived: true },
    { new: true }
  );
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  res.status(200).json({ success: true, message: 'Project archived' });
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject };
