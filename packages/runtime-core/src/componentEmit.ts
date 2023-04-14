import { toHandlerKey } from "../shared/index";

export function emit(instance, event: string, ...args) {
  const { props } = instance;

  const handler = props[toHandlerKey(event)];
  handler && handler(...args);
}
