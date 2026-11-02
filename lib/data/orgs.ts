import "server-only";
import { pick } from "@/lib/data/backend";
import * as local from "@/lib/data/local/orgs";
import * as remote from "@/lib/data/supabase/orgs";

/** Orgs data access: Supabase in production, the local store in development (see lib/data/backend.ts). */
export const createOrganization = ((...args: Parameters<typeof local.createOrganization>) => (pick(local, remote).createOrganization as typeof local.createOrganization)(...args)) as typeof local.createOrganization;
export const listMyOrganizations = ((...args: Parameters<typeof local.listMyOrganizations>) => (pick(local, remote).listMyOrganizations as typeof local.listMyOrganizations)(...args)) as typeof local.listMyOrganizations;
export const getTeam = ((...args: Parameters<typeof local.getTeam>) => (pick(local, remote).getTeam as typeof local.getTeam)(...args)) as typeof local.getTeam;
export const getTeamActivity = ((...args: Parameters<typeof local.getTeamActivity>) => (pick(local, remote).getTeamActivity as typeof local.getTeamActivity)(...args)) as typeof local.getTeamActivity;
export const createInvitation = ((...args: Parameters<typeof local.createInvitation>) => (pick(local, remote).createInvitation as typeof local.createInvitation)(...args)) as typeof local.createInvitation;
export const findInvitation = ((...args: Parameters<typeof local.findInvitation>) => (pick(local, remote).findInvitation as typeof local.findInvitation)(...args)) as typeof local.findInvitation;
export const acceptInvitation = ((...args: Parameters<typeof local.acceptInvitation>) => (pick(local, remote).acceptInvitation as typeof local.acceptInvitation)(...args)) as typeof local.acceptInvitation;
export const revokeInvitation = ((...args: Parameters<typeof local.revokeInvitation>) => (pick(local, remote).revokeInvitation as typeof local.revokeInvitation)(...args)) as typeof local.revokeInvitation;
export const changeRole = ((...args: Parameters<typeof local.changeRole>) => (pick(local, remote).changeRole as typeof local.changeRole)(...args)) as typeof local.changeRole;
export const setMemberStatus = ((...args: Parameters<typeof local.setMemberStatus>) => (pick(local, remote).setMemberStatus as typeof local.setMemberStatus)(...args)) as typeof local.setMemberStatus;
export const updateBrand = ((...args: Parameters<typeof local.updateBrand>) => (pick(local, remote).updateBrand as typeof local.updateBrand)(...args)) as typeof local.updateBrand;
export const createCompanyCard = ((...args: Parameters<typeof local.createCompanyCard>) => (pick(local, remote).createCompanyCard as typeof local.createCompanyCard)(...args)) as typeof local.createCompanyCard;

export type { ActivityRow, MemberRow } from "@/lib/data/local/orgs";
