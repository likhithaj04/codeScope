
import {
    process,
    WasmProcessConfig
} from "@xberg-io/tree-sitter-language-pack-wasm";

const jsCode = `
function calculateTotal(price, quantity) {
    return price * quantity;
}
`;

const javaCode = `
public class SimpleExample {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
`;

const jsConfig = WasmProcessConfig.default();
jsConfig.language = "javascript";

const javaConfig = WasmProcessConfig.default();
javaConfig.language = "java";

const jsResult = process(jsCode, jsConfig);




const javaResult = process(javaCode, javaConfig);
function printStructure(items, depth = 0) {
    for (const item of items) {
        console.log(" ".repeat(depth * 2), {
            kind: item.kind,
            name: item.name,
            signature: item.signature,
            span: item.span
        });

        if (item.children?.length) {
            printStructure(item.children, depth + 1);
        }
    }
}

console.log("JavaScript structure:");
printStructure(jsResult.structure);

console.log("Java structure:");
printStructure(javaResult.structure);
