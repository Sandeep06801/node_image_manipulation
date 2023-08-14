const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('images.db'); 
db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT, path TEXT, modified_path TEXT)');
});

module.exports = db;
