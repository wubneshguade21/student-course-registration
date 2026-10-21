USE student_course_registration;

CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO settings (setting_key, setting_value) VALUES
('system_status', 'active'),
('registration_open', 'true'),
('default_password', '123456'),
('system_name', 'Student Course Registration')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

SELECT * FROM settings;