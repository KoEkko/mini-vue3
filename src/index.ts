// mini-vue 出口

export * from './runtime-dom/index'


import { baseCompile } from './compiler-core'
import * as runtimeDom from './runtime-dom'
import { registerRuntimeCompiler } from './runtime-dom'
function compileToFunction(template) {
  const { code } = baseCompile(template)
  const render = new Function('Vue',code)(runtimeDom)
  return render
}

registerRuntimeCompiler(compileToFunction)