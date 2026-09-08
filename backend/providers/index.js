const MockVideoProvider = require('./MockVideoProvider');
const RealVideoProvider = require('./RealVideoProvider');

/**
 * Factory that returns the active AI video provider based on the
 * AI_VIDEO_PROVIDER environment variable. To switch to a real provider:
 *
 *   1. Implement the TODO sections in RealVideoProvider.js
 *   2. Set AI_VIDEO_PROVIDER=real in your .env
 *   3. Set AI_VIDEO_API_KEY and AI_VIDEO_API_BASE
 */
function getProvider() {
  const name = (process.env.AI_VIDEO_PROVIDER || 'mock').toLowerCase();
  switch (name) {
    case 'real':
      return new RealVideoProvider();
    case 'mock':
    default:
      return new MockVideoProvider();
  }
}

module.exports = { getProvider };
