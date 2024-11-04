-- Create the database
CREATE DATABASE usof CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
-- CREATE USER 'usof_admin'@'localhost' IDENTIFIED BY 'securepass';

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON usof.* TO 'usof_admin'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Use the database
USE usof;

-- -- Users Table
-- CREATE TABLE `users` (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     login VARCHAR(255) UNIQUE NOT NULL,
--     password_hash VARCHAR(255) NOT NULL,
--     full_name VARCHAR(255) NOT NULL,
--     email VARCHAR(255) UNIQUE NOT NULL,
--     profile_picture VARCHAR(255),
--     email_confirmed BOOLEAN DEFAULT FALSE,
--     rating INT DEFAULT 0,
--     role ENUM('user', 'admin') DEFAULT 'user',
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     INDEX idx_email (email),
--     INDEX idx_login (login)
-- ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- -- Tokens Table
-- CREATE TABLE `tokens` (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     user_id INT,
--     token VARCHAR(255) UNIQUE NOT NULL,
--     token_type ENUM('email_confirmation', 'password_reset') NOT NULL,
--     expires_at TIMESTAMP NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
--     INDEX idx_user_id (user_id)
-- ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- -- Posts Table
-- CREATE TABLE `posts` (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     author_id INT,
--     title VARCHAR(255) NOT NULL,
--     content TEXT NOT NULL,
--     status ENUM('active', 'inactive') DEFAULT 'active',
--     publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
--     INDEX idx_author_id (author_id)
-- ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- -- Categories Table
-- CREATE TABLE `categories` (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     title VARCHAR(255) UNIQUE NOT NULL,
--     description TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- -- Post_Categories Table (Many-to-Many relationship between Posts and Categories)
-- CREATE TABLE `post_categories` (
--     post_id INT,
--     category_id INT,
--     PRIMARY KEY (post_id, category_id),
--     FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
--     FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
--     INDEX idx_post_id (post_id),
--     INDEX idx_category_id (category_id)
-- ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- -- Comments Table
-- CREATE TABLE `comments` (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     post_id INT,
--     author_id INT,
--     content TEXT NOT NULL,
--     status ENUM('active', 'inactive') DEFAULT 'active',
--     publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
--     FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
--     INDEX idx_post_id (post_id),
--     INDEX idx_author_id (author_id)
-- ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- -- Likes Table
-- CREATE TABLE `likes` (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     user_id INT,
--     post_id INT NULL,
--     comment_id INT NULL,
--     type ENUM('like', 'dislike') NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
--     FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
--     FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
--     INDEX idx_user_id (user_id),
--     INDEX idx_post_id (post_id),
--     INDEX idx_comment_id (comment_id)
-- ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- -- Sessions Table (for session control)
-- CREATE TABLE `sessions` (
--     session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
--     expires INT UNSIGNED NOT NULL,
--     user_id INT,  -- Only userId is stored
--     PRIMARY KEY (session_id),
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
--     INDEX idx_user_id (user_id)  -- Index for userId in sessions
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
