// Require an active firm license to download a build
const fs = require('node:fs/promises');
const path = require('node:path');
const dataStore = require('./dataStore');
const licenseService = require('./licenseService');

const DOWNLOAD_DIR = path.join(__dirname, '..', 'downloads');

// Download refusal codes used to select HTTP statuses
const REFUSALS = {
  NOT_FOUND: 'not-found',
  SIGN_IN: 'sign-in',
  ADMIN: 'admin',
  NO_LICENSE: 'no-license',
};

// Releases ordered newest first
async function listReleases() {
  return [...dataStore.store.releases].sort((a, b) => b.releaseDate - a.releaseDate);
}

// Published releases ordered newest first
async function publishedReleases(today = new Date()) {
  const releases = await listReleases();
  return releases.filter((release) => release.isPublished(today));
}

// Return download eligibility with the active license or a refusal reason
async function downloadAccessFor(firm, today = new Date()) {
  if (!firm) {
    return {
      allowed: false,
      code: REFUSALS.SIGN_IN,
      reason: 'Sign in with your firm account to download a build.',
      current: null,
    };
  }
  if (firm.isAdmin()) {
    return {
      allowed: false,
      code: REFUSALS.ADMIN,
      reason: 'An administrator account does not hold a license, so it cannot download a build.',
      current: null,
    };
  }

  const current = await licenseService.currentLicenseOf(firm, today);
  if (!current) {
    return {
      allowed: false,
      code: REFUSALS.NO_LICENSE,
      reason: `${firm.name} has no active license. Choose a license plan to download a build.`,
      current: null,
    };
  }

  return { allowed: true, code: null, reason: null, current };
}

// Mark the latest release and include download eligibility
async function releasesFor(firm, today = new Date()) {
  const [releases, access] = await Promise.all([
    listReleases(),
    downloadAccessFor(firm, today),
  ]);

  return {
    releases: releases.map((release, index) => ({ release, isLatest: index === 0 })),
    access,
  };
}

// Return an authorized build path or a refusal code and reason
async function requestDownload(firm, version, today = new Date()) {
  const release = dataStore.findReleaseByVersion(String(version));
  if (!release) {
    return {
      ok: false,
      code: REFUSALS.NOT_FOUND,
      reason: 'The portal has no release with that version number.',
    };
  }

  const access = await downloadAccessFor(firm, today);
  if (!access.allowed) {
    return { ok: false, code: access.code, reason: access.reason };
  }

  // Use the stored release filename instead of request input
  const filePath = path.join(DOWNLOAD_DIR, release.downloadFile);
  try {
    await fs.access(filePath);
  } catch (err) {
    throw new Error(`The build file for BAIT ${release.version} is missing: ${filePath}`, { cause: err });
  }

  return { ok: true, release, filePath, fileName: release.downloadFile };
}

module.exports = {
  listReleases,
  publishedReleases,
  releasesFor,
  downloadAccessFor,
  requestDownload,
  REFUSALS,
};
