import analyzeFile from "./dependencyAnalyser.js";


const  sourceCode=
`import File from "./File";

function Home() {
  return <File items={files} />;
}
`;

const ast = analyzeFile(sourceCode);

console.log(ast);


