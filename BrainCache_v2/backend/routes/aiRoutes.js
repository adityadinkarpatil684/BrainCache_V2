const express = require('express');
const router = express.Router();
const { summarizeNote } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/summarize/:noteId', summarizeNote);

module.exports = router;
