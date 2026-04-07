const { body } = require('express-validator');
const User = require('../models/User');
const { validate } = require('../middleware/validate');

// Validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  validate,
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

/**
 * Send token response
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: user.toJSON(),
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
const register = async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  const user = await User.create({ name, email, password });
  sendTokenResponse(user, 201, res);
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password +settings.geminiApiKey');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
const getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select('+settings.geminiApiKey');
  res.status(200).json({ success: true, data: user });
};

/**
 * @route   PUT /api/auth/me
 * @desc    Update profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  const allowedFields = ['name', 'settings'];
  const updates = {};
  allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select('+settings.geminiApiKey');
  res.status(200).json({ success: true, data: user });
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout
 * @access  Private
 */
const logout = (req, res) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.status(200).json({ success: true, message: 'Logged out' });
};

/**
 * @route   PUT /api/auth/api-key
 * @desc    Save or update user's Gemini API key
 * @access  Private
 */
const updateApiKey = async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || !apiKey.trim()) {
    return res.status(400).json({ success: false, message: 'API key is required' });
  }

  // Validate the key format (Gemini keys start with "AIza")
  if (!apiKey.startsWith('AIza')) {
    return res.status(400).json({ success: false, message: 'Invalid Gemini API key format. Key should start with "AIza"' });
  }

  const user = await User.setApiKey(req.user.id, apiKey.trim());
  res.status(200).json({ success: true, data: user, message: 'API key saved successfully' });
};

/**
 * @route   DELETE /api/auth/api-key
 * @desc    Remove user's Gemini API key
 * @access  Private
 */
const deleteApiKey = async (req, res) => {
  const user = await User.setApiKey(req.user.id, '');
  res.status(200).json({ success: true, data: user, message: 'API key removed' });
};

module.exports = {
  register,
  registerValidation,
  login,
  loginValidation,
  getMe,
  updateProfile,
  logout,
  updateApiKey,
  deleteApiKey,
};
