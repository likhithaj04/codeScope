import { Octokit } from 'octokit'
import { parseGithubUrl } from '../Utils/parseGithubUrl.js';
import { buildTree } from "../Utils/buildTree.js";

const octokit=new Octokit({
auth:process.env.GITHUB_TOKEN
})

// const url='https://github.com/facebook/react'




export async function getRepository(url) {
    console.log('url reaches',url);
    
    const {owner,repo}=parseGithubUrl(url)

    const response=await octokit.rest.repos.get({
        owner,
        repo
    })
// console.log('reached here',response);

    const branchResponse = await octokit.rest.repos.getBranch({
  owner,
  repo,
  branch: response.data.default_branch,
});
    // console.log(branchResponse);


    const gitTree= await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha:branchResponse.data.commit.commit.tree.sha,
    recursive: "true" 

})
// console.log(tree);

const files=gitTree.data.tree.filter((item)=>item.type==='blob')
console.log("files fetched",files);



// return {
//   repository: response.data.full_name,
//   files: files.map((file) => file.path),
//   totalFiles: files.length,
//   truncated: gitTree.data.truncated,
// };
return {
  repository: response.data.full_name,
  tree: buildTree(gitTree.data.tree),
  totalFiles: gitTree.data.tree.filter(
    (item) => item.type === "blob"
  ).length,
  truncated: gitTree.data.truncated,
};
}


export async function getContent(owner,repo,path){

const fileResponse = await octokit.rest.repos.getContent({
    owner,
    repo,
    path:path
});

if (Array.isArray(fileResponse.data) || !fileResponse.data.content) {
        throw new Error("The requested path is not a supported file.");
    }


const sourceCode = Buffer.from(
    fileResponse.data.content,
    "base64"
).toString("utf-8");

// console.log("source",sourceCode);
return sourceCode
}

// const result = await getRepository(
//     "https://github.com/facebook/react"
// );

// const sourceCode = await getContent(
//     "facebook",
//     "react",
//     "packages/react/index.js"
// );

// console.log(sourceCode);
