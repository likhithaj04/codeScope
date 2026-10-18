import analyzeFile from "./dependencyAnalyser.js";


const sourceCode = `
import File from "./File";

function Home() {
    const calculateTotal = () => {
        return 100;
    };
    
    const handleClick = function () {
    console.log("Clicked");
};

    return (
        <>
            <File items={files} />
        </>
    );
}
`;

const ast = analyzeFile(sourceCode);

console.log(ast);


