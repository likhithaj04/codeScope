import React, { useState } from "react";
import { FaFolder, FaFolderOpen, FaCode, FaImage } from "react-icons/fa";
import { FaFileLines, FaFileCode } from "react-icons/fa6";

export default function File({
  items = [],
  onFileSelect,
  content,
  loading,
  mode = "tree", // "tree" | "viewer"
}) {
  const [expandedFolders, setExpandedFolders] = useState({});

  function toggleFolder(path) {
    setExpandedFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  }

  function getIcon(item, isExpanded) {
    const name = (item.name || item.path || "").toLowerCase();

    if (item.type === "folder") {
      if (name === "assets" || name.endsWith("/assets")) {
        return <FaFolder className="text-purple-400" />;
      }
      return isExpanded ? (
        <FaFolderOpen className="text-yellow-400" />
      ) : (
        <FaFolder className="text-yellow-400" />
      );
    }
    if (name.endsWith(".md")) return <FaFileLines className="text-blue-400" />;
    if (name.endsWith(".json")) return <FaFileCode className="text-yellow-500" />;
    if (/\.(png|jpg|jpeg|svg|webp|gif|ico)$/i.test(name)) {
      return <FaImage className="text-purple-400" />;
    }
    return <FaCode className="text-slate-400" />;
  }

  function renderTree(nodes, parentPath = "") {
    if (!Array.isArray(nodes)) return null;

    return nodes.map((item, index) => {
      const itemName = item.name || item.path || "Unnamed item";
      const path = parentPath ? `${parentPath}/${itemName}` : itemName;
      const isFolder = item.type === "folder";
      const isExpanded = !!expandedFolders[path];
      const isSelected = !isFolder && content?.path === (item.path || path);

      return (
        <div key={path || index}>
          <div
            onClick={() => {
              if (isFolder) toggleFolder(path);
              else onFileSelect?.(item, path);
            }}
            className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-slate-800 ${
              isSelected ? "bg-slate-800" : ""
            }`}
            style={{ marginLeft: parentPath ? "16px" : "0" }}
          >
            {isFolder && (
              <span className="w-3 shrink-0 text-xs text-slate-500">
                {isExpanded ? "▾" : "▸"}
              </span>
            )}
            <span className="flex shrink-0 items-center">
              {getIcon(item, isExpanded)}
            </span>
            <span className="min-w-0 truncate text-sm text-slate-200">
              {itemName}
            </span>
          </div>

          {isFolder && isExpanded && item.children?.length > 0 && (
            <div>{renderTree(item.children, path)}</div>
          )}
        </div>
      );
    });
  }

  // ---------- TREE ONLY (sidebar) ----------
  if (mode === "tree") {
    return (
      <div className="select-none p-2 text-sm">
        {items.length > 0 ? (
          renderTree(items)
        ) : (
          <p className="px-2 py-2 text-slate-500">No files to display</p>
        )}
      </div>
    );
  }

  // ---------- VIEWER ONLY (main panel) ----------
  return (
    <div className="flex h-full flex-col bg-slate-950">
      {loading ? (
        <p className="p-4 text-slate-300">Loading file...</p>
      ) : content?.path ? (
        <>
          <div className="shrink-0 border-b border-slate-700 bg-slate-900 px-4 py-3">
            <span className="text-sm text-slate-200">{content.path}</span>
          </div>
          <pre className="flex-1 overflow-auto p-4 text-sm leading-6 text-slate-200">
            <code>{content.content}</code>
          </pre>
        </>
      ) : (
        <div className="flex h-full items-center justify-center text-slate-500">
          Select a file to view its code
        </div>
      )}
    </div>
  );
}