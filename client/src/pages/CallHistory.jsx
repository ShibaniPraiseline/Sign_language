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
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Call history</h1>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</div>
        )}

        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-slate-500">
            No calls yet — go to Contacts and start one.
          </p>
        ) : (
          <ul className="space-y-2">
            {sessions.map((s) => {
              const wasCaller = s.callerId === user.id;
              return (
                <li
                  key={s.id}
                  className="bg-white px-4 py-3 rounded-md border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {wasCaller ? "Outgoing call" : "Incoming call"} — {MODE_LABELS[s.mode] || s.mode}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {s.sourceLang} → {s.targetLang} · {new Date(s.startedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        s.status === "ended"
                          ? "bg-slate-100 text-slate-600"
                          : "bg-teal-50 text-teal-700"
                      }`}
                    >
                      {s.status}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">
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
