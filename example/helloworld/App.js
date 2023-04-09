import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
  render() {
    const app = h("div",{},"app")
    const foo = h(Foo,{}, h("p",{},"123"))
    return h("div",{},[app,foo])
  },

  setup() {
    return {}
  }
};
