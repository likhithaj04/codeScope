export function analyseFunction(walk,ast) {
    const functions = []
    walk(ast.program, (node) => {
        if (node.type === 'FunctionDeclaration') {
            functions.push({
                name: node.id?.name,
                line: node.loc.start.line,
                kind: "FunctionDeclaration"
            })
        }
        else if (
            node.type === "VariableDeclarator" &&
            node.init?.type === "ArrowFunctionExpression"
        ) {
            functions.push({
                name: node.id.name,
                line: node.loc.start.line,
                kind: "ArrowFunctionExpression"

            });
        }

        else if (
            node.type === "VariableDeclarator" &&
            node.init?.type === "FunctionExpression"
        ) {
            functions.push({
                name: node.id.name,
                line: node.loc.start.line,
                kind: "FunctionExpression"
            });
        }
    })
    return functions
}
