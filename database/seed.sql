-- Seed data for classes table
USE uplift_gym;

INSERT INTO classes (class_name, instructor_name, max_capacity, class_date, start_time, end_time)
VALUES
-- Yoga
('Yoga', 'Alice Johnson', 20, '2026-04-20', '08:00:00', '09:00:00'),
('Yoga', 'Alice Johnson', 20, '2026-04-22', '18:00:00', '19:00:00'),
('Yoga', 'Alice Johnson', 20, '2026-04-25', '09:00:00', '10:00:00'),

-- HIIT
('HIIT', 'Brandon Smith', 20, '2026-04-20', '10:00:00', '11:00:00'),
('HIIT', 'Brandon Smith', 20, '2026-04-23', '17:30:00', '18:30:00'),
('HIIT', 'Brandon Smith', 20, '2026-04-26', '09:30:00', '10:30:00'),

-- Pilates
('Pilates', 'Clara Lee', 20, '2026-04-21', '09:00:00', '10:00:00'),
('Pilates', 'Clara Lee', 20, '2026-04-24', '18:30:00', '19:30:00'),
('Pilates', 'Clara Lee', 20, '2026-04-27', '08:30:00', '09:30:00'),

-- Spin
('Spin', 'Derek Hall', 20, '2026-04-20', '06:30:00', '07:30:00'),
('Spin', 'Derek Hall', 20, '2026-04-22', '18:30:00', '19:30:00'),
('Spin', 'Derek Hall', 20, '2026-04-26', '07:00:00', '08:00:00'),

-- Strength Training
('Strength Training', 'Eva Carter', 20, '2026-04-24', '19:00:00', '20:00:00'),
('Strength Training', 'Eva Carter', 20, '2026-04-27', '11:00:00', '12:00:00'),

-- Zumba
('Zumba', 'Fernando Ruiz', 20, '2026-04-20', '17:30:00', '18:30:00'),
('Zumba', 'Fernando Ruiz', 20, '2026-04-26', '10:00:00', '11:00:00'),

-- Functional Training
('Functional Training', 'Grace Kim', 20, '2026-04-21', '07:00:00', '08:00:00'),
('Functional Training', 'Grace Kim', 20, '2026-04-27', '08:00:00', '09:00:00'),

-- Boxing Fitness
('Boxing Fitness', 'Hector Diaz', 20, '2026-04-20', '18:00:00', '19:00:00'),
('Boxing Fitness', 'Hector Diaz', 20, '2026-04-26', '11:00:00', '12:00:00'),

-- Mobility & Stretch
('Mobility & Stretch', 'Isabella Moore', 20, '2026-04-21', '08:30:00', '09:30:00'),
('Mobility & Stretch', 'Isabella Moore', 20, '2026-04-27', '09:00:00', '10:00:00'),

-- Meditation
('Meditation', 'Jason Patel', 20, '2026-04-20', '19:30:00', '20:30:00'),
('Meditation', 'Jason Patel', 20, '2026-04-26', '08:00:00', '09:00:00');
