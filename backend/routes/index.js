// ─── projects.js ─────────────────────────────────────────────────────────────
const express = require('express');
const projectRouter = express.Router();
const { protect } = require('../middleware/auth');
const { getProjects, getProject, createProject, updateProject, deleteProject } = require('../controllers/projectController');

projectRouter.use(protect);
projectRouter.route('/').get(getProjects).post(createProject);
projectRouter.route('/:id').get(getProject).put(updateProject).delete(deleteProject);

module.exports.projectRouter = projectRouter;

// ─── tasks.js ─────────────────────────────────────────────────────────────────
const taskRouter = express.Router();
const { getTasks, getTask, createTask, updateTask, deleteTask, bulkCreateTasks, reorderTasks } = require('../controllers/taskController');

taskRouter.use(protect);
taskRouter.post('/bulk', bulkCreateTasks);
taskRouter.put('/reorder', reorderTasks);
taskRouter.route('/').get(getTasks).post(createTask);
taskRouter.route('/:id').get(getTask).put(updateTask).delete(deleteTask);

module.exports.taskRouter = taskRouter;

// ─── invoices.js ──────────────────────────────────────────────────────────────
const invoiceRouter = express.Router();
const { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, getStats, downloadPDF } = require('../controllers/invoiceController');

invoiceRouter.use(protect);
invoiceRouter.get('/stats', getStats);
invoiceRouter.route('/').get(getInvoices).post(createInvoice);
invoiceRouter.route('/:id').get(getInvoice).put(updateInvoice).delete(deleteInvoice);
invoiceRouter.get('/:id/pdf', downloadPDF);

module.exports.invoiceRouter = invoiceRouter;

// ─── ai.js ────────────────────────────────────────────────────────────────────
const aiRouter = express.Router();
const {
  analyzeRequirement, generateProposal, generateTasks, generateReply,
  getLogs, getProposals, getProposal, updateProposal, downloadProposalPDF,
  generateFreelanceProposal,
} = require('../controllers/aiController');

aiRouter.use(protect);
aiRouter.post('/analyze', analyzeRequirement);
aiRouter.post('/proposal', generateProposal);
aiRouter.post('/freelance-proposal', generateFreelanceProposal);
aiRouter.post('/tasks', generateTasks);
aiRouter.post('/reply', generateReply);
aiRouter.get('/logs', getLogs);

module.exports.aiRouter = aiRouter;

// ─── proposals.js ─────────────────────────────────────────────────────────────
const proposalRouter = express.Router();
const { deleteProposal } = require('../controllers/aiController');
proposalRouter.use(protect);
proposalRouter.get('/', getProposals);
proposalRouter.get('/:id', getProposal);
proposalRouter.put('/:id', updateProposal);
proposalRouter.delete('/:id', deleteProposal);
proposalRouter.get('/:id/pdf', downloadProposalPDF);

module.exports.proposalRouter = proposalRouter;

// ─── dashboard.js ─────────────────────────────────────────────────────────────
const dashboardRouter = express.Router();
const { getDashboard } = require('../controllers/dashboardController');
dashboardRouter.use(protect);
dashboardRouter.get('/', getDashboard);

module.exports.dashboardRouter = dashboardRouter;
