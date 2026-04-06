const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getClients, getClient, createClient, updateClient, deleteClient, addNote, getStats,
} = require('../controllers/clientController');

router.use(protect);
router.get('/stats', getStats);
router.route('/').get(getClients).post(createClient);
router.route('/:id').get(getClient).put(updateClient).delete(deleteClient);
router.post('/:id/notes', addNote);

module.exports = router;
