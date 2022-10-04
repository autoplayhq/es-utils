import type { DevString } from "./DevString";
import { dev } from "./DevString";
import type { ZodLikeParser } from "./ZodLikeParser";

/**
 * Parse JSON into a runtime parseable (like with zod types)
 * @example
 * parseJSON(
 *   await newSessionResponse.text(),
 *   sessionAuthType,
 *   dev`New session response`,
 *   dev`Returned from POST /api/new-session`,
 * )
 */
export function parseJSON<R>(
  jsonString: string,
  parser: ZodLikeParser<R>,
  contentDebugName: DevString,
  contentComesFromDebugName: DevString,
): R {
  try {
    const json = JSON.parse(jsonString);
    return parser.parse(json);
  } catch (err) {
    throw dev`Expected to be able to parse "${contentDebugName}" coming from "${contentComesFromDebugName}", but failed to due to ${err}`
      .record("jsonString", jsonString)
      .asError();
  }
}

// Add this to a TypeScript source in your codebase to error on not using parseJSON
// import type {parseJSON} from "@autoplay/utils"
// declare global {
//   interface JSON {
//     /** @deprecated in favor of {@link parseJSON} */
//     parse(content: string): unknown;
//   }
//   interface Response {
//     /** @deprecated in favor of {@link parseJSON} */
//     json(): Promise<unknown>;
//   }
// }
