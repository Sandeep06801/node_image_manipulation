const sharp = require('sharp');
const db = require('../database');
const path = require('path');
const fs = require('fs');
const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  const { originalname } = req.file;
  const filename = Date.now() + '-' + originalname;

  const imagePath = req.file.path;
  const uploadsDir = path.join(__dirname, '..','public', 'uploads');

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  sharp(imagePath)
    .toFile(path.join(uploadsDir, filename), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to process image' });
      }

      const query = 'INSERT INTO images (filename, path) VALUES (?, ?)';
      db.run(query, [filename, imagePath], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to store image in the database' });
        }

        res.status(200).json({ message: 'Image uploaded successfully' });
      });
    });
};

const getImage = (req, res) => {
  const query = 'SELECT * FROM images';
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to retrieve images from the database' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No images found' });
    }

    const images = rows.map((row) => {
      return {
        id: row.id,
        filename: row.filename,
        path: row.path
      };
    });

    res.json(images);
  });
};

const getPreviewImage = (req, res) => {
  const { id } = req.params;

  const query = 'SELECT * FROM images WHERE id = ?';
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to retrieve image from the database' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const previewImagePath = path.join(__dirname, '..','public', 'previews', row.filename);

    sharp(row.path)
      .resize(300)
      .toFile(previewImagePath, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to process image' });
        }

        res.sendFile(previewImagePath);
      });
  });
};

const deleteImage = (req, res) => {
  const { id } = req.params;

  const query = 'SELECT * FROM images WHERE id = ?';
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to retrieve image from the database' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const deleteQuery = 'DELETE FROM images WHERE id = ?';
    db.run(deleteQuery, [id], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to delete image from the database' });
      }

      fs.unlink(row.path, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to delete image file' });
        }

        res.status(200).json({ message: 'Image deleted successfully' });
      });
    });
  });
};

const resizeImage = (req, res) => {
  const { id } = req.params;
  const { width, height } = req.body;

  const query = 'SELECT * FROM images WHERE id = ?';
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to retrieve image from the database' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const resizedImagePath = path.join(__dirname, '..', 'public', 'resized', row.filename);

    sharp(row.path)
      .resize(Number(width), Number(height))
      .toFile(resizedImagePath, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to process image' });
        }
        res.set('Content-Type', 'image/jpeg');
        res.set('Content-Disposition', `attachment; filename="${row.filename}"`);
        res.sendFile(resizedImagePath);
      });
  });
};

const cropImage = (req, res) => {
  const { id } = req.params;
  const { left, top, width, height } = req.body;

  const query = 'SELECT * FROM images WHERE id = ?';
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to retrieve image from the database' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const croppedImagePath = path.join(__dirname, '..','public', 'cropped', row.filename);

    sharp(row.path)
      .extract({ left: Number(left), top: Number(top), width: Number(width), height: Number(height) })
      .toFile(croppedImagePath, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to process image' });
        }

        res.sendFile(croppedImagePath);
      });
  });
};

const rotateImage = (req, res) => {
  const { id } = req.params;
  const { angle } = req.body;

  const query = 'SELECT * FROM images WHERE id = ?';
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to retrieve image from the database' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const rotatedImagePath = path.join(__dirname, '..','public', 'rotated', row.filename);

    sharp(row.path)
      .rotate(Number(angle))
      .toFile(rotatedImagePath, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to process image' });
        }

        res.sendFile(rotatedImagePath);
      });
  });
};

const applyFilter = (req, res) => {
  const { id } = req.params;
  const { filter } = req.body;

  const query = 'SELECT * FROM images WHERE id = ?';
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to retrieve image from the database' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const filteredImagePath = path.join(__dirname, '..','public', 'filtered', row.filename);

    sharp(row.path)
      .modulate({ brightness: Number(filter) })
      .toFile(filteredImagePath, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to process image' });
        }

        res.sendFile(filteredImagePath);
      });
  });
};

const downloadImage = (req, res) => {
  const { id } = req.params;
  const { operation } = req.query;

  const query = 'SELECT * FROM images WHERE id = ?';
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to retrieve image from the database' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Image not found' });
    }

    let modifiedImagePath;
    switch (operation) {
      case 'crop':
        modifiedImagePath = path.join(__dirname, '..', 'public', 'cropped', row.filename);
        break;
      case 'resize':
        modifiedImagePath = path.join(__dirname, '..', 'public', 'resized', row.filename);
        break;
      case 'rotate':
        modifiedImagePath = path.join(__dirname, '..', 'public', 'rotated', row.filename);
        break;
      case 'filter':
        modifiedImagePath = path.join(__dirname, '..', 'public', 'filtered', row.filename);
        break;
      default:
        return res.status(400).json({ error: 'Invalid operation specified' });
    }

    if (!fs.existsSync(modifiedImagePath)) {
      console.log(`Modified image not found: ${modifiedImagePath}`);
      return res.status(404).json({ error: 'Modified image not found' });
    }

    console.log(`Sending downloadable link to the modified image`);

    res.download(modifiedImagePath, row.filename, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to download the modified image' });
      }

      console.log(`Modified image downloaded successfully: ${modifiedImagePath}`);
    });
  });
};

module.exports = {
  uploadImage,
  getImage,
  getPreviewImage,
  deleteImage,
  resizeImage,
  cropImage,
  rotateImage,
  applyFilter,
  downloadImage,
};