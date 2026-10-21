import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getSystemSettings } from "../api/auth";

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Bulletproof admin check
  const isAdmin = 
    user?.role?.toLowerCase() === "admin" || 
    user?.role_id === 1;

  // ---------- SYSTEM NAME ----------
  const [systemName, setSystemName] = useState("Student Course Registration");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await getSystemSettings();
        if (alive && res.data?.system_name) {
          setSystemName(res.data.system_name);
        }
      } catch (err) {
        console.error("Failed to load system name:", err);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ---------- THEME ----------
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("theme");
    return stored ? stored === "dark" : true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
      isActive
        ? "bg-orange-500 text-white"
        : "text-slate-300 hover:bg-slate-700 hover:text-white"
    }`;

  return (
    <aside
      className={`h-full bg-slate-800 border-r border-slate-700 flex flex-col transition-all duration-200 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* TOP: brand + collapse */}
      <div className="px-3 py-5 border-b border-slate-700 flex items-center justify-between">
        {!collapsed && (
          <h1
            className="text-lg font-bold text-orange-500 leading-tight break-words"
            title={systemName}
          >
            {systemName}
          </h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="text-slate-300 hover:text-white p-1 rounded hover:bg-slate-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {collapsed ? (
              <polyline points="9 18 15 12 9 6" />
            ) : (
              <polyline points="15 18 9 12 15 6" />
            )}
          </svg>
        </button>
      </div>

      {/* USER INFO */}
      {!collapsed && (
        <div className="px-5 py-4 border-b border-slate-700">
          <p className="text-xs text-slate-400">Logged in as</p>
          <p className="text-sm font-semibold text-white truncate">
            {user?.name || "User"}
          </p>
          <p className="text-xs text-orange-400 capitalize">{user?.role}</p>
        </div>
      )}

      {/* NAVIGATION */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <NavLink to="/dashboard" className={linkClass} title="Dashboard">
          <span>🏠</span>
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        <NavLink to="/departments" className={linkClass} title="Departments">
          <span>🏢</span>
          {!collapsed && <span>Departments</span>}
        </NavLink>

        <NavLink to="/courses" className={linkClass} title="Courses">
          <span>📚</span>
          {!collapsed && <span>Courses</span>}
        </NavLink>

        {isAdmin && (
          <NavLink to="/students" className={linkClass} title="Students">
            <span>👨‍🎓</span>
            {!collapsed && <span>Students</span>}
          </NavLink>
        )}

        <NavLink
          to="/enrollments"
          className={linkClass}
          title={isAdmin ? "Enrollments" : "My Enrollments"}
        >
          <span>📝</span>
          {!collapsed && (
            <span>{isAdmin ? "Enrollments" : "My Enrollments"}</span>
          )}
        </NavLink>

        {/* ========== ACTIVITIES (Admin only) ========== */}
        {isAdmin && (
          <NavLink to="/activities" className={linkClass} title="Activity Log">
            <span>⏱️</span>
            {!collapsed && <span>Activity Log</span>}
          </NavLink>
        )}

        {/* ========== SETTINGS (Admin only) ========== */}
        {isAdmin && (
          <NavLink to="/settings" className={linkClass} title="Settings">
            <span>⚙️</span>
            {!collapsed && <span>Settings</span>}
          </NavLink>
        )}
      </nav>

      {/* FOOTER: theme + logout */}
      <div className="px-2 py-4 border-t border-slate-700 space-y-1">
        <button
          onClick={() => setDark(!dark)}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition"
        >
          <span>{dark ? "☀️" : "🌙"}</span>
          {!collapsed && <span>{dark ? "Light Mode" : "Dark Mode"}</span>}
        </button>

        <button
          onClick={handleLogout}
          title="Logout"
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/30 hover:text-red-300 transition"
        >
          <span>🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}