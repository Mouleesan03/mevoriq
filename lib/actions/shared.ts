import "server-only";
import { ConflictError, ForbiddenError, NotFoundError, SlugTakenError, UploadError } from "@/lib/data/errors";

export type FormState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  version?: number;
  savedAt?: string;
  data?: Record<string, string>;
};

/** Turns expected domain errors into a form message; anything else is a real bug and rethrows. */
export function toFormState(err: unknown): FormState {
  if (err instanceof SlugTakenError) return { ok: false, message: err.message, errors: { slug: err.message } };
  if (err instanceof ConflictError || err instanceof ForbiddenError || err instanceof NotFoundError || err instanceof UploadError) {
    return { ok: false, message: err.message };
  }
  throw err;
}
