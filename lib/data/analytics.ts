import "server-only";
import { pick } from "@/lib/data/backend";
import * as local from "@/lib/data/local/analytics";
import * as remote from "@/lib/data/supabase/analytics";

/** Analytics data access: Supabase in production, the local store in development (see lib/data/backend.ts). */
export const recordEvent = ((...args: Parameters<typeof local.recordEvent>) => (pick(local, remote).recordEvent as typeof local.recordEvent)(...args)) as typeof local.recordEvent;
export const getInsights = ((...args: Parameters<typeof local.getInsights>) => (pick(local, remote).getInsights as typeof local.getInsights)(...args)) as typeof local.getInsights;

export const recordSourceView = ((...args: Parameters<typeof local.recordSourceView>) => (pick(local, remote).recordSourceView as typeof local.recordSourceView)(...args)) as typeof local.recordSourceView;
export const getSourceCounts = ((...args: Parameters<typeof local.getSourceCounts>) => (pick(local, remote).getSourceCounts as typeof local.getSourceCounts)(...args)) as typeof local.getSourceCounts;

export type { Insights, SourceCount } from "@/lib/data/insights";
