import { CardView } from "@/components/cards/card-view";
import type { PublicCard } from "@/lib/cards/types";
import { getTheme } from "@/lib/cards/themes";

/** Live preview in a minimal phone frame; scaled so the whole card page is visible. */
export function PhonePreview({ card, displayUrl }: { card: PublicCard; displayUrl: string }) {
  const theme = getTheme(card.theme.template);
  return (
    <div className="mx-auto w-full max-w-[340px] rounded-[14px] border border-black/10 bg-[#0F1B2D] p-2.5 shadow-[0_30px_60px_-20px_rgba(15,27,45,0.35)]">
      <div className="relative h-[640px] overflow-hidden rounded-[12px]" style={{ background: theme.page }}>
        <div className="absolute top-2 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-[#0F1B2D]" aria-hidden />
        <div className="h-full overflow-y-auto px-4 pt-10 pb-6 [scrollbar-width:none]">
          <CardView card={card} displayUrl={displayUrl} preview />
        </div>
      </div>
    </div>
  );
}
