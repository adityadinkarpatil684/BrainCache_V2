const express = require('express');
const router = express.Router();
const {
  getNotes, getArchived, getNote, createNote, updateNote,
  deleteNote, togglePin, toggleArchive
} = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.use(protect);

router.get('/', getNotes);
router.get('/archived', getArchived);
router.get('/:id', getNote);
router.post('/', upload.single('media'), createNote);
router.put('/:id', upload.single('media'), updateNote);
router.delete('/:id', deleteNote);
router.patch('/:id/pin', togglePin);
router.patch('/:id/archive', toggleArchive);

module.exports = router;
