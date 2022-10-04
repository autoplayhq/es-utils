export type ZodLikeParser<R> = {
  parse(value: unknown): R;
};
