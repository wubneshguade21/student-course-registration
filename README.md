# Student Course Registration System

## About the Project

The **Student Course Registration System** is a full-stack web application designed to simplify and digitize the course registration process for educational institutions.

The system provides separate functionalities for **Students** and **Administrators**. Students can register, log in, view available courses, and enroll in courses based on their department. Administrators can manage departments, courses, students, enrollments, activity logs, and system settings.

The application implements **Role-Based Access Control (RBAC)** to ensure that users can only access features and operations permitted for their roles. Authentication is secured using **JSON Web Tokens (JWT)**, while passwords are securely hashed using **bcryptjs**.

This project demonstrates the development of a complete real-world full-stack application using a modern React frontend, Express.js backend, and MySQL database.

---

## 🌐 Live Deployment

The Student Course Registration System is deployed and accessible online.

### Live Application

**Frontend:**  
https://student-course-registration-eight.vercel.app/

The frontend is deployed using **Vercel**.

### Backend API

**Backend:**  
https://student-course-registration-backend-d5w8.onrender.com/

The backend API is deployed using **Render**.

### Database

The production MySQL database is hosted on **Aiven Cloud**.

### Deployment Architecture

```text
User
  │
  ▼
Vercel
React Frontend
  │
  │ REST API / HTTPS
  ▼
Render
Express.js Backend
  │
  │ MySQL / SSL
  ▼
Aiven Cloud
MySQL Database
```

> **Live Demo:** Open the frontend link above to use the Student Course Registration System.

---

## Key Features

### For Students

- Student registration and login
- Secure authentication
- View available courses
- View courses based on department
- Enroll in courses
- View personal information
- Change password
- View enrollment information

### For Administrators

- Secure administrator login
- Manage departments
- Manage courses
- Manage students
- Manage enrollments
- View activity logs
- Manage system settings
- Admin password recovery using a recovery code

### System Features

- JWT-based authentication
- Role-Based Access Control (RBAC)
- Password hashing using bcryptjs
- Protected frontend and backend routes
- Activity logging
- MySQL database
- RESTful API architecture
- Responsive user interface
- Form validation and error handling

---

## Tech Stack

### Frontend

- React 19
- Vite 8
- Tailwind CSS 4
- React Router DOM
- Axios
- TanStack React Query
- React Hot Toast

### Backend

- Node.js
- Express.js
- MySQL (`mysql2`)
- JSON Web Tokens (JWT)
- bcryptjs
- CORS
- dotenv
- nodemon

### Database

- MySQL
- Aiven Cloud

### Deployment

- Vercel — Frontend hosting
- Render — Backend hosting
- Aiven — Cloud MySQL database

---

## System Architecture

The application follows a **client-server architecture** consisting of a React frontend, Express.js backend, and MySQL database.

```text
                    ┌──────────────────────┐
                    │       Students       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React Frontend     │
                    │   Vite + Tailwind    │
                    │      Vercel           │
                    └──────────┬───────────┘
                               │
                         REST API / HTTPS
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Express.js API     │
                    │ Authentication & RBAC│
                    │       Render         │
                    └──────────┬───────────┘
                               │
                         MySQL / SSL
                               │
                               ▼
                    ┌──────────────────────┐
                    │    MySQL Database    │
                    │    Aiven Cloud       │
                    └──────────────────────┘
                               ▲
                               │
                    ┌──────────┴───────────┐
                    │    Administrators    │
                    └──────────────────────┘
```

---

## Authentication & Authorization

The system uses **JWT-based authentication** and **Role-Based Access Control (RBAC)**.

The authentication process follows this flow:

```text
User Login
    ↓
Credential Verification
    ↓
JWT Token Generation
    ↓
Authenticated API Request
    ↓
JWT Verification
    ↓
Role / Permission Verification
    ↓
Access Granted or Denied
```

This ensures that users can only access the resources and operations authorized for their roles.

---

## Database

The system uses **MySQL** for persistent data storage.

The production database is hosted on **Aiven Cloud** and accessed securely by the backend through an encrypted connection.

The main database entities include:

- Departments
- Students
- Courses
- Enrollments
- Users
- Roles
- Permissions
- Role Permissions
- Activity Logs
- Settings

The database supports relationships between students, departments, courses, and enrollments while also supporting authentication, authorization, and activity tracking.

---

# Local Setup & Installation

## 1. Clone the Repository

```bash
git clone <repository-url>
cd student-course-registration
```

---

## 2. Database Setup

Make sure **MySQL** is installed and running on your machine.

Create the database:

```sql
CREATE DATABASE student_course_registration;
```

Run the database schema/scripts provided with the project to create the required tables:

```text
departments
students
courses
enrollments
users
roles
permissions
role_permissions
activity_logs
settings
```

---

## 3. Backend Setup

Navigate to the backend directory:

```bash
cd Backend
```

Install the dependencies:

```bash
npm install
```

Create a `.env` file inside the `Backend` directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=student_course_registration
DB_PORT=3306
PORT=5000
JWT_SECRET=your_jwt_secret_key
ADMIN_RECOVERY_CODE=your_admin_recovery_code
```

Start the backend development server:

```bash
npm run dev
```

The backend will run at:

```text
http://localhost:5000
```

You should see:

```text
MySQL database connected successfully
Server running on port 5000
```

---

## 4. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd Frontend
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

---

# Production Deployment

The application is deployed using three cloud services:

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend API | Render |
| MySQL Database | Aiven Cloud |

### Production URLs

**Frontend:**

https://student-course-registration-eight.vercel.app/

**Backend:**

https://student-course-registration-backend-d5w8.onrender.com/

The frontend communicates with the Render backend through REST API requests, while the Render backend communicates with the Aiven MySQL database.

---

# Security Notes

- Never commit the `.env` file to GitHub.
- Keep `JWT_SECRET` private.
- Keep `ADMIN_RECOVERY_CODE` private.
- Passwords are securely hashed using `bcryptjs`.
- Protected routes require authentication.
- Role-based authorization prevents unauthorized operations.
- Sensitive system activities are recorded in activity logs.
- Production database communication uses SSL.
- Environment variables are used to store sensitive deployment configuration.

Make sure your `.gitignore` contains:

```gitignore
node_modules/
.env
dist/
```

---

# Available Scripts

## Backend

### Development

```bash
npm run dev
```

Starts the backend development server using `nodemon`.

### Production

```bash
npm start
```

Starts the backend server using Node.js.

---

## Frontend

### Development

```bash
npm run dev
```

Starts the Vite development server.

### Production Build

```bash
npm run build
```

Creates an optimized production build.

### Preview Production Build

```bash
npm run preview
```

Previews the production build locally.

---

# Future Improvements

Potential future enhancements include:

- Course prerequisite validation
- Course capacity management
- Schedule conflict detection
- Student registration approval workflow
- Email notifications
- Academic advisor functionality
- PDF and Excel report generation
- Advanced analytics dashboard

---

# License

This project is developed for **educational and academic purposes**.