import { baseParse } from "../src/parse"
import { generate } from '../src/codegen'
describe("codegen",() => {
  it('string' ,() => {
    const ast = baseParse("hi")
    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  })
})