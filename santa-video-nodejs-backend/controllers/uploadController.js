const multer = require("multer");
const path = require("path");
const Upload = require("../models/Upload");
const uploadService = require("../services/uploadService");
require("dotenv").config();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = file.fieldname === "letter" ? "uploads/letters" : "uploads/photos";
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "photos") {
      // Accept only images
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed for photos"));
      }
    } else if (file.fieldname === "letter") {
      // Accept PDF and images for letters
      if (file.mimetype === "application/pdf" || file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only PDF and image files are allowed for letters"));
      }
    } else {
      cb(new Error("Invalid field name"));
    }
  },
});

const uploadController = {
  // Upload child photos (1-4 photos maximum)
  uploadPhotos: [upload.array("photos", 4), async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No photos uploaded" });
      }

      if (req.files.length > 4) {
        return res.status(400).json({ error: "Maximum 4 photos allowed" });
      }

      const processedPhotos = await uploadService.processPhotos(req.files);

      const photoRecords = await Promise.all(
        processedPhotos.map(async (photoData) => {
          const uploadRecord = new Upload({
            originalName: photoData.originalName,
            filename: photoData.filename || photoData.id,
            path: photoData.processedPath,
            mimetype: photoData.mimetype,
            size: photoData.size,
            fileType: "photo",
            metadata: photoData.metadata,
            processed: true,
            processedPath: photoData.processedPath,
            storage_type: 'local'
          });
          await uploadRecord.save();
          return {
            ...uploadRecord.toObject(),
            ...photoData
          };
        })
      );

      res.json({
        success: true,
        photos: photoRecords,
        message: `${photoRecords.length} photo(s) uploaded successfully`
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }],

  // Upload Santa letter
  uploadLetter: [upload.single("letter"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No letter file uploaded" });
      }

      const uploadRecord = new Upload({
        originalName: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
        fileType: "letter"
      });
      await uploadRecord.save();

      res.json({
        success: true,
        letter: uploadRecord,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }],

  // Edit photo with crop/zoom functionality
  editPhoto: async (req, res) => {
    try {
      const { photoId } = req.params;
      const { crop, zoom, rotation, brightness, contrast } = req.body;

      // Find the photo record
      const photoRecord = await Upload.findById(photoId);
      if (!photoRecord || photoRecord.fileType !== 'photo') {
        return res.status(404).json({ error: "Photo not found" });
      }

      // Apply edits using uploadService
      const editedPhoto = await uploadService.editPhoto(photoRecord._id, {
        crop,
        zoom,
        rotation,
        brightness,
        contrast
      });

      // Update photo record with edit settings
      photoRecord.editSettings = {
        crop: crop || photoRecord.editSettings?.crop,
        zoom: zoom || photoRecord.editSettings?.zoom || 1,
        rotation: rotation || photoRecord.editSettings?.rotation || 0,
        brightness: brightness || photoRecord.editSettings?.brightness || 1,
        contrast: contrast || photoRecord.editSettings?.contrast || 1
      };

      if (editedPhoto.path) {
        photoRecord.processedPath = editedPhoto.path;
      }

      await photoRecord.save();

      res.json({
        success: true,
        photo: {
          ...photoRecord.toObject(),
          editedPath: editedPhoto.path
        },
        message: "Photo edited successfully"
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get photo preview with current edits
  previewPhoto: async (req, res) => {
    try {
      const { photoId } = req.params;
      const photoRecord = await Upload.findById(photoId);

      if (!photoRecord || photoRecord.fileType !== 'photo') {
        return res.status(404).json({ error: "Photo not found" });
      }

      res.json({
        success: true,
        photo: {
          id: photoRecord._id,
          originalPath: photoRecord.path,
          processedPath: photoRecord.processedPath,
          editSettings: photoRecord.editSettings,
          metadata: photoRecord.metadata
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = uploadController;
