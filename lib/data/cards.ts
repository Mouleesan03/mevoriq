import "server-only";
import { pick } from "@/lib/data/backend";
import * as local from "@/lib/data/local/cards";
import * as remote from "@/lib/data/supabase/cards";

/** Cards data access: Supabase in production, the local store in development (see lib/data/backend.ts). */
export const listCards = ((...args: Parameters<typeof local.listCards>) => (pick(local, remote).listCards as typeof local.listCards)(...args)) as typeof local.listCards;
export const getCardForEdit = ((...args: Parameters<typeof local.getCardForEdit>) => (pick(local, remote).getCardForEdit as typeof local.getCardForEdit)(...args)) as typeof local.getCardForEdit;
export const createCard = ((...args: Parameters<typeof local.createCard>) => (pick(local, remote).createCard as typeof local.createCard)(...args)) as typeof local.createCard;
export const updateCard = ((...args: Parameters<typeof local.updateCard>) => (pick(local, remote).updateCard as typeof local.updateCard)(...args)) as typeof local.updateCard;
export const setStatus = ((...args: Parameters<typeof local.setStatus>) => (pick(local, remote).setStatus as typeof local.setStatus)(...args)) as typeof local.setStatus;
export const setCardAvatar = ((...args: Parameters<typeof local.setCardAvatar>) => (pick(local, remote).setCardAvatar as typeof local.setCardAvatar)(...args)) as typeof local.setCardAvatar;
export const deleteCard = ((...args: Parameters<typeof local.deleteCard>) => (pick(local, remote).deleteCard as typeof local.deleteCard)(...args)) as typeof local.deleteCard;
export const isSlugAvailable = ((...args: Parameters<typeof local.isSlugAvailable>) => (pick(local, remote).isSlugAvailable as typeof local.isSlugAvailable)(...args)) as typeof local.isSlugAvailable;
export const findPublishedBySlug = ((...args: Parameters<typeof local.findPublishedBySlug>) => (pick(local, remote).findPublishedBySlug as typeof local.findPublishedBySlug)(...args)) as typeof local.findPublishedBySlug;

export type { CardSummary } from "@/lib/data/local/cards";
export { ConflictError, SlugTakenError } from "@/lib/data/errors";
