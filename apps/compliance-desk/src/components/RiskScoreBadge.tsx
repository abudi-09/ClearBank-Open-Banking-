import type { HTMLAttributes } from "react";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export function RiskScoreBadge({ score, className, ...props }: { score: number } & HTMLAttributes<HTMLDivElement>) {
  let variant: BadgeVariant = "success";
  let label = `${score} LOW`;
  if (score > 70) {
    variant = "danger";
    label = `${score} HIGH`;
  } else if (score > 30) {
    variant = "warning";
    label = `${score} MED`;
  }

  return (
    <Badge variant={variant} className={cn("tabular-nums", className)} {...props}>
      {label}
    </Badge>
  );
}
