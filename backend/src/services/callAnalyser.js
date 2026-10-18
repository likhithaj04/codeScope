export function analyseCalls(walk,ast) {
    const calls = []

    walk(ast.program, (node) => {

        if (node.type === 'CallExpression') {
            if (node.type !== "CallExpression") return;

            let parentFunction = null;


            function findCaller(currentNode, functionName = null) {
                if (!currentNode || typeof currentNode !== "object") return;
                if (currentNode.type === "FunctionDeclaration") {
                    functionName = currentNode.id?.name ?? null;
                }

                if (
                    currentNode.type === "VariableDeclarator" &&
                    ["ArrowFunctionExpression", "FunctionExpression"].includes(
                        currentNode.init?.type
                    )
                ) {
                    functionName = currentNode.id?.name ?? null;
                }

                if (
                    currentNode === node &&
                    functionName !== null
                ) {
                    parentFunction = functionName;
                    return;
                }

                for (const key of Object.keys(currentNode)) {
                    if (["loc", "start", "end", "extra"].includes(key)) continue;

                    const value = currentNode[key];

                    if (Array.isArray(value)) {
                        for (const child of value) {
                            findCaller(child, functionName);
                        }
                    } else if (value && typeof value === "object") {
                        findCaller(value, functionName);
                    }
                }
            }

            findCaller(ast.program);


            calls.push({
                name: node.callee.type === "Identifier"
                    ? node.callee.name
                    : node.callee.property.name,
                callType: node.callee.type === "Identifier"
                    ? "function"
                    : "method",
                caller: parentFunction,
                receiver: node.callee.type === "MemberExpression"
    ? node.callee.object.name
    : null,
arguments: node.arguments.map((arg) => {
    if (arg.type === "Identifier") {
        return arg.name;
    }

    if (arg.type === "StringLiteral") {
        return arg.value;
    }

    return arg.type;
}),                line: node.loc.start.line,
            });
        }
    })
    return calls
}