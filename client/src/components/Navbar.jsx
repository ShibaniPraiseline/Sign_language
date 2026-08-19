import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/live-translation", label: "Live Translation" },
  { to: "/contacts", label: "Video Call" },
  { to: "/history", label: "History" },
  { to: "/profile", label: "Profile" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="bg-ink text-paper relative z-40">
      <div className="flex items-center justify-between px-6 py-4">
        <Link to="/dashboard" className="font-display text-lg tracking-tight" onClick={() => setMenuOpen(false)}>
          Sign<span className="text-amber">⇄</span>Voice
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-amber transition-colors">
              {l.label}
            </Link>
          ))}
          <span className="text-ink-soft font-mono text-xs">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="rounded-md border border-white/20 px-3 py-1.5 hover:bg-white/10 transition-colors"
          >
            Log out
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-md hover:bg-white/10"
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 px-6 py-4 flex flex-col gap-4 text-sm bg-ink">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)} className="hover:text-amber transition-colors">
              {l.label}
            </Link>
          ))}
          <span className="text-ink-soft font-mono text-xs">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="rounded-md border border-white/20 px-3 py-2 hover:bg-white/10 transition-colors text-left"
          >
            Log out
          </button>
        </div>
      )}
    </nav>
  );
}
