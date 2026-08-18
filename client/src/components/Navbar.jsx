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
    <nav className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
      <Link to="/dashboard" className="text-lg font-semibold tracking-tight">
        Sign⇄Voice
      </Link>
      <div className="flex items-center gap-6 text-sm">
        <Link to="/dashboard" className="hover:text-teal-300">Dashboard</Link>
        <Link to="/contacts" className="hover:text-teal-300">Contacts</Link>
        <Link to="/profile" className="hover:text-teal-300">Profile</Link>
        <span className="text-slate-400">{user?.name}</span>
        <button
          onClick={handleLogout}
          className="rounded-md bg-slate-700 px-3 py-1.5 hover:bg-slate-600"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}
