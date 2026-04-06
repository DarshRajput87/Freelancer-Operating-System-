const Task = require('../models/Task');

/**
 * @route   GET /api/tasks
 */
const getTasks = async (req, res) => {
  const { project, status, priority, sort = 'position' } = req.query;
  const query = { user: req.user.id };
  if (project) query.project = project;
  if (status) query.status = status;
  if (priority) query.priority = priority;

  const tasks = await Task.find(query)
    .populate('project', 'name status')
    .populate('client', 'name company')
    .sort(sort)
    .lean();

  // Group by status for kanban
  const kanban = { Todo: [], 'In Progress': [], Review: [], Done: [] };
  tasks.forEach((t) => { if (kanban[t.status]) kanban[t.status].push(t); });

  res.status(200).json({ success: true, data: tasks, kanban });
};

/**
 * @route   GET /api/tasks/:id
 */
const getTask = async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user.id })
    .populate('project', 'name status')
    .populate('client', 'name company');
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
  res.status(200).json({ success: true, data: task });
};

/**
 * @route   POST /api/tasks
 */
const createTask = async (req, res) => {
  // Auto-assign position
  const count = await Task.countDocuments({ user: req.user.id, status: req.body.status || 'Todo' });
  const task = await Task.create({ ...req.body, user: req.user.id, position: count });
  await task.populate('project', 'name status');
  res.status(201).json({ success: true, data: task });
};

/**
 * @route   PUT /api/tasks/:id
 */
const updateTask = async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    { new: true, runValidators: true }
  ).populate('project', 'name status');
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
  res.status(200).json({ success: true, data: task });
};

/**
 * @route   DELETE /api/tasks/:id
 */
const deleteTask = async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
  res.status(200).json({ success: true, message: 'Task deleted' });
};

/**
 * @route   POST /api/tasks/bulk
 * @desc    Bulk create tasks (from AI breakdown)
 */
const bulkCreateTasks = async (req, res) => {
  const { tasks, projectId, clientId } = req.body;
  if (!Array.isArray(tasks) || !tasks.length) {
    return res.status(400).json({ success: false, message: 'Tasks array required' });
  }

  const docs = tasks.map((t, i) => ({
    ...t,
    user: req.user.id,
    project: projectId || undefined,
    client: clientId || undefined,
    position: i,
    isAiGenerated: true,
  }));

  const created = await Task.insertMany(docs);
  res.status(201).json({ success: true, data: created, count: created.length });
};

/**
 * @route   PUT /api/tasks/reorder
 * @desc    Update positions after drag-drop
 */
const reorderTasks = async (req, res) => {
  const { updates } = req.body; // [{ id, status, position }]
  if (!Array.isArray(updates)) {
    return res.status(400).json({ success: false, message: 'Updates array required' });
  }

  const ops = updates.map(({ id, status, position }) => ({
    updateOne: {
      filter: { _id: id, user: req.user.id },
      update: { status, position },
    },
  }));

  await Task.bulkWrite(ops);
  res.status(200).json({ success: true, message: 'Tasks reordered' });
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask, bulkCreateTasks, reorderTasks };
