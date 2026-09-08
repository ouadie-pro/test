const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: [
        'Cinematic',
        'Product Ads',
        'Social Media',
        'Anime',
        'Realistic',
        'Fashion',
        'Travel',
        'Nature',
        'Character Animation',
      ],
      required: true,
      index: true,
    },
    preview: { type: String, required: true },
    prompt: { type: String, required: true },
    settings: {
      model: { type: String, default: 'VisionFlow Cinematic' },
      aspectRatio: { type: String, default: '16:9' },
      resolution: { type: String, default: '1080p' },
      duration: { type: Number, default: 5 },
      motionStrength: { type: String, default: 'medium' },
      cameraMovement: { type: String, default: 'static' },
    },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Template', templateSchema);
