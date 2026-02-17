CREATE DATABASE uplift_gym;

CREATE TABLE users ( 
	user_ID int PRIMARY KEY AUTO_INCREMENT,
    last_name varchar(50) NOT NULL,
    first_name varchar(50) NOT NULL,
    email varchar(200) NOT NULL UNIQUE,
    CHECK (email LIKE '%_@_%._%')
);

CREATE TABLE classes (
class_ID int PRIMARY KEY AUTO_INCREMENT,
class_name varchar(50) NOT NULL,
instructor_name varchar(50),
max_capacity INT NOT NULL,
class_date DATE NOT NULL,
start_time TIME NOT NULL,
end_time TIME NOT NULL
);

CREATE TABLE bookings (
booking_ID int PRIMARY KEY AUTO_INCREMENT,
user_ID int NOT NULL,
class_ID int NOT NULL,
FOREIGN KEY (user_ID) REFERENCES users(user_ID),
FOREIGN KEY (class_ID) REFERENCES classes(class_ID),
UNIQUE (user_ID, class_ID) /* Ensure a user can only book a class once */
);