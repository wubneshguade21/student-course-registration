import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateMyDepartment } from "../api/auth";
import { getDepartments } from "../api/departments";
import { getCourses } from "../api/courses";
import { getMyStats } from "../api/dashboard";

export default function StudentDashboard() {
  const { user, updateUser } = useAuth();

  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [myStats, setMyStats] = useState({
    my_enrollments: 0,
    available_courses: 0,
    my_courses: [],
  });
  const [selectedDept, setSelectedDept] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const hasDepartment = !!user?.department_id;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const deptsRes = await getDepartments();
        setDepartments(deptsRes.data);

        if (hasDepartment) {
          const [coursesRes, statsRes] = await Promise.all([
            getCourses(),
            getMyStats(),
          ]);
          setCourses(coursesRes.data);
          setMyStats(statsRes.data);
        }
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [hasDepartment]);

  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    if (!selectedDept) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await updateMyDepartment(Number(selectedDept));
      updateUser({
        department_id: res.data.department_id,
      });
      setSuccess(`You have been assigned to ${res.data.department_name}.`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save department");
    } finally {
      setSaving(false);
    }
  };

  const departmentName = (id) =>
    departments.find((d) => d.id === id)?.name || "—";

  // My department courses
  const myDeptCourses = courses.filter(
    (c) => c.department_id === user?.department_id
  );

  // ============================
  // STEP 1: Choose department
  // ============================
  if (!hasDepartment) {
    return (
      <>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-orange-500 mb-2">
            Welcome, {user?.name}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Before you can enroll in courses, please choose your department.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 p-3 rounded-lg mb-6 border border-red-300 dark:border-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 p-3 rounded-lg mb-6 border border-green-300 dark:border-green-700">
            {success}
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-8 max-w-2xl">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🎓</div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Choose Your Department
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              This determines which courses you can enroll in.
            </p>
          </div>

          <form onSubmit={handleSaveDepartment} className="space-y-4">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select your department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={saving || !selectedDept}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold px-6 py-3 rounded-lg disabled:bg-orange-800"
            >
              {saving ? "Saving..." : "Save Department"}
            </button>
          </form>
        </div>
      </>
    );
  }

  // ============================
  // STEP 2: Show dashboard
  // ============================
  return (
    <>
      {error && (
        <div className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 p-3 rounded-lg mb-6 border border-red-300 dark:border-red-700">
          {error}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-orange-500 mb-2">
          My Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Welcome back, {user?.name}. You are enrolled in{" "}
          <span className="text-orange-500 font-semibold">
            {departmentName(user?.department_id)}
          </span>
          .
        </p>
      </div>

      {/* Stats cards */}
      {loading ? (
        <p className="text-slate-500 dark:text-slate-400">Loading...</p>
      ) : (
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-10">
          <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                My Enrollments
              </h3>
              <span className="text-2xl">📝</span>
            </div>
            <p className="mt-3 text-3xl font-bold text-orange-500 dark:text-orange-400">
              {myStats.my_enrollments}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-500">
              Courses you have registered for
            </p>
          </div>

          <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {departmentName(user?.department_id)} Courses
              </h3>
              <span className="text-2xl">📚</span>
            </div>
            <p className="mt-3 text-3xl font-bold text-orange-500 dark:text-orange-400">
              {myDeptCourses.length}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-500">
              Available in your department
            </p>
          </div>
        </section>
      )}

      {/* My Courses */}
      <section className="mb-10">
        <h3 className="text-xl font-semibold text-orange-500 dark:text-orange-400 mb-4">
          My Courses
        </h3>

        {loading ? (
          <p className="text-slate-500 dark:text-slate-400">Loading...</p>
        ) : myStats.my_courses.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center">
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              You have not enrolled in any course yet.
            </p>
            <Link
              to="/enrollments"
              className="inline-block bg-orange-600 hover:bg-orange-500 text-white font-semibold px-5 py-2.5 rounded-lg transition"
            >
              Enroll in a Course
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-slate-700">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Code
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Course Name
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Credits
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Registered At
                  </th>
                </tr>
              </thead>
              <tbody>
                {myStats.my_courses.map((c) => (
                  <tr
                    key={c.enrollment_id}
                    className="border-t border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750"
                  >
                    <td className="px-6 py-4 font-medium text-orange-500 dark:text-orange-400">
                      {c.course_code}
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-white">
                      {c.course_name}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-300">
                      {c.credit_hour}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                      {new Date(c.registered_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Quick Links */}
      <section>
        <h3 className="text-xl font-semibold text-orange-500 dark:text-orange-400 mb-4">
          Quick Links
        </h3>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/courses"
            className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white px-5 py-3 rounded-lg transition"
          >
            Browse Courses
          </Link>
          <Link
            to="/enrollments"
            className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white px-5 py-3 rounded-lg transition"
          >
            My Enrollments
          </Link>
          <Link
            to="/departments"
            className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white px-5 py-3 rounded-lg transition"
          >
            Departments
          </Link>
        </div>
      </section>
    </>
  );
}