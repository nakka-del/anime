import { ChevronRight, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SafeImage from "./SafeImage";

const BannerCarousel = ({ items = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!items.length) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [items.length]);

  if (!items.length) {
    return null;
  }

  const activeItem = items[activeIndex];

  return (
    <section className="glass relative overflow-hidden rounded-[32px]">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/85 to-transparent" />
      <SafeImage src={activeItem.image} alt={activeItem.title} className="h-[440px] w-full object-cover opacity-55" />
      <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-sky-300">Featured Spotlight</p>
        <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white sm:text-6xl">{activeItem.title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
          Curated picks inspired by what the anime community is obsessing over right now.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to={`/anime/${activeItem.mal_id}`}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/20"
          >
            <PlayCircle size={18} />
            Open Details
          </Link>
          <Link
            to="/anime"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white"
          >
            Explore Catalog
            <ChevronRight size={18} />
          </Link>
        </div>
        <div className="mt-8 flex gap-2">
          {items.map((item, index) => (
            <button
              key={item.mal_id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 rounded-full transition ${index === activeIndex ? "w-10 bg-white" : "w-2.5 bg-white/30"}`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BannerCarousel;
