import express from "express";
import { analyzeFile } from "../src/services/genericAnalyser.js";
import { getRepository, getContent } from "../src/services/github.js";
import { parseGithubUrl } from '../src/Utils/parseGithubUrl.js';
import { buildDependencyGraph } from "../src/services/dependencyGraph.js";


const router = express.Router();


function flattenTree(node) {
  if (!node) return [];

  if (node.type === "file") {
    return [node];
  }

  return (node.children ?? []).flatMap(flattenTree);
}


router.post("/analyse", async (req, res) => {
  try {
      console.log("Analysis route hit");

      const { url } = req.body;
  console.log(url);

    if (!url) {
      return res.status(400).json({
        error: "Repository URL is required",
      });
    }

    const parsedRepo = parseGithubUrl(url);
    const repoData = await getRepository(url);

    console.log("repoData:", repoData);
console.log("repoData.files:", repoData?.files);


    const supportedExtensions = [
      ".js", ".jsx", ".mjs", ".cjs",
      ".ts", ".tsx", ".mts", ".cts",
      ".py", ".java", ".php",
    ];

    // const files = repoData.files.filter((file) =>
    //   supportedExtensions.includes(
    //     file.path.substring(file.path.lastIndexOf(".")).toLowerCase()
    //   )
    // );

   const allFiles = flattenTree(repoData.tree);

console.log("Total files in tree:", allFiles.length);

const files = allFiles.filter((file) =>
  supportedExtensions.includes(
    file.path.substring(file.path.lastIndexOf(".")).toLowerCase()
  )
);

console.log("Supported source files:", files.length);


    const results = [];

    for (const file of files) {
      try {
        const sourceCode = await getContent(
          parsedRepo.owner,
          parsedRepo.repo,
          file.path
        );

        const analysis = analyzeFile(file.path, sourceCode);

        if (analysis) {
          results.push({
            path: file.path,
            ...analysis,
          });
        }
      } catch (error) {
        results.push({
          path: file.path,
          error: error.message,
        });
      }
    }

 const graph = buildDependencyGraph(results);
console.log("graphhhhh",graph);

return res.json({
  repository: repoData.repository,
  totalFiles: repoData.totalFiles,
  analyzedFiles: results.filter((r) => !r.error).length,
  results,
  graph,
});
  } catch (error) {
    console.error("Repository analysis failed:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
});

export default router;