import { isString } from '../shared';
import { NodeTypes } from './ast';
import {
  CREATE_ELEMENT_VNODE,
  TO_DISPLAY_STRING,
  helperNameMap
} from './runtimeHelpers';

export function generate(ast) {
  const context = createCodegenContext();
  const { push } = context;

  genFunctionPreamble(ast, context);

  const functionName = 'render';
  const args = ['_ctx', '_cache'];
  const signature = args.join(', ');

  push(`function ${functionName}(${signature}){`);
  push('return ');
  genNode(ast.codegenNode, context);
  push('}');

  return {
    code: context.code
  };
}

function genFunctionPreamble(ast: any, context) {
  const { push } = context;
  const VueBinging = 'Vue';
  const aliasHelper = (s) => `${helperNameMap[s]}: _${helperNameMap[s]}`;
  if (ast.helpers.length > 0) {
    push(
      `const { ${ast.helpers.map(aliasHelper).join(', ')} } = ${VueBinging}`
    );
  }
  push('\n');

  push('return ');
}

function createCodegenContext() {
  const context = {
    code: '',
    push(source) {
      context.code += source;
    },
    helper(key) {
      return `_${helperNameMap[key]}`;
    }
  };

  return context;
}

function genNode(node, context) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context);
      break;

    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context);
      break;

    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context);
      break;

    case NodeTypes.ELEMENT:
      genElement(node, context);
      break;

    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context);
      break;

    default:
      break;
  }
}

function genCompoundExpression(node, context) {
  const { push } = context;
  const children = node.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (isString(child)) {
      push(child);
    } else {
      genNode(child, context);
    }
  }
}

function genElement(node, context) {
  const { push, helper } = context;
  const { tag, children, props } = node;
  push(`${helper(CREATE_ELEMENT_VNODE)}(`);
  genNodeList(genNullableArgs([tag, props, children]), context);
  // genNode(children, context);
  push(')');
}

function genNodeList(nodes, context) {
  const { push } = context;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (isString(node)) {
      push(`${node}`);
    } else {
      genNode(node, context);
    }
    // node 和 node 之间需要加上 逗号(,)
    // 但是最后一个不需要 "div", [props], [children]
    if (i < nodes.length - 1) {
      push(', ');
    }
  }
}

function genNullableArgs(args) {
  return args.map((arg) => arg || 'null');
}

function genExpression(node, context) {
  const { push } = context;
  push(`${node.content}`);
}

function genInterpolation(node, context) {
  const { push, helper } = context;
  push(`${helper(TO_DISPLAY_STRING)}(`);
  genNode(node.content, context);
  push(')');
}

function genText(node, context) {
  const { push } = context;
  push(`'${node.content}'`);
}