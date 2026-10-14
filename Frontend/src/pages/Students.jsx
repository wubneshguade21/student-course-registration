import { useState, useEffect } from "react";
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../api/students";
import { getDepartments } from "../api/departments";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

const EMPTY_FORM = {
  name: "",
  email: "",
  department_id: "",
  year: "1",
  semester: "1",
};

const YEARS = [1, 2, 3, 4, 5];
const SEMESTERS = [1, 2];

export default function Students() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [studentsRes, deptsRes] = await Promise.all([
        getStudents(),
        getDepartments(),
      ]);
      setStudents(studentsRes.data);
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

  const departmentName = (id) =>
    departments.find((d) => d.id === id)?.name || "—";

  const handleCreate = async (e) => {
    e.preventDefault();
    setSuccess("");
    if (!form.name.trim() || !form.email.trim()) return;

    setCreating(true);
    try {
      const res = await createStudent({
        name: form.name.trim(),
        email: form.email.trim(),
        department_id: Number(form.department_id),
        year: Number(form.year),
        semester: Number(form.semester),
      });
      setSuccess(
        `Student created. Temporary password: ${res.data.temporaryPassword}`
      );
      setForm(EMPTY_FORM);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create student");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (student) => {
    setSuccess("");
    setError("");
    setEditingId(student.id);
    setEditForm({
      name: student.name,
      email: student.email,
      department_id: student.department_id,
      year: String(student.year || 1),
      semester: String(student.semester || 1),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
  };
 const handleUpdate = async (id) => {
    setError("");
    setSuccess("");

    try {
      await updateStudent(id, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        department_id: Number(editForm.department_id),
        year: Number(editForm.year),
        semester: Number(editForm.semester),
      });
      cancelEdit();
      await fetchAll();
      setSuccess("Student updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update student");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      await deleteStudent(id);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete student");
    }
  };
  const filteredStudents = students.filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      String(s.id).includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-orange-500 mb-2">Students</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">
        Manage student records
      </p>

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

      {isAdmin ? (
        <form
          onSubmit={handleCreate}
          className="mb-8 grid grid-cols-1 md:grid-cols-6 gap-3"
        >
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Full name"
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <select
            value={form.department_id}
            onChange={(e) =>
              setForm({ ...form, department_id: e.target.value })
            }
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
            {creating ? "..." : "Add"}
          </button>
        </form>
      ) : (
        <div className="mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      )}

      {loading && (
        <p className="text-slate-500 dark:text-slate-400">Loading students...</p>
      )}

      {!loading && filteredStudents.length === 0 && (
        <p className="text-slate-500 dark:text-slate-400">No students found.</p>
      )}

      {!loading && filteredStudents.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 dark:bg-slate-700">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">ID</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">Name</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">Email</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">Dept</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">Year</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">Sem</th>
                {isAdmin && (
                  <th className="text-right px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr
                  key={s.id}
                  className="border-t border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750"
                >
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{s.id}</td>
                  <td className="px-6 py-4 font-medium text-orange-500 dark:text-orange-400">
                    {editingId === s.id ? (
                      <input
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded px-2 py-1 w-full"
                      />
                    ) : (
                      s.name
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                    {editingId === s.id ? (
                      <input
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                        className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded px-2 py-1 w-full"
                      />
                    ) : (
                      s.email
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                    {editingId === s.id ? (
                      <select
                        value={editForm.department_id || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            department_id: e.target.value,
                          })
                        }
                        className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded px-2 py-1"
                      >
                        <option value="">None</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      departmentName(s.department_id)
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                    {editingId === s.id ? (
                      <select
                        value={editForm.year}
                        onChange={(e) =>
                          setEditForm({ ...editForm, year: e.target.value })
                        }
                        className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded px-2 py-1"
                      >
                        {YEARS.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    ) : (
                      s.year || 1
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                    {editingId === s.id ? (
                      <select
                        value={editForm.semester}
                        onChange={(e) =>
                          setEditForm({ ...editForm, semester: e.target.value })
                        }
                        className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded px-2 py-1"
                      >
                        {SEMESTERS.map((sm) => (
                          <option key={sm} value={sm}>
                            {sm}
                          </option>
                        ))}
                      </select>
                    ) : (
                      s.semester || 1
                    )}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right space-x-3">
                      {editingId === s.id ? (
                        <>
                          <button
                            onClick={() => handleUpdate(s.id)}
                            className="text-green-500 dark:text-green-400 hover:opacity-80 text-sm font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-slate-500 dark:text-slate-400 hover:opacity-80 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(s)}
                            className="text-blue-500 dark:text-blue-400 hover:opacity-80 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="text-red-500 dark:text-red-400 hover:opacity-80 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}