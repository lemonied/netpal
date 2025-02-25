export function removeItem<T extends any[]>(array: T, item: T[number]) {
  const index = array.indexOf(item);
  if (index > -1) {
    array.splice(index, 1);
  }
}
