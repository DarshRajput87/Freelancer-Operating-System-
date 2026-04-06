const Project = require('../models/Project');
const Task = require('../models/Task');
const Proposal = require('../models/Proposal');
const User = require('../models/User');
const aiService = require('../services/aiService');
const { generateProposalPDF } = require('../services/pdfService');

/**
 * Resolve user's Gemini API key from DB (decrypted)
 * Falls back to null if user hasn't set a key (env key will be used)
 */
const getUserApiKey = async (userId) => {
  try {
    return await User.getApiKey(userId);
  } catch (_) {
    return null;
  }
};

/**
 * @route   POST /api/ai/analyze
 * @desc    Analyze raw requirements
 */
const analyzeRequirement = async (req, res) => {
  const { rawRequirement, projectType, projectId, clientId } = req.body;

  if (!rawRequirement?.trim()) {
    return res.status(400).json({ success: false, message: 'rawRequirement is required' });
  }

  const userApiKey = await getUserApiKey(req.user.id);
  const result = await aiService.analyzeRequirement({
    userId: req.user.id,
    rawRequirement,
    projectType,
    refProject: projectId,
    refClient: clientId,
    userApiKey,
  });

  // If projectId provided, update project with structured requirement
  if (projectId) {
    await Project.findOneAndUpdate(
      { _id: projectId, user: req.user.id },
      {
        rawRequirement,
        structuredRequirement: { ...result, analyzedAt: new Date() },
        $push: {
          requirementHistory: {
            raw: rawRequirement,
            structured: result,
            version: 1,
            createdBy: req.user.id,
          },
        },
      }
    );
  }

  res.status(200).json({ success: true, data: result });
};

/**
 * @route   POST /api/ai/proposal
 * @desc    Generate proposal from structured requirement
 */
const generateProposal = async (req, res) => {
  const { structuredRequirement, budget, timeline, clientId, projectId, tone } = req.body;

  if (!structuredRequirement) {
    return res.status(400).json({ success: false, message: 'structuredRequirement is required' });
  }

  const user = await User.findById(req.user.id);

  // Get client name if clientId provided
  let clientName = req.body.clientName;
  let client = null;
  if (clientId) {
    const Client = require('../models/Client');
    client = await Client.findOne({ _id: clientId, user: req.user.id });
    clientName = client?.name;
  }

  const userApiKey = await getUserApiKey(req.user.id);
  const result = await aiService.generateProposal({
    userId: req.user.id,
    structuredRequirement,
    budget,
    timeline,
    clientName,
    freelancerName: user.name,
    projectName: req.body.projectName,
    tone: tone || 'professional',
    refProject: projectId,
    refClient: clientId,
    userApiKey,
  });

  // Auto-save proposal to DB
  const proposal = await Proposal.create({
    user: req.user.id,
    client: clientId,
    project: projectId,
    title: result.title || `Proposal for ${clientName || 'Client'}`,
    content: {
      intro: result.intro,
      understanding: result.understanding,
      scope: result.scope,
      timeline: result.timeline,
      pricing: result.pricing,
      terms: result.terms,
      whyMe: result.whyMe,
    },
    fullContent: Object.values(result).join('\n\n'),
    budget,
    timeline,
    generationInput: { structuredRequirement, budget, timeline, tone },
  });

  res.status(200).json({ success: true, data: { ...result, proposalId: proposal._id } });
};

/**
 * @route   POST /api/ai/tasks
 * @desc    Generate task breakdown and save to DB
 */
const generateTasks = async (req, res) => {
  const { structuredRequirement, techStack, projectId, clientId, autoSave = true } = req.body;

  if (!structuredRequirement) {
    return res.status(400).json({ success: false, message: 'structuredRequirement is required' });
  }

  let projectName = req.body.projectName;
  if (projectId) {
    const project = await Project.findOne({ _id: projectId, user: req.user.id });
    projectName = project?.name;
  }

  const userApiKey = await getUserApiKey(req.user.id);
  const result = await aiService.generateTasks({
    userId: req.user.id,
    structuredRequirement,
    techStack,
    projectName,
    refProject: projectId,
    refClient: clientId,
    userApiKey,
  });

  let savedTasks = [];
  if (autoSave && result.tasks?.length) {
    const taskDocs = result.tasks.map((t, i) => ({
      title: t.title,
      description: t.description,
      estimatedHours: t.estimatedHours,
      priority: t.priority || 'Medium',
      status: 'Todo',
      tags: t.tags || [],
      position: i,
      user: req.user.id,
      project: projectId || undefined,
      client: clientId || undefined,
      isAiGenerated: true,
    }));
    savedTasks = await Task.insertMany(taskDocs);
  }

  res.status(200).json({
    success: true,
    data: { ...result, savedTasks: savedTasks.length, tasks: result.tasks },
  });
};

/**
 * @route   POST /api/ai/reply
 * @desc    Generate client reply
 */
const generateReply = async (req, res) => {
  const { clientMessage, context, tone, clientId, projectId } = req.body;

  if (!clientMessage?.trim()) {
    return res.status(400).json({ success: false, message: 'clientMessage is required' });
  }

  const user = await User.findById(req.user.id);
  let clientName = req.body.clientName;
  if (clientId) {
    const Client = require('../models/Client');
    const client = await Client.findOne({ _id: clientId, user: req.user.id });
    clientName = client?.name;
  }

  const userApiKey = await getUserApiKey(req.user.id);
  const reply = await aiService.generateReply({
    userId: req.user.id,
    clientMessage,
    context,
    tone: tone || 'professional',
    freelancerName: user.name,
    clientName,
    refProject: projectId,
    refClient: clientId,
    userApiKey,
  });

  res.status(200).json({ success: true, data: { reply } });
};

/**
 * @route   GET /api/ai/logs
 * @desc    Get AI usage logs
 */
const getLogs = async (req, res) => {
  const AILog = require('../models/AILog');
  const { type, page = 1, limit = 20 } = req.query;
  const query = { user: req.user.id };
  if (type) query.type = type;

  const logs = await AILog.find(query)
    .sort('-createdAt')
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit))
    .lean();

  const total = await AILog.countDocuments(query);

  // Token usage summary
  const usage = await AILog.aggregate([
    { $match: { user: req.user._id, status: 'success' } },
    { $group: { _id: '$type', totalTokens: { $sum: '$tokensUsed.total' }, count: { $sum: 1 } } },
  ]);

  res.status(200).json({
    success: true,
    data: logs,
    usage,
    pagination: { total, page: parseInt(page), limit: parseInt(limit) },
  });
};

/**
 * @route   GET /api/proposals
 */
const getProposals = async (req, res) => {
  const proposals = await Proposal.find({ user: req.user.id })
    .populate('client', 'name company email')
    .populate('project', 'name')
    .sort('-createdAt');
  res.status(200).json({ success: true, data: proposals });
};

/**
 * @route   GET /api/proposals/:id
 */
const getProposal = async (req, res) => {
  const proposal = await Proposal.findOne({ _id: req.params.id, user: req.user.id })
    .populate('client', 'name company email phone')
    .populate('project', 'name');
  if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });
  res.status(200).json({ success: true, data: proposal });
};

/**
 * @route   PUT /api/proposals/:id
 */
const updateProposal = async (req, res) => {
  const proposal = await Proposal.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    { new: true }
  ).populate('client', 'name company email');
  if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });
  res.status(200).json({ success: true, data: proposal });
};

/**
 * @route   GET /api/proposals/:id/pdf
 */
const downloadProposalPDF = async (req, res) => {
  const proposal = await Proposal.findOne({ _id: req.params.id, user: req.user.id })
    .populate('client')
    .populate('project', 'name');
  if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });

  const user = await User.findById(req.user.id);
  const pdfBuffer = await generateProposalPDF(proposal, proposal.client, user);

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="proposal-${proposal._id}.pdf"`,
    'Content-Length': pdfBuffer.length,
  });
  res.send(pdfBuffer);
};

/**
 * @route   POST /api/ai/freelance-proposal
 * @desc    Generate a short, Upwork/Fiverr-style freelance proposal
 */
const generateFreelanceProposal = async (req, res) => {
  const { jobDescription, clientName, skills, experience, portfolio, tone, customInstructions } = req.body;

  if (!jobDescription?.trim()) {
    return res.status(400).json({ success: false, message: 'jobDescription is required' });
  }

  const userApiKey = await getUserApiKey(req.user.id);
  const result = await aiService.generateFreelanceProposal({
    userId: req.user.id,
    jobDescription,
    clientName,
    skills,
    experience,
    portfolio,
    tone: tone || 'professional',
    customInstructions,
    userApiKey,
  });

  res.status(200).json({ success: true, data: { proposal: result } });
};

/**
 * @route   DELETE /api/proposals/:id
 */
const deleteProposal = async (req, res) => {
  const proposal = await Proposal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });
  res.status(200).json({ success: true, message: 'Proposal deleted' });
};

module.exports = {
  analyzeRequirement, generateProposal, generateTasks, generateReply,
  getLogs, getProposals, getProposal, updateProposal, deleteProposal, downloadProposalPDF,
  generateFreelanceProposal,
};
