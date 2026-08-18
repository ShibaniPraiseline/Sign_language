import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../lib/api";

export default function Contacts() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    const [friendsRes, requestsRes] = await Promise.all([
      api.get("/contacts"),
      api.get("/contacts/requests"),
    ]);
    setFriends(friendsRes.data.friends);
    setRequests(requestsRes.data.requests);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return setResults([]);
    const res = await api.get(`/contacts/search?q=${encodeURIComponent(query)}`);
    setResults(res.data.users);
  }

  async function sendRequest(toUserId) {
    await api.post("/contacts/request", { toUserId });
    setResults((r) => r.filter((u) => u.id !== toUserId));
  }

  async function respond(requestId, accept) {
    await api.post(`/contacts/requests/${requestId}/respond`, { accept });
    loadAll();
  }

  function startCall(friendId) {
    navigate(`/translate?peer=${friendId}`);
  }

  function initials(name) {
    return (name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-12 space-y-12">
        <div>
          <p className="font-mono text-xs text-ink-soft uppercase tracking-wider mb-2">Network</p>
          <h1 className="font-display text-3xl mb-5">Find people</h1>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email"
              className="field-input flex-1"
            />
            <button className="btn-secondary">Search</button>
          </form>

          {results.length > 0 && (
            <ul className="mt-4 space-y-2">
              {results.map((u) => (
                <li key={u.id} className="card flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-cobalt-soft text-cobalt flex items-center justify-center text-xs font-medium">
                      {initials(u.name)}
                    </span>
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-ink-soft">{u.email}</p>
                    </div>
                  </div>
                  <button onClick={() => sendRequest(u.id)} className="btn-primary text-sm py-1.5 px-3">
                    Add
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {requests.length > 0 && (
          <div>
            <h2 className="font-display text-xl mb-3">Friend requests</h2>
            <ul className="space-y-2">
              {requests.map((r) => (
                <li key={r.id} className="card flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-amber-soft text-amber-deep flex items-center justify-center text-xs font-medium">
                      {initials(r.from.name)}
                    </span>
                    <div>
                      <p className="font-medium">{r.from.name}</p>
                      <p className="text-xs text-ink-soft">{r.from.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => respond(r.id, true)} className="btn-primary text-sm py-1.5 px-3">
                      Accept
                    </button>
                    <button onClick={() => respond(r.id, false)} className="btn-secondary text-sm py-1.5 px-3">
                      Decline
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h2 className="font-display text-xl mb-3">Your contacts</h2>
          {loading ? (
            <p className="text-sm text-ink-soft">Loading...</p>
          ) : friends.length === 0 ? (
            <p className="text-sm text-ink-soft">No contacts yet — search above to add friends.</p>
          ) : (
            <ul className="space-y-2">
              {friends.map((f) => (
                <li key={f.id} className="card flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-cobalt-soft text-cobalt flex items-center justify-center text-xs font-medium">
                      {initials(f.name)}
                    </span>
                    <div>
                      <p className="font-medium">{f.name}</p>
                      <p className="text-xs text-ink-soft">{f.email}</p>
                    </div>
                  </div>
                  <button onClick={() => startCall(f.id)} className="btn-primary text-sm py-1.5 px-3">
                    Call
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
