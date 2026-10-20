import { useState, useEffect } from "react";
import {
  updateProfile,
  getSystemSettings,
  updateSystemSettings,
  resetStudentPassword,
} from "../api/auth";
import { getStudents } from "../api/students";
import { useAuth } from "../context/AuthContext";

const Settings = () => {
  const { user, setUser } = useAuth(); // current logged-in user

  // ===== Profile =====
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileMsg, setProfileMsg] = useState("");

  // ===== System Settings =====
  const [systemName, setSystemName] = useState("Student Course Registration");
  const [systemStatus, setSystemStatus] = useState("active");
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [defaultPassword, setDefaultPassword] = useState("123456");
  const [settingsMsg, setSettingsMsg] = useState("");

  // ===== Reset Password =====
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  // Load current user + settings + students
  useEffect(() => {
    // Pre-fill profile from logged-in user
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }

    const fetchData = async () => {
      try {
        const settingsRes = await getSystemSettings();
        const s = settingsRes.data;
        setSystemName(s.system_name || "Student Course Registration");
        setSystemStatus(s.system_status || "active");
        setRegistrationOpen(s.registration_open === "true");
        setDefaultPassword(s.default_password || "123456");

        const studentsRes = await getStudents();
        setStudents(studentsRes.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [user]);

  // 1. Update Profile (Name + Email)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg("");
    try {
      const res = await updateProfile({ name, email });
      setProfileMsg(res.data.message || "Profile updated successfully");

      // Update AuthContext so sidebar shows new name immediately
      if (setUser) {
        setUser((prev) => ({
          ...prev,
          name: name,
          email: email,
        }));
      }
    } catch (err) {
      setProfileMsg(err.response?.data?.message || "Failed to update profile");
    }
  };

  // 2. Update System Settings
  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setSettingsMsg("");
    try {
      await updateSystemSettings({
        system_name: systemName,
        system_status: systemStatus,
        registration_open: registrationOpen,
        default_password: defaultPassword,
      });
      setSettingsMsg("Settings updated successfully");
    } catch (err) {
      setSettingsMsg(err.response?.data?.message || "Failed to update settings");
    }
  };

  // 3. Reset Student Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetMsg("");
    setTempPassword("");
    if (!selectedStudent) {
      setResetMsg("Please select a student");
      return;
    }
    try {
      const res = await resetStudentPassword(selectedStudent);
      setResetMsg(res.data.message);
      setTempPassword(res.data.temporaryPassword);
    } catch (err) {
      setResetMsg(err.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>

      {/* ========== 1. My Profile ========== */}
      <div className="bg-white shadow rounded-lg p-6 mb-6 dark:bg-slate-800">
        <h2 className="text-xl font-semibold mb-4">My Profile</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
              placeholder="Enter your email"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Update Profile
          </button>

          {profileMsg && (
            <p
              className={`text-sm mt-2 ${
                profileMsg.toLowerCase().includes("fail")
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {profileMsg}
            </p>
          )}
        </form>

        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            To change password, go to{" "}
            <a href="/change-password" className="text-blue-600 underline">
              Change Password
            </a>
          </p>
        </div>
      </div>

      {/* ========== 2. Reset Student Password ========== */}
      <div className="bg-white shadow rounded-lg p-6 mb-6 dark:bg-slate-800">
        <h2 className="text-xl font-semibold mb-4">Reset Student Password</h2>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Student
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full border rounded px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
              required
            >
              <option value="">-- Select Student --</option>
              {students.map((s) => (
                <option key={s.id || s.user_id} value={s.user_id || s.id}>
                  {s.name} ({s.email})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
          >
            Reset Password
          </button>

          {resetMsg && (
            <p
              className={`text-sm mt-2 ${
                resetMsg.toLowerCase().includes("fail")
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {resetMsg}
            </p>
          )}

          {tempPassword && (
            <p className="text-sm mt-1 font-medium">
              Temporary Password:{" "}
              <span className="text-red-600">{tempPassword}</span>
            </p>
          )}
        </form>
      </div>

      {/* ========== 3. System Control ========== */}
      <div className="bg-white shadow rounded-lg p-6 dark:bg-slate-800">
        <h2 className="text-xl font-semibold mb-4">System Control</h2>
        <form onSubmit={handleUpdateSettings} className="space-y-4">
        
          <div>
            <label className="block text-sm font-medium mb-1">
              System Name
            </label>
            <input
              type="text"
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              className="w-full border rounded px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
              placeholder="Student Course Registration"
              maxLength={60}
              required
            />
           
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              System Status
            </label>
            <select
              value={systemStatus}
              onChange={(e) => setSystemStatus(e.target.value)}
              className="w-full border rounded px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Student Self-Registration
            </label>
            <select
              value={registrationOpen ? "true" : "false"}
              onChange={(e) => setRegistrationOpen(e.target.value === "true")}
              className="w-full border rounded px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
            >
              <option value="true">Open</option>
              <option value="false">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Default Password (for new/reset students)
            </label>
            <input
              type="text"
              value={defaultPassword}
              onChange={(e) => setDefaultPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Save System Settings
          </button>

          {settingsMsg && (
            <p
              className={`text-sm mt-2 ${
                settingsMsg.toLowerCase().includes("fail")
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {settingsMsg}
            </p>
          )}
        </form>
      </div>
      
    </div>
  );
};

export default Settings;