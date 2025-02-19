export function getDescriptor(proto: any, prop: string) {
  while (proto) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, prop);
    if (descriptor) {
      return descriptor;
    }
    proto = Object.getPrototypeOf(proto);
  }
  return null;
}