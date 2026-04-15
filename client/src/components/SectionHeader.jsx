const SectionHeader = ({ eyebrow, title, description, action }) => (
  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      {eyebrow ? <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">{eyebrow}</p> : null}
      <h2 className="section-title">{title}</h2>
      {description ? <p className="mt-2 max-w-2xl text-sm text-slate-400">{description}</p> : null}
    </div>
    {action}
  </div>
);

export default SectionHeader;
