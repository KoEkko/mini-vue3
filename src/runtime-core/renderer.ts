import { effect } from "../reactivity/effect";
import { EMPTY_OBJECT } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppApi } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  const {
    createElement,
    patchProp: hostPatchProp,
    insert: hostPatchInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options;
  function render(vnode, container) {
    // patch
    patch(null, vnode, container, null, null);
  }

  // n1 -> old
  // n2 -> new
  function patch(n1, n2, container, parentComponent, anchor) {
    // 处理组件

    // 判断是不是element类型
    // 是 element 那么就应该处理 element
    const { type, shapeFlag } = n2;

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent, anchor);
        }
        break;
    }
  }

  function processText(n1, n2, container) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }

  function processFragment(n1, n2, container, parentComponent, anchor) {
    // mountChildren
    mountChildren(n2.children, container, parentComponent, anchor);
  }

  function processElement(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor);
    } else {
      patchElement(n1, n2, container, parentComponent, anchor);
    }
  }

  function patchElement(n1, n2, container, parentComponent, anchor) {
    const oldProps = n1.props || EMPTY_OBJECT;
    const nextProps = n2.props || EMPTY_OBJECT;

    const el = (n2.el = n1.el);
    patchChildren(n1, n2, el, parentComponent, anchor);
    patchProps(el, oldProps, nextProps);
  }
  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const prevShapeFlag = n1.shapeFlag;
    const shapeFlag = n2.shapeFlag;
    const c1 = n1.children;
    const c2 = n2.children;

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(n1.children);
      }
      if (c1 !== c2) {
        hostSetElementText(container, c2);
      }
    } else {
      // new -> array
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, "");
        mountChildren(c2, container, parentComponent, anchor);
      } else {
        // array diff array
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      }
    }
  }

  function isSomeVNodeType(n1, n2) {
    // type
    // key
    return n1.type === n2.type && n1.key === n2.key;
  }

  function patchKeyedChildren(
    c1,
    c2,
    container,
    parentComponent,
    parentAnchor
  ) {
    let i = 0;
    const l2 = c2.length;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;

    // 1. left side
    // 从左往右对比
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSomeVNodeType(n1, n2)) {
        // 比较下一个信息
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      i++;
    }

    // 2. right side
    // 从右往左对比
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];

      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      e1--;
      e2--;
    }

    // 3. 新的比老的多
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos > l2 ? null : c2[nextPos].el;
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      // 老的比新的多
      while (i <= e1) {
        hostRemove(c1[i].el);
        i++;
      }
    } else {
      // 中间对比
      let s1 = i;
      let s2 = i;
      const toBePatched = e2 - s2 + 1;
      let patched = 0;
      // 建立映射表
      const keyToNewIndexMap = new Map();
      for (let i = s1; i <= e2; i++) {
        const nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i);
      }

      // 遍历 old
      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i];

        if (patched >= toBePatched) {
          hostRemove(prevChild.el);
          continue;
        }

        let newIndex;
        // 用户有给key的情况
        if (prevChild.key !== null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else { // 没有就只能遍历新的
          for (let j = s2; j < e2; j++) {
            if (isSomeVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }

        if (newIndex === undefined) {
          hostRemove(prevChild.el);
        } else {
          patch(prevChild, c2[newIndex], container, parentComponent, null);
          patched++;
        }
      }
    }
  }

  function unmountChildren(children) {
    for (let i = 0, length = children.length; i < length; i++) {
      const el = children[i].el;
      // remove
      hostRemove(el);
    }
  }
  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key];
        const nextProp = newProps[key];

        if (prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp);
        }
      }

      if (oldProps !== EMPTY_OBJECT) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null);
          }
        }
      }
    }
  }
  function mountElement(vnode, container, parentComponent, anchor) {
    const { type, props, children, shapeFlag } = vnode;

    const el = (vnode.el = createElement(type));

    // children
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, parentComponent, anchor);
    }

    // props
    if (props) {
      for (const key in props) {
        const val = props[key];
        hostPatchProp(el, key, null, val);
      }
    }

    hostPatchInsert(el, container, anchor);
  }

  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach((v) => {
      patch(null, v, container, parentComponent, anchor);
    });
  }

  function processComponent(n1, n2, container, parentComponent, anchor) {
    mountComponent(n2, container, parentComponent, anchor);
  }

  function mountComponent(
    initialVNode: any,
    container,
    parentComponent,
    anchor
  ) {
    const instance = createComponentInstance(initialVNode, parentComponent);

    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container, anchor);
  }

  function setupRenderEffect(instance, initialVNode, container, anchor) {
    effect(() => {
      if (!instance.isMounted) {
        const { proxy } = instance;
        const subTree = (instance.subTree = instance.render.call(proxy));
        // vnode -> patch
        patch(null, subTree, container, instance, anchor);
        initialVNode.el = subTree.el;
        instance.isMounted = true;
        console.log(`init`);
      } else {
        console.log(`update`);
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        const preSubTree = instance.subTree;
        instance.subTree = subTree;
        patch(preSubTree, subTree, container, instance, anchor);
      }

      // element -> mount
    });
  }

  return {
    createApp: createAppApi(render),
  };
}
