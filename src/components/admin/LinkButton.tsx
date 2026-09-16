import Link from "next/link";
import { Button } from "@/components/ui/button";

type ButtonProps = React.ComponentProps<typeof Button>;

// Button renders as a native <button> by default (nativeButton=true);
// swapping it to a Link via `render` needs nativeButton={false} or
// Base UI logs a dev warning. This wrapper bakes that in so call sites
// don't have to remember it every time.
export function LinkButton({
  href,
  ...props
}: Omit<ButtonProps, "render" | "nativeButton"> & { href: string }) {
  return <Button nativeButton={false} render={<Link href={href} />} {...props} />;
}
