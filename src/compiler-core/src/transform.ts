import { NodeTypes } from "./ast";

export function transform(root, options = {} ) {
  const context = createTransformContext(root, options)
  // 1. 遍历  -> 深度优先遍历
  traverseNode(root, context);
}

function traverseNode(node: any, options:any ) {
  
  const nodeTransforms = options.nodeTransforms
  nodeTransforms.forEach(plugin => {
    plugin(node)
  });
  traverseChildren(node,options)
}
function traverseChildren(node:any, options:any) {
  const children = node.children;

  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      traverseNode(node,options);
    }
  }
}
function createTransformContext(root, options) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || []
  }
  return context
}