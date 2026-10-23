
import path from "node:path";

const SOURCE_EXTENSIONS = [
  ".js", ".jsx", ".mjs", ".cjs",
  ".ts", ".tsx", ".mts", ".cts",
  ".json",
];

export function buildDependencyGraph(results) {
  const fileMap = new Map(
    results.map((file) => [
      path.posix.normalize(file.path.replace(/\\/g, "/")),
      file,
    ])
  );

  const nodes = results.map((file) => ({
    id: file.path,
    label: path.posix.basename(file.path),
    language: file.language,
  }));

  const edges = [];
  const externalDependencies = new Set();

  function resolveLocalImport(importerPath, source) {
    const normalizedSource = source.replace(/\\/g, "/");

    if (
      !normalizedSource.startsWith("./") &&
      !normalizedSource.startsWith("../")
    ) {
      return null;
    }

    const importerDirectory = path.posix.dirname(importerPath);
    const basePath = path.posix.normalize(
      path.posix.join(importerDirectory, normalizedSource)
    );

    const candidates = [
      basePath,
      ...SOURCE_EXTENSIONS.map((ext) => basePath + ext),
      ...SOURCE_EXTENSIONS.map((ext) =>
        path.posix.join(basePath, `index${ext}`)
      ),
    ];

    return candidates.find((candidate) => fileMap.has(candidate)) ?? null;
  }

  for (const file of results) {
    for (const item of file.imports ?? []) {
      const targetPath = resolveLocalImport(file.path, item.source);

      if (targetPath) {
        edges.push({
          source: file.path,
          target: targetPath,
          type: "imports",
          line: item.line,
        });
      } else if (
        item.source &&
        !item.source.startsWith("./") &&
        !item.source.startsWith("../")
      ) {
        externalDependencies.add(item.source);
      }
    }
  }

  return {
    nodes,
    edges,
    externalDependencies: [...externalDependencies].sort(),
  };
}
