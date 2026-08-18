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

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-10 space-y-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Find people</h1>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-900">
              Search
            </button>
          </form>

          {results.length > 0 && (
            <ul className="mt-4 space-y-2">
              {results.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between bg-white px-4 py-3 rounded-md border border-slate-200"
                >
                  <div>
                    <p className="font-medium text-slate-900">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                  <button
                    onClick={() => sendRequest(u.id)}
                    className="text-sm px-3 py-1.5 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                  >
                    Add
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {requests.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Friend requests</h2>
            <ul className="space-y-2">
              {requests.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between bg-white px-4 py-3 rounded-md border border-slate-200"
                >
                  <div>
                    <p className="font-medium text-slate-900">{r.from.name}</p>
                    <p className="text-xs text-slate-500">{r.from.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => respond(r.id, true)}
                      className="text-sm px-3 py-1.5 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => respond(r.id, false)}
                      className="text-sm px-3 py-1.5 border border-slate-300 rounded-md hover:bg-slate-100"
                    >
                      Decline
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Your contacts</h2>
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : friends.length === 0 ? (
            <p className="text-sm text-slate-500">No contacts yet — search above to add friends.</p>
          ) : (
            <ul className="space-y-2">
              {friends.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between bg-white px-4 py-3 rounded-md border border-slate-200"
                >
                  <div>
                    <p className="font-medium text-slate-900">{f.name}</p>
                    <p className="text-xs text-slate-500">{f.email}</p>
                  </div>
                  <button
                    onClick={() => startCall(f.id)}
                    className="text-sm px-3 py-1.5 bg-slate-800 text-white rounded-md hover:bg-slate-900"
                  >
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
