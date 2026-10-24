import { useState } from 'react'

import api from '../../utils/api';
import Navbar from './Navbar';
import File from './File';
import Visualise from './Visualise';



export default function Home() {
  const [urldata, setUrlData] = useState("")
  const [repoData, setRepoData] = useState(null)
  const [content, setContent] = useState({
    path: "",
    content: "",
  });
  const [loading, setLoading] = useState(false)
  const [repoCache, setRepoCache] = useState({})
  const [fileCache, setFileCache] = useState({})
 const [activeView, setActiveView] = useState("files");
const [results, setResults] = useState([]);
const [graph, setGraph] = useState(null);
const [analysisCache, setAnalysisCache] = useState({});
const [showNavbar, setShowNavbar] = useState(true);

  async function handleSearch() {
    setLoading(true)
    // console.log(urldata);

    // if(!repoCache){
    const search = await api.post("/api/repository", {
      url: urldata
    })
    console.log(search.data.tree.children);
    setRepoData(search.data)
    // setRepoCache(search.data)
    // }

    setLoading(false)
  }


  async function handleFileSelect(item, path) {
    const filePath = item.path || path.path;
    const cacheKey = `${urldata}:${filePath}`;

    if (fileCache[cacheKey]) {
      console.log("fetching from filecache");

      setContent(fileCache[cacheKey]);
      return;
    }

    setLoading(true);

    try {
      const res = await api.get("/api/repository/file", {
        params: {
          url: urldata,
          path: filePath,
        },
      });

      const fileData = {
        path: res.data.path,
        content: res.data.content,
      };

      setFileCache((prev) => ({
        ...prev,
        [cacheKey]: fileData,
      }));

      setContent(fileData);
    } finally {
      setLoading(false);
    }
  }


  

async function handleGetNodes() {
  const cacheKey = `${urldata}:analysis`;

  if (analysisCache[cacheKey]) {
    setGraph(analysisCache[cacheKey].graph);
    setResults(analysisCache[cacheKey].results);
    return true;
  }

  setLoading(true);

  try {
    const response = await api.post("/repo/analyse", {
      url: urldata,
    });

    const data = response.data;

    setGraph(data.graph);
    setResults(data.results);

    setAnalysisCache((prev) => ({
      ...prev,
      [cacheKey]: {
        graph: data.graph,
        results: data.results,
      },
    }));

    return true;
  } catch (error) {
    console.error("Analysis failed:", error);
    return false;
  } finally {
    setLoading(false);
  }
}

async function handleViewChange(view) {
  if (!repoData && view !== "files") {
    console.log("Search for a repository first.");
    return;
  }
  if (view === "graph") {
    const success = await handleGetNodes();
    if (!success) return;
  }
  setShowNavbar(true); // reset whenever the view changes
  setActiveView(view);
}

function handleGraphWheel(e) {
  if (Math.abs(e.deltaY) < 4) return; // ignore tiny trackpad jitter
  if (e.deltaY < 0) setShowNavbar(false); // scroll up -> graph covers navbar
  else setShowNavbar(true);               // scroll down -> navbar returns
}
 
return (
  <div className="h-screen overflow-hidden flex flex-col">
    {/* Collapsible navbar */}
    <div
      className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
        showNavbar ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
    >
      <div className="overflow-hidden min-h-0">
        <Navbar
          handleSearch={handleSearch}
          urldata={urldata}
          setUrlData={setUrlData}
          activeView={activeView}
          onViewChange={handleViewChange}
        />
      </div>
    </div>

    {/* Main workspace */}
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Left sidebar: always visible in every view, scrollbar hidden */}
      <aside className="w-64 shrink-0 border-r border-slate-700 bg-slate-900 text-white overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="px-4 py-3 border-b border-slate-700">
          <h2 className="text-sm font-semibold">Explorer</h2>
        </div>

        {repoData ? (
          <File
            items={repoData.tree.children}
            onFileSelect={handleFileSelect}
            content={content}
            loading={loading}
          />
        ) : (
          <p className="p-4 text-sm text-slate-400">
            Search for a repository to view its files.
          </p>
        )}
      </aside>

    <main className="flex-1 min-w-0 min-h-0 overflow-hidden bg-slate-950 text-white">
  {loading && <p className="p-4 text-slate-300">Loading...</p>}

  {!loading && activeView === "files" && (
    <div className="h-full overflow-hidden">
      <File mode="viewer" content={content} />
    </div>
  )}

  {!loading && activeView === "graph" && graph && (
    <div className="h-full w-full" onWheel={handleGraphWheel}>
      <Visualise graph={graph} />
    </div>
  )}

  {!loading && activeView === "impact" && (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Impact Analysis</h2>
      <p className="mt-2 text-slate-400">
        Impact analysis will be implemented next.
      </p>
    </div>
  )}
</main>
    </div>
  </div>
);
}