import { getParser } from "@xberg-io/tree-sitter-language-pack-wasm";
import path from "node:path";
import { importSources } from "./importSources.js";
import {JS,EXTENSIONS,LANGUAGES} from './languageConfig.js'



export const detectLanguage = (filePath) =>
  EXTENSIONS[path.extname(filePath).toLowerCase()] ?? null;
const stripQuotes = (s) => s.replace(/^['"`]|['"`]$/g, "");

// `obj.method` member-access nodes (JS/TS and Python)
const MEMBER_KINDS = {
  member_expression: { object: "object", property: "property" },
  attribute: { object: "object", property: "attribute" },
};

const STRING_KINDS = new Set([
  "string", "string_literal", "encapsed_string", "template_string", "string_fragment",
]);

// Used to name anonymous functions without needing node.parent():
// `const foo = () => {}`  /  `{ foo: () => {} }`  /  `a.foo = function(){}`
const NAME_HINTS = {
  variable_declarator: { name: "name", value: "value" },
  public_field_definition: { name: "name", value: "value" },
  pair: { name: "key", value: "value" },
  assignment_expression: { name: "left", value: "right" },
};



export function analyzeCode(sourceCode, language) {
  const cfg = LANGUAGES[language];
  if (!cfg) return null; // unsupported language

  const parser = getParser(language);
  const tree = parser.parse(sourceCode);

  // Tree-sitter offsets are BYTE offsets, so slice a Buffer, not the string.
  // (If your binding reports UTF-16 offsets, change `text` to sourceCode.slice(start, end).)
  const buf = Buffer.from(sourceCode, "utf8");
  const text = (n) => buf.subarray(n.startByte(), n.endByte()).toString("utf8");
  const line = (n) => n.startPosition().row + 1;
  const sameNode = (a, b) =>
    a && b && a.startByte() === b.startByte() && a.endByte() === b.endByte() && a.kind() === b.kind();

  const functions = [];
  const calls = [];
  const imports = [];

  const functionName = (node, nameHint) => {
    const named = node.childByFieldName("name");
    return named ? text(named) : nameHint ?? "anonymous";
  };

  const addImport = (node, kind, source) =>
    imports.push({ source, statement: text(node).trim(), line: line(node) });

  const argText = (a) => {
    if (a.kind() === "argument") a = a.namedChild(0) ?? a; // PHP wraps args
    const k = a.kind();
    if (k === "identifier" || k === "name" || k === "variable_name") return text(a);
    if (STRING_KINDS.has(k)) return stripQuotes(text(a));
    return k;
  };

  const collectArgs = (node) => {
    const args = [];
    const argsNode = node.childByFieldName("arguments");
    if (!argsNode) return args;
    for (let i = 0; i < argsNode.namedChildCount(); i++) {
      const a = argsNode.namedChild(i);
      if (a.kind() === "comment") continue;
      args.push(argText(a));
    }
    return args;
  };

  const handleCall = (node, kind, rule, scope) => {
    // Find the callee node: by field name, or by child kind (PHP `new Foo`)
    let calleeNode = rule.callee ? node.childByFieldName(rule.callee) : null;
    if (!calleeNode && rule.calleeChild) {
      for (let i = 0; i < node.namedChildCount(); i++) {
        const c = node.namedChild(i);
        if (rule.calleeChild.includes(c.kind())) { calleeNode = c; break; }
      }
    }
    if (!calleeNode) return;

    let name = text(calleeNode);

    // Skip lowercase JSX tags like <div> (only components are interesting)
    if (rule.componentOnly && /^[a-z]/.test(name) && !name.includes(".")) return;

    let receiver = null;
    if (rule.receiver) {
      const r = node.childByFieldName(rule.receiver);
      receiver = r ? text(r) : null;
    }

    // Receiver embedded in callee: JS/TS `a.b()`, Python `a.b()`
    const member = MEMBER_KINDS[calleeNode.kind()];
    if (member) {
      const obj = calleeNode.childByFieldName(member.object);
      const prop = calleeNode.childByFieldName(member.property);
      if (prop) name = text(prop);
      if (obj) receiver = text(obj);
    }

    const args = collectArgs(node);

    // require("./x") and import("./x") are dependencies too
    if (
      (language === "javascript" || language === "typescript" || language === "tsx") &&
      (name === "require" || name === "import") &&
      !receiver
    ) {
      const first = node.childByFieldName("arguments")?.namedChild(0);
      if (first && STRING_KINDS.has(first.kind())) {
        addImport(node, kind, stripQuotes(text(first)));
      }
    }

    calls.push({
      name,
      callType: rule.callType ?? (receiver ? "method" : "function"),
      caller: scope?.name ?? null,
      receiver,
      arguments: args,
      line: line(node),
    });
  };

  // `scope`    = innermost enclosing function (so nested calls are attributed correctly)
  // `nameHint` = variable/property name for an anonymous function value
  const visit = (node, scope, nameHint) => {
    const kind = node.kind();

    if (cfg.imports.includes(kind)) {
      for (const source of importSources(node, kind, language, text,stripQuotes)) {
        addImport(node, kind, source);
      }
    }

    if (cfg.functions.includes(kind)) {
      scope = { name: functionName(node, nameHint), kind, line: line(node) };
      functions.push(scope);
    }

    const rule = cfg.calls[kind];
    if (rule) handleCall(node, kind, rule, scope);

    // Prepare a naming hint for the value child of declarators/assignments/pairs
    const hintRule = NAME_HINTS[kind];
    const hintName = hintRule ? node.childByFieldName(hintRule.name) : null;
    const hintValue = hintRule ? node.childByFieldName(hintRule.value) : null;

    for (let i = 0; i < node.namedChildCount(); i++) {
      const child = node.namedChild(i);
      const childHint =
        hintName && hintValue && sameNode(child, hintValue) ? text(hintName) : null;
      visit(child, scope, childHint);
    }
  };

  visit(tree.rootNode(), null, null);
  return { language, functions, calls, imports };
}

/* Convenience: analyze by file path + contents */
export function analyzeFile(filePath, sourceCode) {
  const language = detectLanguage(filePath);
  return language ? analyzeCode(sourceCode, language) : null;
}

const phpSource = `<?php
use App\\Models\\User;
require_once "helpers.php";

function calculatePrice($total, $discount) {
    return $total - applyDiscount($total, $discount);
}

function applyDiscount($total, $discount) {
    return $total * ($discount / 100);
}

class Cart {
    public function checkout($user) {
        $price = calculatePrice(1200, 20);
        $mailer = new Mailer();
        $mailer->send($user->email, "Total: " . $price);
        User::find(1);
        return strlen("done");
    }
}
`;

// console.log(JSON.stringify(analyzeCode(jsSource, "javascript"), null, 2));
console.log(JSON.stringify(analyzeCode(phpSource, "php"), null, 2));