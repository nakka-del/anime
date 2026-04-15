import { Sparkles } from "lucide-react";

const EmptyState = ({ title, description }) => (
  <div className="glass flex min-h-[280px] flex-col items-center justify-center rounded-[32px] px-6 text-center">
    <div className="mb-4 rounded-full bg-white/5 p-4 text-sky-300">
      <Sparkles size={28} />
    </div>
    <h3 className="text-xl font-semibold text-white">{title}</h3>
    <p className="mt-3 max-w-md text-sm text-slate-400">{description}</p>
  </div>
);

export default EmptyState;
