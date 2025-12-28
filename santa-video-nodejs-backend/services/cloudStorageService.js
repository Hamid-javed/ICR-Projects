const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log(process.env.CLOUDINARY_CLOUD_NAME)
console.log(process.env.CLOUDINARY_API_KEY)
console.log(process.env.CLOUDINARY_API_SECRET)

class CloudStorageService {
  async uploadVideoCloudinary(localFilePath, videoId, childName) {
    const cloudinary = require('cloudinary').v2;

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    try {
      const cleanChildName = childName.replace(/[^a-zA-Z0-9]/g, '');
      const publicId = `${cleanChildName.toLowerCase()}-${videoId}`;

      const uploadResult = await cloudinary.uploader.upload(localFilePath, {
        resource_type: 'video',
        public_id: publicId,
        folder: 'santa-videos',
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        // 🚫 do NOT include timestamp manually here
      });

      console.log(uploadResult)

      try {
        fs.unlinkSync(localFilePath);
        console.log(`✅ Local file cleaned up: ${localFilePath}`);
      } catch (cleanupError) {
        console.warn(`⚠️ Could not clean up local file: ${cleanupError.message}`);
      }

      console.log(`✅ Video uploaded to Cloudinary: ${uploadResult.secure_url}`);
      return uploadResult.secure_url;

    } catch (error) {
      console.error('❌ Cloudinary upload error:', error);
      throw error;
    }
  }

  async uploadVideoToCloud(localFilePath, videoId, childName) {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary configuration not found');
    }
    return await this.uploadVideoCloudinary(localFilePath, videoId, childName);
  }
}

module.exports = new CloudStorageService();
