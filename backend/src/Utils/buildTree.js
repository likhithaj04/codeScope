export function buildTree(items){

    const root= {
        name:'root',
        type:'folder',
        children:[]
    }

    for(let item of items){
       const parts=item.path.split("/")
       let current=root

        for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isFile = i === parts.length - 1 && item.type === "blob";

      let child = current.children.find(
        (node) => node.name === name
      );

      if (!child) {
        child = {
          name,
          type: isFile ? "file" : "folder",
          children: [],
        };

        if (isFile) {
          child.path = item.path;
          child.sha = item.sha;
        }

        current.children.push(child);
      }

      current = child;
    }
  }

  return root;
    }

