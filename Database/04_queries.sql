USE student_course_registration;

SELECT *
FROM students;

-- View all departments
SELECT *
FROM departments;

-- View all courses
SELECT *
FROM courses;

-- View all enrollments
SELECT *
FROM enrollments;


-- =========================
-- JOIN QUERIES
-- =========================

-- Students with their departments
SELECT
    students.name AS student,
    departments.name AS department
FROM students
JOIN departments
    ON students.department_id = departments.id;


-- Students with their registered courses
SELECT
    students.name AS student,
    courses.course_name AS course,
    enrollments.registered_at
FROM enrollments
JOIN students
    ON enrollments.student_id = students.id
JOIN courses
    ON enrollments.course_id = courses.id;


-- View enrollment details
SELECT
    enrollments.id AS enrollment_id,
    students.name AS student,
    courses.course_code,
    courses.course_name,
    enrollments.registered_at
FROM enrollments
JOIN students
    ON enrollments.student_id = students.id
JOIN courses
    ON enrollments.course_id = courses.id;


-- =========================
-- COUNT QUERIES
-- =========================

-- Total students
SELECT COUNT(*) AS total_students
FROM students;

-- Total courses
SELECT COUNT(*) AS total_courses
FROM courses;

-- Total enrollments
SELECT COUNT(*) AS total_enrollments
FROM enrollments;


-- Count courses registered by each student
SELECT
    students.name AS student,
    COUNT(enrollments.course_id) AS total_courses
FROM enrollments
JOIN students
    ON enrollments.student_id = students.id
GROUP BY students.id, students.name;


-- =========================
-- STUDENT QUERIES
-- =========================

-- View courses of a specific student
SELECT
    students.name AS student,
    courses.course_name AS course
FROM enrollments
JOIN students
    ON enrollments.student_id = students.id
JOIN courses
    ON enrollments.course_id = courses.id
WHERE students.id = 1;


-- View enrollments of a specific student
SELECT *
FROM enrollments
WHERE student_id = 1;


-- =========================
-- STUDENT CRUD
-- =========================

-- Update student
UPDATE students
SET name = 'Abebe k'
WHERE id = 1;


-- =========================
-- COURSE CRUD
-- =========================

-- Add a course
INSERT INTO courses (
    course_code,
    course_name,
    credit_hour,
    department_id
)
VALUES ('CS301', 'Web Development', 3, 1);

-- View courses
SELECT *
FROM courses;

-- Update a course
UPDATE courses
SET course_code = 'CS301'
WHERE id = 5;

-- Delete a course
DELETE FROM courses
WHERE id = 5;


-- =========================
-- ENROLLMENT CRUD
-- =========================

-- Register a student for a course
INSERT INTO enrollments (student_id, course_id)
VALUES (2, 3);

-- View a specific enrollment
SELECT *
FROM enrollments
WHERE student_id = 2
AND course_id = 3;

-- Drop a student's course registration
DELETE FROM enrollments
WHERE student_id = 2
AND course_id = 3;