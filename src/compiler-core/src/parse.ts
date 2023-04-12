import { NodeTypes } from "./ast";

const enum TagTypes {
  START,
  END,
}

export function baseParse(content: string) {
  const context = createParserContext(content);
  return createRoot(parseChildren(context, []));
}

function parseChildren(context, ancestor) {
  const nodes: any = [];
  while (!isEnd(context, ancestor)) {
    let node;
    if (context.source.startsWith("{{")) {
      node = parseInterpolation(context);
    } else if (context.source[0] === "<") {
      if (/[a-z]/i.test(context.source[1])) {
        node = parseElement(context, ancestor);
      }
    }
    if (!node) {
      node = parseText(context);
    }
    nodes.push(node);
  }
  return nodes;
}

function isEnd(context, ancestor) {
  // 2.当遇到结束标签的时候
  const s = context.source;
  if (s.startsWith("</")) {
    for (let i = ancestor.length - 1; i >= 0 ; i--) {
      const tag = ancestor[i].tag;
      if (startsWithEndTagOpen(context, tag)) {
        return true;
      }
    }
  }
  // if (parentTag && s.startsWith(`</${parentTag}>`)) {
  //   return true;
  // }
  // 1.source没有值
  return !s;
}

function parseText(context: any): any {
  let endIndex = context.source.length;
  let endToken = ["<", "{{"];
  for (let i = 0; i < endToken.length; i++) {
    const index = context.source.indexOf(endToken[i]);
    if (index !== -1 && endIndex > index) {
      endIndex = index;
    }
  }

  // 1.获取content
  const content = parseTextData(context, endIndex);
  return {
    type: NodeTypes.TEXT,
    content: content,
  };
}

function parseTextData(context: any, length: number) {
  const content = context.source.slice(0, length);
  advanceBy(context, length);
  return content;
}

function parseElement(context: any, ancestor: any[]) {
  const element: any = parseTag(context, TagTypes.START);
  ancestor.push(element);
  element.children = parseChildren(context, ancestor);
  ancestor.pop();
  if (startsWithEndTagOpen(context, element.tag)) {
    parseTag(context, TagTypes.END);
  } else {
    throw new Error(`缺少结束标签:${element.tag}`);
  }
  return element;
}

function startsWithEndTagOpen(context, tag) {
  const s: string = context.source;
  return (
    s.startsWith("</") &&
    s.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
  );
}

function parseTag(context: any, type: TagTypes) {
  // 1. 解析tag
  const match: any = /^<\/?([a-z]*)/i.exec(context.source);
  const tag = match[1];
  // 2. 删除处理完成的代码
  advanceBy(context, match[0].length);
  advanceBy(context, 1);
  if (type === TagTypes.END) return;

  return {
    type: NodeTypes.ELEMENT,
    tag: tag,
  };
}

function parseInterpolation(context) {
  // {{message}}
  const openDelimiter = "{{";
  const closeDelimiter = "}}";

  const closeIndex = context.source.indexOf(
    closeDelimiter,
    openDelimiter.length
  ); //获取 }} index

  advanceBy(context, openDelimiter.length);

  const rawContentLength = closeIndex - openDelimiter.length;
  const rawContent = parseTextData(context, rawContentLength);
  const content = rawContent.trim(); // 处理空格
  advanceBy(context, closeDelimiter.length);
  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content,
    },
  };
}

function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length);
}

function createRoot(children) {
  return {
    children,
  };
}

function createParserContext(content: string) {
  return {
    source: content,
  };
}
