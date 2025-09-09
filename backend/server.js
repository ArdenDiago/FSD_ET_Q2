require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
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

// GET /movies: Retrieve all movies
app.get('/movies', (req, res) => {
	db.query('SELECT * FROM movies', (err, results) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json(results);
	});
});

// POST /movies: Add a new movie

app.post('/movies', async (req, res) => {
    try {
        const { title, director, genre, release_year, rating, image_url } = req.body;
        console.log('POST /movies payload:', req.body); // Log incoming data
        db.query(
            'INSERT INTO movies (title, director, genre, release_year, rating, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [title, director, genre, release_year, rating, image_url],
            (err, result) => {
                if (err) {
                    console.error('MySQL error:', err); // Log full error
                    return res.status(500).json({ error: err.message, details: err });
                }
                res.json({ id: result.insertId, ...req.body });
            }
        );
    } catch (err) {
        console.error('POST /movies error:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// PUT /movies/:id: Update an existing movie
app.put('/movies/:id', async (req, res) => {
	try {
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
	} catch (err) {
		console.error('POST /movies error:', err); // Log error to console
		res.status(500).json({ error: 'Internal Server Error', details: err.message });
	}
});

// DELETE /movies/:id: Delete movie
app.delete('/movies/:id', (req, res) => {
	const { id } = req.params;
	db.query('DELETE FROM movies WHERE id=?', [id], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ message: 'Movie deleted.' });
	});
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
