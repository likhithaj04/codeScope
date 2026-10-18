import * as parser from '@babel/parser'

// type tells us what kind of syntax node it represents.
// body contains the statements inside the program.
// loc contains source-location information, such as line and column.
// start and end identify positions in the original source code.

function walk(node,visit){ //explore all child nodes for dependency
   if(!node || typeof node!=="object") return

  if (node.type) {
        visit(node);
    }
// console.log("Node type:", node.type);
    // console.log("Keys:", Object.keys(node)); //gets the property names of the current AST node.

    for(const key of Object.keys(node)){
         if (["loc", "start", "end", "extra"].includes(key)) {
            continue;
        }

        const value=node[key] //gets the value stored in each property.

        if(Array.isArray(value)){
            //   The inner loop checks each item in that array and prints its type.
             for (const child of value) {
                walk(child, visit);
            }
        } else if (value && typeof value === "object") {
            walk(value, visit);
        
        }
    }

}

function analyseImports(ast,sourceCode){
    const imports=[]
    walk(ast.program,(node)=>{
                if (node.type === "ImportDeclaration") {

        imports.push({
            source: node.source.value,
                line: node.loc.start.line,
                statement: sourceCode.slice(node.start, node.end)
        })
    }
})
        return imports;

}

function analyseFunction(ast){
    const functions=[]
     walk(ast.program,(node)=>{
        if(node.type==='FunctionDeclaration'){
           functions.push({
            name:node.id?.name,
            line: node.loc.start.line

           })
        }
       else if (
    node.type === "VariableDeclarator" &&
    node.init?.type === "ArrowFunctionExpression"
) {
    functions.push({
        name: node.id.name,
        line: node.loc.start.line
    });
}

else if (
    node.type === "VariableDeclarator" &&
    node.init?.type === "FunctionExpression"
) {
    functions.push({
        name: node.id.name,
        line: node.loc.start.line
    });
}
     })
     return functions
}

function analyzeFile(sourceCode){
    const ast =parser.parse(sourceCode,{
        sourceType:"unambiguous",
        plugins:["jsx"]
    });


    const imports=analyseImports(ast,sourceCode)
const functions=analyseFunction(ast)
    // for (const node of ast.program.body){
    //     if(node.type==="ImportDeclaration"){
    //         imports.push({
    //             source:node.source.value,
    //             line:node.loc.start.line,
    //             statement:sourceCode.slice(node.start,node.end)
    //         })
    //     }
    // }
    // console.log(ast.program.body.map(node => node.type));

    
// walk(ast.program, (node) => {
//     console.log("Node visited:", node.type);
// });
return {imports,functions}  
}



export default analyzeFile

