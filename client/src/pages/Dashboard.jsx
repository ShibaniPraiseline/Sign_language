import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Welcome, {user?.name}
        </h1>
        <p className="text-slate-600 mb-8">
          Pick a contact to start a live translation call, or update your details.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            to="/contacts"
            className="block bg-white p-6 rounded-lg border border-slate-200 hover:border-teal-400"
          >
            <div className="text-2xl mb-2">📇</div>
            <h2 className="font-semibold text-slate-900">Contacts</h2>
            <p className="text-sm text-slate-500 mt-1">
              Add friends and start a call with them.
            </p>
          </Link>

          <Link
            to="/profile"
            className="block bg-white p-6 rounded-lg border border-slate-200 hover:border-teal-400"
          >
            <div className="text-2xl mb-2">👤</div>
            <h2 className="font-semibold text-slate-900">Profile</h2>
            <p className="text-sm text-slate-500 mt-1">
              Update your phone number, bio, and preferred sign language.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
