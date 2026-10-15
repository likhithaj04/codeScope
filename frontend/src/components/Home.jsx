import { useState } from 'react'

import api from '../../utils/api';
import Navbar from './Navbar';
import File from './File';

export default function Home() {
      const [urldata,setUrlData]=useState("")
      const [repoData,setRepoData]=useState(null)
const [content, setContent] = useState({
  path: "",
  content: "",
});    
 const [loading,setLoading]=useState(false)

 const [repoCache,setRepoCache]=useState({})
 const [fileCache,setFileCache]=useState({})

    async function handleSearch() {
      setLoading(true)
    // console.log(urldata);

    // if(!repoCache){
       const search = await api.post("/api/repository",{
      url:urldata
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

  return (
    <>
<div className="h-screen overflow-hidden flex flex-col">
  <Navbar
    handleSearch={handleSearch}
    urldata={urldata}
    setUrlData={setUrlData}
  />

  {repoData && (
    <div className="min-h-0 flex-1">
      <File
        items={repoData.tree.children}
        onFileSelect={handleFileSelect}
        content={content}
        loading={loading}
      />
    </div>  
  )}
</div>
    </>
   
  )
}
