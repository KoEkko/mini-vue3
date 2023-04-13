import { isString } from "../../shared";
import { NodeTypes } from "./ast";
import { CREATE_ELEMENT_VNODE, TO_DISPLAY_STRING, helperMapName } from "./runtimeHelpers";

export function generate(ast: any) {
  const context = createCodeGenContext();
  const { push } = context;

  genFunctionPreamble(ast, context);

  const functionName = "render";
  const args = ["_ctx", "_cache"];
  const signature = args.join(", ");

  push(`function ${functionName}(${signature}){`);
  // ast的入口，应该在transform阶段就有对应的入口
  genNode(ast.codegenNode, context);
  push("}");

  return {
    code: context.code,
  };
}
function genFunctionPreamble(ast, context) {
  const { push } = context;
  const VueBinging = "Vue";
  const helpers = ["toDisplayString"];
  const aliasHelpers = (s) => `${helperMapName[s]}:_${helperMapName[s]}`;
  if (ast.helpers.length > 0) {
    push(`const { ${helpers.map(aliasHelpers).join(", ")} } = ${VueBinging}`);
  }
  push("\n");
  push("return");
}
function genNode(node, context) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context);
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context);
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context);
    case NodeTypes.ELEMENT:
      genElement(node,context);
      break
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node,context);
      break
    default:
      break;
  }
}

function genCompoundExpression(node, context) {
  const { push } = context
  const children = node.children
  for(let i = 0; i<children.length; i++) {
    const child = children[i]
    if(isString(child)) {
      push(child)
    } else {
      genNode(child,context)
    }
  }
}
function genElement(node, context ) {
  const { push , helper} = context
  const {tag,children,props} = node
  push(`${helper(CREATE_ELEMENT_VNODE)}(`)
  genNodeList(genNull([tag,props,children]),context)
  push(")")
}

function genNodeList(nodes,context) {
  const { push } = context
  for(let i = 0; i< nodes.length; i++) {
    const node = nodes[i]
    if(isString(node)) {
      push(node)
    } else {
      genNode(node,context)
    }
    if(i < nodes.length - 1) {
      push(", ")
    }
  }
}
function genNull(args:any) {
  return args.map((arg) => arg || "null")
}

function genExpression(node, context) {
  const { push } = context;
  push(`${node.content}`);
}

function genInterpolation(node, context) {
  const { push, helper } = context;
  push(`${helper(TO_DISPLAY_STRING)}`);
  genNode(node.content, context);
  push(")");
}
function genText(node, context) {
  const { push } = context;
  push(`return  ${node.content}`);
}
function createCodeGenContext(): any {
  const context = {
    code: "",
    push(source) {
      context.code += source;
    },
    helper(key) {
      return `_${helperMapName[key]}`;
    },
  };
  return context;
}
