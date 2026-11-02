import { describe, expect, it } from "vitest";
import { EVENT_MAX_HOURS, effectiveEnd, eventTag, formatDuration, isLive } from "@/lib/events";

const start = "2026-11-02T09:00:00.000Z";
const hours = (h: number) => new Date(new Date(start).getTime() + h * 3_600_000).getTime();

describe("event tags", () => {
  it("turns names into short tags", () => {
    expect(eventTag("DevFest Colombo 2026!")).toBe("devfest-colombo-2026");
    expect(eventTag("A very long conference name that keeps going on")).toHaveLength(30);
    expect(eventTag("A very long conference name that keeps going on")).not.toMatch(/-$/);
  });
  it("falls back when the name has no Latin letters", () => {
    expect(eventTag("தொழில் சந்திப்பு")).toBe("event");
  });
});

describe("live events", () => {
  it("is live until ended", () => {
    expect(isLive({ startedAt: start, endedAt: null }, hours(2))).toBe(true);
    expect(isLive({ startedAt: start, endedAt: "2026-11-02T10:00:00.000Z" }, hours(0.5))).toBe(false);
  });
  it(`stops by itself after ${EVENT_MAX_HOURS} hours`, () => {
    expect(isLive({ startedAt: start, endedAt: null }, hours(EVENT_MAX_HOURS + 0.1))).toBe(false);
    expect(effectiveEnd({ startedAt: start, endedAt: null })).toBe(new Date(hours(EVENT_MAX_HOURS)).toISOString());
    expect(effectiveEnd({ startedAt: start, endedAt: "2026-11-02T12:00:00.000Z" })).toBe("2026-11-02T12:00:00.000Z");
  });
  it("formats durations", () => {
    expect(formatDuration(start, "2026-11-02T12:20:00.000Z")).toBe("3h 20m");
    expect(formatDuration(start, "2026-11-02T09:45:00.000Z")).toBe("45m");
    expect(formatDuration(start, "2026-11-02T11:00:00.000Z")).toBe("2h");
  });
});
