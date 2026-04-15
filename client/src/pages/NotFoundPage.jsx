import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <div className="page-shell flex min-h-[70vh] items-center justify-center">
    <div className="glass max-w-xl rounded-[36px] px-8 py-12 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-300">404</p>
      <h1 className="mt-4 text-5xl font-black tracking-tight text-white">That portal does not exist.</h1>
      <p className="mt-5 text-sm leading-7 text-slate-400">
        The page you tried to open drifted out of this timeline. Head back to the main feed and continue exploring.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex rounded-full bg-gradient-to-r from-rose-500 to-orange-400 px-6 py-3 text-sm font-semibold text-white"
      >
        Return home
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
