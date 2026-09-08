const Video = require('../models/Video');
const aiVideoService = require('../services/aiVideoService');

function publicUrl(req, value) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  // value like "/uploads/abc.jpg" → full URL
  return `${req.protocol}://${req.get('host')}${value}`;
}

function formatVideo(req, v) {
  if (!v) return null;
  const obj = v.toObject ? v.toObject({ versionKey: false }) : v;
  obj.videoUrl = publicUrl(req, obj.videoUrl);
  obj.thumbnailUrl = publicUrl(req, obj.thumbnailUrl);
  obj.firstFrame = publicUrl(req, obj.firstFrame);
  obj.lastFrame = publicUrl(req, obj.lastFrame);
  return obj;
}

exports.generate = async (req, res, next) => {
  try {
    const {
      prompt,
      enhancedPrompt,
      firstFrame = '',
      lastFrame = '',
      model = 'VisionFlow Motion',
      aspectRatio = '16:9',
      resolution = '720p',
      duration = 5,
      numberOfVideos = 1,
      motionStrength = 'medium',
      cameraMovement = 'static',
      title,
    } = req.body;

    if (!prompt || prompt.trim().length < 3) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }
    if (!firstFrame) {
      return res.status(400).json({ error: 'A first frame image is required.' });
    }

    const credits = aiVideoService.estimateCredits({
      resolution,
      duration,
      model,
      numberOfVideos,
    });

    if (req.user.credits < credits) {
      return res.status(402).json({
        error: "You don't have enough credits to run this generation.",
        code: 'INSUFFICIENT_CREDITS',
        required: credits,
        available: req.user.credits,
      });
    }

    // Deduct credits up front; refund on immediate failure.
    req.user.credits -= credits;
    await req.user.save();

    const video = await Video.create({
      userId: req.user._id,
      title: title || prompt.slice(0, 60),
      prompt: prompt.trim(),
      enhancedPrompt: enhancedPrompt || '',
      firstFrame,
      lastFrame,
      model,
      aspectRatio,
      resolution,
      duration,
      numberOfVideos,
      motionStrength,
      cameraMovement,
      status: 'queued',
      progress: 0,
      creditsUsed: credits,
    });

    try {
      const { jobId } = await aiVideoService.startGeneration(video);
      video.externalJobId = jobId;
      video.status = 'processing';
      await video.save();
    } catch (err) {
      video.status = 'failed';
      video.errorMessage = err.message;
      await video.save();
      req.user.credits += credits;
      await req.user.save();
      return res.status(502).json({ error: 'Failed to start generation', code: 'PROVIDER_ERROR' });
    }

    res.status(201).json({ video: formatVideo(req, video), creditsRemaining: req.user.credits });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const video = await Video.findOne({ _id: req.params.id, userId: req.user._id });
    if (!video) return res.status(404).json({ error: 'Video not found' });

    // If the upstream job reports completion, sync it into the document.
    if (video.status !== 'completed' && video.status !== 'failed' && video.externalJobId) {
      const status = await aiVideoService.pollStatus(video.externalJobId);
      video.progress = status.progress;
      if (status.status === 'completed') {
        video.status = 'completed';
        video.videoUrl = status.videoUrl || video.videoUrl;
        video.thumbnailUrl = status.thumbnailUrl || video.thumbnailUrl;
        video.progress = 100;
      } else if (status.status === 'failed') {
        video.status = 'failed';
        video.errorMessage = status.error || 'Generation failed';
      } else {
        video.status = status.status;
      }
      await video.save();
    }

    res.json({ video: formatVideo(req, video) });
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { status, sort = 'newest' } = req.query;
    const filter = { userId: req.user._id };
    if (status && status !== 'all') filter.status = status;

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'most-viewed': { views: -1, createdAt: -1 },
    };
    const videos = await Video.find(filter).sort(sortMap[sort] || sortMap.newest).limit(200);
    res.json({ videos: videos.map((v) => formatVideo(req, v)) });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const video = await Video.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!video) return res.status(404).json({ error: 'Video not found' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    const video = await Video.findOne({ _id: req.params.id, userId: req.user._id });
    if (!video) return res.status(404).json({ error: 'Video not found' });
    if (video.status === 'completed' || video.status === 'failed' || video.status === 'cancelled') {
      return res.json({ video: formatVideo(req, video) });
    }
    if (video.externalJobId) await aiVideoService.cancel(video.externalJobId).catch(() => {});
    video.status = 'cancelled';
    video.progress = 0;
    await video.save();
    // Refund credits.
    req.user.credits += video.creditsUsed;
    await req.user.save();
    res.json({ video: formatVideo(req, video), creditsRemaining: req.user.credits });
  } catch (err) {
    next(err);
  }
};

exports.retry = async (req, res, next) => {
  try {
    const video = await Video.findOne({ _id: req.params.id, userId: req.user._id });
    if (!video) return res.status(404).json({ error: 'Video not found' });
    if (video.status === 'processing' || video.status === 'queued') {
      return res.status(400).json({ error: 'Generation already in progress' });
    }
    if (req.user.credits < video.creditsUsed) {
      return res.status(402).json({
        error: "You don't have enough credits to retry this generation.",
        code: 'INSUFFICIENT_CREDITS',
      });
    }
    req.user.credits -= video.creditsUsed;
    await req.user.save();

    video.status = 'queued';
    video.progress = 0;
    video.errorMessage = '';
    const { jobId } = await aiVideoService.startGeneration(video);
    video.externalJobId = jobId;
    video.status = 'processing';
    await video.save();
    res.json({ video: formatVideo(req, video), creditsRemaining: req.user.credits });
  } catch (err) {
    next(err);
  }
};

exports.incrementView = async (req, res, next) => {
  try {
    const video = await Video.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!video) return res.status(404).json({ error: 'Video not found' });
    res.json({ ok: true, views: video.views });
  } catch (err) {
    next(err);
  }
};
