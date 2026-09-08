const Template = require('../models/Template');

const templates = [
  {
    title: 'Cinematic Forest Walk',
    description: 'Slow dolly forward through a misty forest with golden hour light.',
    category: 'Cinematic',
    preview: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=900&q=70',
    prompt:
      'Slow cinematic dolly forward through a misty pine forest, sun rays cutting through fog, leaves gently falling, golden hour lighting, 4K cinematic look.',
    settings: {
      model: 'VisionFlow Cinematic',
      aspectRatio: '16:9',
      resolution: '1080p',
      duration: 10,
      motionStrength: 'medium',
      cameraMovement: 'dolly-in',
    },
    featured: true,
  },
  {
    title: 'Product Reveal',
    description: 'A 360° orbit around a hero product with soft studio lighting.',
    category: 'Product Ads',
    preview: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=70',
    prompt:
      'Smooth 360° orbit around a hero product on a clean white pedestal, soft studio lighting, subtle reflections, premium commercial feel.',
    settings: {
      model: 'VisionFlow Cinematic',
      aspectRatio: '1:1',
      resolution: '1080p',
      duration: 5,
      motionStrength: 'low',
      cameraMovement: 'orbit',
    },
    featured: true,
  },
  {
    title: 'TikTok Outfit Change',
    description: 'Quick vertical reveal of a street style look with energy and motion.',
    category: 'Social Media',
    preview: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=70',
    prompt:
      'Vertical 9:16 social-ready clip, confident camera push-in, subject turns and smiles, vibrant street style, energetic and modern.',
    settings: {
      model: 'VisionFlow Fast',
      aspectRatio: '9:16',
      resolution: '1080p',
      duration: 5,
      motionStrength: 'high',
      cameraMovement: 'zoom-in',
    },
  },
  {
    title: 'Anime Sky Drift',
    description: 'Dreamy anime cloudscape with gentle camera pan.',
    category: 'Anime',
    preview: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=900&q=70',
    prompt:
      'Anime-style sky with soft pastel clouds drifting, gentle camera pan, sparkling stars, Studio Ghibli inspired atmosphere.',
    settings: {
      model: 'VisionFlow Cinematic',
      aspectRatio: '16:9',
      resolution: '1080p',
      duration: 10,
      motionStrength: 'medium',
      cameraMovement: 'pan-right',
    },
  },
  {
    title: 'Realistic Portrait Turn',
    description: 'Photorealistic portrait slowly turning toward camera.',
    category: 'Realistic',
    preview: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=900&q=70',
    prompt:
      'Photorealistic portrait of a person slowly turning toward the camera, soft natural light, shallow depth of field, cinematic color grading.',
    settings: {
      model: 'VisionFlow Cinematic',
      aspectRatio: '4:3',
      resolution: '1080p',
      duration: 5,
      motionStrength: 'low',
      cameraMovement: 'static',
    },
  },
  {
    title: 'Fashion Runway',
    description: 'Editorial fashion look walking down a runway.',
    category: 'Fashion',
    preview: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=70',
    prompt:
      'High fashion model striding confidently down a minimalist runway, sharp directional lighting, editorial camera dolly.',
    settings: {
      model: 'VisionFlow Cinematic',
      aspectRatio: '9:16',
      resolution: '1080p',
      duration: 5,
      motionStrength: 'medium',
      cameraMovement: 'dolly-in',
    },
  },
  {
    title: 'Travel Drone Shot',
    description: 'Aerial cinematic over a tropical coastline.',
    category: 'Travel',
    preview: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=70',
    prompt:
      'Aerial cinematic drone shot pulling back from a tropical coastline, turquoise water, white sand, warm sunset light.',
    settings: {
      model: 'VisionFlow Cinematic',
      aspectRatio: '16:9',
      resolution: '1080p',
      duration: 10,
      motionStrength: 'high',
      cameraMovement: 'dolly-out',
    },
  },
  {
    title: 'Nature Time-lapse',
    description: 'Slow zoom into a blooming wildflower field.',
    category: 'Nature',
    preview: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900&q=70',
    prompt:
      'Gentle zoom into a vibrant wildflower meadow, soft wind, golden hour sun, butterflies in the distance.',
    settings: {
      model: 'VisionFlow Motion',
      aspectRatio: '16:9',
      resolution: '720p',
      duration: 5,
      motionStrength: 'low',
      cameraMovement: 'zoom-in',
    },
  },
  {
    title: 'Character Animation',
    description: 'Stylized character walking through a neon city.',
    category: 'Character Animation',
    preview: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=900&q=70',
    prompt:
      'Stylized animated character walking through a rainy neon-lit cyberpunk street, reflective puddles, soft camera follow.',
    settings: {
      model: 'VisionFlow Cinematic',
      aspectRatio: '16:9',
      resolution: '1080p',
      duration: 10,
      motionStrength: 'medium',
      cameraMovement: 'pan-left',
    },
  },
];

async function seedTemplates() {
  const count = await Template.countDocuments();
  if (count > 0) return;
  await Template.insertMany(templates);
  console.log(`✓ Seeded ${templates.length} templates`);
}

if (require.main === module) {
  require('dotenv').config();
  const mongoose = require('mongoose');
  (async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    await seedTemplates();
    await mongoose.disconnect();
    console.log('Done');
  })();
}

module.exports = { seedTemplates };
