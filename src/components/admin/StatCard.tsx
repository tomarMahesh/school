import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const PALETTES = {
  orange: { bg: "from-orange-50 to-amber-100", icon: "bg-orange-500" },
  blue: { bg: "from-blue-50 to-indigo-100", icon: "bg-blue-500" },
  purple: { bg: "from-purple-50 to-pink-100", icon: "bg-purple-500" },
  teal: { bg: "from-teal-50 to-emerald-100", icon: "bg-teal-500" },
  green: { bg: "from-green-50 to-lime-100", icon: "bg-green-500" },
  sky: { bg: "from-sky-50 to-cyan-100", icon: "bg-sky-500" },
} as const;

export function StatCard({
  label,
  value,
  icon: Icon,
  palette,
  href,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  palette: keyof typeof PALETTES;
  href?: string;
}) {
  const colors = PALETTES[palette];

  const content = (
    <CardContent
      className={cn(
        "flex items-center gap-4 rounded-xl bg-gradient-to-br p-5",
        colors.bg,
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white",
          colors.icon,
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </CardContent>
  );

  if (href) {
    return (
      <a href={href} className="block">
        <Card className="gap-0 overflow-hidden border-none py-0 shadow-sm transition-shadow hover:shadow-md">
          {content}
        </Card>
      </a>
    );
  }

  return (
    <Card className="gap-0 overflow-hidden border-none py-0 shadow-sm">
      {content}
    </Card>
  );
}
