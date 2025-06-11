import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

dotenv.config();
const app = express();
const port = parseInt(process.env.PORT || '8000', 10);

app.use(cors());
app.use(express.json());

// Connect to SQLite database
const dbPath = path.resolve(__dirname, 'cities.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('❌ DB connection failed:', err.message);
  else console.log('✅ Connected to SQLite database at', dbPath);
});

// Create table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS cities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  count INTEGER NOT NULL
);`, () => {
  // After table is ready, check if empty
  const citiesJsonPath = path.resolve(__dirname, '..', 'database', 'cities.json');
  db.get('SELECT COUNT(*) AS count FROM cities', (err, row) => {
    if (err) {
      console.error('❌ Failed to count cities:', err.message);
      return;
    }

    const { count } = row as { count: number };

    if (count === 0) {
      console.log('⏳ Importing cities from JSON...');
      const file = fs.readFileSync(citiesJsonPath, 'utf8');
      const cities = JSON.parse(file);
      const insert = db.prepare('INSERT INTO cities (name, count) VALUES (?, ?)');
      for (const city of cities) {
        insert.run(city.cityName, city.count);
      }
      insert.finalize(() => {
        console.log(`✅ Imported ${cities.length} cities into the database.`);
      });
    } else {
      console.log(`ℹ️ Database already has ${count} cities.`);
    }
  });
});

// ✅ GET /api/cities?search=ber&page=1
app.get('/api/cities', (req, res) => {
  const search = (req.query.search as string || '').toLowerCase();
  const page = parseInt(req.query.page as string || '1');
  const pageSize = 5;
  const offset = (page - 1) * pageSize;

  const query = `
    SELECT * FROM cities
    WHERE LOWER(name) LIKE ?
    LIMIT ? OFFSET ?
  `;
  const params = [`%${search}%`, pageSize, offset];

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ results: rows, page });
  });
});

// ✅ POST /api/cities
app.post('/api/cities', (req, res) => {
  const { name, count } = req.body;

  if (!name || typeof count !== 'number') {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const query = `INSERT INTO cities (name, count) VALUES (?, ?)`;
  db.run(query, [name, count], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, name, count });
  });
});

// ✅ GET /api/cities/:id
app.get('/api/cities/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  db.get('SELECT * FROM cities WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'City not found' });
    res.json(row);
  });
});

// ✅ PUT /api/cities/:id
app.put('/api/cities/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, count } = req.body;

  if (!name || typeof count !== 'number') {
    return res.status(400).json({ error: 'Invalid input' });
  }

  db.run(
    'UPDATE cities SET name = ?, count = ? WHERE id = ?',
    [name, count, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'City not found' });
      res.json({ id, name, count });
    }
  );
});

// ✅ DELETE /api/cities/:id
app.delete('/api/cities/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  db.run('DELETE FROM cities WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'City not found' });
    res.status(204).send(); // No content
  });
});


// Root route
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
