import { Menu, Search, UserCircle2 } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useTheme from "../../hooks/useTheme";
import SearchBar from "../SearchBar";
import SafeImage from "../SafeImage";
import ThemeToggle from "../ThemeToggle";

const navLinkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-white/10 text-white shadow-lg shadow-black/10"
      : "text-slate-300 hover:bg-white/5 hover:text-white"
  }`;

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="page-shell flex items-center gap-4 py-4">
        <Link to="/" className="mr-auto flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-orange-400 to-sky-500 text-lg font-black text-white">
            AV
          </div>
          <div>
            <p className="text-lg font-bold tracking-wide">AnimeVerse</p>
            <p className="text-xs text-slate-400">Track. Discover. Binge smarter.</p>
          </div>
        </Link>

        <div className="hidden flex-1 lg:block">
          <SearchBar />
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          <NavLink className={navLinkClass} to="/">
            Home
          </NavLink>
          <NavLink className={navLinkClass} to="/anime">
            Browse
          </NavLink>
          <NavLink className={navLinkClass} to="/dashboard">
            Dashboard
          </NavLink>
        </nav>

        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

        {user ? (
          <div className="hidden items-center gap-3 md:flex">
            <SafeImage
              src={user.avatar}
              alt={user.name}
              className="h-10 w-10 rounded-full border border-white/10 bg-white/5"
            />
            <div className="text-right">
              <p className="text-sm font-medium">{user.name}</p>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-slate-400 transition hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <Link
            to="/auth"
            className="hidden rounded-full bg-gradient-to-r from-rose-500 to-orange-400 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:scale-[1.02] md:inline-flex"
          >
            Login
          </Link>
        )}

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex rounded-full border border-white/10 p-2 text-slate-200 md:hidden"
        >
          <Menu size={20} />
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-slate-950/95 px-4 py-4 md:hidden">
          <div className="mb-4">
            <SearchBar />
          </div>
          <div className="flex flex-col gap-2">
            <NavLink className={navLinkClass} to="/" onClick={() => setMobileOpen(false)}>
              Home
            </NavLink>
            <NavLink className={navLinkClass} to="/anime" onClick={() => setMobileOpen(false)}>
              Browse
            </NavLink>
            <NavLink className={navLinkClass} to="/dashboard" onClick={() => setMobileOpen(false)}>
              Dashboard
            </NavLink>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            {user ? (
              <>
                <div className="flex items-center gap-3">
                  <UserCircle2 size={20} />
                  <span className="text-sm">{user.name}</span>
                </div>
                <button type="button" onClick={handleLogout} className="text-sm text-rose-300">
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Search size={20} />
                  <span className="text-sm">Join your anime archive</span>
                </div>
                <Link to="/auth" className="text-sm text-sky-300" onClick={() => setMobileOpen(false)}>
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
