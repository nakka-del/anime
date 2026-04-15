import { Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import SafeImage from "./SafeImage";

const AnimeCard = ({ anime, compact = false, isSaved = false, onToggleWatchlist }) => (
  <article
    className={clsx(
      "group glass overflow-hidden rounded-[28px] transition duration-300 hover:-translate-y-1 hover:border-white/20",
      compact ? "flex gap-4 p-4" : "",
    )}
  >
    <div className={clsx("relative overflow-hidden", compact ? "h-32 w-24 rounded-2xl" : "aspect-[3/4] w-full")}>
      <SafeImage
        src={anime.image}
        alt={anime.title}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <button
        type="button"
        onClick={() => onToggleWatchlist?.(anime)}
        className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-950/70 text-white backdrop-blur"
      >
        <Heart size={16} className={isSaved ? "fill-rose-400 text-rose-400" : ""} />
      </button>
    </div>

    <div className={clsx(compact ? "flex-1 pt-1" : "p-5")}>
      <div className="mb-3 flex items-center gap-2 text-xs text-slate-400">
        <span className="chip">{anime.type}</span>
        <span className="chip">{anime.status}</span>
      </div>
      <Link to={`/anime/${anime.mal_id}`}>
        <h3 className="line-clamp-2 text-lg font-semibold text-white transition group-hover:text-rose-300">
          {anime.title}
        </h3>
      </Link>
      <p className="mt-2 line-clamp-3 text-sm text-slate-400">
        {anime.synopsis || "A visually rich anime experience waiting to be discovered."}
      </p>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
        <span className="inline-flex items-center gap-1">
          <Star size={15} className="fill-amber-400 text-amber-400" />
          {anime.rating || "N/A"}
        </span>
        <span>{anime.episodes ? `${anime.episodes} eps` : "TBA"}</span>
      </div>
    </div>
  </article>
);

export default AnimeCard;
