export type SplitString<
  T extends string,
  D extends string,
> = T extends `${infer Prefix}${D}${infer Postfix}` ? [Prefix, Postfix] : never;
