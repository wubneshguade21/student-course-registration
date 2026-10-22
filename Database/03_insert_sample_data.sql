USE defaultdb;

-- 1. Roles
INSERT INTO roles (name) VALUES ('admin'), ('student');

-- 2. Admin User (Password: Admin@1234)
INSERT INTO users (name, email, password, role_id, must_change_password) 
VALUES (
    'Admin', 
    'admin@gmail.com', 
    '$2b$10$1cr.Rb7nohwH4HCLYHvT8.RvlyH8F.d5.RuoLaYF9g4.wRGPLAU/C', 
    1, 
    FALSE
);

-- 3. Permissions
INSERT INTO permissions (name, description) VALUES
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

-- 4. Role Permissions (Admin gets all)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- 5. Role Permissions (Student gets specific)
INSERT INTO role_permissions (role_id, permission_id) VALUES
(2, 5), (2, 9), (2, 13), (2, 14), (2, 16);

-- 6. Settings
INSERT INTO settings (setting_key, setting_value) VALUES
('system_status', 'active'),
('registration_open', 'true'),
('default_password', '123456'),
('system_name', 'Student Course Registration');

-- 7. Departments
INSERT INTO departments (name) VALUES
('Computer Science'),
('Information Technology'),
('Software Engineering'),
('Computer Engineering');

-- 8. Students (Assuming department IDs 1, 2, 3)
INSERT INTO students (name, email, department_id, year, semester) VALUES
('Abebe Kebede', 'abebe@gmail.com', 1, 1, 1),
('Hana Tesfaye', 'hana@gmail.com', 1, 1, 1),
('Dawit Alemu', 'dawit@gmail.com', 2, 1, 1),
('Meron Bekele', 'meron@gmail.com', 3, 1, 1);

-- 9. Courses
INSERT INTO courses (course_code, course_name, credit_hour, department_id, year, semester) VALUES
('CS101', 'Introduction to Programming', 3, 1, 1, 1),
('CS201', 'Database Systems', 3, 1, 1, 1),
('IT101', 'Computer Networks', 3, 2, 1, 1),
('SE101', 'Software Engineering Fundamentals', 3, 3, 1, 1);

-- 10. Enrollments
INSERT INTO enrollments (student_id, course_id) VALUES
(1, 1), (1, 2), (2, 1), (3, 3), (4, 4);