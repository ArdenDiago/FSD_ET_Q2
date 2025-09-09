require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path'); // Needed for serving frontend

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MySQL connection using .env variables
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database.');
});

// ------------------- API ROUTES -------------------

// GET /movies: Retrieve all movies
app.get('/movies', (req, res) => {
    db.query('SELECT * FROM movies', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// POST /movies: Add a new movie
app.post('/movies', (req, res) => {
    const { title, director, genre, release_year, rating, image_url } = req.body;
    db.query(
        'INSERT INTO movies (title, director, genre, release_year, rating, image_url) VALUES (?, ?, ?, ?, ?, ?)',
        [title, director, genre, release_year, rating, image_url],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: result.insertId, ...req.body });
        }
    );
});

// PUT /movies/:id: Update an existing movie
app.put('/movies/:id', (req, res) => {
    const { id } = req.params;
    const { title, director, genre, release_year, rating, image_url } = req.body;
    db.query(
        'UPDATE movies SET title=?, director=?, genre=?, release_year=?, rating=?, image_url=? WHERE id=?',
        [title, director, genre, release_year, rating, image_url, id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Movie updated.' });
        }
    );
});

// DELETE /movies/:id: Delete a movie
app.delete('/movies/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM movies WHERE id=?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Movie deleted.' });
    });
});

// ------------------- SERVE FRONTEND -------------------

// Path to frontend build folder
const frontendPath = path.join(__dirname, '../frontend/dist'); // adjust if needed
app.use(express.static(frontendPath));

// Wildcard route for React SPA
app.get('/:anything', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// ------------------- START SERVER -------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
