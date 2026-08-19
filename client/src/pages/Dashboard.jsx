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
        <h1 className="font-display text-3xl mb-10">Welcome, {user?.name}</h1>

        {/* Primary: the two things this app actually does */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <Link
            to="/live-translation"
            className="card p-7 hover:border-cobalt transition-colors"
          >
            <div className="w-11 h-11 rounded-full bg-cobalt-soft text-cobalt flex items-center justify-center text-lg mb-4">
              🤟
            </div>
            <h2 className="font-display text-xl mb-1">Live Translation</h2>
            <p className="text-sm text-ink-soft leading-relaxed">
              Translate on your own — sign to sign, sign to voice, or voice to
              sign, right from your camera or mic.
            </p>
          </Link>

          <Link
            to="/contacts"
            className="card p-7 hover:border-amber transition-colors"
          >
            <div className="w-11 h-11 rounded-full bg-amber-soft text-amber-deep flex items-center justify-center text-lg mb-4">
              📹
            </div>
            <h2 className="font-display text-xl mb-1">Video Call</h2>
            <p className="text-sm text-ink-soft leading-relaxed">
              Call a contact with live translation running throughout the
              conversation.
            </p>
          </Link>
        </div>

        {/* Secondary */}
        <div className="grid sm:grid-cols-2 gap-3">
          <Link to="/history" className="card p-4 flex items-center gap-3 hover:border-line">
            <span className="text-lg">🕓</span>
            <div>
              <h3 className="font-medium text-sm">Call History</h3>
              <p className="text-xs text-ink-soft">Review past calls</p>
            </div>
          </Link>
          <Link to="/profile" className="card p-4 flex items-center gap-3 hover:border-line">
            <span className="text-lg">👤</span>
            <div>
              <h3 className="font-medium text-sm">Profile</h3>
              <p className="text-xs text-ink-soft">Details & preferences</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
