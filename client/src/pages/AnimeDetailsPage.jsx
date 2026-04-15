import { Clapperboard, Heart, PlayCircle, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import apiClient from "../api/apiClient";
import { fetchAnimeDetails } from "../api/animeApi";
import EmptyState from "../components/EmptyState";
import LoadingSkeleton from "../components/LoadingSkeleton";
import SafeImage from "../components/SafeImage";
import { useAuth } from "../context/AuthContext";
import { FALLBACK_CHARACTER_IMAGE } from "../utils/media";
import { mapWatchlistPayload } from "../utils/watchlist";

const AnimeDetailsPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    Promise.all([
      fetchAnimeDetails(id),
      isAuthenticated ? apiClient.get("/watchlist") : Promise.resolve({ data: [] }),
    ])
      .then(([animePayload, watchlistRes]) => {
        setAnime(animePayload);
        setSaved(watchlistRes.data.some((item) => item.animeId === Number(id)));
        setLoadError("");
      })
      .catch(() => {
        setAnime(null);
        setLoadError("Anime details could not be loaded.");
        toast.error("Failed to load anime details");
      })
      .finally(() => setLoading(false));
  }, [id, isAuthenticated]);

  const toggleWatchlist = async () => {
    if (!isAuthenticated) {
      toast.error("Login to save anime to your watchlist");
      return;
    }

    if (saved) {
      await apiClient.delete(`/watchlist/${id}`);
      setSaved(false);
      toast.success("Removed from watchlist");
      return;
    }

    await apiClient.post("/watchlist", mapWatchlistPayload(anime));
    setSaved(true);
    toast.success("Added to watchlist");
  };

  if (loading) {
    return (
      <div className="page-shell">
        <LoadingSkeleton count={4} />
      </div>
    );
  }

  if (loadError || !anime) {
    return (
      <div className="page-shell">
        <EmptyState
          title="This anime page could not be opened"
          description="The trailer or metadata request did not complete. Check that the backend is running, then try again."
        />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <section className="glass overflow-hidden rounded-[36px]">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <div className="relative">
            <SafeImage src={anime.image} alt={anime.title} className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 to-transparent p-6">
              <span className="chip">{anime.type}</span>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="chip">{anime.status}</span>
              <span className="chip">{anime.seasonYear || "Catalog classic"}</span>
              <span className="chip">{anime.rating ? `${anime.rating} score` : "No score yet"}</span>
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">{anime.title}</h1>
            <p className="mt-3 text-sm text-slate-400">{anime.title_japanese}</p>
            <p className="mt-6 max-w-4xl text-sm leading-7 text-slate-300">{anime.synopsis}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Score</p>
                <p className="mt-2 inline-flex items-center gap-2 text-2xl font-bold text-white">
                  <Star size={20} className="fill-amber-400 text-amber-400" />
                  {anime.rating || "N/A"}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Episodes</p>
                <p className="mt-2 text-2xl font-bold text-white">{anime.episodes || "TBA"}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Source</p>
                <p className="mt-2 text-2xl font-bold text-white">{anime.source || "Unknown"}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Duration</p>
                <p className="mt-2 text-2xl font-bold text-white">{anime.duration || "Unknown"}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={toggleWatchlist}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-400 px-6 py-3 text-sm font-semibold text-white"
              >
                <Heart size={18} className={saved ? "fill-white" : ""} />
                {saved ? "Saved to Watchlist" : "Add to Watchlist"}
              </button>
              <a
                href="#trailer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white"
              >
                <PlayCircle size={18} />
                Watch Trailer
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {[...(anime.genres || []), ...(anime.themes || []), ...(anime.demographics || [])].slice(0, 10).map((item) => (
                <span key={item.mal_id || item.name} className="chip">
                  {item.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-8 xl:grid-cols-[1.4fr_0.9fr]">
        <div id="trailer" className="glass rounded-[32px] p-6">
          <div className="mb-4 flex items-center gap-3">
            <Clapperboard className="text-sky-300" />
            <h2 className="text-2xl font-semibold text-white">Trailer Preview</h2>
          </div>
          {anime.trailer ? (
            <div className="overflow-hidden rounded-[28px] border border-white/10">
              <iframe
                title={`${anime.title} trailer`}
                src={anime.trailer}
                className="aspect-video w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-white/10 bg-white/5 p-10 text-center text-slate-400">
              Trailer not available yet for this title.
            </div>
          )}
        </div>

        <div className="glass rounded-[32px] p-6">
          <h2 className="text-2xl font-semibold text-white">Cast Snapshot</h2>
          <div className="mt-6 space-y-4">
            {anime.characters?.slice(0, 6).map((entry) => (
              <div key={entry.character.mal_id} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-3">
                <SafeImage
                  src={entry.character.images?.jpg?.image_url}
                  alt={entry.character.name}
                  className="h-16 w-12 rounded-xl object-cover"
                  fallbackSrc={FALLBACK_CHARACTER_IMAGE}
                />
                <div>
                  <p className="font-medium text-white">{entry.character.name}</p>
                  <p className="text-sm text-slate-400">{entry.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {anime.promoVideos?.length ? (
        <section className="mt-10 glass rounded-[32px] p-6">
          <h2 className="text-2xl font-semibold text-white">Jikan Promo Videos</h2>
          <p className="mt-2 text-sm text-slate-400">
            These promo clips are fetched from the Jikan anime videos endpoint when available.
          </p>
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {anime.promoVideos.map((video, index) => (
              <a
                key={`${video.title}-${index}`}
                href={video.trailer?.url || video.trailer?.embed_url || "#trailer"}
                target="_blank"
                rel="noreferrer"
                className="overflow-hidden rounded-[24px] border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:border-white/20"
              >
                <SafeImage
                  src={video.images?.jpg?.image_url || anime.trailerImage}
                  alt={video.title}
                  className="aspect-video w-full object-cover"
                />
                <div className="p-4">
                  <p className="line-clamp-2 text-sm font-semibold text-white">{video.title || "Promo video"}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-sky-300">Open video</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="glass rounded-[28px] p-6">
          <h3 className="text-lg font-semibold text-white">Recommendation Pulse</h3>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            If you enjoy {anime.title}, try adjacent genres, the same studio lineup, or similarly ranked seasonal shows. This mock recommendation card is ready to evolve into a fuller recommendation engine later.
          </p>
        </div>
        <div className="glass rounded-[28px] p-6">
          <h3 className="text-lg font-semibold text-white">Reviews Mock</h3>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Community reviews can slot here next, with spoiler flags, sentiment chips, and top fan reactions.
          </p>
        </div>
        <div className="glass rounded-[28px] p-6">
          <h3 className="text-lg font-semibold text-white">Episode Streaming UI</h3>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            A streaming interface placeholder is included conceptually so the platform feels closer to a modern anime portal without shipping unlicensed playback.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AnimeDetailsPage;
