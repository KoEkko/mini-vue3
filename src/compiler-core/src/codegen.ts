export function generate(ast:any) {
  const context = createCodeGenContext()
  const { push } = context
  push('return')
  const functionName = "render"
  const args = ["_ctx", "_cache"]
  const signature = args.join(", ")
  
  push(`function ${functionName}(${signature}){`)
  // ast的入口，应该在transform阶段就有对应的入口
  genNode(ast.codegenNode, context)
  push('}')

  return {
    code:context.code
  }
}

function genNode(node, context) {
  const { push } = context
  push(`return ${node.content}`)
}

function createCodeGenContext():any {
  const context = {
    code:"",
    push(source) {
      context.code += source
    }
  }
  return context
}