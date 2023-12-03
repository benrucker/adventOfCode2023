export type Mutable<T> = {
  -readonly [TKey in keyof T]: T[TKey];
};
