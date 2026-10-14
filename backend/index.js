import 'dotenv/config'
import express from 'express'
import repoRoute from './routes/repoContent.js'
import cors from 'cors'

const app=express()
app.use(cors({origin:'http://localhost:5173'}))
app.use(express.json());

// const response=await octokit.rest.repos.get({
//     owner:'facebook',
//     repo:'react'
// })

// console.log(response.data);

app.use("/api/repository",repoRoute)




const port=process.env.PORT || 8080

app.listen(port,()=>{
console.log(`server started at ${port}`)
})

