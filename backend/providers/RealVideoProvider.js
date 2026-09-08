const AIVideoProvider = require('./AIVideoProvider');
const { v4: uuid } = require('uuid');

/**
 * Real provider stub. This class is intentionally a thin wrapper with
 * clearly marked TODO sections so a real Image-to-Video API (e.g.
 * Runway Gen-3, Pika, Stable Video Diffusion, Kling, etc.) can be wired
 * in without changing the rest of the application.
 *
 * Required environment variables when AI_VIDEO_PROVIDER=real:
 *   AI_VIDEO_API_KEY   - API key for the upstream provider
 *   AI_VIDEO_API_BASE  - Base URL of the provider's REST API
 *   AI_VIDEO_MODEL     - Model identifier (optional, defaults configured)
 */
class RealVideoProvider extends AIVideoProvider {
  constructor() {
    super();
    this.apiKey = process.env.AI_VIDEO_API_KEY;
    this.apiBase = process.env.AI_VIDEO_API_BASE;
    this.model = process.env.AI_VIDEO_MODEL || 'visionflow-motion-v1';

    if (!this.apiKey || !this.apiBase) {
      console.warn(
        '[RealVideoProvider] AI_VIDEO_API_KEY or AI_VIDEO_API_BASE is missing. ' +
          'Calls will fail until they are set in your environment.'
      );
    }

    // Optional in-memory cache mapping our internal jobId → upstream jobId.
    this.upstreamJobs = new Map();
  }

  async _request(path, { method = 'GET', body } = {}) {
    // TODO: replace this with a real HTTP client (e.g. undici, axios, fetch).
    // Keep the shape stable so the rest of the application does not need to
    // change when the upstream API is wired in.
    const url = `${this.apiBase}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    };
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Upstream error ${res.status}: ${text}`);
    }
    return res.json();
  }

  async generate(input) {
    // TODO: replace with real provider call. Example shape:
    //
    //   const upstream = await this._request('/v1/videos', {
    //     method: 'POST',
    //     body: {
    //       model: this.model,
    //       prompt: input.prompt,
    //       first_frame_url: input.firstFrame,
    //       last_frame_url: input.lastFrame,
    //       aspect_ratio: input.aspectRatio,
    //       resolution: input.resolution,
    //       duration_seconds: input.duration,
    //       motion_strength: input.motionStrength,
    //       camera_movement: input.cameraMovement,
    //       num_videos: input.numberOfVideos,
    //     },
    //   });
    //   this.upstreamJobs.set(jobId, upstream.id);
    //
    const jobId = `real_${uuid()}`;
    return { jobId, status: 'queued', progress: 0 };
  }

  async getStatus(jobId) {
    // TODO: replace with real provider call. Example shape:
    //
    //   const upstreamId = this.upstreamJobs.get(jobId);
    //   const upstream = await this._request(`/v1/videos/${upstreamId}`);
    //   return {
    //     jobId,
    //     status: upstream.status,        // queued | processing | completed | failed
    //     progress: upstream.progress,
    //     videoUrl: upstream.video_url,
    //     thumbnailUrl: upstream.thumbnail_url,
    //     error: upstream.error,
    //   };
    //
    return { jobId, status: 'queued', progress: 0 };
  }

  async cancel(jobId) {
    // TODO: replace with real provider call.
    return { cancelled: true };
  }
}

module.exports = RealVideoProvider;
