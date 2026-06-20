const UserModel = require('../models/userModel');
const { uploadToCloudinary } = require('../config/cloudinary');

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Upload buffer manually to Cloudinary with avatar-specific options
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'braincache/avatars',
      resource_type: 'image',
      transformation: [{ width: 200, height: 200, crop: 'fill' }]
    });

    await UserModel.updateAvatar(req.user.id, result.url);
    const user = await UserModel.findById(req.user.id);

    res.json({ message: 'Avatar updated', avatar_url: result.url, user });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ message: 'Failed to upload avatar' });
  }
};

const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Upload buffer manually to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'braincache',
      resource_type: 'auto'
    });

    res.json({
      message: 'File uploaded',
      url: result.url,
      public_id: result.public_id,
      original_name: req.file.originalname,
      mimetype: req.file.mimetype
    });
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ message: 'Failed to upload file' });
  }
};

module.exports = { uploadAvatar, uploadFile };
