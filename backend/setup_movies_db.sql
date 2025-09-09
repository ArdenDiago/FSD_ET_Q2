

CREATE DATABASE IF NOT EXISTS movies_db;
USE movies_db;



CREATE TABLE IF NOT EXISTS movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    director VARCHAR(255) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    release_year INT NOT NULL,
    rating DECIMAL(2,1) NOT NULL,
    image_url VARCHAR(500)
);
