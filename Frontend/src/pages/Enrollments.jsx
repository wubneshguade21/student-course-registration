import { useState, useEffect } from "react";
import {
  getEnrollments,
  createEnrollment,
  deleteEnrollment,
} from "../api/enrollments";
import { getStudents } from "../api/students";
import { getCourses } from "../api/courses";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

export default function Enrollments() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");

  // ================= CSV DOWNLOAD LOGIC =================
  const handleExport = () => {
    if (filteredEnrollments.length === 0) return;
    const exportData = filteredEnrollments.map((e, i) => ({
      No: i + 1,
      ...(isAdmin && { Student: studentName(e.student_id) }),
      Course: courseLabel(e.course_id),
      "Registered At": new Date(e.registered_at).toLocaleString(),
    }));
    const headers = Object.keys(exportData[0]).join(",");
    const rows = exportData.map((row) =>
      Object.values(row)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Enrollments_List.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // ======================================================

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [enrollRes, coursesRes] = await Promise.all([
        getEnrollments(),
        getCourses(),
      ]);
      setEnrollments(enrollRes.data);
      setAllCourses(coursesRes.data);

      if (isAdmin) {
        const studentsRes = await getStudents();
        setStudents(studentsRes.data);
      }
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const selectableCourses = isAdmin
    ? allCourses
    : allCourses.filter(
        (c) =>
          user?.department_id && c.department_id === user.department_id
      );

  const studentName = (id) =>
    students.find((s) => s.id === id)?.name || `Student #${id}`;

  const courseLabel = (id) => {
    const c = allCourses.find((c) => c.id === id);
    return c ? `${c.course_code} — ${c.course_name}` : `Course #${id}`;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!courseId) return;
    if (isAdmin && !studentId) return;

    setCreating(true);
    try {
      const body = { course_id: Number(courseId) };
      if (isAdmin) body.student_id = Number(studentId);

      await createEnrollment(body);
      setStudentId("");
      setCourseId("");
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to enroll");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Drop this enrollment?")) return;
    try {
      await deleteEnrollment(id);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to drop enrollment");
    }
  };

  const filteredEnrollments = enrollments
    .filter((e) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        String(e.id).includes(q) ||
        studentName(e.student_id).toLowerCase().includes(q) ||
        courseLabel(e.course_id).toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (isAdmin) {
        return studentName(a.student_id).localeCompare(studentName(b.student_id));
      } else {
        return courseLabel(a.course_id).localeCompare(courseLabel(b.course_id));
      }
    });

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-orange-500 mb-2">Enrollments</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">
        {isAdmin ? "Register students for courses" : "Your registered courses"}
      </p>

      {error && (
        <div className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 p-3 rounded-lg mb-6 border border-red-300 dark:border-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleCreate}
        className={`mb-4 grid grid-cols-1 ${
          isAdmin ? "md:grid-cols-3" : "md:grid-cols-2"
        } gap-3`}
      >
        {isAdmin && (
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.email})
              </option>
            ))}
          </select>
        )}

        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">
            {isAdmin ? "Select course" : "Select course (your department)"}
          </option>
          {selectableCourses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.course_code} — {c.course_name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={creating}
          className="bg-orange-600 hover:bg-orange-500 text-white font-semibold px-6 py-2.5 rounded-lg disabled:bg-orange-800"
        >
          {creating ? "Enrolling..." : "Enroll"}
        </button>
      </form>

      {!isAdmin && selectableCourses.length === 0 && !loading && (
        <div className="mb-8 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 p-4 rounded-lg border border-yellow-300 dark:border-yellow-700">
          ⚠️ No courses available in your department. Please contact the administrator.
        </div>
      )}

      {/* Search & Export */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={isAdmin ? "Search by ID, student or course..." : "Search by ID or course..."}
          className="w-full md:w-1/2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          onClick={handleExport}
          className="bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2.5 rounded-lg transition"
        >
          📥 Export CSV
        </button>
      </div>

      {loading && (
        <p className="text-slate-500 dark:text-slate-400">
          Loading enrollments...
        </p>
      )}

      {!loading && filteredEnrollments.length === 0 && (
        <p className="text-slate-500 dark:text-slate-400">
          {search ? "No enrollments match your search." : "No enrollments found."}
        </p>
      )}

      {!loading && filteredEnrollments.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 dark:bg-slate-700">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  #
                </th>
                {isAdmin && (
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Student
                  </th>
                )}
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Course
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Registered At
                </th>
                <th className="text-right px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEnrollments.map((e, index) => (
                <tr
                  key={e.id}
                  className="border-t border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {index + 1}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 font-medium text-orange-500 dark:text-orange-400">
                      {studentName(e.student_id)}
                    </td>
                  )}
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                    {courseLabel(e.course_id)}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                    {new Date(e.registered_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="text-red-500 dark:text-red-400 hover:opacity-80 text-sm font-medium"
                    >
                      Drop
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}