import "server-only";
import { pick } from "@/lib/data/backend";
import * as local from "@/lib/data/local/profiles";
import * as remote from "@/lib/data/supabase/profiles";

/** Profiles data access: Supabase in production, the local store in development (see lib/data/backend.ts). */
export const getProfile = ((...args: Parameters<typeof local.getProfile>) => (pick(local, remote).getProfile as typeof local.getProfile)(...args)) as typeof local.getProfile;
export const updateProfile = ((...args: Parameters<typeof local.updateProfile>) => (pick(local, remote).updateProfile as typeof local.updateProfile)(...args)) as typeof local.updateProfile;
export const exportAccount = ((...args: Parameters<typeof local.exportAccount>) => (pick(local, remote).exportAccount as typeof local.exportAccount)(...args)) as typeof local.exportAccount;
export const deleteAccount = ((...args: Parameters<typeof local.deleteAccount>) => (pick(local, remote).deleteAccount as typeof local.deleteAccount)(...args)) as typeof local.deleteAccount;

/** Demo sign-in for the local store only. */
export const signInByEmail = local.signInByEmail;
/** Supabase only: make sure a profile row exists for the signed-in auth user. */
export const ensureProfile = remote.ensureProfile;
