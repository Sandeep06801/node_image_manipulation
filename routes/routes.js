const express = require('express');
const multer = require('multer');
const imageController = require('../controllers/imageController');

const router = express.Router();
const upload = multer({ dest: 'public/uploads/' });

router.post('/upload', upload.single('image'), imageController.uploadImage);
router.get('/images', imageController.getImage);
router.get('/image/:id/preview', imageController.getPreviewImage);
router.get('/image/:id/delete', imageController.deleteImage);
router.post('/image/:id/resize', imageController.resizeImage);
router.post('/image/:id/crop', imageController.cropImage);
router.post('/image/:id/rotate', imageController.rotateImage);
router.post('/image/:id/filter', imageController.applyFilter);
router.get('/image/:id/download', imageController.downloadImage);


module.exports = router;