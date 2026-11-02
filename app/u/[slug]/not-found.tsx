import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function CardNotFound() {
  return (
    <main className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo height={32} />
      <div>
        <h1 className="text-2xl font-bold">This card isn’t available</h1>
        <p className="mt-2 max-w-sm text-muted-foreground">The link may be mistyped, or the owner has unpublished it.</p>
      </div>
      <Button asChild>
        <Link href="/">Create your own free card</Link>
      </Button>
    </main>
  );
}
