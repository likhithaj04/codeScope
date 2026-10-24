
export default function Navbar({
  handleSearch,
  urldata,
  setUrlData,
  activeView,
  onViewChange,
}) {
  const tabs = ["files", "graph", "impact"];

  return (
    <div className="bg-slate-900 text-white px-5 py-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-7">
        <h1 className="font-bold text-2xl md:text-3xl tracking-tight">
          Code<span className="text-blue-400">Scope</span>
        </h1>

        <p className="text-sm md:text-base text-slate-400">
          Repository Explorer
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 focus-within:border-blue-500 rounded-xl p-2">
          <input
            value={urldata}
            onChange={(e) => setUrlData(e.target.value)}
            placeholder="Paste a public GitHub repository URL..."
            className="flex-1 min-w-0 bg-transparent outline-none px-3 py-2 text-sm md:text-base"
          />

          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-lg text-sm font-semibold shrink-0"
          >
            Search
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-2 ml-1">
          Explore files, dependencies, and code impact in a repository.
        </p>
      </div>

      <div className="max-w-3xl mx-auto grid grid-cols-3 gap-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onViewChange(tab)}
            className={`border rounded-xl py-3 px-2 text-sm md:text-base font-medium capitalize transition-colors ${
              activeView === tab
                ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                : "border-slate-700 bg-slate-800/60 text-slate-300 hover:border-blue-500/50 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
