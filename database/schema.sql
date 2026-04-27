-- =====================================
-- CREATE DATABASE
-- =====================================
CREATE DATABASE IF NOT EXISTS uplift_gym;
USE uplift_gym;

-- =====================================
-- USERS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS users (
    user_ID INT PRIMARY KEY AUTO_INCREMENT,

    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,

    dob DATE,
    street VARCHAR(100),
    city VARCHAR(50),
    state VARCHAR(50),
    zip VARCHAR(10),
    phone VARCHAR(20),

    -- Membership + Admin
    membershipActive BOOLEAN NOT NULL DEFAULT FALSE,
    selectedPlan VARCHAR(50) DEFAULT NULL,
    isAdmin BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CHECK (email LIKE '%@%._%')
);

-- =====================================
-- CLASSES TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS classes (
    class_ID INT PRIMARY KEY AUTO_INCREMENT,

    class_name VARCHAR(50) NOT NULL,
    instructor_name VARCHAR(50),

    max_capacity INT NOT NULL DEFAULT 20,

    class_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- BOOKINGS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS bookings (
    booking_ID INT PRIMARY KEY AUTO_INCREMENT,

    user_ID INT NOT NULL,
    class_ID INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_ID) REFERENCES users(user_ID) ON DELETE CASCADE,
    FOREIGN KEY (class_ID) REFERENCES classes(class_ID) ON DELETE CASCADE,

    -- Prevent duplicate booking of same class by same user
    UNIQUE (user_ID, class_ID)
);

-- =====================================
-- PRICING TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS pricing (
    pricing_key VARCHAR(50) PRIMARY KEY,
    price DECIMAL(10,2) NOT NULL
);

-- =====================================
-- SEED PRICING DATA
-- =====================================
INSERT INTO pricing (pricing_key, price)
VALUES
('single-class', 25.00),
('starter', 79.00),
('plus', 119.00),
('unlimited', 159.00)
ON DUPLICATE KEY UPDATE price = VALUES(price);