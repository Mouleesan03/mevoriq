import "server-only";
import { pick } from "@/lib/data/backend";
import * as local from "@/lib/data/local/leads";
import * as remote from "@/lib/data/supabase/leads";

/** Leads data access: Supabase in production, the local store in development (see lib/data/backend.ts). */
export const createLead = ((...args: Parameters<typeof local.createLead>) => (pick(local, remote).createLead as typeof local.createLead)(...args)) as typeof local.createLead;
export const listLeads = ((...args: Parameters<typeof local.listLeads>) => (pick(local, remote).listLeads as typeof local.listLeads)(...args)) as typeof local.listLeads;
export const getLead = ((...args: Parameters<typeof local.getLead>) => (pick(local, remote).getLead as typeof local.getLead)(...args)) as typeof local.getLead;
export const updateLead = ((...args: Parameters<typeof local.updateLead>) => (pick(local, remote).updateLead as typeof local.updateLead)(...args)) as typeof local.updateLead;
export const deleteLead = ((...args: Parameters<typeof local.deleteLead>) => (pick(local, remote).deleteLead as typeof local.deleteLead)(...args)) as typeof local.deleteLead;
export const newLeadCount = ((...args: Parameters<typeof local.newLeadCount>) => (pick(local, remote).newLeadCount as typeof local.newLeadCount)(...args)) as typeof local.newLeadCount;

export type { LeadRow } from "@/lib/data/local/leads";
export { CONSENT_VERSION, leadsToCsv, type LeadFilters, type LeadInput } from "@/lib/data/shared";
