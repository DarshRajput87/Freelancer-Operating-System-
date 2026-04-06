const Client = require('../models/Client');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Invoice = require('../models/Invoice');

/**
 * @route   GET /api/dashboard
 * @desc    Full dashboard stats
 */
const getDashboard = async (req, res) => {
  const userId = req.user._id;

  const [
    clientStats,
    projectStats,
    taskStats,
    invoiceStats,
    recentClients,
    recentProjects,
    upcomingDeadlines,
    monthlyRevenue,
  ] = await Promise.all([
    // Client pipeline
    Client.aggregate([
      { $match: { user: userId, isArchived: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Project status breakdown
    Project.aggregate([
      { $match: { user: userId, isArchived: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Task kanban counts
    Task.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Invoice financial summary
    Invoice.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
          total: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
    ]),

    // Recent 5 clients
    Client.find({ user: userId, isArchived: false })
      .sort('-createdAt')
      .limit(5)
      .select('name company status email createdAt'),

    // Recent 5 projects
    Project.find({ user: userId, isArchived: false })
      .sort('-updatedAt')
      .limit(5)
      .populate('client', 'name company')
      .select('name status budget deadline client progress'),

    // Tasks due in next 7 days
    Task.find({
      user: userId,
      status: { $ne: 'Done' },
      deadline: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 86400000) },
    })
      .sort('deadline')
      .limit(10)
      .populate('project', 'name'),

    // Monthly revenue last 12 months
    Invoice.aggregate([
      {
        $match: {
          user: userId,
          status: 'Paid',
          paidDate: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 11)) },
        },
      },
      {
        $group: {
          _id: { year: { $year: '$paidDate' }, month: { $month: '$paidDate' } },
          revenue: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  // Format response
  const clientPipeline = {};
  clientStats.forEach((s) => { clientPipeline[s._id] = s.count; });

  const projectBreakdown = {};
  projectStats.forEach((s) => { projectBreakdown[s._id] = s.count; });

  const taskBreakdown = {};
  taskStats.forEach((s) => { taskBreakdown[s._id] = s.count; });

  const invoiceBreakdown = {};
  invoiceStats.forEach((s) => { invoiceBreakdown[s._id] = { total: s.total, count: s.count }; });

  const totalClients = Object.values(clientPipeline).reduce((a, b) => a + b, 0);
  const conversionRate = totalClients > 0
    ? (((clientPipeline.Won || 0) / totalClients) * 100).toFixed(1)
    : 0;

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalClients,
        activeProjects: projectBreakdown['In Progress'] || 0,
        pendingTasks: (taskBreakdown['Todo'] || 0) + (taskBreakdown['In Progress'] || 0),
        totalRevenue: invoiceBreakdown['Paid']?.total || 0,
        pendingRevenue: (invoiceBreakdown['Pending']?.total || 0) + (invoiceBreakdown['Overdue']?.total || 0),
        conversionRate: parseFloat(conversionRate),
      },
      clientPipeline,
      projectBreakdown,
      taskBreakdown,
      invoiceBreakdown,
      recentClients,
      recentProjects,
      upcomingDeadlines,
      monthlyRevenue,
    },
  });
};

module.exports = { getDashboard };
