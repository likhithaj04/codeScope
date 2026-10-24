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

const { url, filePath } = req.body;
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

console.log("Full repository graph:", graph);

// If a filePath is provided, return a focused graph.
if (filePath) {
  const selectedFile = graph.nodes.find(
    (node) => node.id === filePath
  );

  if (!selectedFile) {
    return res.status(404).json({
      error: `File not found in dependency graph: ${filePath}`,
    });
  }

  // Get edges directly connected to the selected file.
  const connectedEdges = graph.edges.filter(
    (edge) =>
      edge.source === filePath ||
      edge.target === filePath
  );

  // Include the selected file and its direct neighbors.
  const connectedNodeIds = new Set([
    filePath,
    ...connectedEdges.map((edge) => edge.source),
    ...connectedEdges.map((edge) => edge.target),
  ]);

  const focusedGraph = {
    nodes: graph.nodes.filter((node) =>
      connectedNodeIds.has(node.id)
    ),
    edges: connectedEdges,
    externalDependencies: [],
  };

  return res.json({
    repository: repoData.repository,
    selectedComponent: filePath,
    mode: "component",
    graph: focusedGraph,
  });
}

// No filePath: preserve existing full-repository behavior.
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