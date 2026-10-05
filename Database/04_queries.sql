USE student_course_registration;
select   students.name,departments.name AS department from students join departments on students.department_id=departments.id;
SELECT
    students.name AS student,
    courses.course_name AS course,
    enrollments.registered_at
FROM enrollments
JOIN students
    ON enrollments.student_id = students.id
JOIN courses
    ON enrollments.course_id = courses.id;
    -- Count total students
SELECT COUNT(*) AS total_students
FROM students;
-- Count courses registered by each student
SELECT
    students.name AS student,
    COUNT(enrollments.course_id) AS total_courses
FROM enrollments
JOIN students
    ON enrollments.student_id = students.id
GROUP BY students.id, students.name;
UPDATE students SET name='Abebe k'
WHERE id=1; 
SELECT
    students.name AS student,
    courses.course_name AS course
FROM enrollments
JOIN students
    ON enrollments.student_id = students.id
JOIN courses
    ON enrollments.course_id = courses.id
WHERE students.id = 1;

-- =========================
-- COURSE CRUD
-- =========================


INSERT INTO courses (course_code, course_name, credit_hour, department_id)
VALUES ('CS301', 'Web Development', 3, 1);


SELECT * FROM courses;


UPDATE courses
SET course_code = 'CS301'
WHERE id = 5;


DELETE FROM courses
WHERE id = 5;