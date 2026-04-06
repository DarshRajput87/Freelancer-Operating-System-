// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register, registerValidation, login, loginValidation, getMe, updateProfile, logout,
  updateApiKey, deleteApiKey,
} = require('../controllers/authController');

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/api-key', protect, updateApiKey);
router.delete('/api-key', protect, deleteApiKey);

module.exports = router;
