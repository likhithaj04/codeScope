import { useState } from 'react'

import api from '../../utils/api';
import Navbar from './Navbar';
import File from './File';

export default function Home() {
      const [urldata,setUrlData]=useState("")
      const [repoData,setRepoData]=useState(null)
    
    async function handleSearch() {
    console.log(urldata);
    
    const search = await api.post("/api/repository",{
      url:urldata
    })
console.log(search.data.tree.children);
  setRepoData(search.data)
  }


  async function handleFileSelect(item,path){
  const res= await api.get("/api/repository/file")
  }

  return (
    <>
     <Navbar handleSearch={handleSearch} urldata={urldata} setUrlData={setUrlData}/>
   { repoData && <File items={repoData.tree.children} onFileSelect={handleFileSelect}/>
   
   } 
    </>
   
  )
}
