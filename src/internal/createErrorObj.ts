import type { DevString } from "./DevString";
import { dev } from "./DevString";

/**
 * Generate a fragile object that will throw error at any operation.
 */
export function createErrorObj<T = any>(error: DevString, errorLog?: (error: DevString) => any): T {
  return new Proxy(
    {},
    {
      get(target, prop, receiver: unknown) {
        const message = error.because(dev`You are trying to access a property "obj.${prop.toString()}".`);
        errorLog?.(message);
        throw error.asError();
      },
      set(target, prop, val: unknown, receiver: unknown) {
        const message = error.because(dev`You are trying to set a property "obj.${prop.toString()}" equal to ${val}.`);
        errorLog?.(message);
        throw error.asError();
      },
      apply(target, thisArg: unknown, argumentsList: unknown[]) {
        const message = error.because(dev`You are trying to call me with ${argumentsList}.`).record("thisArg", thisArg);
        errorLog?.(message);
        throw error.asError();
      },
    },
  ) as T;
}
