/** Expected domain errors shared by both data backends (turned into form messages in lib/actions/shared.ts). */
export class NotFoundError extends Error {
  constructor(what = "Not found.") {
    super(what);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "You don't have permission to do that.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends Error {
  constructor(message = "This card was changed somewhere else. Reload to see the latest version.") {
    super(message);
    this.name = "ConflictError";
  }
}

export class SlugTakenError extends Error {
  constructor() {
    super("That address is already taken.");
    this.name = "SlugTakenError";
  }
}

export class UploadError extends Error {}
