import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/apiClient";
import { fetchHomeData } from "../api/animeApi";
import AnimeCard from "../components/AnimeCard";
import BannerCarousel from "../components/BannerCarousel";
import EmptyState from "../components/EmptyState";
import LoadingSkeleton from "../components/LoadingSkeleton";
import SectionHeader from "../components/SectionHeader";
import { useAuth } from "../context/AuthContext";
import { mapWatchlistPayload } from "../utils/watchlist";

const INITIAL_HOME_DATA = {
  featured: [],
  trending: [],
  topRated: [],
  latest: [],
};

const HomePage = () => {
  const [homeData, setHomeData] = useState(INITIAL_HOME_DATA);
  const [watchlistIds, setWatchlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    Promise.all([
      fetchHomeData(),
      isAuthenticated ? apiClient.get("/watchlist") : Promise.resolve({ data: [] }),
    ])
      .then(([homePayload, watchlistRes]) => {
        setHomeData(homePayload);
        setWatchlistIds(watchlistRes.data.map((item) => item.animeId));
        setLoadError("");
      })
      .catch(() => {
        setHomeData(INITIAL_HOME_DATA);
        setLoadError("Anime feed could not be loaded right now.");
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const toggleWatchlist = async (anime) => {
    if (!isAuthenticated) {
      toast.error("Login to save anime to your watchlist");
      return;
    }

    const exists = watchlistIds.includes(anime.mal_id);

    if (exists) {
      await apiClient.delete(`/watchlist/${anime.mal_id}`);
      setWatchlistIds((prev) => prev.filter((id) => id !== anime.mal_id));
      toast.success("Removed from watchlist");
      return;
    }

    await apiClient.post("/watchlist", mapWatchlistPayload(anime));
    setWatchlistIds((prev) => [...prev, anime.mal_id]);
    toast.success("Added to watchlist");
  };

  const renderSection = (title, description, items) => (
    <section className="mt-12">
      <SectionHeader
        title={title}
        description={description}
        action={
          <Link to="/anime" className="inline-flex items-center gap-2 text-sm font-medium text-sky-300">
            View more
            <ArrowRight size={16} />
          </Link>
        }
      />
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((anime) => (
          <AnimeCard
            key={anime.mal_id}
            anime={anime}
            isSaved={watchlistIds.includes(anime.mal_id)}
            onToggleWatchlist={toggleWatchlist}
          />
        ))}
      </div>
    </section>
  );

  return (
    <div className="page-shell">
      {loading ? (
        <>
          <div className="glass mb-12 h-[440px] animate-pulse rounded-[32px]" />
          <LoadingSkeleton count={8} />
        </>
      ) : loadError ? (
        <EmptyState
          title="The anime feed is taking a break"
          description="The frontend is up, but the anime data source did not respond. Make sure the backend is running on port 5000, or reload in a moment."
        />
      ) : (
        <>
          <BannerCarousel items={homeData.featured} />

          <section className="mt-12 grid gap-6 xl:grid-cols-3">
            <div className="glass rounded-[32px] p-6 xl:col-span-2">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-rose-300">Welcome to the feed</p>
              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Everything anime fans want, in one cinematic dashboard.
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">
                Browse trending hits, surface underrated gems, save personal watchlists, and jump straight into anime detail pages with trailers, ratings, and metadata pulled from MyAnimeList via Jikan.
              </p>
            </div>
            <div className="glass rounded-[32px] p-6">
              <p className="text-sm text-slate-400">Fast access</p>
              <div className="mt-4 space-y-4">
                <Link to="/anime?status=airing" className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white">
                  Airing now
                </Link>
                <Link to="/anime?type=Movie" className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white">
                  Anime movies
                </Link>
                <Link to="/dashboard" className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white">
                  Your watchlist
                </Link>
              </div>
            </div>
          </section>

          {renderSection("Trending Anime", "Airing shows and community favorites dominating the charts.", homeData.trending)}
          {renderSection("Top Rated", "Critically loved anime with the strongest audience scores.", homeData.topRated)}
          {renderSection("Latest Releases", "Fresh seasonal launches and newly released episodes.", homeData.latest)}
        </>
      )}
    </div>
  );
};

export default HomePage;
