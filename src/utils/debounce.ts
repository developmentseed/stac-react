/* eslint-disable @typescript-eslint/no-explicit-any */

type DebouncedFunction<T extends (...args: any) => any> = T & {
  cancel: () => void;
};

const debounce = <F extends (...args: any) => any>(fn: F, ms = 250): DebouncedFunction<F> => {
  let timeoutId: ReturnType<typeof setTimeout>;

  const debouncedFn = function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  } as F;

  // Add cancel method to clear pending timeouts
  (debouncedFn as DebouncedFunction<F>).cancel = () => {
    clearTimeout(timeoutId);
  };

  return debouncedFn as DebouncedFunction<F>;
};

export default debounce;
export type { DebouncedFunction };
