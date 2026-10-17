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

function analyzeFile(sourceCode){
    const ast =parser.parse(sourceCode,{
        sourceType:"unambiguous",
        plugins:["jsx"]
    });


    const imports=[]

    for (const node of ast.program.body){
        if(node.type==="ImportDeclaration"){
            imports.push({
                source:node.source.value,
                line:node.loc.start.line,
                statement:sourceCode.slice(node.start,node.end)
            })
        }
    }
    console.log(ast.program.body.map(node => node.type));
walk(ast, (node) => {
    console.log("Node type:", node.type);
});return imports
}



export default analyzeFile

