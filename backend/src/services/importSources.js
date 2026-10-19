export function importSources(node, kind, language, text,stripQuotes) {
  switch (language) {
    case "javascript":
    case "typescript":
    case "tsx": {
      const src = node.childByFieldName("source");
      return src ? [stripQuotes(text(src))] : []; // `export const x` has no source -> skipped
    }
    case "python": {
      if (kind === "import_from_statement") {
        const mod = node.childByFieldName("module_name");
        return mod ? [text(mod)] : [];
      }
      // `import os, sys as s`
      const out = [];
      for (let i = 0; i < node.namedChildCount(); i++) {
        const c = node.namedChild(i);
        if (c.kind() === "dotted_name") out.push(text(c));
        else if (c.kind() === "aliased_import") {
          const n = c.childByFieldName("name");
          if (n) out.push(text(n));
        }
      }
      return out;
    }
    case "java":
      return [text(node).replace(/^import\s+(static\s+)?/, "").replace(/;$/, "").trim()];
    case "php": {
      if (kind === "namespace_use_declaration") {
        return [text(node).replace(/^use\s+/, "").replace(/;$/, "").trim()];
      }
      // include / require variants: first named child is the path expression
      const arg = node.namedChild(0);
      return arg ? [stripQuotes(text(arg))] : [];
    }
    default:
      return [];
  }
}