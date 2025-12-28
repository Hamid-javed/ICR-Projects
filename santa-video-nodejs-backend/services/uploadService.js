const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const Upload = require('../models/Upload');

class UploadService {
  async processPhotosForVideo(files) {
    const processedPhotos = [];

    for (const file of files) {
      try {
        const photoId = uuidv4();
        const originalPath = file.path;
        const processedPath = path.join(path.dirname(originalPath), `processed-${photoId}.jpg`);

        // Process image with Sharp for video use
        await sharp(originalPath)
          .resize(1920, 1080, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: 85 })
          .toFile(processedPath);

        const photoData = {
          id: photoId,
          originalName: file.originalname,
          originalPath: originalPath,
          processedPath: processedPath,
          size: file.size,
          mimetype: file.mimetype,
          metadata: await this.getImageMetadata(processedPath)
        };

        processedPhotos.push(photoData);
      } catch (error) {
        console.error('Error processing photo:', error);
        throw new Error(`Failed to process photo: ${file.originalname}`);
      }
    }

    return processedPhotos;
  }

  async cleanupPhotos(photos) {
    for (const photo of photos) {
      try {
        // Delete original uploaded file
        if (photo.originalPath && require('fs').existsSync(photo.originalPath)) {
          require('fs').unlinkSync(photo.originalPath);
          console.log(`🗑️ Deleted original photo: ${photo.originalPath}`);
        }
        
        // Delete processed file
        if (photo.processedPath && require('fs').existsSync(photo.processedPath)) {
          require('fs').unlinkSync(photo.processedPath);
          console.log(`🗑️ Deleted processed photo: ${photo.processedPath}`);
        }
      } catch (error) {
        console.warn(`⚠️ Could not delete photo files for ${photo.originalName}:`, error.message);
      }
    }
  }

  async processLetter(file) {
    try {
      const letterId = uuidv4();
      const letterData = {
        id: letterId,
        originalName: file.originalname,
        path: `/uploads/letters/${path.basename(file.path)}`,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date().toISOString(),
      };

      // If it's an image, create a thumbnail
      if (file.mimetype.startsWith('image/')) {
        const thumbnailPath = path.join(path.dirname(file.path), `thumb-${letterId}.jpg`);

        await sharp(file.path).resize(300, 400, { fit: 'inside' }).jpeg({ quality: 80 }).toFile(thumbnailPath);

        letterData.thumbnailPath = `/uploads/letters/${path.basename(thumbnailPath)}`;
      }

      return letterData;
    } catch (error) {
      console.error('Error processing letter:', error);
      throw new Error('Failed to process letter file');
    }
  }

  async editPhoto(photoId, editOptions) {
    try {
      // This would typically load the photo from database
      // For now, we'll simulate the edit process
      const { crop, zoom, rotation } = editOptions;

      const editedPhotoId = uuidv4();
      const editedPath = path.join(__dirname, '../uploads/photos', `edited-${editedPhotoId}.jpg`);

      // Apply edits using Sharp
      let sharpInstance = sharp(`uploads/photos/processed-${photoId}.jpg`);

      if (rotation) {
        sharpInstance = sharpInstance.rotate(rotation);
      }

      if (crop) {
        sharpInstance = sharpInstance.extract({
          left: crop.x,
          top: crop.y,
          width: crop.width,
          height: crop.height,
        });
      }

      if (zoom && zoom !== 1) {
        const metadata = await sharpInstance.metadata();
        const newWidth = Math.round(metadata.width * zoom);
        const newHeight = Math.round(metadata.height * zoom);
        sharpInstance = sharpInstance.resize(newWidth, newHeight);
      }

      await sharpInstance.jpeg({ quality: 85 }).toFile(editedPath);

      return {
        id: editedPhotoId,
        path: `/uploads/photos/edited-${editedPhotoId}.jpg`,
        editOptions,
      };
    } catch (error) {
      console.error('Error editing photo:', error);
      throw new Error('Failed to edit photo');
    }
  }

  async getImageMetadata(imagePath) {
    try {
      const metadata = await sharp(imagePath).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        hasAlpha: metadata.hasAlpha,
      };
    } catch (error) {
      console.error('Error getting image metadata:', error);
      return null;
    }
  }
}

module.exports = new UploadService();

