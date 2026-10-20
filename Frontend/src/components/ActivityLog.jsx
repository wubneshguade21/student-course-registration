import { useState, useEffect } from "react";
import { getActivities } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

export default function Activities() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdmin = user?.role?.toLowerCase() === "admin" || user?.role_id === 1;

  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchLogs = async () => {
      try {
        const res = await getActivities();
        if (Array.isArray(res.data)) {
          setLogs(res.data);
        }
      } catch (err) {
        console.error(err);
        setError("Could not load activity logs. Please check the backend.");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <Layout>
        <div className="p-6 text-red-500 font-bold">Access Denied. Admins only.</div>
      </Layout>
    );
  }

  const getBadgeStyle = (action) => {
    switch (action) {
      case "CREATE":
      case "REGISTER":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "UPDATE":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "DELETE":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-orange-500 mb-2">System Activity</h1>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading activity...</p>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
      ) : logs.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-8 text-center rounded-xl border border-slate-300 dark:border-slate-700">
          <p className="text-slate-500">No recent activity found.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm">
                <tr>
                  <th className="px-6 py-4 font-semibold">Action</th>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Details</th>
                  <th className="px-6 py-4 font-semibold">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-sm">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md tracking-wider ${getBadgeStyle(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {log.user_name || "System"}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      <span className="capitalize font-medium text-orange-500 mr-1">{log.entity_type}</span>
                      : {log.entity_name}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}