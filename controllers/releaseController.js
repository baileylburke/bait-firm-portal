// Load releases and check download access through ReleaseService
const releaseService = require('../services/releaseService');
const { HttpError } = require('../middleware/errorHandlers');

const { REFUSALS } = releaseService;

// Map download refusal codes to HTTP statuses
const REFUSAL_STATUS = {
  [REFUSALS.SIGN_IN]: 401,
  [REFUSALS.ADMIN]: 403,
  [REFUSALS.NO_LICENSE]: 403,
};

async function renderReleases(req, res, { status = 200, refusal = null } = {}) {
  const { releases, access } = await releaseService.releasesFor(req.firm);

  res.status(status).render('releases', {
    pageTitle: 'Releases',
    active: 'releases',
    releases,
    access,
    refusal,
  });
}

// Prevent shared caches from storing licensed downloads
const DOWNLOAD_OPTIONS = {
  cacheControl: false,
  headers: { 'Cache-Control': 'private, no-store' },
};

// Wrap res.download so the controller can await it
function sendFile(res, filePath, fileName) {
  return new Promise((resolve, reject) => {
    res.download(filePath, fileName, DOWNLOAD_OPTIONS, (err) => (err ? reject(err) : resolve()));
  });
}

// GET /releases
async function showReleases(req, res, next) {
  try {
    await renderReleases(req, res);
  } catch (err) {
    next(err);
  }
}

// GET /releases/:version/download
async function download(req, res, next) {
  try {
    const result = await releaseService.requestDownload(req.firm, req.params.version);

    if (!result.ok && result.code === REFUSALS.NOT_FOUND) {
      throw new HttpError(404, result.reason);
    }
    if (!result.ok) {
      // Show the reason returned by the service
      return await renderReleases(req, res, {
        status: REFUSAL_STATUS[result.code] || 403,
        refusal: result.reason,
      });
    }

    await sendFile(res, result.filePath, result.fileName);
  } catch (err) {
    if (res.headersSent) {
      // Log interrupted downloads after the response has started
      console.error(`Download of ${req.originalUrl} did not complete: ${err.message}`);
      return;
    }
    next(err);
  }
}

module.exports = { showReleases, download };
