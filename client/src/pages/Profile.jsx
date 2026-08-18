import { useState } from "react";
import Navbar from "../components/Navbar";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

function initials(name) {
  return (name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    avatarUrl: user?.avatarUrl || "",
    preferredLang: user?.preferredLang || "ISL",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState("");
  const [pwError, setPwError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      // Don't send an empty string for a url() field — treat blank as "unset"
      const payload = { ...form };
      if (!payload.avatarUrl) delete payload.avatarUrl;
      const res = await api.patch("/profile", payload);
      updateUser(res.data.user);
      setMessage("Profile updated.");
    } catch (err) {
      setError(err.response?.data?.error || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPwSaving(true);
    setPwMessage("");
    setPwError("");
    try {
      await api.post("/auth/change-password", pwForm);
      setPwMessage("Password changed.");
      setPwForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPwError(err.response?.data?.error || "Could not change password.");
    } finally {
      setPwSaving(false);
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
          <div className="flex items-center gap-4">
            {form.avatarUrl ? (
              <img
                src={form.avatarUrl}
                alt=""
                className="w-16 h-16 rounded-full object-cover border border-line"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            ) : (
              <span className="w-16 h-16 rounded-full bg-cobalt-soft text-cobalt flex items-center justify-center text-lg font-medium">
                {initials(form.name)}
              </span>
            )}
            <div className="flex-1">
              <label className="field-label">Avatar image URL</label>
              <input
                name="avatarUrl"
                value={form.avatarUrl}
                onChange={handleChange}
                placeholder="https://example.com/photo.jpg"
                className="field-input"
              />
            </div>
          </div>

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

        <h2 className="font-display text-xl mt-10 mb-3">Change password</h2>

        {pwMessage && (
          <div className="mb-4 text-sm text-good bg-green-50 px-3 py-2 rounded-md">{pwMessage}</div>
        )}
        {pwError && (
          <div className="mb-4 text-sm text-bad bg-red-50 px-3 py-2 rounded-md">{pwError}</div>
        )}

        <form onSubmit={handlePasswordSubmit} className="card p-6 space-y-4">
          <div>
            <label className="field-label">Current password</label>
            <input
              type="password"
              required
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label">New password</label>
            <input
              type="password"
              required
              minLength={6}
              value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              className="field-input"
            />
          </div>
          <div className="pt-2 text-right">
            <button type="submit" disabled={pwSaving} className="btn-primary">
              {pwSaving ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
