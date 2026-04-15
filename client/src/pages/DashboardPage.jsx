import { CalendarDays, Heart, Shield, Trash2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import apiClient from "../api/apiClient";
import { createAdminAnime, deleteAdminAnime, fetchAdminAnime } from "../api/animeApi";
import AnimeCard from "../components/AnimeCard";
import EmptyState from "../components/EmptyState";
import LoadingSkeleton from "../components/LoadingSkeleton";
import SafeImage from "../components/SafeImage";
import SectionHeader from "../components/SectionHeader";
import { useAuth } from "../context/AuthContext";

const initialAdminForm = {
  title: "",
  synopsis: "",
  image: "",
  trailer: "",
  trailerImage: "",
  type: "TV",
  status: "Finished Airing",
  episodes: "",
  rating: "",
  season: "",
  year: "",
  source: "",
  duration: "",
  genres: "",
  themes: "",
  demographics: "",
  studios: "",
};

const DashboardPage = () => {
  const { user, refreshProfile } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [adminAnime, setAdminAnime] = useState([]);
  const [adminForm, setAdminForm] = useState(initialAdminForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const requests = [apiClient.get("/auth/profile"), apiClient.get("/watchlist")];

    if (user?.role === "admin") {
      requests.push(fetchAdminAnime());
    }

    Promise.all(requests)
      .then((results) => {
        setProfileData(results[0].data);
        setWatchlist(results[1].data);

        if (user?.role === "admin") {
          setAdminAnime(results[2]);
        }
      })
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, [user?.role]);

  const removeFromWatchlist = async (anime) => {
    await apiClient.delete(`/watchlist/${anime.animeId || anime.mal_id}`);
    setWatchlist((prev) => prev.filter((item) => item.animeId !== (anime.animeId || anime.mal_id)));
    await refreshProfile().catch(() => {});
    toast.success("Removed from watchlist");
  };

  const submitAdminAnime = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const createdAnime = await createAdminAnime(adminForm);
      setAdminAnime((prev) => [createdAnime, ...prev]);
      setAdminForm(initialAdminForm);
      toast.success("Anime added to admin catalog");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add anime");
    } finally {
      setSubmitting(false);
    }
  };

  const removeAdminAnime = async (animeId) => {
    try {
      await deleteAdminAnime(animeId);
      setAdminAnime((prev) => prev.filter((anime) => anime.mal_id !== animeId));
      toast.success("Anime deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete anime");
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <LoadingSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="Dashboard"
        title={`Welcome back, ${user?.name}`}
        description={
          user?.role === "admin"
            ? "You have admin access. Manage custom anime entries and shape the catalog visible across the platform."
            : "Your personal anime dashboard with profile stats, saved shows, and bookmark management."
        }
      />

      <section className="mb-10 grid gap-6 lg:grid-cols-3">
        <div className="glass rounded-[28px] p-6">
          <div className="flex items-center gap-3">
            <SafeImage src={user.avatar} alt={user.name} className="h-16 w-16 rounded-full border border-white/10" />
            <div>
              <p className="text-xl font-semibold text-white">{user.name}</p>
              <p className="text-sm text-slate-400">{user.email}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.25em] text-sky-300">{user.role}</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-[28px] p-6">
          <p className="inline-flex items-center gap-2 text-sm text-slate-400">
            <Heart size={16} />
            Watchlist
          </p>
          <p className="mt-3 text-4xl font-black text-white">{profileData?.stats?.watchlistCount || watchlist.length}</p>
          <p className="mt-2 text-sm text-slate-400">Saved titles ready for your next session.</p>
        </div>
        <div className="glass rounded-[28px] p-6">
          <p className="inline-flex items-center gap-2 text-sm text-slate-400">
            <CalendarDays size={16} />
            Member since
          </p>
          <p className="mt-3 text-2xl font-bold text-white">
            {new Date(profileData?.stats?.memberSince || Date.now()).toLocaleDateString()}
          </p>
          <p className="mt-2 text-sm text-slate-400">Your archive started here.</p>
        </div>
      </section>

      {user?.role === "admin" ? (
        <section className="mb-10 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="glass rounded-[32px] p-6">
            <div className="mb-6 flex items-center gap-3">
              <Shield className="text-amber-300" />
              <h2 className="text-2xl font-semibold text-white">Admin Catalog Controls</h2>
            </div>

            <form onSubmit={submitAdminAnime} className="grid gap-4 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm text-slate-300">Title</span>
                <input
                  value={adminForm.title}
                  onChange={(event) => setAdminForm((prev) => ({ ...prev, title: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  required
                />
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm text-slate-300">Synopsis</span>
                <textarea
                  value={adminForm.synopsis}
                  onChange={(event) => setAdminForm((prev) => ({ ...prev, synopsis: event.target.value }))}
                  className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                />
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm text-slate-300">Poster Image URL</span>
                <input
                  value={adminForm.image}
                  onChange={(event) => setAdminForm((prev) => ({ ...prev, image: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  placeholder="https://..."
                  required
                />
              </label>
              <label>
                <span className="mb-2 block text-sm text-slate-300">Trailer Embed URL</span>
                <input
                  value={adminForm.trailer}
                  onChange={(event) => setAdminForm((prev) => ({ ...prev, trailer: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  placeholder="https://www.youtube.com/embed/..."
                />
              </label>
              <label>
                <span className="mb-2 block text-sm text-slate-300">Trailer Thumbnail URL</span>
                <input
                  value={adminForm.trailerImage}
                  onChange={(event) => setAdminForm((prev) => ({ ...prev, trailerImage: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  placeholder="https://..."
                />
              </label>
              <label>
                <span className="mb-2 block text-sm text-slate-300">Type</span>
                <select
                  value={adminForm.type}
                  onChange={(event) => setAdminForm((prev) => ({ ...prev, type: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                >
                  <option value="TV">TV</option>
                  <option value="Movie">Movie</option>
                  <option value="OVA">OVA</option>
                  <option value="ONA">ONA</option>
                </select>
              </label>
              <label>
                <span className="mb-2 block text-sm text-slate-300">Status</span>
                <select
                  value={adminForm.status}
                  onChange={(event) => setAdminForm((prev) => ({ ...prev, status: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                >
                  <option value="Finished Airing">Finished Airing</option>
                  <option value="Currently Airing">Currently Airing</option>
                  <option value="Not yet aired">Not yet aired</option>
                </select>
              </label>
              <label>
                <span className="mb-2 block text-sm text-slate-300">Episodes</span>
                <input
                  value={adminForm.episodes}
                  onChange={(event) => setAdminForm((prev) => ({ ...prev, episodes: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  type="number"
                />
              </label>
              <label>
                <span className="mb-2 block text-sm text-slate-300">Rating</span>
                <input
                  value={adminForm.rating}
                  onChange={(event) => setAdminForm((prev) => ({ ...prev, rating: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  type="number"
                  step="0.1"
                />
              </label>
              <label>
                <span className="mb-2 block text-sm text-slate-300">Season</span>
                <input
                  value={adminForm.season}
                  onChange={(event) => setAdminForm((prev) => ({ ...prev, season: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  placeholder="spring"
                />
              </label>
              <label>
                <span className="mb-2 block text-sm text-slate-300">Year</span>
                <input
                  value={adminForm.year}
                  onChange={(event) => setAdminForm((prev) => ({ ...prev, year: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  type="number"
                />
              </label>
              <label>
                <span className="mb-2 block text-sm text-slate-300">Source</span>
                <input
                  value={adminForm.source}
                  onChange={(event) => setAdminForm((prev) => ({ ...prev, source: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  placeholder="Manga"
                />
              </label>
              <label>
                <span className="mb-2 block text-sm text-slate-300">Duration</span>
                <input
                  value={adminForm.duration}
                  onChange={(event) => setAdminForm((prev) => ({ ...prev, duration: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  placeholder="24 min per ep"
                />
              </label>
              <label>
                <span className="mb-2 block text-sm text-slate-300">Genres</span>
                <input
                  value={adminForm.genres}
                  onChange={(event) => setAdminForm((prev) => ({ ...prev, genres: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  placeholder="Action, Fantasy"
                />
              </label>
              <label>
                <span className="mb-2 block text-sm text-slate-300">Themes</span>
                <input
                  value={adminForm.themes}
                  onChange={(event) => setAdminForm((prev) => ({ ...prev, themes: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  placeholder="School, Time Travel"
                />
              </label>
              <label>
                <span className="mb-2 block text-sm text-slate-300">Demographics</span>
                <input
                  value={adminForm.demographics}
                  onChange={(event) => setAdminForm((prev) => ({ ...prev, demographics: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  placeholder="Shounen"
                />
              </label>
              <label>
                <span className="mb-2 block text-sm text-slate-300">Studios</span>
                <input
                  value={adminForm.studios}
                  onChange={(event) => setAdminForm((prev) => ({ ...prev, studios: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  placeholder="MAPPA, Bones"
                />
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="md:col-span-2 rounded-2xl bg-gradient-to-r from-amber-400 to-rose-500 px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {submitting ? "Adding anime..." : "Add Anime to Catalog"}
              </button>
            </form>
          </div>

          <div className="glass rounded-[32px] p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Shield className="text-amber-300" />
                <h2 className="text-2xl font-semibold text-white">Managed Anime</h2>
              </div>
              <span className="chip">{adminAnime.length} entries</span>
            </div>

            {adminAnime.length ? (
              <div className="space-y-4">
                {adminAnime.map((anime) => (
                  <div
                    key={anime.mal_id}
                    className="rounded-[24px] border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-start gap-4">
                      <SafeImage src={anime.image} alt={anime.title} className="h-28 w-20 rounded-2xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="text-lg font-semibold text-white">{anime.title}</p>
                        <p className="mt-2 line-clamp-3 text-sm text-slate-400">{anime.synopsis}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="chip">{anime.type}</span>
                          <span className="chip">{anime.status}</span>
                          <span className="chip">{anime.rating || "N/A"} score</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAdminAnime(anime.mal_id)}
                        className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-200"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No admin anime yet"
                description="Use the form to add your own anime cards, details, and trailers into the shared catalog."
              />
            )}
          </div>
        </section>
      ) : null}

      <section className="glass rounded-[32px] p-6">
        <div className="mb-6 flex items-center gap-3">
          <UserRound className="text-sky-300" />
          <h2 className="text-2xl font-semibold text-white">Your Watchlist</h2>
        </div>

        {watchlist.length ? (
          <div className="space-y-4">
            {watchlist.map((anime) => (
              <AnimeCard
                key={anime._id}
                anime={{ ...anime, mal_id: anime.animeId }}
                compact
                isSaved
                onToggleWatchlist={removeFromWatchlist}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Your watchlist is empty"
            description="Start saving shows from the home page or anime catalog and they'll appear here."
          />
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
