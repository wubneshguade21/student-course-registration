USE student_course_registration;

-- Add departments
INSERT INTO departments (name)
VALUES
    ('Computer Science'),
    ('Information Technology'),
    ('Software Engineering')
    ('computer Engineering');

-- Add students
INSERT INTO students (name, email, department_id)
VALUES
    ('Abebe Kebede', 'abebe@gmail.com', 1),
    ('Hana Tesfaye', 'hana@gmail.com', 1),
    ('Dawit Alemu', 'dawit@gmail.com', 2),
    ('Meron Bekele', 'meron@gmail.com', 3);

-- Add courses
INSERT INTO courses (course_code, course_name, credit_hour, department_id)
VALUES
    ('CS101', 'Introduction to Programming', 3, 1),
    ('CS201', 'Database Systems', 3, 1),
    ('IT101', 'Computer Networks', 3, 2),
    ('SE101', 'Software Engineering Fundamentals', 3, 3);

-- Add enrollments
INSERT INTO enrollments (student_id, course_id)
VALUES
    (1, 1),
    (1, 2),
    (2, 1),
    (3, 3),
    (4, 4);
    -- ROLES
INSERT INTO roles (name)
VALUES
('admin'),
('student');
-- PERMISSIONS
INSERT INTO permissions (name, description)
VALUES
('view_students', 'View students'),
('create_student', 'Create a student'),
('update_student', 'Update a student'),
('delete_student', 'Delete a student'),
('view_departments', 'View departments'),
('create_department', 'Create a department'),
('update_department', 'Update a department'),
('delete_department', 'Delete a department'),
('view_courses', 'View courses'),
('create_course', 'Create a course'),
('update_course', 'Update a course'),
('delete_course', 'Delete a course'),
('view_enrollments', 'View enrollments'),
('create_enrollment', 'Create an enrollment'),
('update_enrollment', 'Update an enrollment'),
('delete_enrollment', 'Delete an enrollment');

-- ADMIN ROLE PERMISSIONS
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id
FROM permissions;


-- STUDENT ROLE PERMISSIONS
INSERT INTO role_permissions (role_id, permission_id)
VALUES
(2, 5),
(2, 9),
(2, 13),
(2, 14),
(2, 16);