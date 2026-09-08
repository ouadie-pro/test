/**
 * AI Video Provider interface.
 * Concrete implementations must implement: generate, getStatus, cancel.
 * @typedef {Object} GenerateInput
 * @property {string} prompt
 * @property {string} firstFrame  URL of the first frame image
 * @property {string} [lastFrame] URL of the last frame image
 * @property {string} model
 * @property {string} aspectRatio
 * @property {string} resolution
 * @property {number} duration
 * @property {number} numberOfVideos
 * @property {string} motionStrength
 * @property {string} cameraMovement
 *
 * @typedef {Object} GenerateResult
 * @property {string} jobId
 * @property {string} status
 * @property {number} progress
 *
 * @typedef {Object} StatusResult
 * @property {string} jobId
 * @property {string} status
 * @property {number} progress
 * @property {string} [videoUrl]
 * @property {string} [thumbnailUrl]
 * @property {string} [error]
 */
class AIVideoProvider {
  /**
   * @param {GenerateInput} input
   * @returns {Promise<GenerateResult>}
   */
  async generate(_input) {
    throw new Error('AIVideoProvider.generate not implemented');
  }

  /**
   * @param {string} jobId
   * @returns {Promise<StatusResult>}
   */
  async getStatus(_jobId) {
    throw new Error('AIVideoProvider.getStatus not implemented');
  }

  /**
   * @param {string} jobId
   * @returns {Promise<{cancelled: boolean}>}
   */
  async cancel(_jobId) {
    throw new Error('AIVideoProvider.cancel not implemented');
  }
}

module.exports = AIVideoProvider;
