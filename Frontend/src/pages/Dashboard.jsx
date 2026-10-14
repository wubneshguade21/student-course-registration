import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAdminStats } from "../api/dashboard";
import Layout from "../components/Layout";
import StudentDashboard from "./StudentDashboard";

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <Layout>
      {isAdmin ? <AdminDashboard /> : <StudentDashboard />}
    </Layout>
  );
}

/* ============================================
   ADMIN DASHBOARD
   ============================================ */
function AdminDashboard() {
  const [stats, setStats] = useState({
    total_students: 0,
    total_departments: 0,
    total_courses: 0,
    total_enrollments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAdminStats();
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const cards = [
    {
      title: "Total Students",
      value: stats.total_students,
      description: "Registered students",
      icon: "🎓",
    },
    {
      title: "Departments",
      value: stats.total_departments,
      description: "Academic departments",
      icon: "🏢",
    },
    {
      title: "Total Courses",
      value: stats.total_courses,
      description: "Available courses",
      icon: "📚",
    },
    {
      title: "Enrollments",
      value: stats.total_enrollments,
      description: "Student registrations",
      icon: "📝",
    },
  ];

  return (
    <>
      {error && (
        <div className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 p-3 rounded-lg mb-6 border border-red-300 dark:border-red-700">
          {error}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-orange-500 mb-2">
          Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Overview of the Student Course Registration System.
        </p>
      </div>

      {loading ? (
        <p className="text-slate-500 dark:text-slate-400">Loading...</p>
      ) : (
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-lg"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {item.title}
                </h3>
                <span className="text-2xl">{item.icon}</span>
              </div>
              <p className="mt-3 text-3xl font-bold text-orange-500 dark:text-orange-400">
                {item.value}
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-500">
                {item.description}
              </p>
            </div>
          ))}
        </section>
      )}

      <section className="mt-10">
        <h3 className="text-xl font-semibold text-orange-500 dark:text-orange-400 mb-4">
          Quick Links
        </h3>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/departments"
            className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white px-5 py-3 rounded-lg transition"
          >
            Departments
          </Link>
          <Link
            to="/courses"
            className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white px-5 py-3 rounded-lg transition"
          >
            Courses
          </Link>
          <Link
            to="/students"
            className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white px-5 py-3 rounded-lg transition"
          >
            Students
          </Link>
          <Link
            to="/enrollments"
            className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white px-5 py-3 rounded-lg transition"
          >
            Enrollments
          </Link>
        </div>
      </section>
    </>
  );
}