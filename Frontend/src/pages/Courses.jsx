import { useState, useEffect } from "react";
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../api/courses";
import { getDepartments } from "../api/departments";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

const EMPTY_FORM = {
  course_code: "",
  course_name: "",
  credit_hour: "",
  department_id: "",
  year: "1",
  semester: "1",
};

const YEARS = [1, 2, 3, 4, 5];
const SEMESTERS = [1, 2];

export default function Courses() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const [view, setView] = useState("grid");

  const [filterDept, setFilterDept] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [filterSem, setFilterSem] = useState("all");
  const [search, setSearch] = useState("");

  // ================= CSV DOWNLOAD LOGIC =================
  const handleExport = () => {
    if (visibleCourses.length === 0) return;
    const exportData = visibleCourses.map((c, i) => ({
      No: i + 1,
      Code: c.course_code,
      "Course Name": c.course_name,
      Department: departmentName(c.department_id),
      Credits: c.credit_hour,
      Year: c.year || 1,
      Semester: c.semester || 1,
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
    link.setAttribute("download", "Courses_List.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // ======================================================

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [coursesRes, deptsRes] = await Promise.all([
        getCourses(),
        getDepartments(),
      ]);
      setCourses(coursesRes.data);
      setDepartments(deptsRes.data);
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

  useEffect(() => {
    if (!isAdmin && user?.department_id) {
      setFilterDept(String(user.department_id));
    }
  }, [isAdmin, user]);

  const departmentName = (id) =>
    departments.find((d) => d.id === id)?.name || "—";

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.course_code.trim() || !form.course_name.trim()) return;

    setCreating(true);
    try {
      await createCourse({
        course_code: form.course_code.trim(),
        course_name: form.course_name.trim(),
        credit_hour: Number(form.credit_hour),
        department_id: Number(form.department_id),
        year: Number(form.year),
        semester: Number(form.semester),
      });
      setForm(EMPTY_FORM);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create course");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (course) => {
    setEditingId(course.id);
    setEditForm({
      course_code: course.course_code,
      course_name: course.course_name,
      credit_hour: course.credit_hour,
      department_id: course.department_id,
      year: String(course.year || 1),
      semester: String(course.semester || 1),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
  };

  const handleUpdate = async (id) => {
    try {
      await updateCourse(id, {
        course_code: editForm.course_code.trim(),
        course_name: editForm.course_name.trim(),
        credit_hour: Number(editForm.credit_hour),
        department_id: Number(editForm.department_id),
        year: Number(editForm.year),
        semester: Number(editForm.semester),
      });
      cancelEdit();
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update course");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    try {
      await deleteCourse(id);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete course");
    }
  };

  const visibleCourses = courses
    .filter((c) => {
      if (filterDept !== "all") {
        if (String(c.department_id) !== filterDept) return false;
      }
      if (filterYear !== "all") {
        if (String(c.year) !== filterYear) return false;
      }
      if (filterSem !== "all") {
        if (String(c.semester) !== filterSem) return false;
      }
      const q = search.trim().toLowerCase();
      if (q) {
        const match =
          c.course_code.toLowerCase().includes(q) ||
          c.course_name.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    })
    .sort((a, b) => a.course_name.localeCompare(b.course_name));

  const resetFilters = () => {
    setFilterDept(
      !isAdmin && user?.department_id ? String(user.department_id) : "all"
    );
    setFilterYear("all");
    setFilterSem("all");
    setSearch("");
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-orange-500 mb-2">Courses</h1>
        <p className="text-slate-500 dark:text-slate-400">
          {isAdmin
            ? "Manage all academic courses across departments."
            : "Browse courses by department, year, and semester."}
        </p>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 p-3 rounded-lg mb-6 border border-red-300 dark:border-red-700">
          {error}
        </div>
      )}

      {isAdmin && (
        <form
          onSubmit={handleCreate}
          className="mb-6 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-4"
        >
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3">
            ➕ Add a new course
          </p>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            <input
              type="text"
              value={form.course_code}
              onChange={(e) => setForm({ ...form, course_code: e.target.value })}
              placeholder="Code"
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="text"
              value={form.course_name}
              onChange={(e) => setForm({ ...form, course_name: e.target.value })}
              placeholder="Course name"
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="number"
              min="1"
              value={form.credit_hour}
              onChange={(e) => setForm({ ...form, credit_hour: e.target.value })}
              placeholder="Credits"
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <select
              value={form.department_id}
              onChange={(e) =>
                setForm({ ...form, department_id: e.target.value })
              }
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
            <select
              value={form.semester}
              onChange={(e) => setForm({ ...form, semester: e.target.value })}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  Sem {s}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={creating}
              className="bg-orange-600 hover:bg-orange-500 text-white font-semibold px-6 py-2.5 rounded-lg disabled:bg-orange-800"
            >
              {creating ? "..." : "Add Course"}
            </button>
          </div>
        </form>
      )}

      <div className="mb-6 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-3">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            🔍 Filter Courses
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={handleExport}
              className="text-sm bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-md font-medium transition"
            >
              📥 Export CSV
            </button>
            <button
              onClick={resetFilters}
              className="text-xs text-orange-500 hover:text-orange-400 font-medium"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {!isAdmin && (
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Years</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                Year {y}
              </option>
            ))}
          </select>

          <select
            value={filterSem}
            onChange={(e) => setFilterSem(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Semesters</option>
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code or name..."
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {loading && (
        <p className="text-slate-500 dark:text-slate-400">Loading courses...</p>
      )}

      {!loading && visibleCourses.length === 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-2">
            📚 No courses match your filters
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">
            Try changing the year, semester, or department.
          </p>
          <button
            onClick={resetFilters}
            className="bg-orange-600 hover:bg-orange-500 text-white font-semibold px-5 py-2 rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      )}

      {!loading && visibleCourses.length > 0 && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing{" "}
              <span className="font-semibold text-orange-500">
                {visibleCourses.length}
              </span>{" "}
              course{visibleCourses.length !== 1 ? "s" : ""}
            </p>

            <button
              onClick={() => setView(view === "grid" ? "list" : "grid")}
              className="flex items-center gap-2 bg-slate-200 dark:bg-slate-900 px-4 py-1.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition self-start border border-slate-300 dark:border-slate-700"
              title={view === "grid" ? "Switch to List View" : "Switch to Grid View"}
            >
              <span className="text-lg leading-none">
                {view === "grid" ? "☰" : "⊞"}
              </span>
              <span>{view === "grid" ? "List View" : "Grid View"}</span>
            </button>
          </div>

          {view === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleCourses.map((c, index) => (
                <div
                  key={c.id}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-5 shadow-sm hover:shadow-md transition"
                >
                  {editingId === c.id ? (
                    <div className="space-y-2">
                      <input
                        value={editForm.course_code}
                        onChange={(e) =>
                          setEditForm({ ...editForm, course_code: e.target.value })
                        }
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded px-2 py-1 text-sm"
                      />
                      <input
                        value={editForm.course_name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, course_name: e.target.value })
                        }
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded px-2 py-1 text-sm"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={editForm.credit_hour}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              credit_hour: e.target.value,
                            })
                          }
                          className="w-20 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded px-2 py-1 text-sm"
                        />
                        <select
                          value={editForm.year}
                          onChange={(e) =>
                            setEditForm({ ...editForm, year: e.target.value })
                          }
                          className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded px-2 py-1 text-sm"
                        >
                          {YEARS.map((y) => (
                            <option key={y} value={y}>
                              Y{y}
                            </option>
                          ))}
                        </select>
                        <select
                          value={editForm.semester}
                          onChange={(e) =>
                            setEditForm({ ...editForm, semester: e.target.value })
                          }
                          className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded px-2 py-1 text-sm"
                        >
                          {SEMESTERS.map((s) => (
                            <option key={s} value={s}>
                              S{s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <select
                        value={editForm.department_id}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            department_id: e.target.value,
                          })
                        }
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded px-2 py-1 text-sm"
                      >
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleUpdate(c.id)}
                          className="flex-1 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded py-1.5"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex-1 bg-slate-500 hover:bg-slate-400 text-white text-sm font-semibold rounded py-1.5"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                          {c.course_code}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          #{index + 1}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                        {c.course_name}
                      </h3>

                      <div className="space-y-1.5 text-sm mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400">
                            Department
                          </span>
                          <span className="font-medium text-slate-700 dark:text-slate-200 truncate ml-2">
                            {departmentName(c.department_id)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400">
                            Credits
                          </span>
                          <span className="font-medium text-slate-700 dark:text-slate-200">
                            {c.credit_hour}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400">
                            Year · Semester
                          </span>
                          <span className="font-medium text-slate-700 dark:text-slate-200">
                            Y{c.year || 1} · S{c.semester || 1}
                          </span>
                        </div>
                      </div>

                      {isAdmin && (
                        <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                          <button
                            onClick={() => startEdit(c)}
                            className="flex-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm font-medium py-1.5 rounded transition"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="flex-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium py-1.5 rounded transition"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {view === "list" && (
            <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm">
                    <tr>
                      <th className="px-6 py-4 font-semibold w-16 text-center">#</th>
                      <th className="px-6 py-4 font-semibold">Code</th>
                      <th className="px-6 py-4 font-semibold">Name</th>
                      <th className="px-6 py-4 font-semibold">Department</th>
                      <th className="px-6 py-4 font-semibold text-center">Credits</th>
                      <th className="px-6 py-4 font-semibold text-center">Year/Sem</th>
                      {isAdmin && <th className="px-6 py-4 font-semibold text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-sm">
                    {visibleCourses.map((c, index) => (
                      <tr
                        key={c.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition"
                      >
                        <td className="px-6 py-4 text-center text-slate-500 dark:text-slate-400">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-bold px-2.5 py-1 rounded-full">
                            {c.course_code}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                          {c.course_name}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                          {departmentName(c.department_id)}
                        </td>
                        <td className="px-6 py-4 text-center font-medium">
                          {c.credit_hour}
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">
                          Y{c.year || 1} · S{c.semester || 1}
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-4">
                              <button
                                onClick={() => startEdit(c)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(c.id)}
                                className="text-red-600 dark:text-red-400 hover:text-red-800 font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}