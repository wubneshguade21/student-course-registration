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