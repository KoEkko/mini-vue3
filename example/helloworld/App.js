import { h, provide, inject } from "../../lib/guide-mini-vue.esm.js";
const Provider = {
  name: "Provider",
  setup() {
    provide("ProviderTwo", "ProviderTwo");
    provide("foo", "fooVal"), provide("bar", "barVal");
  },
  render() {
    return h("div", {}, [h("p", {}, "Provider"), h(ProviderTwo)]);
  },
};

const ProviderTwo = {
  name: "ProviderTwo",
  setup() {},
  render() {
    return h("div", {}, [h("p", {}, "ProviderTwo"), h(Consumer)]);
  },
};

const Consumer = {
  name: "Consumer",
  setup() {
    const foo = inject("foo");
    const bar = inject("bar");
    const defaultValue = inject("", () => "hhh");
    const two = inject("ProviderTwo");
    return {
      foo,
      bar,
      two,
      defaultValue
    };
  },

  render() {
    return h("div", {}, `Consumer : ${this.foo} - ${this.bar} - ${this.two} - ${this.defaultValue}`);
  },
};

export default {
  name: "App",
  setup() {},
  render() {
    return h("div", {}, [h("p", {}, "apiInject"), h(Provider)]);
  },
};
