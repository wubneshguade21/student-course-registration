import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  // ========== STATE ==========
  // We need 5 pieces of state
  const [name, setName] = useState("");           // for name input
  const [email, setEmail] = useState("");         // for email input
  const [password, setPassword] = useState("");   // for password input
  const [error, setError] = useState("");         // to show error message
  const [loading, setLoading] = useState(false);  // to show loading on button

  const navigate = useNavigate(); // to redirect after success

  // ========== SUBMIT FUNCTION ==========
  const handleSubmit = async (e) => {
    e.preventDefault();        // stop page refresh
    setError("");              // clear old error
    setLoading(true);          // start loading

    try {
      // Send data to backend
      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      // If successful, go to Login page
      navigate("/login");
    } catch (err) {
      // If backend returns error, show it
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);       // stop loading (always runs)
    }
  };

  // ========== UI ==========
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="bg-slate-800 p-8 rounded-xl shadow-lg w-full max-w-md border border-slate-700">
        
        <h1 className="text-3xl font-bold text-center text-orange-500 mb-6">
          Register
        </h1>

        {/* Show error only if error exists */}
        {error && (
          <div className="bg-red-900/50 text-red-300 p-3 rounded-lg mb-4 text-sm border border-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-orange-400 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your full name"
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-400"
            />
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-orange-400 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-400"
            />
          </div>

          {/* Password Input */}
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

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-400 hover:bg-orange-500 text-white font-semibold py-2.5 rounded-lg transition disabled:bg-orange-800 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-orange-500 hover:text-orange-400 font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}