import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });

      // Block non-students
      if (res.data.role !== "student") {
        setError("This is the student login. Please use the admin login page.");
        setLoading(false);
        return;
      }

      const userData = {
        id: res.data.userId,
        name: res.data.name,
        email: res.data.email,
        role_id: res.data.role_id,
        role: res.data.role,
        must_change_password: res.data.must_change_password,
        student_id: res.data.student_id || null,
        department_id: res.data.department_id || null,
        year: res.data.year || null,
        semester: res.data.semester || null,
      };

      login(userData, res.data.token);

      if (res.data.must_change_password) {
        navigate("/change-password");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="bg-slate-800 p-8 rounded-xl shadow-lg w-full max-w-md border border-slate-700">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎓</div>
          <h1 className="text-3xl font-bold text-orange-500">Student Login</h1>
          <p className="text-slate-400 text-sm mt-1">
            Enter your student credentials
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 text-red-300 p-3 rounded-lg mb-4 text-sm border border-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-orange-400 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="student@example.com"
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-orange-400 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition disabled:bg-orange-800"
          >
            {loading ? "Logging in..." : "Login as Student"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-orange-500 hover:text-orange-400 font-medium"
          >
            Register
          </Link>
        </p>

        <p className="text-center text-sm text-slate-500 mt-3">
          <Link to="/" className="hover:text-slate-400">
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}