import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

const MODE_LABELS = {
  "sign-to-sign": "Sign → Sign",
  "sign-to-voice": "Sign → Voice",
  "voice-to-sign": "Voice → Sign",
};

function formatDuration(startedAt, endedAt) {
  if (!endedAt) return "—";
  const seconds = Math.round((new Date(endedAt) - new Date(startedAt)) / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export default function CallHistory() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/calls/history")
      .then((res) => setSessions(res.data.sessions))
      .catch((err) => setError(err.response?.data?.error || "Could not load call history."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <p className="font-mono text-xs text-ink-soft uppercase tracking-wider mb-2">Log</p>
        <h1 className="font-display text-3xl mb-6">Call history</h1>

        {error && (
          <div className="mb-4 text-sm text-bad bg-red-50 px-3 py-2 rounded-md">{error}</div>
        )}

        {loading ? (
          <p className="text-sm text-ink-soft">Loading...</p>
        ) : sessions.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-sm text-ink-soft">No calls yet — go to Contacts and start one.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {sessions.map((s) => {
              const wasCaller = s.callerId === user.id;
              return (
                <li key={s.id} className="card flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${
                        wasCaller ? "bg-cobalt-soft text-cobalt" : "bg-amber-soft text-amber-deep"
                      }`}
                    >
                      {wasCaller ? "↗" : "↙"}
                    </span>
                    <div>
                      <p className="font-medium">
                        {wasCaller ? "Outgoing" : "Incoming"} · {MODE_LABELS[s.mode] || s.mode}
                      </p>
                      <p className="text-xs text-ink-soft font-mono mt-0.5">
                        {s.sourceLang} → {s.targetLang} · {new Date(s.startedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-mono px-2 py-1 rounded-full ${
                        s.status === "ended"
                          ? "bg-line/60 text-ink-soft"
                          : "bg-green-50 text-good"
                      }`}
                    >
                      {s.status}
                    </span>
                    <p className="text-xs text-ink-soft font-mono mt-1">
                      {formatDuration(s.startedAt, s.endedAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
