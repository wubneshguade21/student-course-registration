require("dotenv").config();

const db = require("./db");

const express = require("express");
const cors = require("cors");

const studentRoutes = require("./routes/studentRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const courseRoutes = require("./routes/courseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/students", studentRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);

db.query("SELECT 1")
    .then(() => {
        console.log("MySQL database connected successfully");
    })
    .catch((error) => {
        console.error("MySQL connection failed:", error.message);
    });

app.get("/", (req, res) => {
    res.send("Student Course Registration Backend is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});