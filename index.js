const express = require('express');
const routes = require('./routes/routes');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

const createDirectories = () => {
  const directories = ['uploads','previews', 'resized', 'cropped', 'rotated', 'filtered'];

  directories.forEach((directory) => {
    const dirPath = path.join(__dirname, 'public', directory);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
};

createDirectories();

app.use(express.json());
app.use(express.static('public'));
app.use('/', routes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
