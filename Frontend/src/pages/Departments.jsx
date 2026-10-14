import { useState, useEffect } from "react";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../api/departments";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

export default function Departments() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await getDepartments();
      setDepartments(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // ---------- CREATE ----------
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    try {
      await createDepartment({ name: name.trim() });
      setName("");
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || "This department already exists");
    } finally {
      setCreating(false);
    }
  };

  // ---------- UPDATE ----------
  const startEdit = (dept) => {
    setEditingId(dept.id);
    setEditName(dept.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    try {
      await updateDepartment(id, { name: editName.trim() });
      cancelEdit();
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update department");
    }
  };

  // ---------- DELETE (soft) ----------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    try {
      await deleteDepartment(id);
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete department");
    }
  };

  // ---------- FILTER ----------
  const filteredDepartments = departments.filter((d) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return String(d.id).includes(q) || d.name.toLowerCase().includes(q);
  });

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-orange-500 mb-2">
        Departments
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">
        Manage academic departments
      </p>

      {error && (
        <div className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 p-3 rounded-lg mb-6 border border-red-300 dark:border-red-700">
          {error}
        </div>
      )}

      {/* ADMIN: Add form. STUDENT: Search box. */}
      {isAdmin ? (
        <form onSubmit={handleCreate} className="mb-8 flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter department name"
            className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-orange-600 hover:bg-orange-500 text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:bg-orange-800"
          >
            {creating ? "Creating..." : "Add Department"}
          </button>
        </form>
      ) : (
        <div className="mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID or name..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      )}

      {loading && (
        <p className="text-slate-500 dark:text-slate-400">
          Loading departments...
        </p>
      )}

      {!loading && filteredDepartments.length === 0 && (
        <p className="text-slate-500 dark:text-slate-400">
          {search
            ? "No departments match your search."
            : "No departments found."}
        </p>
      )}

      {!loading && filteredDepartments.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 dark:bg-slate-700">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  ID
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Name
                </th>
                {isAdmin && (
                  <th className="text-right px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredDepartments.map((dept) => (
                <tr
                  key={dept.id}
                  className="border-t border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750"
                >
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {dept.id}
                  </td>
                  <td className="px-6 py-4 font-medium text-orange-500 dark:text-orange-400">
                    {editingId === dept.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded px-2 py-1 w-full"
                      />
                    ) : (
                      dept.name
                    )}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right space-x-3">
                      {editingId === dept.id ? (
                        <>
                          <button
                            onClick={() => handleUpdate(dept.id)}
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
                            onClick={() => startEdit(dept)}
                            className="text-blue-500 dark:text-blue-400 hover:opacity-80 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(dept.id)}
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