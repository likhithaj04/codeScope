import { useState } from 'react'
import api from '../../utils/api.js'

export default function Navbar({handleSearch,urldata,setUrlData}) {
//   const [urldata,setUrlData]=useState("")

//   async function handleSearch() {
//     console.log(urldata);
    
//     const search = await api.post("/api/repository",{
//       url:urldata
//     })
// console.log(search.data.tree.children);

//   }

  return (
    <div className="bg-slate-900 text-white px-5 py-6 md:px-10 md:py-8">

      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-7">
        <h1 className="font-bold text-2xl md:text-3xl tracking-tight">
          Code<span className="text-blue-400">Scope</span>
        </h1>

        <p className="text-sm md:text-base text-slate-400">
          Repository Explorer
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 focus-within:border-blue-500 rounded-xl p-2 transition-colors">
          <input
            type="text"
            value={urldata}
            onChange={(e)=>setUrlData(e.target.value)}
            placeholder="Paste a public GitHub repository URL..."
            className="flex-1 min-w-0 bg-transparent outline-none border-none px-3 py-2 text-sm md:text-base text-white placeholder:text-slate-500"
          />

          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-500 active:scale-95 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer shrink-0"
          >
            Search
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-2 ml-1">
          Explore files, dependencies, and code impact in a repository.
        </p>
      </div>

      <div className="max-w-3xl mx-auto grid grid-cols-3 gap-3">
        <button className="border border-blue-500/40 bg-blue-500/10 text-blue-300 rounded-xl py-3 px-2 text-sm md:text-base font-medium hover:bg-blue-500/20 transition-colors cursor-pointer">
          Files
        </button>

        <button className="border border-slate-700 bg-slate-800/60 text-slate-300 rounded-xl py-3 px-2 text-sm md:text-base font-medium hover:border-blue-500/50 hover:text-white transition-colors cursor-pointer">
          Graph
        </button>

        <button className="border border-slate-700 bg-slate-800/60 text-slate-300 rounded-xl py-3 px-2 text-sm md:text-base font-medium hover:border-blue-500/50 hover:text-white transition-colors cursor-pointer">
          Impact
        </button>
      </div>

    </div>
  )
}
