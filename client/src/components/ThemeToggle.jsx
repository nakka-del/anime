import { Moon, SunMedium } from "lucide-react";

const ThemeToggle = ({ theme, toggleTheme }) => (
  <button
    type="button"
    onClick={toggleTheme}
    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 transition hover:scale-105"
    aria-label="Toggle theme"
  >
    {theme === "dark" ? <SunMedium size={18} /> : <Moon size={18} />}
  </button>
);

export default ThemeToggle;
