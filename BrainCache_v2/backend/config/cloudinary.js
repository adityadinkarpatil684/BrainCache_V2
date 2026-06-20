const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use memoryStorage — files go into req.file.buffer, we upload manually
const memoryStorage = multer.memoryStorage();

const upload = multer({ storage: memoryStorage });
const uploadAvatar = multer({ storage: memoryStorage });

// Helper: upload a buffer to Cloudinary and return { url, public_id }
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve({ url: result.secure_url, public_id: result.public_id });
    });
    stream.end(buffer);
  });
};

module.exports = { cloudinary, upload, uploadAvatar, uploadToCloudinary };

