/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin_exportQuestions from "../admin/exportQuestions.js";
import type * as auth from "../auth.js";
import type * as catalog_examQuestionPolicy from "../catalog/examQuestionPolicy.js";
import type * as catalog_tracksCanonical from "../catalog/tracksCanonical.js";
import type * as lib_adminEmails from "../lib/adminEmails.js";
import type * as lib_authorization from "../lib/authorization.js";
import type * as lib_practiceAccess from "../lib/practiceAccess.js";
import type * as lib_workosIdentity from "../lib/workosIdentity.js";
import type * as practiceQuestions from "../practiceQuestions.js";
import type * as seed from "../seed.js";
import type * as seed_devQuestionBank from "../seed/devQuestionBank.js";
import type * as tracks from "../tracks.js";
import type * as userProgress from "../userProgress.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "admin/exportQuestions": typeof admin_exportQuestions;
  auth: typeof auth;
  "catalog/examQuestionPolicy": typeof catalog_examQuestionPolicy;
  "catalog/tracksCanonical": typeof catalog_tracksCanonical;
  "lib/adminEmails": typeof lib_adminEmails;
  "lib/authorization": typeof lib_authorization;
  "lib/practiceAccess": typeof lib_practiceAccess;
  "lib/workosIdentity": typeof lib_workosIdentity;
  practiceQuestions: typeof practiceQuestions;
  seed: typeof seed;
  "seed/devQuestionBank": typeof seed_devQuestionBank;
  tracks: typeof tracks;
  userProgress: typeof userProgress;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
