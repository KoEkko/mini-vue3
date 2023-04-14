import { CREATE_ELEMENT_VNODE } from "./runtimeHelpers";

export const enum NodeTypes {
  COMPOUND_EXPRESSION,
  ELEMENT,
  INTERPOLATION,
  ROOT,
  SIMPLE_EXPRESSION,
  TEXT,
}

export const enum ElementTypes {
  ELEMENT,
}

export function createVNodeCall(context, tag, props, children) {
  context.helper(CREATE_ELEMENT_VNODE);
  return {
    type: NodeTypes.ELEMENT,
    tag,
    props,
    children,
  };
}
