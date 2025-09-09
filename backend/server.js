require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg'); // PostgreSQL client

const app = express();

// ------------------- MIDDLEWARE -------------------
app.use(express.json());
app.use(cors());

// ------------------- DATABASE CONNECTION -------------------
const db = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
});

db.connect(err => {
    if (err) console.error('Error connecting to PostgreSQL:', err);
    else console.log('Connected to PostgreSQL database.');
});

// ------------------- API ROUTES -------------------

// GET /movies: Retrieve all movies
app.get('/movies', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM movies');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /movies: Add a new movie
app.post('/movies', async (req, res) => {
    const { title, director, genre, release_year, rating, image_url } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO movies (title, director, genre, release_year, rating, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title, director, genre, release_year, rating, image_url]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /movies/:id: Update an existing movie
app.put('/movies/:id', async (req, res) => {
    const { id } = req.params;
    const { title, director, genre, release_year, rating, image_url } = req.body;
    try {
        await db.query(
            'UPDATE movies SET title=$1, director=$2, genre=$3, release_year=$4, rating=$5, image_url=$6 WHERE id=$7',
            [title, director, genre, release_year, rating, image_url, id]
        );
        res.json({ message: 'Movie updated.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /movies/:id: Delete a movie
app.delete('/movies/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM movies WHERE id=$1', [id]);
        res.json({ message: 'Movie deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------------- SERVE FRONTEND -------------------
const frontendPath = path.join(__dirname, '../frontend/dist'); // adjust if needed
app.use(express.static(frontendPath));

// Wildcard route for React SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// ------------------- START SERVER -------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
