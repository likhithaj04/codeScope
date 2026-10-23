import express from 'express'
const router = express.Router()
import { analyzeFile } from '../src/services/genericAnalyser.js'

import { getRepository ,getContent} from '../src/services/github.js'


router.post("/analyse", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        error: "Repository URL is required",
      });
    }

    // 1. Parse the GitHub URL
    const parsedRepo = parseGithubUrl(url);

    // 2. Get the repository's file list
    const repoData = await getRepository(url);

    // 3. Keep only supported source files
    const supportedExtensions = [
      ".js", ".jsx", ".mjs", ".cjs",
      ".ts", ".tsx", ".mts", ".cts",
      ".py", ".java", ".php",
    ];

    const files = repoData.files.filter((file) =>
      supportedExtensions.includes(
        file.path.substring(file.path.lastIndexOf(".")).toLowerCase()
      )
    );

    // 4. Fetch source and analyze each file
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
        // One inaccessible file should not stop the entire analysis
        results.push({
          path: file.path,
          error: error.message,
        });
      }
    }

    // 5. Return all file-level analysis results
    res.json({
      repository: repoData.repository,
      totalFiles: files.length,
      analyzedFiles: results.filter((r) => !r.error).length,
      results,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});
export default router