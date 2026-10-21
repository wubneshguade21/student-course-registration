import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-orange-500">
            Student Course Registration
          </h1>
          <nav className="flex gap-6 text-sm font-medium">
            <Link to="/" className="text-white hover:text-orange-400">
              Home
            </Link>
            <Link
              to="/admin-login"
              className="text-slate-300 hover:text-orange-400"
            >
              Admin Login
            </Link>
            <Link
              to="/student-login"
              className="text-slate-300 hover:text-orange-400"
            >
              Student Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-3xl text-center py-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to the
            <br />
            <span className="text-orange-500">
              Student Course Registration
            </span>{" "}
            System
          </h2>
          <p className="text-slate-400 text-lg mb-10">
            Choose how you want to log in.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/admin-login"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg transition text-lg"
            >
              🛡️ Admin Login
            </Link>
            <Link
              to="/student-login"
              className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-8 py-4 rounded-lg transition text-lg border border-slate-600"
            >
              🎓 Student Login
            </Link>
          </div>

          <p className="text-slate-500 text-sm mt-10">
            New student?{" "}
            <Link
              to="/register"
              className="text-orange-500 hover:text-orange-400"
            >
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}