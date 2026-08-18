import { useState } from "react";
import Navbar from "../components/Navbar";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    preferredLang: user?.preferredLang || "ISL",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await api.patch("/profile", form);
      updateUser(res.data.user);
      setMessage("Profile updated.");
    } catch (err) {
      setError(err.response?.data?.error || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="max-w-lg mx-auto px-6 py-12">
        <p className="font-mono text-xs text-ink-soft uppercase tracking-wider mb-2">Account</p>
        <h1 className="font-display text-3xl mb-6">Your profile</h1>

        {message && (
          <div className="mb-4 text-sm text-good bg-green-50 px-3 py-2 rounded-md">{message}</div>
        )}
        {error && (
          <div className="mb-4 text-sm text-bad bg-red-50 px-3 py-2 rounded-md">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="field-label">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="field-input" />
          </div>

          <div>
            <label className="field-label">Phone number</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91 9xxxxxxxxx"
              className="field-input"
            />
          </div>

          <div>
            <label className="field-label">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              maxLength={280}
              className="field-input"
            />
          </div>

          <div>
            <label className="field-label">Preferred sign language</label>
            <select
              name="preferredLang"
              value={form.preferredLang}
              onChange={handleChange}
              className="field-input"
            >
              <option value="ISL">ISL — Indian Sign Language</option>
              <option value="ASL">ASL — American Sign Language</option>
              <option value="BSL">BSL — British Sign Language</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <p className="text-xs text-ink-soft font-mono">{user?.email}</p>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
