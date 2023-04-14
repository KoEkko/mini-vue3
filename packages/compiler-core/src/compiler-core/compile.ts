import { generate } from './codegen';
import { baseParse } from './parse';
import { transform } from './transform';
import { transformExpression } from './transforms/transformExpression';
import { transformElement } from './transforms/transformElement';
import { transformText } from './transforms/transformText';

export function baseCompile(template) {
  // 把 template 也就是字符串 parse 成 ast
  const ast = baseParse(template);
  transform(ast, {
    nodeTransforms: [transformExpression, transformElement, transformText]
  });

  // 生成 render 函数代码
  return generate(ast);
}