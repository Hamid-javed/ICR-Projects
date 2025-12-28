const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const sharp = require('sharp');
const cloudStorageService = require('../services/cloudStorageService');
const Order = require('../models/Order');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = file.fieldname === "letter" ? "uploads/letters" : "uploads/photos";
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
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
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "photos") {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed for photos"));
      }
    } else if (file.fieldname === "letter") {
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


const videoGenerationController = {
  // Single endpoint to collect all user data and generate video
  createVideo: [
    upload.fields([
      { name: 'photos', maxCount: 4 },
      { name: 'letter', maxCount: 1 }
    ]),
    async (req, res) => {
      try {
        const {
          childName,
          parentEmail,
          templateId,
          selectedScripts,
          goodbyeScript,
          videoName // <-- new parameter
        } = req.body;

        // Validate required fields
        if (!childName) {
          return res.status(400).json({
            error: "Child name is required"
          });
        }

        if (!parentEmail) {
          return res.status(400).json({
            error: "Parent email is required"
          });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(parentEmail)) {
          return res.status(400).json({
            error: "Invalid email format"
          });
        }

        if (!templateId) {
          return res.status(400).json({
            error: "Template ID is required"
          });
        }

        if (!selectedScripts) {
          return res.status(400).json({
            error: "At least one script must be selected"
          });
        }

        // Parse selectedScripts if it's a string and convert single ID to array
        let scriptsArray;
        try {
          // Handle string input (from form data)
          if (typeof selectedScripts === 'string') {
            // Check if it's a JSON string array
            if (selectedScripts.startsWith('[')) {
              scriptsArray = JSON.parse(selectedScripts);
            } else {
              // Single script ID
              scriptsArray = [selectedScripts];
            }
          } else if (Array.isArray(selectedScripts)) {
            // Already an array
            scriptsArray = selectedScripts;
          } else if (typeof selectedScripts === 'number') {
            // Convert number to string
            scriptsArray = [selectedScripts.toString()];
          } else {
            throw new Error('Invalid scripts format');
          }
        } catch (e) {
          return res.status(400).json({
            error: "Invalid scripts format",
            message: "Selected scripts must be a script ID or an array of script IDs"
          });
        }

        // Validate photos (1-4 required)
        const photos = req.files?.photos || [];
        if (photos.length === 0) {
          return res.status(400).json({
            error: "At least 1 photo is required"
          });
        }

        if (photos.length > 4) {
          return res.status(400).json({
            error: "Maximum 4 photos allowed"
          });
        }

        // Get letter file if uploaded
        const letter = req.files?.letter ? req.files.letter[0] : null;

        // Load templates and scripts data
        const templatesPath = path.join(__dirname, '../data/templates.json');
        const scriptsPath = path.join(__dirname, '../data/scripts.json');

        if (!fs.existsSync(templatesPath) || !fs.existsSync(scriptsPath)) {
          return res.status(500).json({
            error: "Required data files not found"
          });
        }

        const templates = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
        const scripts = JSON.parse(fs.readFileSync(scriptsPath, 'utf8'));

        // Find selected template
        const template = templates.find(t => t.id === templateId);
        if (!template) {
          return res.status(404).json({
            error: "Template not found",
            availableTemplates: templates.map(t => ({ id: t.id, name: t.name }))
          });
        }

        // Find selected scripts with better error handling
        const selectedScriptData = [];
        for (const scriptId of scriptsArray) {
          const script = scripts.find(s => s.id === scriptId);
          if (!script) {
            return res.status(404).json({
              error: "Script not found",
              message: `Script with ID ${scriptId} not found`,
              availableScripts: scripts.map(s => ({ id: s.id, category: s.category }))
            });
          }
          selectedScriptData.push(script);
        }

        // Find goodbye script
        let goodbyeScriptData = null;
        if (goodbyeScript) {
          goodbyeScriptData = scripts.find(s => s.id === goodbyeScript);
        }

        // Process uploaded photos
        const processedPhotos = await Promise.all(
          photos.map(async (photo, index) => {
            const processedPath = path.join(
              path.dirname(photo.path),
              `processed-${path.basename(photo.path)}`
            );

            // Resize and optimize photo
            await sharp(photo.path)
              .resize(800, 600, {
                fit: 'cover',
                position: 'center'
              })
              .jpeg({ quality: 85 })
              .toFile(processedPath);

            return {
              original: photo.path,
              processed: processedPath,
              index: index
            };
          })
        );

        // --- Video selection logic ---
        let baseVideoPath = null;
        if (videoName) {
          const candidatePath = path.join(__dirname, '../data/video', videoName);
          if (fs.existsSync(candidatePath)) {
            baseVideoPath = candidatePath;
          } else {
            return res.status(404).json({
              error: 'Selected video not found',
              message: `No video named ${videoName} in data/video/`
            });
          }
        }

        // Generate unique video ID (use childName for output as requested)
        const safeChildName = childName.replace(/[^a-zA-Z0-9_-]/g, '_');
        const videoId = uuidv4();
        const outputPath = path.join(__dirname, '../uploads/videos', `${safeChildName}.mp4`);

        // Ensure video directory exists
        const videoDir = path.dirname(outputPath);
        if (!fs.existsSync(videoDir)) {
          fs.mkdirSync(videoDir, { recursive: true });
        }

        await generateVideoWithFFmpeg({
          videoId,
          childName,
          template,
          selectedScriptData,
          goodbyeScriptData,
          processedPhotos,
          letter,
          outputPath,
          baseVideoPath, // pass to helper
          audioPath: path.join(__dirname, '../uploads/audio', `${childName}.mp3`)
        });

        console.log(`🎬 Video generation completed: ${outputPath}`);

        // Upload video to cloud storage
        let cloudVideoUrl;
        try {
          console.log('☁️ Uploading video to cloud storage...');
          cloudVideoUrl = await cloudStorageService.uploadVideoToCloud(
            outputPath,
            videoId,
            childName
          );
          console.log(`✅ Video uploaded to cloud: ${cloudVideoUrl}`);
        } catch (cloudError) {
          console.error('❌ Cloud upload failed:', cloudError.message);
          // Use local URL as fallback
          cloudVideoUrl = `/uploads/videos/video-${videoId}.mp4`;
        }



        // Clean up processed photos
        try {
          for (const photo of processedPhotos) {
            if (fs.existsSync(photo.processed)) {
              fs.unlinkSync(photo.processed);
            }
            if (fs.existsSync(photo.original)) {
              fs.unlinkSync(photo.original);
            }
          }
          console.log('✅ Temporary files cleaned up');
        } catch (cleanupError) {
          console.warn('⚠️ File cleanup warning:', cleanupError.message);
        }

        const order = await Order.create({
          videoId: videoId,
          videoUrl: cloudVideoUrl,
          childName: childName,
          parentEmail: parentEmail,
          template: {
            id: template.id,
            name: template.name
          },
          scripts: selectedScriptData.map(s => ({
            id: s.id,
            category: s.category,
            text: s.text.replace('{{childName}}', childName)
          })),
          goodbyeScript: goodbyeScriptData ? {
            id: goodbyeScriptData.id,
            text: goodbyeScriptData.text.replace('{{childName}}', childName)
          } : null,
          photos: processedPhotos.length,
          hasLetter: !!letter,
          emailSent: true,
          cloudStored: cloudVideoUrl.startsWith('https://'),
          createdAt: new Date().toISOString()
        })

        order.save()

        res.json({
          success: true,
          message: "Video generated and sent to email successfully!",
          data: {
            orderId: order._id,
            videoId: videoId,
            videoUrl: cloudVideoUrl,
            childName: childName,
            parentEmail: parentEmail,
            template: {
              id: template.id,
              name: template.name
            },
            scripts: selectedScriptData.map(s => ({
              id: s.id,
              category: s.category,
              text: s.text.replace('{{childName}}', childName)
            })),
            goodbyeScript: goodbyeScriptData ? {
              id: goodbyeScriptData.id,
              text: goodbyeScriptData.text.replace('{{childName}}', childName)
            } : null,
            photos: processedPhotos.length,
            hasLetter: !!letter,
            emailSent: true,
            cloudStored: cloudVideoUrl.startsWith('https://'),
            createdAt: new Date().toISOString()
          }
        });

      } catch (error) {
        console.error('Video generation error:', error);
        res.status(500).json({
          error: error.message,
          message: "Failed to generate video"
        });
      }
    }
  ]
};


function ffmpegEscapePath(filePath) {
  return `'${filePath.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "'\\''")}'`;
}


async function generateVideoWithFFmpeg(options) {
  const {
    videoId,
    childName,
    selectedScriptData,
    goodbyeScriptData,
    processedPhotos,
    outputPath,
    baseVideoPath,
    audioPath
  } = options;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const tempDir = path.dirname(outputPath);
  const concatVideoPath = path.join(tempDir, `${videoId}-concat.mp4`);
  const introAudioPath = path.join(__dirname, `../uploads/audio/${childName}-intro.mp3`);
  const mainAudioPath = audioPath;
  const concatAudioPath = path.join(tempDir, `${videoId}-audio-concat.mp3`);
  const subtitlesPath = path.join(tempDir, `${videoId}-subtitles.srt`);

  await new Promise((resolve, reject) => {
    if (!processedPhotos.length) return reject(new Error('No processed photos for overlay.'));

    const command = ffmpeg(baseVideoPath);

    processedPhotos.forEach(photo => {
      command.input(photo.processed);
    });

    const filterComplex = [];
    let lastOutput = '0:v';

    processedPhotos.forEach((photo, idx) => {
      const inputIndex = idx + 1;
      const outputLabel = `v${idx}`;

      filterComplex.push(`[${inputIndex}:v]scale=300:-1[scaled${idx}]`);

      let position;
      switch (idx % 4) {
        case 0: position = '10:10'; break;
        case 1: position = 'W-w-10:10'; break;
        case 2: position = '10:H-h-10'; break;
        case 3: position = 'W-w-10:H-h-10'; break;
      }

      filterComplex.push(
        `[${lastOutput}][scaled${idx}]overlay=${position}:enable='between(t,${idx * 5},${(idx + 1) * 5})'[${outputLabel}]`
      );

      lastOutput = outputLabel;
    });

    command
      .complexFilter(filterComplex, [lastOutput])
      .outputOptions([
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        '-pix_fmt', 'yuv420p'
      ])
      .on('start', (cmd) => console.log('FFmpeg overlay command:', cmd))
      .on('error', (err) => {
        console.error('FFmpeg overlay error:', err);
        reject(err);
      })
      .on('end', resolve);

    command.output(concatVideoPath).run();
  });

  let audioConcatList = '';
  if (fs.existsSync(introAudioPath)) {
    audioConcatList += `file '${introAudioPath.replace(/\\/g, '/')}'\n`;
  }
  audioConcatList += `file '${mainAudioPath.replace(/\\/g, '/')}'\n`;
  const audioListPath = path.join(tempDir, `${videoId}-audio-list.txt`);
  fs.writeFileSync(audioListPath, audioConcatList);
  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(audioListPath)
      .inputOptions(['-f', 'concat', '-safe', '0'])
      .outputOptions(['-c', 'copy', '-y'])
      .output(concatAudioPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
  fs.unlinkSync(audioListPath);

  const allScripts = [...selectedScriptData];
  if (goodbyeScriptData) allScripts.push(goodbyeScriptData);
  let srtContent = '';
  let currentTime = 0;
  const scriptDuration = 4;
  allScripts.forEach((script, idx) => {
    const start = currentTime;
    const end = currentTime + scriptDuration;
    const text = script.text.replace(/\{\{childName\}\}/g, childName);
    const formatTime = (s) => {
      const h = String(Math.floor(s / 3600)).padStart(2, '0');
      const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
      const sec = String(Math.floor(s % 60)).padStart(2, '0');
      return `${h}:${m}:${sec},000`;
    };
    srtContent += `${idx + 1}\n${formatTime(start)} --> ${formatTime(end)}\n${text}\n\n`;
    currentTime = end;
  });
  fs.writeFileSync(subtitlesPath, srtContent);

  await new Promise((resolve, reject) => {
    ffmpeg(concatVideoPath)
      .input(concatAudioPath)
      .outputOptions([
        '-map', '0:v:0',
        '-map', '1:a:0',
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-shortest',
        '-y'
      ])
      .videoFilters([
        `subtitles=${ffmpegEscapePath(subtitlesPath)}`
      ])

      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });

  [concatVideoPath, concatAudioPath, subtitlesPath].forEach(f => {
    if (fs.existsSync(f)) fs.unlinkSync(f);
  });
}

module.exports = videoGenerationController;
