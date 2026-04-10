-- Create database
CREATE DATABASE IF NOT EXISTS uplift_gym;
USE uplift_gym;

-- USERS TABLE
CREATE TABLE users (
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
    membershipActive TINYINT(1) NOT NULL DEFAULT 0,
    selectedPlan VARCHAR(50) DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CHECK (email LIKE '%_@_%._%')
);

-- CLASSES TABLE
CREATE TABLE classes (
    class_ID INT PRIMARY KEY AUTO_INCREMENT,
    class_name VARCHAR(50) NOT NULL,
    instructor_name VARCHAR(50),
    max_capacity INT NOT NULL DEFAULT 20,
    class_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BOOKINGS TABLE
CREATE TABLE bookings (
    booking_ID INT PRIMARY KEY AUTO_INCREMENT,
    user_ID INT NOT NULL,
    class_ID INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_ID) REFERENCES users(user_ID) ON DELETE CASCADE,
    FOREIGN KEY (class_ID) REFERENCES classes(class_ID) ON DELETE CASCADE,

    UNIQUE (user_ID, class_ID)
);