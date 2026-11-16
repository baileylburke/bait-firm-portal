// ReleaseService checks download access and returns a reason when access is denied
const express = require('express');
const releaseController = require('../controllers/releaseController');

const router = express.Router();

router.get('/releases', releaseController.showReleases);
router.get('/releases/:version/download', releaseController.download);

module.exports = router;
