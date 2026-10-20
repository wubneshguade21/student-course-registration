use student_course_registration;
UPDATE users 
SET password = '$2b$10$1cr.Rb7nohwH4HCLYHvT8.RvlyH8F.d5.RuoLaYF9g4.wRGPLAU/C',
    must_change_password = 0
WHERE role_id = 1;
SELECT id, name, email, LEFT(password, 30) AS pass_start 
FROM users 
WHERE role_id = 1;