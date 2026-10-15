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

    async function handleSearch() {
      setLoading(true)
    console.log(urldata);
    
    const search = await api.post("/api/repository",{
      url:urldata
    })
console.log(search.data.tree.children);
  setRepoData(search.data)
  setLoading(false)
  }


  async function handleFileSelect(path,item){
    // // console.log(path);
    // console.log("repourldata",repoData.repository);
    // // console.log(repoData.repository.html_url);
        setLoading(true)

  const res= await api.get("/api/repository/file",{
    params:{
      url: `${urldata}`,
      path:path.path
    }
  })
setContent({
    path: res.data.path,
    content: res.data.content,
  });
  console.log(res.data);
setLoading(false)
// console.log(res.data.content);
  
  }

  return (
    <>
     <Navbar handleSearch={handleSearch} urldata={urldata} setUrlData={setUrlData}/>
   { repoData && <File items={repoData.tree.children} onFileSelect={handleFileSelect} content={content} loading={loading}/>
   
   } 
    </>
   
  )
}
