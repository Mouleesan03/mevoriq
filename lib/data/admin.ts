import "server-only";
import { pick } from "@/lib/data/backend";
import * as local from "@/lib/data/local/admin";
import * as remote from "@/lib/data/supabase/admin";

/** Admin data access: Supabase in production, the local store in development (see lib/data/backend.ts). */
export const getFlag = ((...args: Parameters<typeof local.getFlag>) => (pick(local, remote).getFlag as typeof local.getFlag)(...args)) as typeof local.getFlag;
export const createReport = ((...args: Parameters<typeof local.createReport>) => (pick(local, remote).createReport as typeof local.createReport)(...args)) as typeof local.createReport;
export const createMessage = ((...args: Parameters<typeof local.createMessage>) => (pick(local, remote).createMessage as typeof local.createMessage)(...args)) as typeof local.createMessage;
export const setMessageState = ((...args: Parameters<typeof local.setMessageState>) => (pick(local, remote).setMessageState as typeof local.setMessageState)(...args)) as typeof local.setMessageState;
export const getAdminOverview = ((...args: Parameters<typeof local.getAdminOverview>) => (pick(local, remote).getAdminOverview as typeof local.getAdminOverview)(...args)) as typeof local.getAdminOverview;
export const resolveReport = ((...args: Parameters<typeof local.resolveReport>) => (pick(local, remote).resolveReport as typeof local.resolveReport)(...args)) as typeof local.resolveReport;
export const setFlag = ((...args: Parameters<typeof local.setFlag>) => (pick(local, remote).setFlag as typeof local.setFlag)(...args)) as typeof local.setFlag;

export { isPlatformAdmin } from "@/lib/data/shared";
