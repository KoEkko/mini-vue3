import { NodeTypes } from "./ast";
import { TO_DISPLAY_STRING, helperMapMenu } from "./runtimeHelpers";

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
  const aliasHelpers = (s) => `${helperMapMenu[s]}:_${helperMapMenu[s]}`;
  if (ast.helpers.length > 0) {
    push(`const { ${helpers.map(aliasHelpers).join(", ")} } = ${VueBinging}`);
  }
  push("\n");
  push("return");
}
function genNode(node, context) {

  switch(node.type) {
    case NodeTypes.TEXT:
      genText(node,context)
      break
    case NodeTypes.INTERPOLATION:
      genInterpolation(node,context)
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context)
    default:
      break
  }
}
function genExpression(node, context) {
  const { push } = context
  push(`${node.content}`)
}

function genInterpolation(node,context) {
  const { push,helper } = context
  push(`${helper(TO_DISPLAY_STRING)}`)
  genNode(node.content,context)
  push(")")
}
function genText(node,context) {
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
      return `_${helperMapMenu[key]}`
    }
  };
  return context;
}
