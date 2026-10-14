import express from 'express'
const router = express.Router()

import { getRepository ,getContent} from '../src/services/github.js'
import { parseGithubUrl } from '../src/Utils/parseGithubUrl.js';

router.post("/", async (req, res) => {
    try {
        const { url } = req.body;
        console.log("reached",url);
        const result = await getRepository(url)
        console.log(result);
        
        res.json(result)
        
    } catch (error) {
        res.status(400).json({
            error: error.message,
        });
    }
})

router.get("/file",async(req,res)=>{
    try{
        console.log("hit");

    const { url, path } = req.query;
console.log(url,path);

    if (!url || !path) {
      return res.status(400).json({
        error: "Repository URL and file path are required",
      });
    }
    const parsedRepo= parseGithubUrl(url)

 const content = await getContent(
      parsedRepo.owner,
      parsedRepo.repo,
      path
    );
    res.json({path,content})
}catch (error) {
    res.status(400).json({ error: error.message });
  }
})

export default router;