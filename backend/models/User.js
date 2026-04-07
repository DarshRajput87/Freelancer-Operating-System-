const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Simple AES-256 encryption for API keys at rest
const ENCRYPTION_KEY = (process.env.JWT_SECRET || 'fallback_secret_key_32_bytes!!!').padEnd(32, '0').slice(0, 32);
const IV_LENGTH = 16;

function encrypt(text) {
  if (!text) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
  if (!text) return '';
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encrypted = parts.join(':');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },
    settings: {
      currency: { type: String, default: 'USD' },
      timezone: { type: String, default: 'UTC' },
      hourlyRate: { type: Number, default: 0 },
      businessName: { type: String, default: '' },
      businessAddress: { type: String, default: '' },
      geminiApiKey: { type: String, default: '', select: false },
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLogin: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Compare entered password with hashed
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from JSON responses
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  // Only expose whether key is set, never the actual key
  if (obj.settings) {
    obj.settings.hasGeminiKey = !!obj.settings.geminiApiKey;
    delete obj.settings.geminiApiKey;
  }
  return obj;
};

// Static methods for API key encryption
UserSchema.statics.setApiKey = async function (userId, apiKey) {
  const encrypted = apiKey ? encrypt(apiKey) : '';
  return this.findByIdAndUpdate(userId, { 'settings.geminiApiKey': encrypted }, { new: true }).select('+settings.geminiApiKey');
};

UserSchema.statics.getApiKey = async function (userId) {
  const user = await this.findById(userId).select('+settings.geminiApiKey');
  if (!user?.settings?.geminiApiKey) return null;
  try {
    return decrypt(user.settings.geminiApiKey);
  } catch (_) {
    return null;
  }
};

module.exports = mongoose.model('User', UserSchema);
