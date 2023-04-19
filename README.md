# Mini- Vue3

在页面中渲染 `hello world`

index.html
```html
<div id="app"></div>
<script src="main.js" type="module"></script>
```

main.js
```js
import { createApp } from '../../lib/guide-mini-vue.esm.js';
import App from './App.js';

const rootContainer = document.querySelector('#app');
createApp(App).mount(rootContainer);
```

App.js
```js
import { h, ref } from '../../lib/guide-mini-vue.esm.js';

export default {
  name: 'App',
  render() {
    return h('div', {}, 'hi, ' + this.count);
  },
  setup() {
    const count = ref(1);
    return {
      count
    };
  }
};
```

也可以用`template`模板字符串转`render`函数
App.js
```js
import { ref } from '../../lib/guide-mini-vue.esm.js';

export default {
  name: 'App',
  template: `<div>hi, {{count}}</div>`,
  setup() {
    const count = ref(1);
    return {
      count
    };
  }
};
```


