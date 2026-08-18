import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-ink text-paper">
      <Link to="/dashboard" className="font-display text-lg tracking-tight">
        Sign<span className="text-amber">⇄</span>Voice
      </Link>
      <div className="flex items-center gap-6 text-sm">
        <Link to="/dashboard" className="hover:text-amber transition-colors">Dashboard</Link>
        <Link to="/contacts" className="hover:text-amber transition-colors">Contacts</Link>
        <Link to="/history" className="hover:text-amber transition-colors">History</Link>
        <Link to="/profile" className="hover:text-amber transition-colors">Profile</Link>
        <span className="text-ink-soft font-mono text-xs">{user?.name}</span>
        <button
          onClick={handleLogout}
          className="rounded-md border border-white/20 px-3 py-1.5 hover:bg-white/10 transition-colors"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}
