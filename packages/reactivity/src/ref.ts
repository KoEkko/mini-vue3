
import { hasChanged, isObject } from "@guide-mini-vue/shared";
import { isTracking, trackEffect, triggerEffect } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
  private _value: any;
  public dep;
  public __v_isRef = true
  private _rawValue: any;
  constructor(value) {
    this._rawValue = value
    this._value = convert(value)
    this.dep = new Set();
  }

  get value() {
    trackRefValue(this)
    return this._value;
  }

  set value(newValue) {
    if (!hasChanged(this._rawValue, newValue)) return
    this._rawValue = newValue
    this._value = convert(newValue);
    triggerEffect(this.dep);
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

function trackRefValue(ref) {
  if (isTracking()) {
    trackEffect(ref.dep);
  }
}

export function ref(value) {
  return new RefImpl(value);
}


export function isRef(ref) {
  return !!ref.__v_isRef
}

export function unRef(ref) {
  return isRef(ref) ? ref.value : ref
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target,key))
    },
    set(target, key, value) {
      if ( !isRef(value) && isRef(target[key])) {
        return (target[key].value = value)
      } else {
        return Reflect.set(target, key, value)
      }
    }
  })
}