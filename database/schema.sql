-- DLSU PUSA Database

DROP DATABASE IF EXISTS dlsuPusa;
CREATE DATABASE dlsuPusa;
USE dlsuPusa;


-- USERS

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    user_password VARCHAR(100) NOT NULL,
    user_role ENUM('Trainer', 'Admin', 'Volunteer') NOT NULL DEFAULT 'Volunteer',
    user_quota ENUM('Completed', 'Incomplete')
);

-- Cats

CREATE TABLE cats (
    cat_id INT AUTO_INCREMENT PRIMARY KEY,
    cat_name VARCHAR(200) NOT NULL,
    adoption_status ENUM('Adopted', 'Pending', 'Available'),
    cat_description VARCHAR(500)
);


-- feeding slot

CREATE TABLE feeding_slots (
    slot_id INT AUTO_INCREMENT PRIMARY KEY,
    trainer_id INT,
    user_count INT, -- how many possible volunteers
    slot_date DATE NOT NULL,
    slot_time TIME NOT NULL
);

-- nook slot

CREATE TABLE nook_slots (
    nook_id INT AUTO_INCREMENT PRIMARY KEY,
    trainer_id INT,
    user_count INT, -- how many possible volunteers
    slot_date DATE NOT NULL,
    slot_time TIME NOT NULL
);

-- feeding signups

CREATE TABLE feeding_signups (
    feedingSign_id INT AUTO_INCREMENT PRIMARY KEY,
    slot_id INT,
    volunteer_id INT,
    signed_up_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 

CREATE TABLE nook_signups (
    nookSign_id INT AUTO_INCREMENT PRIMARY KEY,
    slot_id INT,
    volunteer_id INT,
    signed_up_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 

CREATE TABLE adoption_applications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    cat_id INT,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending'
);


-- DATA input stuff --
