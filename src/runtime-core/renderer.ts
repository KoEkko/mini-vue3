import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { Fragment, Text } from "./vnode";

export function render(vnode, container) {
  // patch
  //

  patch(vnode, container,null);
}

function patch(vnode, container,parentComponent) {
  // 处理组件

  // 判断是不是element类型
  // 是 element 那么就应该处理 element
  const { type, shapeFlag } = vnode;
  
  switch (type) {
    case Fragment:
      processFragment(vnode, container,parentComponent);
      break;
    case Text:
      processText(vnode, container)
      break;
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container,parentComponent);
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container,parentComponent);
      }
      break;
  }
}

function processText(vnode, container) {
  const { children } = vnode
  const textNode = (vnode.el = document.createTextNode(children))
  container.append(textNode)
}

function processFragment(vnode, container,parentComponent) {
  // mountChildren
  mountChildren(vnode, container,parentComponent)
}

function processElement(vnode: any, container: any,parentComponent) {
  mountElement(vnode, container,parentComponent);
}

function mountElement(vnode, container,parentComponent) {
  const { type, props, children, shapeFlag } = vnode;

  const el = (vnode.el = document.createElement(type));

  // children
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el,parentComponent);
  }

  // props
  if (props) {
    for (const key in props) {
      const val = props[key];
      const isOn = (key: string) => /^on[A-Z]/.test(key);
      if (isOn(key)) {
        const event = key.slice(2).toLocaleLowerCase();
        el.addEventListener(event, val);
      }
      el.setAttribute(key, val);
    }
  }

  container.append(el);
}

function mountChildren(vnode, container,parentComponent) {
  vnode.children.forEach((v) => {
    patch(v, container,parentComponent);
  });
}

function processComponent(vnode, container,parentComponent) {
  mountComponent(vnode, container,parentComponent);
}

function mountComponent(initialVNode: any, container,parentComponent) {
  const instance = createComponentInstance(initialVNode, parentComponent);

  setupComponent(instance);
  setupRenderEffect(instance, initialVNode, container);
}

function setupRenderEffect(instance, initialVNode, container) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);

  // vnode -> patch
  patch(subTree, container,instance);

  // element -> mount
  initialVNode.el = subTree.el;
}
