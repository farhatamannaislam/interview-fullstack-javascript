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



// Root route
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
