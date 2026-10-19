const JS = {
  functions: [
    "function_declaration",
    "generator_function_declaration",
    "method_definition",
    "arrow_function",
    "function_expression",
  ],
  calls: {
    call_expression: { callee: "function" },
    new_expression: { callee: "constructor", callType: "constructor" },
    // JSX usage: <Button /> counts as a "component" call (html tags are filtered out)
    jsx_opening_element: { callee: "name", callType: "component", componentOnly: true },
    jsx_self_closing_element: { callee: "name", callType: "component", componentOnly: true },
  },
  imports: ["import_statement", "export_statement"], // export_statement only counts if it has a `source`
};

const LANGUAGES = {
  javascript: JS,
  typescript: JS,
  tsx: JS,
  python: {
    functions: ["function_definition"],
    calls: { call: { callee: "function" } },
    imports: ["import_statement", "import_from_statement"],
  },
  java: {
    functions: ["method_declaration", "constructor_declaration"],
    calls: {
      method_invocation: { callee: "name", receiver: "object" },
      object_creation_expression: { callee: "type", callType: "constructor" },
    },
    imports: ["import_declaration"],
  },
  php: {
    functions: ["function_definition", "method_declaration"],
    calls: {
      function_call_expression: { callee: "function" },
      member_call_expression: { callee: "name", receiver: "object" },
      scoped_call_expression: { callee: "name", receiver: "scope" },
      object_creation_expression: {
        calleeChild: ["name", "qualified_name"],
        callType: "constructor",
      },
    },
    imports: [
      "namespace_use_declaration",
      "include_expression",
      "include_once_expression",
      "require_expression",
      "require_once_expression",
    ],
  },
};

const EXTENSIONS = {
  ".js": "javascript", ".jsx": "javascript", ".mjs": "javascript", ".cjs": "javascript",
  ".ts": "typescript", ".mts": "typescript", ".cts": "typescript",
  ".tsx": "tsx",
  ".py": "python",
  ".java": "java",
  ".php": "php",
};

export  {JS,LANGUAGES,EXTENSIONS }