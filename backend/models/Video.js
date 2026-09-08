const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'Untitled video' },
    prompt: { type: String, required: true },
    enhancedPrompt: { type: String, default: '' },
    firstFrame: { type: String, default: '' },
    lastFrame: { type: String, default: '' },
    model: { type: String, default: 'VisionFlow Motion' },
    aspectRatio: { type: String, enum: ['16:9', '9:16', '1:1', '4:3'], default: '16:9' },
    resolution: { type: String, enum: ['480p', '720p', '1080p'], default: '720p' },
    duration: { type: Number, enum: [5, 10, 15], default: 5 },
    numberOfVideos: { type: Number, enum: [1, 2, 4], default: 1 },
    motionStrength: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    cameraMovement: {
      type: String,
      enum: ['static', 'zoom-in', 'zoom-out', 'pan-left', 'pan-right', 'orbit', 'dolly-in', 'dolly-out'],
      default: 'static',
    },
    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'queued',
      index: true,
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    videoUrl: { type: String, default: '' },
    thumbnailUrl: { type: String, default: '' },
    errorMessage: { type: String, default: '' },
    externalJobId: { type: String, default: '' },
    creditsUsed: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

videoSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Video', videoSchema);
