import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  name: "",
  email: "",
  password: "",
};

const AuthPage = () => {
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (mode === "register") {
        await register(formData);
      } else {
        await login({
          email: formData.email,
          password: formData.password,
        });
      }

      navigate(location.state?.from || "/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <section className="mx-auto grid max-w-6xl overflow-hidden rounded-[36px] border border-white/10 bg-slate-950/60 shadow-2xl shadow-slate-950/40 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative hidden overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,107,107,0.35),transparent_30%),linear-gradient(180deg,#0f172a_0%,#020617_100%)] p-10 lg:block">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.05),transparent)]" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-300">Your anime identity</p>
            <h1 className="mt-6 text-5xl font-black tracking-tight text-white">Build your personal anime universe.</h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-slate-300">
              Save watchlists, explore top titles, track new releases, and keep your anime journey synced across a polished MERN experience.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mb-8 flex rounded-full border border-white/10 bg-white/5 p-1">
            {["login", "register"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMode(tab)}
                className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
                  mode === tab ? "bg-gradient-to-r from-rose-500 to-orange-400 text-white" : "text-slate-400"
                }`}
              >
                {tab === "login" ? "Login" : "Create account"}
              </button>
            ))}
          </div>

          <h2 className="text-3xl font-bold text-white">{mode === "login" ? "Welcome back" : "Start your AnimeVerse profile"}</h2>
          <p className="mt-3 text-sm text-slate-400">
            {mode === "login"
              ? "Access your watchlist and dashboard instantly."
              : "Create an account to save favorites and manage your anime library."}
          </p>
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            <p className="font-semibold text-white">Demo logins</p>
            <p className="mt-2">
              Admin: <code>admin@animeverse.demo</code> / <code>Admin@123</code>
            </p>
            <p>
              User: <code>user@animeverse.demo</code> / <code>User@123</code>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {mode === "register" ? (
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Name</span>
                <input
                  value={formData.name}
                  onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  placeholder="Enter your display name"
                />
              </label>
            ) : null}

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Email</span>
              <input
                type="email"
                value={formData.email}
                onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                required
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                placeholder="you@example.com"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Password</span>
              <input
                type="password"
                value={formData.password}
                onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
                required
                minLength={6}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                placeholder="Minimum 6 characters"
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-orange-400 px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-70"
            >
              {submitting ? "Processing..." : mode === "login" ? "Login to AnimeVerse" : "Create account"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default AuthPage;
