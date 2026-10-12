// const url='https://github.com/facebook/react'

export function parseGithubUrl(url) {
    console.log("reached",url);
    
    let parsedUrl;


    try {
        parsedUrl = new URL(url) //JavaScript's built-in URL constructor analyzes the string and breaks it into its different parts.
    } catch {
        throw new Error("Please provide a valid URL");
    }


     if (
    parsedUrl.hostname !== "github.com" ||
    parsedUrl.protocol !== "https:"
  ) {
    throw new Error("Please provide a valid GitHub repository URL");
  }

    const parts = parsedUrl.pathname.split("/").filter(Boolean)
    // console.log(parts);

    if (parts.length < 2) {
        throw new Error("Invalid GitHub repository URL");
    }
    const owner = parts[0]
    const repo = parts[1]

    return { owner, repo }
}

// const result = parseGithubUrl(
//   "https://github.com/facebook/react"
// );

// console.log(result);