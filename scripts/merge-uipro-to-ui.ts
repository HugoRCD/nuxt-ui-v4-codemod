import type { SgRoot } from "@ast-grep/napi";

export default function transform(root: SgRoot): string | null {
  const rootNode = root.root();
  
  // Find objects that contain both ui and uiPro properties
  const targetObjects = rootNode.findAll({
    rule: {
      kind: "object",
      all: [
        {
          has: {
            kind: "pair",
            has: {
              field: "key",
              regex: "^ui$"
            }
          }
        },
        {
          has: {
            kind: "pair", 
            has: {
              field: "key",
              regex: "^uiPro$"
            }
          }
        }
      ]
    }
  });

  if (targetObjects.length === 0) {
    return null;
  }

  let hasChanges = false;
  const edits = [];

  for (const obj of targetObjects) {
    // Find ui and uiPro pairs within this object
    const pairs = obj.findAll({ rule: { kind: "pair" } });
    
    let uiPair = null;
    let uiProPair = null;
    const otherPairs = [];

    for (const pair of pairs) {
      const keyNode = pair.find({ rule: { field: "key" } });
      if (!keyNode) continue;
      
      const keyText = keyNode.text();
      if (keyText === "ui") {
        uiPair = pair;
      } else if (keyText === "uiPro") {
        uiProPair = pair;
      } else {
        otherPairs.push(pair);
      }
    }

    if (!uiPair || !uiProPair) continue;

    // Get the content of ui and uiPro objects
    const uiValue = uiPair.find({ rule: { field: "value", kind: "object" } });
    const uiProValue = uiProPair.find({ rule: { field: "value", kind: "object" } });

    if (!uiValue || !uiProValue) continue;

    // Get properties from both objects
    const uiProps = uiValue.findAll({ rule: { kind: "pair" } });
    const uiProProps = uiProValue.findAll({ rule: { kind: "pair" } });

    // Create new object content
    let newObjectContent = "{\n";
    
    // Add other properties first (maintaining order)
    for (const pair of otherPairs) {
      newObjectContent += "  " + pair.text() + ",\n";
    }

    // Add merged ui object
    newObjectContent += "  ui: {\n";
    
    // Add ui properties
    for (const prop of uiProps) {
      newObjectContent += "    " + prop.text() + ",\n";
    }
    
    // Add uiPro properties
    for (let i = 0; i < uiProProps.length; i++) {
      const prop = uiProProps[i];
      newObjectContent += "    " + prop.text();
      if (i < uiProProps.length - 1) {
        newObjectContent += ",";
      }
      newObjectContent += "\n";
    }
    
    newObjectContent += "  }\n";
    newObjectContent += "}";

    // Replace the entire object
    edits.push(obj.replace(newObjectContent));
    hasChanges = true;
  }

  return hasChanges ? rootNode.commitEdits(edits) : null;
} 