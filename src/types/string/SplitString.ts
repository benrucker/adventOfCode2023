export type SplitStringOnce<
  T extends string,
  D extends string,
> = T extends `${infer Prefix}${D}${infer Postfix}` ? [Prefix, Postfix] : never;

export type SplitString<
  T extends string,
  D extends string,
> = T extends `${infer Prefix}${D}${infer Postfix}`
  ? [Prefix, ...SplitString<Postfix, D>]
  : [T];
