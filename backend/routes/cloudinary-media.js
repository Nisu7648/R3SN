const express = require('express');
const router = express.Router();
const CloudinaryIntegration = require('../integrations/cloudinary-media');

const getCloudinary = (req) => new CloudinaryIntegration({
  cloudName: req.body.cloudName || req.headers['x-cloudinary-cloud-name'],
  apiKey: req.body.apiKey || req.headers['x-cloudinary-api-key'],
  apiSecret: req.body.apiSecret || req.headers['x-cloudinary-api-secret']
});

router.post('/upload/image', async (req, res) => {
  try {
    const { file, options } = req.body;
    const cloudinary = getCloudinary(req);
    const result = await cloudinary.uploadImage(file, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/upload/video', async (req, res) => {
  try {
    const { file, options } = req.body;
    const cloudinary = getCloudinary(req);
    const result = await cloudinary.uploadVideo(file, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/upload/raw', async (req, res) => {
  try {
    const { file, options } = req.body;
    const cloudinary = getCloudinary(req);
    const result = await cloudinary.uploadRaw(file, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/assets/:publicId', async (req, res) => {
  try {
    const { resourceType } = req.query;
    const cloudinary = getCloudinary(req);
    const result = await cloudinary.deleteAsset(req.params.publicId, resourceType);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/assets/:publicId', async (req, res) => {
  try {
    const { resourceType } = req.query;
    const cloudinary = getCloudinary(req);
    const result = await cloudinary.getAssetDetails(req.params.publicId, resourceType);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/assets', async (req, res) => {
  try {
    const { resourceType, ...options } = req.query;
    const cloudinary = getCloudinary(req);
    const result = await cloudinary.listAssets(resourceType, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/search', async (req, res) => {
  try {
    const { expression, options } = req.body;
    const cloudinary = getCloudinary(req);
    const result = await cloudinary.searchAssets(expression, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/folders', async (req, res) => {
  try {
    const { path } = req.body;
    const cloudinary = getCloudinary(req);
    const result = await cloudinary.createFolder(path);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/folders/:path', async (req, res) => {
  try {
    const cloudinary = getCloudinary(req);
    const result = await cloudinary.deleteFolder(req.params.path);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/folders', async (req, res) => {
  try {
    const cloudinary = getCloudinary(req);
    const result = await cloudinary.listFolders();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tags/add', async (req, res) => {
  try {
    const { publicId, tag, resourceType } = req.body;
    const cloudinary = getCloudinary(req);
    const result = await cloudinary.addTag(publicId, tag, resourceType);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tags/remove', async (req, res) => {
  try {
    const { publicId, tag, resourceType } = req.body;
    const cloudinary = getCloudinary(req);
    const result = await cloudinary.removeTag(publicId, tag, resourceType);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/transform', async (req, res) => {
  try {
    const { publicId, transformations } = req.body;
    const cloudinary = getCloudinary(req);
    const result = cloudinary.generateTransformationUrl(publicId, transformations);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/usage', async (req, res) => {
  try {
    const cloudinary = getCloudinary(req);
    const result = await cloudinary.getUsage();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
