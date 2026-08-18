import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BridgeMotif from "../components/BridgeMotif";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signup({ name, email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <BridgeMotif className="w-32 h-auto mx-auto mb-6 opacity-80" />
        <div className="card p-8">
          <h1 className="font-display text-2xl mb-1">Create your account</h1>
          <p className="text-sm text-ink-soft mb-6">Join and start translating conversations.</p>

          {error && (
            <div className="mb-4 text-sm text-bad bg-red-50 px-3 py-2 rounded-md">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field-input"
              />
            </div>
            <div>
              <label className="field-label">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-input"
              />
            </div>
            <div>
              <label className="field-label">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field-input"
              />
              <p className="text-xs text-ink-soft mt-1">At least 6 characters</p>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <p className="mt-5 text-sm text-center text-ink-soft">
            Already have an account?{" "}
            <Link to="/login" className="text-cobalt font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
