const AIVideoProvider = require('./AIVideoProvider');
const { v4: uuid } = require('uuid');

/**
 * Demo / development provider. Simulates the entire image-to-video
 * generation pipeline so the application works end-to-end without an
 * external API key.
 */
class MockVideoProvider extends AIVideoProvider {
  constructor() {
    super();
    /** @type {Map<string, {status: string, progress: number, startedAt: number, videoUrl: string, thumbnailUrl: string}>} */
    this.jobs = new Map();

    // Public, royalty-free sample videos used as demo output.
    this.demoVideos = [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    ];

    this.demoThumbnails = [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=70',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=70',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=70',
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=70',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=70',
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=70',
    ];
  }

  pick(arr, seed) {
    return arr[Math.abs(seed) % arr.length];
  }

  async generate(input) {
    const jobId = `mock_${uuid()}`;
    const seed = Date.now();
    const videoUrl = this.pick(this.demoVideos, seed);
    const thumbnailUrl = this.pick(this.demoThumbnails, seed + 1);

    this.jobs.set(jobId, {
      status: 'queued',
      progress: 0,
      startedAt: Date.now(),
      videoUrl,
      thumbnailUrl,
      duration: (input && input.duration) || 5,
    });

    // Simulate progression. Resolves immediately with the queued state.
    return { jobId, status: 'queued', progress: 0 };
  }

  async getStatus(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) {
      // Even if the job was forgotten (server restart), return completed so
      // previously stored records don't appear stuck in the UI.
      return {
        jobId,
        status: 'completed',
        progress: 100,
        videoUrl: this.pick(this.demoVideos, jobId.length),
        thumbnailUrl: this.pick(this.demoThumbnails, jobId.length + 1),
      };
    }

    const elapsed = (Date.now() - job.startedAt) / 1000;
    // Total time scaled to ~6-12 seconds so the demo feels responsive.
    const total = Math.max(6, Math.min(12, (job.duration || 5) * 1.2));
    const pct = Math.min(100, Math.floor((elapsed / total) * 100));

    if (pct < 25) job.status = 'queued';
    else if (pct < 100) job.status = 'processing';
    else job.status = 'completed';

    job.progress = pct;

    return {
      jobId,
      status: job.status,
      progress: job.progress,
      videoUrl: job.status === 'completed' ? job.videoUrl : undefined,
      thumbnailUrl: job.status === 'completed' ? job.thumbnailUrl : undefined,
    };
  }

  async cancel(jobId) {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = 'cancelled';
      job.progress = 0;
    }
    return { cancelled: true };
  }
}

module.exports = MockVideoProvider;
