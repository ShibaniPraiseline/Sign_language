import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <p className="font-mono text-xs text-ink-soft uppercase tracking-wider mb-2">Dashboard</p>
        <h1 className="font-display text-3xl mb-2">Welcome, {user?.name}</h1>
        <p className="text-ink-soft mb-10">
          Pick a contact to start a live translation call, or update your details.
        </p>

        <div className="grid sm:grid-cols-3 gap-4">
          <Link to="/contacts" className="card p-6 hover:border-cobalt transition-colors">
            <div className="w-9 h-9 rounded-full bg-cobalt-soft text-cobalt flex items-center justify-center text-sm font-medium mb-3">
              📇
            </div>
            <h2 className="font-display text-lg">Contacts</h2>
            <p className="text-sm text-ink-soft mt-1">Add friends and start a call.</p>
          </Link>

          <Link to="/history" className="card p-6 hover:border-amber transition-colors">
            <div className="w-9 h-9 rounded-full bg-amber-soft text-amber-deep flex items-center justify-center text-sm font-medium mb-3">
              🕓
            </div>
            <h2 className="font-display text-lg">Call History</h2>
            <p className="text-sm text-ink-soft mt-1">Review past translation calls.</p>
          </Link>

          <Link to="/profile" className="card p-6 hover:border-cobalt transition-colors">
            <div className="w-9 h-9 rounded-full bg-cobalt-soft text-cobalt flex items-center justify-center text-sm font-medium mb-3">
              👤
            </div>
            <h2 className="font-display text-lg">Profile</h2>
            <p className="text-sm text-ink-soft mt-1">Phone, bio, preferred language.</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
