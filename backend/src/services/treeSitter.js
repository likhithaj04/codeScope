

import {
    getParser
} from "@xberg-io/tree-sitter-language-pack-wasm";

const parser = getParser("java");

const sourceCode = `

public class Main {
    public static void main(String[] args) {
        int number1 = 10;
        int number2 = 20;
        
        // Calculate the sum
        int sum = number1 + number2;
        
        // Print the result
        System.out.println("The sum is: " + sum);
    }
}


`;






function analyzeFunction(functionNode, sourceCode, language) {
    const nameNode = functionNode.childByFieldName("name");

    const functionName = nameNode
        ? sourceCode.slice(
            nameNode.startByte(),
            nameNode.endByte()
        )
        : "anonymous";

    const calls = [];

    const bodyNode = functionNode.childByFieldName("body");

    if (!bodyNode) {
        return { name: functionName, calls };
    }

    const callRules = {
        javascript: {
            nodeTypes: ["call_expression"],
            functionField: "function"
        },
        php: {
            nodeTypes: ["function_call_expression", "member_call_expression"],
            functionField: "function"
        },
        python: {
            nodeTypes: ["call"],
            functionField: "function"
        },
        java: {
            nodeTypes: ["method_invocation", "object_creation_expression"],
            functionField: "name"
        }
    };

    const rules = callRules[language];

    if (!rules) {
        return { name: functionName, calls };
    }

    walk(bodyNode, (node) => {
        if (!rules.nodeTypes.includes(node.kind())) {
            return;
        }

        const calledNode = node.childByFieldName(
            rules.functionField
        );

        if (!calledNode) return;

        const callee = sourceCode.slice(
            calledNode.startByte(),
            calledNode.endByte()
        );

        calls.push({
            caller: functionName,
            callee
        });
    });

    return { name: functionName, calls };
}






function walk(node, visit) {
    visit(node);

    for (let i = 0; i < node.namedChildCount(); i++) {
        walk(node.namedChild(i), visit);
    }
}


function findFunctions(root, sourceCode, language) {
    const functions = [];

    const functionNodeTypes = {
        javascript: ["function_declaration"],
        php: ["function_definition", "method_declaration"],
        python: ["function_definition"],
        java: ["method_declaration", "constructor_declaration"],
    };

    const supportedTypes = functionNodeTypes[language] ?? [];

    walk(root, (node) => {
        if (!supportedTypes.includes(node.kind())) return;

        const nameNode = node.childByFieldName("name");
        if (!nameNode) return;

        functions.push({
            name: sourceCode.slice(
                nameNode.startByte(),
                nameNode.endByte()
            ),
            line: node.startPosition().row + 1,
            kind: node.kind()
        });
    });

    return functions;
}





const tree = parser.parse(sourceCode);

console.log("Tree:", tree);
const root = tree.rootNode();

console.log(root.toSexp());


walk(root, (node) => {
    if (node.kind() === "method_invocation") {
        console.log("Call node:", node.kind());
        console.log("Call text:", sourceCode.slice(
            node.startByte(),
            node.endByte()
        ));

        console.log(
            "Name field:",
            node.childByFieldName("name")?.kind()
        );

        console.log(
            "Object field:",
            node.childByFieldName("object")?.kind()
        );
    }
});

const functions = findFunctions(root, sourceCode, "java");
console.log("Functions:", functions);







const functionNode = root.namedChild(0);

console.log("Node type:", functionNode.kind());

const nameNode = functionNode.childByFieldName("name");

console.log("Function name:", nameNode.kind());
console.log("Name text:", sourceCode.slice(
    nameNode.startByte(),
    nameNode.endByte()
));

const bodyNode = functionNode.childByFieldName("body");

console.log("Body type:", bodyNode.kind());
console.log("Number of named children:", bodyNode.namedChildCount());

// walk(bodyNode, (node) => {
//     if (node.kind() !== "call_expression") {
//         return;
//     }

//     // const calledFunction = node.childByFieldName("function");

//     if (!calledFunction) {
//         return;
//     }

//     const functionName = sourceCode.slice(
//         calledFunction.startByte(),
//         calledFunction.endByte()
//     );

//     // console.log("Called function:", functionName);
// });

console.log(
    JSON.stringify(
        analyzeFunction(functionNode, sourceCode),
        null,
        2
    )
);
// // console.log("Root:", root);

// console.log(
//     "Root node prototype:",
//     Object.getOwnPropertyNames(
//         Object.getPrototypeOf(root)
//     )
// );
// console.log(
//     "Tree prototype:",
//     Object.getOwnPropertyNames(
//         Object.getPrototypeOf(tree)
//     )
// );