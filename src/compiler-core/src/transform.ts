import { NodeTypes } from "./ast";
import { TO_DISPLAY_STRING } from "./runtimeHelpers";

export function transform(root, options = {} ) {
  const context = createTransformContext(root, options)
  // 1. 遍历  -> 深度优先遍历
  traverseNode(root, context);
  // 创建入口
  createRootCodegen(root)
  root.helpers = [...context.helpers.keys()]
}
function createRootCodegen(root) {
  root.codegenNode =  root.children[0]
}

function traverseNode(node: any, context:any ) {
  const nodeTransforms = context.nodeTransforms
  nodeTransforms.forEach(plugin => {
    plugin(node)
  });

  switch(node.type) {
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING);
      break;
    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT:
      traverseChildren(node,context)
      break;
    default:
      break
  }
}

function traverseChildren(node:any, context:any) {
  const children = node.children;
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      traverseNode(node,context);
    }
  }
}

function createTransformContext(root, options) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
    helpers:new Map(),
    helper(key) {
      context.helpers.set(key,1)
    }
  }
  return context
}