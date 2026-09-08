const { getProvider } = require('../providers');

/**
 * Thin orchestration layer around the active AI provider. Responsible
 * for credit math, status polling lifecycle, and provider-agnostic error
 * handling.
 */
class AIVideoService {
  constructor() {
    this.provider = getProvider();
  }

  /**
   * Calculate credit cost for a generation request.
   * Higher resolution, longer duration, premium models and multiple
   * outputs all increase the cost.
   */
  estimateCredits({ resolution = '720p', duration = 5, model = 'VisionFlow Motion', numberOfVideos = 1 }) {
    let base = 40;
    if (resolution === '480p') base = 30;
    else if (resolution === '720p') base = 60;
    else if (resolution === '1080p') base = 120;

    const durationFactor = duration / 5; // 5s = x1, 10s = x2, 15s = x3
    let modelFactor = 1;
    if (model === 'VisionFlow Cinematic') modelFactor = 1.5;
    else if (model === 'VisionFlow Fast') modelFactor = 0.6;

    return Math.ceil(base * durationFactor * modelFactor * numberOfVideos);
  }

  async startGeneration(videoDoc) {
    return this.provider.generate({
      prompt: videoDoc.prompt,
      firstFrame: videoDoc.firstFrame,
      lastFrame: videoDoc.lastFrame,
      model: videoDoc.model,
      aspectRatio: videoDoc.aspectRatio,
      resolution: videoDoc.resolution,
      duration: videoDoc.duration,
      numberOfVideos: videoDoc.numberOfVideos,
      motionStrength: videoDoc.motionStrength,
      cameraMovement: videoDoc.cameraMovement,
    });
  }

  async pollStatus(jobId) {
    return this.provider.getStatus(jobId);
  }

  async cancel(jobId) {
    return this.provider.cancel(jobId);
  }
}

module.exports = new AIVideoService();
