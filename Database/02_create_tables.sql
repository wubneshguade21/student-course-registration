USE student_course_registration;

CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);
CREATE TABLE students(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL unique,
    department_id INT,
    foreign key(department_id) references departments(id)
);
CREATE TABLE courses(
    id INT AUTO_INCREMENT PRIMARY key,
    course_code VARCHAR(20) NOT NULL,
    course_name VARCHAR(150) NOT NULL,
    credit_hour INT NOT NULL,
    department_id INT,
    foreign key (department_id)references departments(id)
);
CREATE TABLE enrollments(
    id INT AUTO_INCREMENT  PRIMARY key,
    student_id INT not NULL,
    course_id INT not NULL,
    registered_at timestamp default current_timestamp,
    unique (student_id,course_id),
    foreign key (student_id) references students(id),
    foreign key (course_id) references courses(id)
);