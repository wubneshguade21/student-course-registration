use student_course_registration;
-- 1. Settings table (System Control ለመያዝ)
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Default values 
INSERT INTO settings (setting_key, setting_value) VALUES
('system_status', 'active'),          -- active / inactive
('registration_open', 'true'),        -- true / false
('default_password', '123456')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

SELECT * FROM settings;