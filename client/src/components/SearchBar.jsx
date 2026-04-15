import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchAnimeSuggestions } from "../api/animeApi";
import useDebounce from "../hooks/useDebounce";
import SafeImage from "./SafeImage";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedQuery = useDebounce(query, 350);
  const navigate = useNavigate();

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestions([]);
      return;
    }

    fetchAnimeSuggestions(debouncedQuery)
      .then((data) => setSuggestions(data))
      .catch(() => setSuggestions([]));
  }, [debouncedQuery]);

  const submitSearch = (event) => {
    event.preventDefault();

    if (!query.trim()) {
      return;
    }

    setShowSuggestions(false);
    navigate(`/anime?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="relative">
      <form onSubmit={submitSearch} className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => window.setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Search anime, studios, worlds..."
          className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-400 focus:border-sky-400/50"
        />
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="glass absolute mt-3 w-full overflow-hidden rounded-3xl">
          {suggestions.map((anime) => (
            <Link
              key={anime.mal_id}
              to={`/anime/${anime.mal_id}`}
              className="flex items-center gap-3 border-b border-white/5 px-4 py-3 transition hover:bg-white/5 last:border-b-0"
            >
              <SafeImage src={anime.image} alt={anime.title} className="h-14 w-10 rounded-lg object-cover" />
              <span className="text-sm text-slate-100">{anime.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
