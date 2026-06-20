const express = require('express');
const router = express.Router();
const { uploadAvatar, uploadFile } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const { upload, uploadAvatar: avatarUpload } = require('../config/cloudinary');

router.use(protect);

router.post('/avatar', avatarUpload.single('avatar'), uploadAvatar);
router.post('/file', upload.single('file'), uploadFile);

module.exports = router;
